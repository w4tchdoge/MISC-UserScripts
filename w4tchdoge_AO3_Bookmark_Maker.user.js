// ==UserScript==
// @name           w4tchdoge's AO3 Bookmark Maker
// @namespace      https://github.com/w4tchdoge
// @version        2.7.1-20240524_215729
// @description    Modified/Forked from "Ellililunch AO3 Bookmark Maker" (https://greasyfork.org/en/scripts/458631). Script is out-of-the-box setup to automatically add title, author, status, summary, and last read date to the description in an "collapsible" section so as to not clutter the bookmark.
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/w4tchdoge_AO3_Bookmark_Maker.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/w4tchdoge_AO3_Bookmark_Maker.user.js
// @match          *://archiveofourown.org/*works/*
// @exclude        *://archiveofourown.org/*works/*/bookmarks
// @match          *://archiveofourown.org/series/*
// @match          *://archiveofourown.org/users/*
// @icon           https://archiveofourown.org/favicon.ico
// @require        https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment-with-locales.min.js
// @license        GNU GPLv3
// @history        2.7.1 — Clarify how the 'relationships' variable in workInfo now functions, especially with regards to it's new functionality in series bookmarks
// @history        2.7.0 — Add all unique relationship tags in all the works on a series page to the series bookmark
// @history        2.6.3 — Fix some minor messups I made in 2.6.2 before they break something or the other
// @history        2.6.2 — Fix author_HTML only retrieving the first author in multi-author works/series
// @history        2.6.1 — Fixes incompatibilty with users's skins caused by not using cloneNode(true) when retrieving relationship tags and subsequently removing all classes from them. credit to @notdoingthateither on Greasy Fork for the fix
// @history        2.6.0 — Add a new default variable author_HTML that can be used in the workInfo customisation function. for more details about author_HTML please refer to line 1228
// @history        2.5.0 — Add toggle in the dropdown present on the user's preferences page for showing/not showing the AutoTag button when making/editing a bookmark
// @history        2.4.5 — Add exlude rule for pages listing bookmarks as the script isn't designed to run on those pages
// @history        2.4.4 — Add a fallback for retrieving the "Entire Work" button in case it's been modified but is still somewhat recognisable in the DOM
// @history        2.4.3 — Fix script not working on Firefox browsers due to a lack of support for the :has() CSS selector and a Firefox specific error caused by not using Optional Chaining
// @history        2.4.2 — Fix a bug where the script errored on single chapter works
// @history        2.4.1 — Add an option to have a version of the "Summary Page" button in the top nav buttons. Defaults to false
// @history        2.4.0 — Add an Auto Tag button that automatically adds the completion status and word count to the user tags area
// @history        2.3.0 — Fairly large reworks of series summaries which includes the addition of the series_works_summaries var (which only does anything when bookmarking a series) that can be used in workInfo to add the summaries of the works in the series to the series bookmark; Added moment.js as a library in case anyone wants to use it to set their own date var
// @history        2.2.2 — Fix a possible styling issue that may occur with the dropdown menu
// @history        2.2.1 — Fix Relationships subsection for works with no relationship tags by adding a "No Relationships" to the subsection when there are no relationship tags
// @history        2.2.0 — Add a 'relationships' var that can be used in workInfo to add the work's relationship tags to the bookmark. Default config now set to include said var in workInfo
// @history        2.1.2 — Replace the bottom entire work button with a summary page button that works better on large works
// @history        2.1.1 — Adjusted script execution condition to allow for works with no summary
// @history        2.1.0 — Tweaked the bookmarking process which should hopefully make it easier to configure. Also rewrote *some* of the code to hopefully make it better perfoming
// @history        2.0.9 — Add functionality to retrieve the ID of the work or series being bookmarked
// @history        2.0.8 — Make some if statements in the localStorage section more readable
// @history        2.0.7 — Fix bottomEntireWork not functioning because of the placement of the code responsible for putting the button there being inside an if statement that only executes on specific pages
// @history        2.0.6 — Fix even more localStorage issues, this time caused by my own incompetence
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
	let ini_settings_dict = {
		divider: `</details>\n\n`,
		autoPrivate: false,
		showAutoTagButton: true,
		bottomSummaryPage: true,
		topSummaryPage: false,
		simpleWorkSummary: false,
		FWS_asBlockquote: true,
		splitSelect: 1,
	};

	/* EXPLANATION OF THE "CONSTANTS" THAT CAN BE CHANGED BY THE END USER

divider               : String which is used to indicate where the bookmark should be split in half


autoPrivate           : If true, automatically checks the checkbox to private the bookmark


showAutoTagButton     : If true, shows the "Auto Tag" button when bookmarking a work


bottomSummaryPage     : If true, checks if the current page is an entire work page or a work page that is not on the first chapter.
If the aforementioned checks are passed, Adds a "Summary Page" button to the bottom nav bar to easily navigate to a page where the summary exists so it can be picked up by the userscript.
This is done due to the fact that the last read date will not update when updating a bookmark from the latest chapter.


topSummaryPage        : If true, also adds a Summary Page button to the top nav bar next to the "Entire Work" button


simpleWorkSummary     : If true, uses the original method to retrieve the work summary (least hassle, but includes the 'Summary' heading element which some users may find annoying).
If false, retrieves the work summary in a way (which I call the fancy way) that allows more flexibility when customising newBookmarkNotes


FWS_asBlockquote : If using the fancy work summary method, set whether you want to retrieve the summary as a blockquote.
For more information on the effects of changing simpleWorkSummary and FWS_asBlockquote, please look at where simpleWorkSummary is first used in the script, it should be around line 1171


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
	var
		divider,
		autoPrivate,
		showAutoTagButton,
		bottomSummaryPage,
		topSummaryPage,
		simpleWorkSummary,
		FWS_asBlockquote,
		splitSelect,
		workInfo,
		new_notes;

	// localStorage stuff
	if (typeof Storage != `undefined`) { // If localStorage exists

		console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
localStorage exists`
		);


		switch (Boolean(localStorage.getItem(`w4BM_divider`))) {
			// Execute if statement only if w4BM_divider is not set in localStorage
			case false:
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

				break;

			// Execute if statement only if w4BM_divider is set in localStorage
			case true:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_divider' IS SET in the localStorage`
				);

				divider = localStorage.getItem(`w4BM_divider`);

				break;

			default:
				console.log(`Error in retrieving localStorage variable w4BM_divider`);
				break;
		}

		// doing the same thing as the first if else on line 174
		switch (Boolean(localStorage.getItem(`w4BM_autoPrivate`))) {
			case false:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_autoPrivate' is not set in the localStorage
Now setting it to '${ini_settings_dict.autoPrivate}'`
				);

				autoPrivate = ini_settings_dict.autoPrivate;
				localStorage.setItem(`w4BM_autoPrivate`, ini_settings_dict.autoPrivate);

				break;

			case true:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_autoPrivate' IS SET in the localStorage`
				);

				autoPrivate = stringToBoolean(localStorage.getItem(`w4BM_autoPrivate`));

				break;

			default:
				console.log(`Error in retrieving localStorage variable w4BM_autoPrivate`);
				break;
		}

		// doing the same thing as the first if else on line 174
		switch (Boolean(localStorage.getItem(`w4BM_showAutoTagButton`))) {
			case false:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_showAutoTagButton' is not set in the localStorage
Now setting it to '${ini_settings_dict.showAutoTagButton}'`
				);

				showAutoTagButton = ini_settings_dict.showAutoTagButton;
				localStorage.setItem(`w4BM_showAutoTagButton`, ini_settings_dict.showAutoTagButton);

				break;

			case true:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_showAutoTagButton' IS SET in the localStorage`
				);

				showAutoTagButton = stringToBoolean(localStorage.getItem(`w4BM_showAutoTagButton`));

				break;

			default:
				console.log(`Error in retrieving localStorage variable w4BM_showAutoTagButton`);
				break;
		}

		// doing the same thing as the first if else on line 174
		switch (Boolean(localStorage.getItem(`w4BM_bottomSummaryPage`))) {
			case false:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_bottomSummaryPage' is not set in the localStorage
Now setting it to '${ini_settings_dict.bottomSummaryPage}'`
				);

				bottomSummaryPage = ini_settings_dict.bottomSummaryPage;
				localStorage.setItem(`w4BM_bottomSummaryPage`, ini_settings_dict.bottomSummaryPage);

				break;

			case true:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_bottomSummaryPage' IS SET in the localStorage`
				);

				bottomSummaryPage = stringToBoolean(localStorage.getItem(`w4BM_bottomSummaryPage`));

				break;

			default:
				console.log(`Error in retrieving localStorage variable w4BM_bottomSummaryPage`);
				break;
		}

		// doing the same thing as the first if else on line 174
		switch (Boolean(localStorage.getItem(`w4BM_topSummaryPage`))) {
			case false:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_topSummaryPage' is not set in the localStorage
Now setting it to '${ini_settings_dict.topSummaryPage}'`
				);

				topSummaryPage = ini_settings_dict.topSummaryPage;
				localStorage.setItem(`w4BM_topSummaryPage`, ini_settings_dict.topSummaryPage);

				break;

			case true:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_topSummaryPage' IS SET in the localStorage`
				);

				topSummaryPage = stringToBoolean(localStorage.getItem(`w4BM_topSummaryPage`));

				break;

			default:
				console.log(`Error in retrieving localStorage variable w4BM_topSummaryPage`);
				break;
		}

		// doing the same thing as the first if else on line 174
		switch (Boolean(localStorage.getItem(`w4BM_simpleWorkSummary`))) {
			case false:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_simpleWorkSummary' is not set in the localStorage
Now setting it to '${ini_settings_dict.simpleWorkSummary}'`
				);

				simpleWorkSummary = ini_settings_dict.simpleWorkSummary;
				localStorage.setItem(`w4BM_simpleWorkSummary`, ini_settings_dict.simpleWorkSummary);

				break;

			case true:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_simpleWorkSummary' IS SET in the localStorage`
				);

				simpleWorkSummary = stringToBoolean(localStorage.getItem(`w4BM_simpleWorkSummary`));

				break;

			default:
				console.log(`Error in retrieving localStorage variable w4BM_simpleWorkSummary`);
				break;
		}

		// doing the same thing as the first if else on line 174
		switch (Boolean(localStorage.getItem(`w4BM_FWS_asBlockquote`))) {
			case false:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_FWS_asBlockquote' is not set in the localStorage
Now setting it to '${ini_settings_dict.FWS_asBlockquote}'`
				);

				FWS_asBlockquote = ini_settings_dict.FWS_asBlockquote;
				localStorage.setItem(`w4BM_FWS_asBlockquote`, ini_settings_dict.FWS_asBlockquote);

				break;

			case true:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_FWS_asBlockquote' IS SET in the localStorage`
				);

				FWS_asBlockquote = stringToBoolean(localStorage.getItem(`w4BM_FWS_asBlockquote`));

				break;

			default:
				console.log(`Error in retrieving localStorage variable w4BM_FWS_asBlockquote`);
				break;
		}

		// doing the same thing as the first if else on line 174
		switch (Boolean(localStorage.getItem(`w4BM_splitSelect`))) {
			case false:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_splitSelect' is not set in the localStorage
Now setting it to '${ini_settings_dict.splitSelect}'`
				);

				splitSelect = ini_settings_dict.splitSelect;
				localStorage.setItem(`w4BM_splitSelect`, ini_settings_dict.splitSelect);

				break;

			case true:
				console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
'w4BM_splitSelect' IS SET in the localStorage`
				);

				splitSelect = parseInt(localStorage.getItem(`w4BM_splitSelect`));

				break;

			default:
				console.log(`Error in retrieving localStorage variable w4BM_splitSelect`);
				break;
		}

	}
	else { // if localStorage does not exist

		divider = ini_settings_dict.divider;
		autoPrivate = ini_settings_dict.autoPrivate;
		showAutoTagButton = ini_settings_dict.showAutoTagButton;
		bottomSummaryPage = ini_settings_dict.bottomSummaryPage;
		topSummaryPage = ini_settings_dict.topSummaryPage;
		simpleWorkSummary = ini_settings_dict.simpleWorkSummary;
		FWS_asBlockquote = ini_settings_dict.FWS_asBlockquote;
		splitSelect = ini_settings_dict.splitSelect;

	}


	// Log the current value of the vars in localStorage
	var log_string = `
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
Logging the current state of vars used by the script

localStorage vars:`;

	Object.keys(ini_settings_dict).forEach((key) => {
		var spacing = 19 - key.toString().length;
		if (key == `divider`) {
			log_string += `\n${key.toString()}${" ".repeat(spacing)}: ${localStorage.getItem(`w4BM_${key}`).replace(/\n/gi, `\\n`).replace(/\t/gi, `\\t`).replace(/\r/gi, `\\r`)}`;
		} else {
			log_string += `\n${key.toString()}${" ".repeat(spacing)}: ${localStorage.getItem(`w4BM_${key}`)}`;
		}
	});

	log_string += `

current script vars (list may be incomplete):
divider           : ${divider.replace(/\n/gi, `\\n`).replace(/\t/gi, `\\t`).replace(/\r/gi, `\\r`)}
autoPrivate       : ${autoPrivate}
showAutoTagButton : ${showAutoTagButton}
bottomSummaryPage : ${bottomSummaryPage}
topSummaryPage    : ${topSummaryPage}
simpleWorkSummary : ${simpleWorkSummary}
FWS_asBlockquote  : ${FWS_asBlockquote}
splitSelect       : ${splitSelect}`;

	console.log(log_string);


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
			style: `width: auto;`
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
			style: `padding-top: .75em;`,
			innerHTML: `<p style='padding: .75em .5em .5em;'>Divider text:<br /></p>`
		});

		// create the text input box for the divider value
		var w4BM_divider_input_box = Object.assign(document.createElement(`input`), {
			type: `text`,
			id: `w4BM_divider_input_box`,
			name: `w4BM_divider_input_box`,
			style: `width: 16em; margin-left: 0.2em;`
		});
		w4BM_divider_input_box.setAttribute(`value`, localStorage.getItem(`w4BM_divider`).replace(/\n/gi, `\\n`).replace(/\t/gi, `\\t`).replace(/\r/gi, `\\r`) || `divider\\n\\n`);
		w4BM_divider_input_area.append(w4BM_divider_input_box);

		// create divider input submit button
		var w4BM_divider_input_btn = Object.assign(document.createElement(`button`), {
			id: `w4BM_divider_input_btn`,
			style: `margin-left: 0.3em;`,
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

		// create button - show AutoTag button - yes
		var w4BM_showAutoTagButton_yes = Object.assign(document.createElement(`li`), {
			className: `w4BM_showAutoTagButton_yes`,
			id: `w4BM_showAutoTagButton_yes`,
			innerHTML: `<a>Show AutoTag Button: YES</a>`
		});
		w4BM_showAutoTagButton_yes.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_showAutoTagButton`, false);
			w4BM_showAutoTagButton_yes.replaceWith(w4BM_showAutoTagButton_no);
		});

		// create button - show AutoTag button - no
		var w4BM_showAutoTagButton_no = Object.assign(document.createElement(`li`), {
			className: `w4BM_showAutoTagButton_no`,
			id: `w4BM_showAutoTagButton_no`,
			innerHTML: `<a>Show AutoTag Button: NO</a>`
		});
		w4BM_showAutoTagButton_no.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_showAutoTagButton`, true);
			w4BM_showAutoTagButton_no.replaceWith(w4BM_showAutoTagButton_yes);
		});

		// create button - add "Summary Page" button to bottom navbar
		var w4BM_bottomSummaryPage_yes = Object.assign(document.createElement(`li`), {
			className: `w4BM_bottomSummaryPage_yes`,
			id: `w4BM_bottomSummaryPage_yes`,
			innerHTML: `<a>"Summary Page" button in bottom navbar: YES</a>`
		});
		w4BM_bottomSummaryPage_yes.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_bottomSummaryPage`, false);
			w4BM_bottomSummaryPage_yes.replaceWith(w4BM_bottomSummaryPage_no);
		});

		// create button - do not add "Summary Page" button to bottom navbar
		var w4BM_bottomSummaryPage_no = Object.assign(document.createElement(`li`), {
			className: `w4BM_bottomSummaryPage_no`,
			id: `w4BM_bottomSummaryPage_no`,
			innerHTML: `<a>"Summary Page" button in bottom navbar: NO</a>`
		});
		w4BM_bottomSummaryPage_no.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_bottomSummaryPage`, true);
			w4BM_bottomSummaryPage_no.replaceWith(w4BM_bottomSummaryPage_yes);
		});

		// create button - add "Summary Page" button to top navbar
		var w4BM_topSummaryPage_yes = Object.assign(document.createElement(`li`), {
			className: `w4BM_topSummaryPage_yes`,
			id: `w4BM_topSummaryPage_yes`,
			innerHTML: `<a>"Summary Page" button in top navbar: YES</a>`
		});
		w4BM_topSummaryPage_yes.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_topSummaryPage`, false);
			w4BM_topSummaryPage_yes.replaceWith(w4BM_topSummaryPage_no);
		});

		// create button - do not add "Summary Page" button to top navbar
		var w4BM_topSummaryPage_no = Object.assign(document.createElement(`li`), {
			className: `w4BM_topSummaryPage_no`,
			id: `w4BM_topSummaryPage_no`,
			innerHTML: `<a>"Summary Page" button in top navbar: NO</a>`
		});
		w4BM_topSummaryPage_no.addEventListener(`click`, function (event) {
			localStorage.setItem(`w4BM_topSummaryPage`, true);
			w4BM_topSummaryPage_no.replaceWith(w4BM_topSummaryPage_yes);
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

			// showing AutoTag button
			if (showAutoTagButton == true || showAutoTagButton == `true`) {
				w4BM_dropMenu.append(w4BM_showAutoTagButton_yes);
			}
			else {
				w4BM_dropMenu.append(w4BM_showAutoTagButton_no);
			}

			// adding "Summary Page" to bottom navbar
			if (bottomSummaryPage == true || bottomSummaryPage == `true`) {
				w4BM_dropMenu.append(w4BM_bottomSummaryPage_yes);
			}
			else {
				w4BM_dropMenu.append(w4BM_bottomSummaryPage_no);
			}

			// adding "Summary Page" to top navbar
			if (topSummaryPage == true || topSummaryPage == `true`) {
				w4BM_dropMenu.append(w4BM_topSummaryPage_yes);
			}
			else {
				w4BM_dropMenu.append(w4BM_topSummaryPage_no);
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

	// ------------------------------------------------------

	var BSP_conditional = (currPgURL.includes(`works`) && main.querySelector(`li.chapter.previous`) != null && bottomSummaryPage),
		TSP_conditional = (currPgURL.includes(`works`) && main.querySelector(`li.chapter.previous`) != null && topSummaryPage);
	console.log(`
All conditions met for "Summary Page" button in the bottom nav bar?: ${BSP_conditional}
All conditions met for "Summary Page" button in the top nav bar?: ${TSP_conditional}`
	);

	// Creating the "Summary Page" buttons
	// Make the href for the "Summary Page" button
	var sum_pg_href = main.querySelector(`li.chapter.entire a`)?.getAttribute(`href`).replace(/(.*?works\/\d+)\?.*/, `$1`);

	// Create the bottom "Summary Page" button
	var btm_sum_pg = Object.assign(document.createElement(`li`), {
		className: `bottomSummaryPage`,
		id: `bottomSummaryPage`,
		style: `padding-left: 0.5663em;`,
		innerHTML: `<a href="${sum_pg_href}">Summary Page</a>`
	});

	// Create the top "Summary Page" button
	var top_sum_pg = Object.assign(document.createElement(`li`), {
		className: `topSummaryPage`,
		id: `topSummaryPage`,
		style: `padding-left: 0.31696592em;`,
		innerHTML: `<a href="${sum_pg_href}">SP</a>`
	});

	// Get the "↑ Top" button that's in the bottom nav bar
	let toTop_xp = `.//*[@id="feedback"]//*[@role="navigation"]//li[*[text()[contains(.,"Top")]]]`;
	let toTop_btn = document.evaluate(toTop_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

	// Get the Entire Work button in the top nav bar
	// Define the var which the Entire Work button will be stored in
	var entiWork_topnavBTN;

	// At least one script modifies the top navigation bar to the extent that the original XPath doesn't work, so this is me adding a fallback
	// Original XPath
	var entiWork_topnavBTN_xPath = `.//*[contains(concat(" ",normalize-space(@class)," ")," work ")][contains(concat(" ",normalize-space(@class)," ")," navigation ")][contains(concat(" ",normalize-space(@class)," ")," actions ")]//*[contains(concat(" ",normalize-space(@class)," ")," chapter ")][contains(concat(" ",normalize-space(@class)," ")," entire ")][count(.//a[contains(@href,"view_full_work=true")]) > 0]`;
	entiWork_topnavBTN = document.evaluate(entiWork_topnavBTN_xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	if (Boolean(entiWork_topnavBTN) == false) {
		// Fallback XPath
		var entiWork_topnavBTN_xPath = `.//li[contains(concat(" ",normalize-space(@class)," ")," entire ")][count(.//a[contains(@href,"view_full_work=true")]) > 0]`;
		entiWork_topnavBTN = document.evaluate(entiWork_topnavBTN_xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}

	// Debug code
	// console.log(btm_sum_pg);
	// console.log(top_sum_pg);
	// console.log(toTop_btn);
	// console.log(entiWork_topnavBTN);

	if (BSP_conditional) {
		// If true, add a "Summary Page" button after the "↑ Top" button in the bottom navbar to take you to a page where the summary exists and can be used by the userscript
		toTop_btn.after(btm_sum_pg);
	}
	if (TSP_conditional) {
		// If true, adds summary page btn to top navbar
		entiWork_topnavBTN.after(top_sum_pg);
	}

	// make the bookmarking part of the script work only in places where you can make bookmarks
	// this if statement was the easiest way i could think of (im lazy ok) to solve the problem of it erroring on the user preferences page
	// oh and it also makes sure that the script only works and replaces your current bookmark with new text when a summary element exists
	// (yet again, the easiest way i could think of to stop the script from replacing a summary with 'undefined')

	// removed requirement for summary since some works dont have a summary
	// old if: if ((currPgURL.includes(`works`) || currPgURL.includes(`series`)) && (!!document.getElementsByClassName(`summary`).length || document.evaluate(`.//*[@id="main"]//span[text()="Series"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue != undefined)) {
	if ((currPgURL.includes(`works`) || currPgURL.includes(`series`))) {

		if (autoPrivate) { // for auto-privating your bookmarks
			main.querySelector(`#bookmark_private`).checked = true;
		}

		// Define variables used in date configuration
		var currdate = new Date(),
			dd = String(currdate.getDate()).padStart(2, `0`),
			mm = String(currdate.getMonth() + 1).padStart(2, `0`), //January is 0
			yyyy = currdate.getFullYear(),
			hh = String(currdate.getHours()).padStart(2, `0`),
			mins = String(currdate.getMinutes()).padStart(2, `0`);

		// Define variables used in bookmark configuration
		var
			curr_notes = main.querySelector(`#bookmark_notes`).textContent.split(divider).at(`-${splitSelect}`),
			author,
			author_HTML,
			words,
			AO3_status,
			title,
			relationships = ``,
			summary = `<em><strong>NO SUMMARY</strong></em>`,
			series_summary,
			series_notes,
			series_works_summaries = ``,
			lastChapter,
			latestChapterNumLength,
			chapNumPadCount,
			ws_id,
			autotag_status,
			word_count_tag;

		// Define function used in the Auto Tag feature
		function statusCheck_for_AutoTag() {
			// Look for HTML DOM element only present on series pages
			let seriesTrue = document.evaluate(`.//*[@id="main"]//span[text()="Series"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

			// Check if current page is a series page
			if (seriesTrue != undefined) {
				let
					statusCheck_XPath = '//dl[contains(concat(" ",normalize-space(@class)," ")," series ")][contains(concat(" ",normalize-space(@class)," ")," meta ")][contains(concat(" ",normalize-space(@class)," ")," group ")]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[contains(text(), "Complete")]/following-sibling::*[1]',
					status_check = document.evaluate(statusCheck_XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;

				switch (status_check) {
					case 'Yes':
						autotag_status = 'Complete';
						break;

					case 'No':
						autotag_status = 'Work In Progress';
						break;

					default:
						break;
				}
			}
			else {
				let status_check = document.querySelector('.work.meta.group dl.stats dt.status');

				if (Boolean(status_check) == false) { // For single chapter works which are always complete
					autotag_status = 'Complete';
				}
				else { // For multi chapter works
					switch (status_check.textContent) {
						case 'Completed:':
							autotag_status = 'Complete';
							break;

						case 'Updated:':
							autotag_status = 'Work in Progress';
							break;

						default:
							break;
					}
				}
			}
		}

		// Make the button used in Auto Tag
		if (document.querySelector(`#bookmark-form`) && showAutoTagButton) {

			// Get element in bookmark form to append button to
			var yourTags_xp = `.//div[@id="main"]//div[@id="bookmark-form"]//dt/label[text() = 'Your tags']`,
				yourTags_elem = document.evaluate(yourTags_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

			// Create button element
			var autoTag_btn_elem = Object.assign(document.createElement(`label`), {
				id: `w4BM_autoTag_elem`,
				className: `actions`,
				style: `font-size: 0.85em`,
				innerHTML: `<a id='w4BM_autoTag_btn'>Auto Tag</a>`
			});

			// Append button element
			yourTags_elem.after(autoTag_btn_elem);

			// Select the parent dt element to which the button will be a child of
			var yourTags_parent_dt_xp = `.//div[@id="main"]//div[@id="bookmark-form"]//dt[./label[text() = 'Your tags']]`,
				yourTags_parent_dt_elem = document.evaluate(yourTags_parent_dt_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;;

			// Change the display style of the parent dt of the yourTags_elems to contents
			yourTags_parent_dt_elem.style.display = `contents`;

			// Add click listener to autoTag_btn_elem
			autoTag_btn_elem.addEventListener(`click`, AutoTag);
		}

		// Look for HTML DOM element only present on series pages
		var seriesTrue = document.evaluate(`.//*[@id="main"]//span[text()="Series"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		// Check if current page is a series page
		if (seriesTrue != undefined) {
			// Retrieve series information

			// Define RegEx for extracing series ID from URL
			const re_su = /(^https?:\/\/)(.*\.)?(archiveofourown\.org)(.*?)(\/series\/)(\d+)\/?.*$/i;

			// Retrieve series title
			title = main.querySelector(`:scope > h2.heading`).textContent.trim();
			// Retrieve series word count
			words = document.evaluate(`.//*[@id="main"]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[text()="Words:"]/following-sibling::*[1]/self::dd`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
			// Retrieve series author
			let
				series_author_xpath = `.//*[@id="main"]//dl[contains(concat(" ",normalize-space(@class)," ")," series ")][contains(concat(" ",normalize-space(@class)," ")," meta ")][contains(concat(" ",normalize-space(@class)," ")," group ")]//dt[text()[contains(.,"Creator")]]/following-sibling::*[1]/self::dd`,
				series_author_element = document.evaluate(series_author_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			author = series_author_element.textContent.trim();
			// check if series_author_element contains a link
			// if it does, assign contents of the outerHTML of the <a> tag to author_HTML as a string
			// if it doesnt, make author_HTML identical to author
			if (Boolean(series_author_element.querySelectorAll(`a`))) {
				let auth_str_arr = [];
				Array.from(series_author_element.querySelectorAll(`a`)).forEach(function (el) {
					let el_c = el.cloneNode(true);
					auth_str_arr.push(el_c.outerHTML);
				});
				author_HTML = auth_str_arr.join(`, `);
			} else {
				author_HTML = author;
			}
			// Check if there is a series summary
			switch (Boolean(main.querySelector(`.series.meta.group .userstuff`))) {
				case true: // If series summary exists, retrieve summary
					series_summary = main.querySelector(`.series.meta.group .userstuff`).innerHTML;
					break;

				case false: // Else fill in var with NO SUMMARY string
					series_summary = `<em><strong>NO SUMMARY</strong></em>`;
					break;

				default: // If error, fill var asking for bug report
					series_summary = `<em>Error in retrieving series summary, please report this bug at</em> https://greasyfork.org/en/scripts/467885`;
					break;
			}
			// Check if there are series notes
			let series_notes_dt_xp = `.//*[contains(concat(" ",normalize-space(@class)," ")," series ")][contains(concat(" ",normalize-space(@class)," ")," meta ")][contains(concat(" ",normalize-space(@class)," ")," group ")]//dt[text()[contains(.,"Notes:")]]`;
			switch (Boolean(document.evaluate(series_notes_dt_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue)) {
				case true: // If series notes exists, retrieve notes
					series_notes = document.evaluate(`${series_notes_dt_xp}/following-sibling::*[1]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;
					series_notes = `<details><summary>Series Notes:</summary>\n${series_notes}\n</details>`;
					break;

				case false:
					series_notes = ``;
					break;

				default:
					break;
			}

			// Join series summary and series notes
			summary = series_summary + series_notes;

			// Get summaries for each work in series
			let series_children = Array.from(main.querySelector(`.series.work.index.group`).children);
			var srsWkSum_arr = [];
			series_children.forEach((child, index) => {
				var srs_work_sum = `<em><strong>NO SUMMARY</strong></em>`;
				let workname = child.querySelector(`.heading a[href*="works"]`).innerText;
				let summary_elem = child.querySelector(`.userstuff.summary`);
				if (Boolean(summary_elem) == true) {
					srs_work_sum = summary_elem.outerHTML;
				}
				srsWkSum_arr.push(`<details><summary>Work ${index + 1}. ${workname} - Summary</summary>\n${srs_work_sum}</details>`);
			});
			series_works_summaries = `\n${srsWkSum_arr.join(`\n`)}`;

			// Get all relationship tags present in series' works and add them to series bookmark
			// Retrieve relationship tags
			var raw_rels_arr = Array.from(document.querySelectorAll(`ul.tags > li.relationships > a.tag`)), rels_arr = [];
			raw_rels_arr.forEach(function (element, index, array) {
				let element_clone = element.cloneNode(true);
				element_clone.removeAttribute(`class`);

				let rel_string = element_clone.outerHTML;
				// console.log(`Content in array ${array} at index ${index}: ${array[index]}`);
				// console.log(element_clone.outerHTML);

				rels_arr.push(`• ${rel_string}`);
			});

			// Remove duplicates in rels_arr
			rels_arr = [...new Set(rels_arr)];

			// Attempt to add entries from rels_arr to relationships regardless of whether rels_arr is empty or not
			relationships = `<details><summary>Relationship Tags:</summary>\n${rels_arr.join(`\n`)}</details>`;

			// Check if rels_arr is empty, indicating no relationship tags
			if (!Array.isArray(rels_arr) || !rels_arr.length) {
				// If empty, set 'relationships' var to indicate no relationship tags
				relationships = `<details><summary>Relationship Tags:</summary>\n• <em><strong>No Relationship Tags</strong></em></details>`;
			}


			// Retrieve series status
			let pub_xp = `//dl[contains(concat(" ",normalize-space(@class)," ")," series ")][contains(concat(" ",normalize-space(@class)," ")," meta ")][contains(concat(" ",normalize-space(@class)," ")," group ")]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[contains(text(), "Complete")]/following-sibling::*[1]`;
			let complete = document.evaluate(pub_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
			var updated = main.querySelector(`.series.meta.group`).getElementsByTagName(`dd`)[2].textContent;
			switch (complete) {
				case `No`:
					AO3_status = `Updated: ${updated}`;
					break;

				case `Yes`:
					AO3_status = `Completed: ${updated}`;
					break;

				default:
					break;
			}
			// Retrieve series ID
			ws_id = currPgURL.replace(re_su, `$6`);


		}
		else {
			// Retrieve work information

			// Define RegEx for extracting work ID from URL
			const re_wu = /(^https?:\/\/)(.*\.)?(archiveofourown\.org)(.*?)(\/works\/)(\d+)\/?.*$/i;

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
			let work_author_element = main.querySelector(`#workskin > .preface .byline`);
			author = work_author_element.textContent.trim(); // fic author
			// check if work_author_element contains a link
			// if it does, assign contents of the outerHTML of the <a> tag to author_HTML as a string
			// if it doesnt, make author_HTML identical to author
			if (Boolean(work_author_element.querySelectorAll(`a`))) {
				let auth_str_arr = [];
				Array.from(work_author_element.querySelectorAll(`a`)).forEach(function (el) {
					let el_c = el.cloneNode(true);
					auth_str_arr.push(el_c.outerHTML);
				});
				author_HTML = auth_str_arr.join(`, `);
			} else {
				author_HTML = author;
			}

			// Retrieve relationship tags
			var raw_rels_arr = Array.from(document.querySelectorAll(`.relationship.tags ul a`));
			var rels_arr = [];
			raw_rels_arr.forEach(function (el) {
				let el_c = el.cloneNode(true);
				el_c.removeAttribute(`class`);
				rels_arr.push(`• ${el_c.outerHTML}`);
			});

			// Add Relationship tags to 'relationships' var
			relationships = `<details><summary>Relationship Tags:</summary>\n${rels_arr.join(`\n`)}</details>`;

			// Check if rels_arr is empty, indicating no relationship tags
			if (!Array.isArray(rels_arr) || !rels_arr.length) {
				// Set 'relationships' var to indicate no relationship tags
				relationships = `<details><summary>Relationship Tags:</summary>\n• <em><strong>No Relationship Tags</strong></em></details>`;
			}

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
				AO3_status = `${main.querySelector(`dt.status`).textContent} ${main.querySelector(`dd.status`).textContent}`;
			}
			else {
				// Retrieval method for single chapter works
				AO3_status = `${main.querySelector(`dt.published`).textContent} ${main.querySelector(`dd.published`).textContent}`;
			}

			// Retrieve work ID
			ws_id = currPgURL.replace(re_wu, `$6`);

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
		- date_string               // String to show when the work was last read – User configurable in the Date configuration sub-section
		- title                     // Title of the work or series
		- author                    // Author of the work or series
		- author_HTML               // Author of the work or series, as an HTML <a> element (a link). e.g. the author_HTML string for AO3 work 54769867 would be '<a rel="author" href="/users/nescias/pseuds/nescias">nescias</a>'
		- AO3_status                // Status of the work or series. i.e. Completed: 2020-08-23, Updated: 2022-05-08, Published: 2015-06-29
		- relationships             // For work bookmarks, it's the Relationship tags present in the work and it will be a collapsible element in your work bookmark. For series bookmarks, it's all of the unique Relationship tags present in all the works in a series and it will be a collapsible element in your series bookmark
		- summary                   // Summary of the work or series
		- words                     // Current word count of the work or series
		- ws_id                     // ID of the work/series being bookmarked

		Variables specific to series:
		- series_works_summaries    // Adds all of the summaries of the works in the series to the series bookmark

		Variables specific to works:
		- lastChapter               // Last published chapter of the work or series

		*/

		/* //// Date configuration sub-section //// */
		/*
		// THE CONFIGURATION RELIES HEAVILY ON TEMPLATE LITERALS
		// FOR MORE INFORMATION ON TEMPLATE LITERALS PLEASE VISIT THE FOLLOWING WEBPAGE
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
		*/

		// Setting the date
		// Feel free to use your own date format, you don't need to stick to the presets here.
		// If you dont like the predefined vars for date, and your device supports the require field,
		// I've added the moment.js library which you can use to define your own date var.
		// e.g.
		// var date = moment().format("dddd, MMMM Do YYYY, h:mm:ss a");
		// would give you something like the following string:
		// "Thursday, August 31st 2023, 4:38:35 pm"
		// 
		// format guide available here: https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/

		var date = `${yyyy}/${mm}/${dd}`, // Date without time
			date_string = `(Approximate) Last Read: ${date}`;
		// date = `${yyyy}/${mm}/${dd} ${hh}${mm}hrs`; // Date with time
		console.log(`
w4tchdoge's AO3 Bookmark Maker UserScript – Log
--------------------
Date Generated: ${date}
Date String Generated: ${date_string}`
		);
		// Make the date string an empty string for series because it doesnt make sense there
		if (Boolean(seriesTrue)) {
			date_string = ``;
		}

		/* ///////////// Select from Presets ///////////// */

		// To stop using a preset, wrap it in a block comment (add /* to the start and */ to the end); To start using a preset, do the opposite.
		// Remember to make sure the variables are set correctly for that preset
		// divider and splitSelect are set in the dropdown menu on your User Preferences page
		// new_notes is set at the bottom of the script
		// If you're experiencing any issues with the script, please do not hesitate to PM me on GreasyFork
		// I could have simply made a mistake in the documentation which is messing everything up (I am not infallible XD)

		// ------------------------

		// Preset 1 – With last read date
		// To use this preset, scroll to the top where the constants are defined and set divider and splitSelect to the following values:
		// divider = `</details>\n\n`
		// splitSelect = 1
		// new_notes = `${workInfo}\n\n${curr_notes}`

		workInfo = `<details><summary>Work/Series Details</summary>
\t${title} by ${author_HTML}
\t${AO3_status}
\tWork/Series ID: ${ws_id}
\t${relationships}
\t<details><summary>Work/Series Summary:</summary>
\t${summary}</details>
${date_string}</details>`;

		// ------------------------

		// Preset 2 – Without last read date
		// To use this preset, scroll to the top where the constants are defined and set divider and splitSelect to the following values:
		// divider = `</details>\n\n`
		// splitSelect = 1
		// new_notes = `${workInfo}\n\n${curr_notes}`

		/* workInfo = `<details><summary>Work Details</summary>
\t${title} by ${author}
\t${status}
\tWork/Series ID: ${ws_id}
\t${relationships}
\t<details><summary>Work Summary:</summary>
\t${summary}</details>
</details>`; */

		// ------------------------

		// Preset 3 – Preset 1 but reversed
		// To use this preset, scroll to the top where the constants are defined and set divider and splitSelect to the following values:
		// divider = `<br />\n<details>`
		// splitSelect = 0
		// new_notes = `${curr_notes}<br />\n${workInfo}`

		/* workInfo = `<details><summary>Work Details</summary>
\t${title} by ${author}
\t${status}
\tWork/Series ID: ${ws_id}
\t${relationships}
\t<details><summary>Work Summary:</summary>
\t${summary}</details>
(Approximate) Last Read: ${date}</details>`; */

		// ------------------------

		// Preset 4 – Preset 2 but reversed
		// To use this preset, scroll to the top where the constants are defined and set divider and splitSelect to the following values:
		// divider = `<br />\n<details>`
		// splitSelect = 0
		// new_notes = `${curr_notes}<br />\n${workInfo}`

		/* workInfo = `<details><summary>Work Details</summary>
\t${title} by ${author}
\t${status}
\tWork/Series ID: ${ws_id}
\t${relationships}
\t<details><summary>Work Summary:</summary>
\t${summary}</details>
(Approximate) Last Read: ${date}</details>`; */

		// ------------------------

		// Auto Tag Feature

		function AutoTag() {
			// Call Status Check
			statusCheck_for_AutoTag();

			// Define vars
			var words_XPath = './/*[@id="main"]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[text()="Words:"]/following-sibling::*[1]/self::dd',
				words = document.evaluate(words_XPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent.toString().replaceAll(/,| |\s/gi, ''),
				words = parseInt(words),
				tag_input_box = document.querySelector('.input #bookmark_tag_string_autocomplete');

			// Define Word Count Tag
			// In case you want to add more tags or change the word count range for each tag,
			// here are some recourses on how comparators work in JavaScript:
			// StackOverflow answer that shows you how equalities work: https://stackoverflow.com/a/14718577/11750206
			// An overview of JavaScript's Comparison and Logical Operators: https://www.w3schools.com/js/js_comparisons.asp
			if (words < 2500) { word_count_tag = 'Word Count: Less than 2500'; }
			if (words < 7500 && words >= 2500) { word_count_tag = 'Word Count: 2500 to 7499'; }
			if (words < 15000 && words >= 7500) { word_count_tag = 'Word Count: 7500 to 14999'; }
			if (words < 30000 && words >= 15000) { word_count_tag = 'Word Count: 15000 to 29999'; }
			if (words >= 30000) { word_count_tag = 'Word Count: Greater than 30000'; }

			// Put the Auto Tags into the User Tags field
			tag_input_box.value = `${autotag_status}, ${word_count_tag}`;
		}

		// ------------------------

		// You are free to define your own string for the newBookmarkNotes variable as you see fit


		// Fills the bookmark box with the autogenerated bookmark
		new_notes = `${workInfo}\n\n${curr_notes}`;
		document.getElementById("bookmark_notes").innerHTML = new_notes;

	}

})();
