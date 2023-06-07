// ==UserScript==
// @name           w4tchdoge's AO3 Bookmark Maker
// @namespace      https://github.com/w4tchdoge
// @version        2.0.5-20230607_162103
// @description    Modified/Forked from "Ellililunch AO3 Bookmark Maker" (https://greasyfork.org/en/scripts/458631). Script is out-of-the-box setup to automatically add title, author, status, summary, and last read date to the description in an "collapsible" section so as to not clutter the bookmark.
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/w4tchdoge_AO3_Bookmark_Maker.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/w4tchdoge_AO3_Bookmark_Maker.user.js
// @match          *://archiveofourown.org/works/*
// @match          *://archiveofourown.org/series/*
// @match          *://archiveofourown.org/users/*
// @icon           https://archiveofourown.org/favicon.ico
// @license        GNU GPLv3
// @history        2.0.5 — Fixing localStorage stuff
// @history        2.0.4 — More summary related bugfixes
// @history        2.0.3 — Fix the script replacing an existing summary in the bookmark notes with 'undefined'
// @history        2.0.2 — Alert the user that their input for a new divider value has been accepted + Minor styling changes in the setting dropdown
// @history        2.0.1 — Fix if statements that used variables that needed to be true or false by using a function to convert the 'true' & 'false' strings from localStorage to booleans
// @history        2.0.0 — Implement localStorage for the majority of user settings. Presets must still be set via editing the script
// @history        1.0.0 — Initial Publishing to GresyFork
// ==/UserScript==

/*
// THIS USERSCRIPT RELIES HEAVILY ON TEMPLATE LITERALS
// FOR INFORMATION ON WHETHER YOUR BROWSER IS COMPATIBLE WITH TEMPLATE LITERALS PLEASE VISIT THE FOLLOWING WEBPAGE
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#browser_compatibility
*/

// NOTICE TO NEW USERS
// Configuration area for the autogenerated portion of the bookmark at the bottom of the userscript
// Various settings that can be tweaked by the end user are accessible in a menu on your Preferences page:
// (https://archiveofourown.org/users/{YOUR_USERNAME}/preferences)
// IF YOU HAVE ANY QUESTIONS AT ALL DO NOT HESITATE TO PM ME ON GREASYFORK

(function () {

	/* Dictionary of "constants" that can be changed by the end user to affect how the script functions */
	let settings_dict = {
		divider: `</details>\n\n`,
		autoPrivate: false,
		bottomEntireWork: true,
		simpleWorkSummary: false,
		FWS_asBlockquote: true,
		splitSelect: 1
	};

	/* EXPLANATION OF THE "CONSTANTS" THAT CAN BE CHANGED BY THE END USER

divider               : String which is used to indicate where the bookmark should be split in half


autoPrivate           : If true, automatically checks the checkbox to private the bookmark


bottomEntireWork      : If true, checks if the current page is an entire work page or a work page that is not on the first chapter.
If the aforementioned checks are passed, clones the "Entire Work" button to the bottom nav bar to easily navigate to a page where the userscript will work.
This is done due to the fact that the last read date will not update when updating a bookmark from the latest chapter.


simpleWorkSummary     : If true, uses the original method to retrieve the work summary (least hassle, but includes the 'Summary' heading element which some users may find annoying).
If false, retrieves the work summary in a way (which I call the fancy way) that allows more flexibility when customising newBookmarkNotes


FWS_asBlockquote : If using the fancy work summary method, set whether you want to retrieve the summary as a blockquote.
For more information on the effects of changing simpleWorkSummary and FWS_asBlockquote, please look at where simpleWorkSummary is first used in the script, it should be around line 674


splitSelect           : splitSelect changes which half of bookmarkNotes your initial bookmark is supposed to live in.
Valid values are 0 and 1.

e.g.
If you want the final bookmark (after pasting of autogenerated text) to look like the below text (and have configured it as such at the bottom of the script):

{bookmarkNotes}
<hr />
{title} by {author}<br />
{status}<br />
{summary}<br />

Then you can set divider = '<hr />' and splitSelect = 0
What this does is it replaces anything AFTER the <hr /> with the autogenerated bookmark text you've defined at the bottom while keeping your own text (e.g. "@ Chapter 2" or "Chapter 8 ripped my heart out").

If you instead want something like the following:

{title} by {author}<br />
{status}<br />
{summary}<br />
<hr />
{bookmarkNotes}

Then you can set divider = '<hr />' and splitSelect = 1, which replaces everything BEFORE your bookmark notes.

Another way to explain it is that the script works by taking the current contents of your bookmark and splitting it into two pieces along a user defined "divider", thus creating an array. Depending on the way you want the bookmark to be structured, the part of the bookmark that you want to keep could be before the divider or after the divider. splitSelect lets you tell the script which half of the array contains the bit of the bookmark you want to keep. If it's the first half splitSelect is 0, if it's the last half splitSelect is 1.

	*/

	// from https://stackoverflow.com/a/1414175/11750206 ; used to convert the 'true' & 'false' strings in localStorage to actual booleans
	const stringToBoolean = (stringValue) => {
		switch (stringValue?.toLowerCase()?.trim()) {
			case "true":
			case "yes":
			case "1":
				return true;

			case "false":
			case "no":
			case "0":
			case null:
			case undefined:
				return false;

			default:
				return JSON.parse(stringValue);
		}
	};

	// Declare user-configurable variables
	var divider, autoPrivate, bottomEntireWork, simpleWorkSummary, FWS_asBlockquote, splitSelect;

	// localStorage stuff
	if (typeof Storage != `undefined`) { // If localStorage exists

		console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	localStorage exists`
		);


		// Execute if statement only if w4BM_divider is not set in localStorage
		if (!!!localStorage.getItem(`w4BM_divider`)) {

			console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_divider' is not set in the localStorage
	Now setting it to '${ini_settings_dict.divider.replace(/\n/gi, `\\n`).replace(/\t/gi, `\\t`).replace(/\r/gi, `\\r`)}'`
			);

			// set the divider in localStorage and current script execution to the default value
			// this will only happen on the first ever execution of the script, because this action only happens when:
			// a) localStorage exists
			// b) w4BM_divider does not exist in the localStorage
			divider = ini_settings_dict.divider;
			localStorage.setItem(`w4BM_divider`, ini_settings_dict.divider);
		}

		// Execute if statement only if w4BM_divider is set in localStorage
		else if (!!localStorage.getItem(`w4BM_divider`)) {

			/* console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_divider' IS SET in the localStorage`
			); */

			divider = localStorage.getItem(`w4BM_divider`);
		}


		// doing the same thing as the first if else on line 130
		if (!!!localStorage.getItem(`w4BM_autoPrivate`)) {

			console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_autoPrivate' is not set in the localStorage
	Now setting it to '${ini_settings_dict.autoPrivate}'`
			);

			autoPrivate = ini_settings_dict.autoPrivate;
			localStorage.setItem(`w4BM_autoPrivate`, ini_settings_dict.autoPrivate);
		}
		else if (!!localStorage.getItem(`w4BM_autoPrivate`)) {

			/* console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_autoPrivate' IS SET in the localStorage`
			); */

			divider = stringToBoolean(localStorage.getItem(`w4BM_autoPrivate`));
		}

		// doing the same thing as the first if else on line 130
		if (!!!localStorage.getItem(`w4BM_bottomEntireWork`)) {

			console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_bottomEntireWork' is not set in the localStorage
	Now setting it to '${ini_settings_dict.bottomEntireWork}'`
			);

			bottomEntireWork = ini_settings_dict.bottomEntireWork;
			localStorage.setItem(`w4BM_bottomEntireWork`, ini_settings_dict.bottomEntireWork);
		}
		else if (!!localStorage.getItem(`w4BM_bottomEntireWork`)) {

			/* console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_bottomEntireWork' IS SET in the localStorage`
			); */

			divider = stringToBoolean(localStorage.getItem(`w4BM_bottomEntireWork`));
		}

		// doing the same thing as the first if else on line 130
		if (!!!localStorage.getItem(`w4BM_simpleWorkSummary`)) {

			console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_simpleWorkSummary' is not set in the localStorage
	Now setting it to '${ini_settings_dict.simpleWorkSummary}'`
			);

			simpleWorkSummary = ini_settings_dict.simpleWorkSummary;
			localStorage.setItem(`w4BM_simpleWorkSummary`, ini_settings_dict.simpleWorkSummary);
		}
		else if (!!localStorage.getItem(`w4BM_simpleWorkSummary`)) {

			/* console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_simpleWorkSummary' IS SET in the localStorage`
			); */

			divider = stringToBoolean(localStorage.getItem(`w4BM_simpleWorkSummary`));
		}

		// doing the same thing as the first if else on line 130
		if (!!!localStorage.getItem(`w4BM_FWS_asBlockquote`)) {

			console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_FWS_asBlockquote' is not set in the localStorage
	Now setting it to '${ini_settings_dict.FWS_asBlockquote}'`
			);

			FWS_asBlockquote = ini_settings_dict.FWS_asBlockquote;
			localStorage.setItem(`w4BM_FWS_asBlockquote`, ini_settings_dict.FWS_asBlockquote);
		}
		else if (!!localStorage.getItem(`w4BM_FWS_asBlockquote`)) {

			/* console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_FWS_asBlockquote' IS SET in the localStorage`
			); */

			divider = stringToBoolean(localStorage.getItem(`w4BM_FWS_asBlockquote`));
		}

		// doing the same thing as the first if else on line 130
		if (!!!localStorage.getItem(`w4BM_splitSelect`)) {

			console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_splitSelect' is not set in the localStorage
	Now setting it to '${ini_settings_dict.splitSelect}'`
			);

			splitSelect = ini_settings_dict.splitSelect;
			localStorage.setItem(`w4BM_splitSelect`, ini_settings_dict.splitSelect);
		}
		else if (!!localStorage.getItem(`w4BM_splitSelect`)) {

			/* console.log(`
	w4tchdoge's AO3 Bookmark Maker UserScript – Log
	--------------------
	'w4BM_splitSelect' IS SET in the localStorage`
			); */

			divider = parseInt(localStorage.getItem(`w4BM_splitSelect`));
		}

	}
	else { // if localStorage does not exist

		divider = ini_settings_dict.divider;
		autoPrivate = ini_settings_dict.autoPrivate;
		bottomEntireWork = ini_settings_dict.bottomEntireWork;
		simpleWorkSummary = ini_settings_dict.simpleWorkSummary;
		FWS_asBlockquote = ini_settings_dict.FWS_asBlockquote;
		splitSelect = ini_settings_dict.splitSelect;

	}


	// add main element that all querySelector operations will be done on
	const main = document.querySelector(`div#main`);


	// Get current page URL
	const currPgURL = window.location.href;

	if (currPgURL.includes(`users`) && currPgURL.includes(`preferences`)) {
		addPrefDropdown();
	}

	// Create and add dropdown menu to configure the script
	function addPrefDropdown() {

		// unescapeSlashes is from https://stackoverflow.com/a/48855846/11750206
		function unescapeSlashes(str) {
			// add another escaped slash if the string ends with an odd
			// number of escaped slashes which will crash JSON.parse
			let parsedStr = str.replace(/(^|[^\\])(\\\\)*\\$/, "$&\\");

			// escape unescaped double quotes to prevent error with
			// added double quotes in json string
			parsedStr = parsedStr.replace(/(^|[^\\])((\\\\)*")/g, "$1\\$2");

			try {
				parsedStr = JSON.parse(`"${parsedStr}"`);
			} catch (e) {
				return str;
			}
			return parsedStr;
		}

		// get the header menu
		const header_menu = document.querySelector(`ul.primary.navigation.actions`);

		// create and insert the menu button
		var w4BM_settingMenu = Object.assign(document.createElement(`li`), {
			className: `dropdown`,
			id: `w4BM_settings_dropdown`,
			innerHTML: `<a>Bookmark Maker Settings</a>`
		});
		if (document.querySelector(`#navbar_bookmarks_button`) !== null) {
			document.querySelector(`#navbar_bookmarks_button`).before(w4BM_settingMenu);
		} else {
			header_menu.querySelector(`li.search`).before(w4BM_settingMenu);
		}

		// create and append dropdown menu
		var w4BM_dropMenu = Object.assign(document.createElement(`ul`), {
			className: `menu dropdown-menu`,
			style: `width: 23.5em`
		});
		w4BM_settingMenu.append(w4BM_dropMenu);

		// create a more info li element to dropdown
		var w4BM_moreInfo_liElm = Object.assign(document.createElement(`li`), {
			style: `padding: 0.5em; text-align: left;`,
			innerHTML: `<div><em><p>This menu is for changing values of constants.</p><br /><p>Preset selection is still done via editing the userscript.</p><br /><p>For more info on setup check script code.</p><br /><p>If you have any questions, don't hesitate to PM me on Greasy Fork</p></em></div>`
		});

		// append the more info li element to dropdown
		w4BM_dropMenu.append(w4BM_moreInfo_liElm);

		// create the "— Settings —" li element to dropdown
		var w4BM_settings_liElm = Object.assign(document.createElement(`li`), {
			innerHTML: `<a style="padding: 0.5em 0.5em 0.25em; text-align: center; font-weight: bold;">&mdash; Settings &mdash;</a>`
		});

		// append the "— Settings —" li element to dropdown
		w4BM_dropMenu.append(w4BM_settings_liElm);

		// create the general area where the divider input will go
		var w4BM_divider_input_area = Object.assign(document.createElement(`li`), {
			className: `w4BM_divider_input_area`,
			id: `w4BM_divider_input_area`,
			style: `margin-top: .75em;`,
			innerHTML: `<p style='padding: .75em .5em .5em;'>Divider text:<br /></p>`
		});

		// create the text input box for the divider value
		var w4BM_divider_input_box = Object.assign(document.createElement(`input`), {
			type: `text`,
			id: `w4BM_divider_input_box`,
			name: `w4BM_divider_input_box`,
			style: `width: 16em; margin-left: 0.2em`
		});
		w4BM_divider_input_box.setAttribute(`value`, localStorage.getItem(`w4BM_divider`).replace(/\n/gi, `\\n`).replace(/\t/gi, `\\t`).replace(/\r/gi, `\\r`) || `divider\\n\\n`);
		w4BM_divider_input_area.append(w4BM_divider_input_box);

		// create divider input submit button
		var w4BM_divider_input_btn = Object.assign(document.createElement(`button`), {
			id: `w4BM_divider_input_btn`,
			style: `margin-left: 0.3em`,
			innerHTML: `Enter`
		});

		// append divider input submit button
		w4BM_divider_input_box.after(w4BM_divider_input_btn);

		// make the divider input submit button actually do what it's supposed to
		w4BM_divider_input_btn.addEventListener(`click`, function () {
			var input_value = unescapeSlashes(document.querySelector(`#w4BM_divider_input_box`).value);
			localStorage.setItem(`w4BM_divider`, input_value);
			console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
New value set for the 'divider' variable in localStorage.
New value: '${input_value.replace(/\n/gi, `\\n`).replace(/\t/gi, `\\t`).replace(/\r/gi, `\\r`)}'`
			);
			alert(`w4tchdoge's AO3 Bookmark Maker
New value set for the 'divider' variable in localStorage.
New value: '${input_value.replace(/\n/gi, `\\n`).replace(/\t/gi, `\\t`).replace(/\r/gi, `\\r`)}'`
			);
		});

		// append input area to dropdown
		w4BM_settings_liElm.after(w4BM_divider_input_area);

		// create button - auto private bookmarks - yes
		var w4BM_autoPrivate_yes = Object.assign(document.createElement(`li`), {
			className: `w4BM_autoPrivate_yes`,
			id: `w4BM_autoPrivate_yes`,
			innerHTML: `<a>Auto Private Bookmarks: YES</a>`
		});
		w4BM_autoPrivate_yes.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_autoPrivate`, false);
			w4BM_autoPrivate_yes.replaceWith(w4BM_autoPrivate_no);
		});

		// create button - auto private bookmarks - no
		var w4BM_autoPrivate_no = Object.assign(document.createElement(`li`), {
			className: `w4BM_autoPrivate_no`,
			id: `w4BM_autoPrivate_no`,
			innerHTML: `<a>Auto Private Bookmarks: NO</a>`
		});
		w4BM_autoPrivate_no.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_autoPrivate`, true);
			w4BM_autoPrivate_no.replaceWith(w4BM_autoPrivate_yes);
		});

		// create button - add "Entire Work" button to bottom navbar
		var w4BM_bottomEntireWork_yes = Object.assign(document.createElement(`li`), {
			className: `w4BM_bottomEntireWork_yes`,
			id: `w4BM_bottomEntireWork_yes`,
			innerHTML: `<a>"Entire Work" button in bottom navbar: YES</a>`
		});
		w4BM_bottomEntireWork_yes.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_bottomEntireWork`, false);
			w4BM_bottomEntireWork_yes.replaceWith(w4BM_bottomEntireWork_no);
		});

		// create button - do not add "Entire Work" button to bottom navbar
		var w4BM_bottomEntireWork_no = Object.assign(document.createElement(`li`), {
			className: `w4BM_bottomEntireWork_no`,
			id: `w4BM_bottomEntireWork_no`,
			innerHTML: `<a>"Entire Work" button in bottom navbar: NO</a>`
		});
		w4BM_bottomEntireWork_no.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_bottomEntireWork`, true);
			w4BM_bottomEntireWork_no.replaceWith(w4BM_bottomEntireWork_yes);
		});

		// create button - use simple summary
		var w4BM_simpleWorkSummary_yes = Object.assign(document.createElement(`li`), {
			className: `w4BM_simpleWorkSummary_yes`,
			id: `w4BM_simpleWorkSummary_yes`,
			innerHTML: `<a>Use a simpler work summary: YES</a>`
		});
		w4BM_simpleWorkSummary_yes.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_simpleWorkSummary`, false);
			w4BM_simpleWorkSummary_yes.replaceWith(w4BM_simpleWorkSummary_no);
		});

		// create button - don't use simple summary
		var w4BM_simpleWorkSummary_no = Object.assign(document.createElement(`li`), {
			className: `w4BM_simpleWorkSummary_no`,
			id: `w4BM_simpleWorkSummary_no`,
			innerHTML: `<a>Use a simpler work summary: NO</a>`
		});
		w4BM_simpleWorkSummary_no.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_simpleWorkSummary`, true);
			w4BM_simpleWorkSummary_no.replaceWith(w4BM_simpleWorkSummary_yes);
		});

		// create button - use blockquotes when using fancy work summary
		var w4BM_FWS_asBlockquote_yes = Object.assign(document.createElement(`li`), {
			className: `w4BM_FWS_asBlockquote_yes`,
			id: `w4BM_FWS_asBlockquote_yes`,
			innerHTML: `<a>Use blockquote w/ fancy work summary: YES</a>`
		});
		w4BM_FWS_asBlockquote_yes.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_FWS_asBlockquote`, false);
			w4BM_FWS_asBlockquote_yes.replaceWith(w4BM_FWS_asBlockquote_no);
		});

		// create button - dont use blockquotes when using fancy work summary
		var w4BM_FWS_asBlockquote_no = Object.assign(document.createElement(`li`), {
			className: `w4BM_FWS_asBlockquote_no`,
			id: `w4BM_FWS_asBlockquote_no`,
			innerHTML: `<a>Use blockquote w/ fancy work summary: NO</a>`
		});
		w4BM_FWS_asBlockquote_no.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_FWS_asBlockquote`, true);
			w4BM_FWS_asBlockquote_no.replaceWith(w4BM_FWS_asBlockquote_yes);
		});

		// create button - set splitSelect to 1
		var w4BM_splitSelect_1 = Object.assign(document.createElement(`li`), {
			className: `w4BM_splitSelect_1`,
			id: `w4BM_splitSelect_1`,
			innerHTML: `<a>splitSelect: 1</a>`
		});
		w4BM_splitSelect_1.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_splitSelect`, 0);
			w4BM_splitSelect_1.replaceWith(w4BM_splitSelect_0);
		});

		// create button - set splitSelect to 0
		var w4BM_splitSelect_0 = Object.assign(document.createElement(`li`), {
			className: `w4BM_splitSelect_0`,
			id: `w4BM_splitSelect_0`,
			innerHTML: `<a>splitSelect: 0</a>`
		});
		w4BM_splitSelect_0.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_splitSelect`, 1);
			w4BM_splitSelect_0.replaceWith(w4BM_splitSelect_1);
		});

		// append binary choice buttons to the dropdown menu
		if (typeof (Storage) !== `undefined`) {

			// auto privating bookmarks
			if (autoPrivate == true || autoPrivate == `true`) {
				w4BM_dropMenu.append(w4BM_autoPrivate_yes);
			}
			else {
				w4BM_dropMenu.append(w4BM_autoPrivate_no);
			}

			// adding "Entire Work" to bottom navbar
			if (bottomEntireWork == true || bottomEntireWork == `true`) {
				w4BM_dropMenu.append(w4BM_bottomEntireWork_yes);
			}
			else {
				w4BM_dropMenu.append(w4BM_bottomEntireWork_no);
			}

			// using a simple work summary
			if (simpleWorkSummary == true || simpleWorkSummary == `true`) {
				w4BM_dropMenu.append(w4BM_simpleWorkSummary_yes);
			}
			else {
				w4BM_dropMenu.append(w4BM_simpleWorkSummary_no);
			}

			// using blockquotes w/ fancy work summary
			if (FWS_asBlockquote == true || FWS_asBlockquote == `true`) {
				w4BM_dropMenu.append(w4BM_FWS_asBlockquote_yes);
			}
			else {
				w4BM_dropMenu.append(w4BM_FWS_asBlockquote_no);
			}

			// setting the splitSelect
			if (splitSelect == 1) {
				w4BM_dropMenu.append(w4BM_splitSelect_1);
			}
			else {
				w4BM_dropMenu.append(w4BM_splitSelect_0);
			}
		}

	}

	// make the bookmarking part of the script work only in places where you can make bookmarks
	// this if statement was the easiest way i could think of (im lazy ok) to solve the problem of it erroring on the user preferences page
	// oh and it also makes sure that the script only works and replaces your current bookmark with new text when a summary element exists
	// (yet again, the easiest way i could think of to stop the script from replacing a summary with 'undefined')
	if ((currPgURL.includes(`works`) || currPgURL.includes(`series`)) && (!!document.getElementsByClassName(`summary`).length || document.evaluate(`.//*[@id="main"]//span[text()="Series"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != undefined)) {

		if (autoPrivate) { // for auto-privating your bookmarks
			main.querySelector(`#bookmark_private`).checked = true;
		}


		// keeps any bookmark notes you've made previously
		var bookmarkNotes = main.querySelector(`#bookmark_notes`).textContent.split(divider).at(`-${splitSelect}`);


		// Define variables used in date configuration
		var currdate = new Date(),
			dd = String(currdate.getDate()).padStart(2, `0`),
			mm = String(currdate.getMonth() + 1).padStart(2, `0`), //January is 0
			yyyy = currdate.getFullYear(),
			hh = String(currdate.getHours()).padStart(2, `0`),
			mins = String(currdate.getMinutes()).padStart(2, `0`);

		// Define variables used in bookmark configuration
		var author,
			words,
			status,
			title,
			summary,
			lastChapter,
			latestChapterNumLength,
			chapNumPadCount;


		// Checks if the current page is either the first chapter of a work or the entire work
		if (currPgURL.includes(`works`) && main.querySelector(`li.chapter.previous`) != null && bottomEntireWork) {
			// If all above conditions are true, add a second "Entire Work" button at the bottom nav bar

			// Clone the "Entire Work" button
			var enti_work = main.querySelector(`li.chapter.entire`).cloneNode(true);
			// Add padding to make it look more natural in the bottom nav bar
			enti_work.style.paddingLeft = `0.5663em`;

			// Get the "↑ Top" button that's in the bottom nav bar
			let toTop_xp = `.//*[@id="feedback"]//*[@role="navigation"]//li[*[text()[contains(.,"Top")]]]`;
			let toTop_btn = document.evaluate(toTop_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

			// Add the cloned "Entire Work" button after the "↑ Top" button in the bottom navbar
			toTop_btn.after(enti_work);
		}


		// Look for HTML DOM element only present on series pages
		var seriesTrue = document.evaluate(`.//*[@id="main"]//span[text()="Series"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		// Check if current page is a series page
		if (seriesTrue != undefined) {
			// Retrieve series information

			// Retrieve series title
			title = main.querySelector(`:scope > h2.heading`).textContent.trim();
			// Retrieve series word count
			words = document.evaluate(`.//*[@id="main"]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[text()="Words:"]/following-sibling::*[1]/self::dd`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
			// Retrieve series author
			author = document.evaluate(`.//*[@id="main"]//dl[contains(concat(" ",normalize-space(@class)," ")," series ")][contains(concat(" ",normalize-space(@class)," ")," meta ")][contains(concat(" ",normalize-space(@class)," ")," group ")]//dt[text()="Creator:"]/following-sibling::*[1]/self::dd`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
			// Check if there actually is a series summary
			if (main.querySelector(`.series.meta.group .userstuff`) != null) { // If summary exists, retrieve series summary
				summary = main.querySelector(`.series.meta.group .userstuff`).innerHTML;
			}
			else if (main.querySelector(`.series.meta.group .userstuff`) == null) { // Else assign a blank string to the summary var
				summary = '';
			}
			// Retrieve series status
			let pub_xp = `//dl[contains(concat(" ",normalize-space(@class)," ")," series ")][contains(concat(" ",normalize-space(@class)," ")," meta ")][contains(concat(" ",normalize-space(@class)," ")," group ")]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[contains(text(), "Complete")]/following-sibling::*[1]`;
			let complete = document.evaluate(pub_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
			var updated = main.querySelector(`.series.meta.group`).getElementsByTagName(`dd`)[2].textContent;
			if (complete == `No`) {
				status = `Updated: ${updated}`;
			} else if (complete == `Yes`) {
				status = `Completed: ${updated}`;
			}


		}
		else {
			// Retrieve work information

			// Calculate appropriate padding count for lastChapter
			latestChapterNumLength = document.evaluate(`.//*[@id="main"]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[text()="Chapters:"]/following-sibling::*[1]/self::dd`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent.split(`/`).at(0).length;
			if (latestChapterNumLength >= 3) {
				chapNumPadCount = 3;
			}
			else {
				chapNumPadCount = 2;
			}

			// Retrieve last chapter of work
			lastChapter = `Chapter ${document.evaluate(`.//*[@id="main"]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[text()="Chapters:"]/following-sibling::*[1]/self::dd`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent.split(`/`).at(0).padStart(chapNumPadCount, `0`)}`;
			// Retrieve work title
			title = main.querySelector(`#workskin .title.heading`).textContent.trim();
			// Retrieve work work count
			words = document.evaluate(`.//*[@id="main"]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[text()="Words:"]/following-sibling::*[1]/self::dd`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
			// Retrieve work author
			author = main.querySelector(`#workskin > .preface .byline`).textContent.trim(); // fic author

			// Retrieve work summary
			if (simpleWorkSummary) { // the original methos to retrieve the work's summary
				summary = document.getElementsByClassName(`summary`)[0].innerHTML;

				// Example output of the above method:
				// summary will be a var equal to the following string
				// '\n          <h3 class="heading">Summary:</h3>\n            <blockquote class="userstuff">\n              <p>Lorem ipsum dolor...</p>\n            </blockquote>\n        '

			}
			else if (!simpleWorkSummary && FWS_asBlockquote && main.querySelector(`.summary blockquote`) != null) { // new method #1
				summary = main.querySelector(`.summary blockquote`).outerHTML;

				// Example output of the above method:
				// summary will be a var equal to the following string
				// '<blockquote class="userstuff">\n              <p>Lorem ipsum dolor...</p>\n            </blockquote>'

			}
			else if (!simpleWorkSummary && !FWS_asBlockquote && main.querySelector(`.summary blockquote`) != null) { // new method #2
				summary = main.querySelector(`.summary blockquote`).innerHTML.trim();

				// Example output of the above method:
				// summary will be a var equal to the following string
				// '<p>Lorem ipsum dolor...</p>'

			}

			// Retrieve work status
			if (document.getElementsByClassName(`status`).length != 0) {
				// Retrieval method for multi-chapter works
				status = `${main.querySelector(`dt.status`).textContent} ${main.querySelector(`dd.status`).textContent}`;
			}
			else {
				// Retrieval method for single chapter works
				status = `${main.querySelector(`dt.published`).textContent} ${main.querySelector(`dd.published`).textContent}`;
			}

		}



		/* ///////////////// USER CONFIGURABLE SETTINGS ///////////////// */
		/*
		// Below are the configurations for the autogenerated bookmark content, including the date configuraton
		// THE CONFIGURATION RELIES HEAVILY ON TEMPLATE LITERALS
		// FOR MORE INFORMATION ON TEMPLATE LITERALS PLEASE VISIT THE FOLLOWING WEBPAGE
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
		*/

		/* ///////////////// Bookmark content configuration section ///////////////// */
		/*

		Variables that can be used when creating the string for newBookmarkNotes:
		- date           // Current date (and time) – User configurable in the Date configuration sub-section
		- title          // Title of the work or series
		- author         // Author of the work or series
		- status         // Status of the work or series. i.e. Completed: 2020-08-23, Updated: 2022-05-08, Published: 2015-06-29
		- summary        // Summary of the work or series
		- words          // Current word count of the work or series

		Variables specific to series:
		NONE

		Variables specific to works:
		- lastChapter    // Last published chapter of the work or series

		*/

		/* //// Date configuration sub-section //// */
		/*
		// THE CONFIGURATION RELIES HEAVILY ON TEMPLATE LITERALS
		// FOR MORE INFORMATION ON TEMPLATE LITERALS PLEASE VISIT THE FOLLOWING WEBPAGE
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
		*/

		// Setting the date
		// Feel free to use your own date format, you don't need to stick to the presets here
		var date = `${yyyy}/${mm}/${dd}`; // Date without time
		// date = `${yyyy}/${mm}/${dd} ${hh}${mm}hrs`; // Date with time
		console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
Date Generated: ${date}`
		);

		/* ///////////// Select from Presets ///////////// */

		// To stop using a preset, wrap it in a block comment (add /* to the start and */ to the end); To start using a preset, do the opposite.

		// ------------------------

		// Preset 1 – With last read date
		// To use this preset, scroll to the top where the constants are defined and set divider and splitSelect to the following values:
		// divider = `</details>\n\n`
		// splitSelect = 1

		var newBookmarkNotes = `<details><summary>Work Details</summary>
\t${title} by ${author}
\t${status}
\t<details><summary>Work Summary:</summary>
\t${summary}</details>
(Approximate) Last Read: ${date}</details>

${bookmarkNotes}`;

		// ------------------------

		// Preset 2 – Without last read date
		// To use this preset, scroll to the top where the constants are defined and set divider and splitSelect to the following values:
		// divider = `</details>\n\n`
		// splitSelect = 1

		/* var newBookmarkNotes = `<details><summary>Work Details</summary>
	\t${title} by ${author}
	\t${status}
	\t<details><summary>Work Summary:</summary>
	\t${summary}</details>
	</details>

	${bookmarkNotes}`; */

		// ------------------------

		// Preset 3 – Preset 1 but reversed
		// To use this preset, scroll to the top where the constants are defined and set divider and splitSelect to the following values:
		// divider = `<br />\n<details>`
		// splitSelect = 0

		/* var newBookmarkNotes = `${bookmarkNotes}
	<br />
	<details><summary>Work Details</summary>
	\t${title} by ${author}
	\t${status}
	\t<details><summary>Work Summary:</summary>
	\t${summary}</details>
	(Approximate) Last Read: ${date}</details>`; */

		// ------------------------

		// Preset 4 – Preset 2 but reversed
		// To use this preset, scroll to the top where the constants are defined and set divider and splitSelect to the following values:
		// divider = `<br />\n<details>`
		// splitSelect = 0

		/* var newBookmarkNotes = `${bookmarkNotes}
	<br />
	<details><summary>Work Details</summary>
	\t${title} by ${author}
	\t${status}
	\t<details><summary>Work Summary:</summary>
	\t${summary}</details>
	(Approximate) Last Read: ${date}</details>`; */

		// ------------------------

		// You are free to define your own string for the newBookmarkNotes variable as you see fit


		// Fills the bookmark box with the autogenerated bookmark
		document.getElementById("bookmark_notes").innerHTML = newBookmarkNotes;

	}

})();
