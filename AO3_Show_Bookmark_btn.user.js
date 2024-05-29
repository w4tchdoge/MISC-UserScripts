// ==UserScript==
// @name           AO3: Add button to Show Bookmark
// @namespace      https://github.com/w4tchdoge
// @version        1.0.3-20240529_223125
// @description    Adds a "Show Bookmark" button before the "Edit Bookmark" button on the page where you view a work's bookmarks
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Show_Bookmark_btn.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Show_Bookmark_btn.user.js
// @match          *://archiveofourown.org/*/bookmarks
// @match          *://archiveofourown.org/bookmarks*
// @license        AGPL-3.0-or-later
// @history        1.0.3 — Make sure script works on bookmark searches. Add a check to make sure that the script only executes if the existing_edit_btns array has elements in it
// @history        1.0.2 — Make sure script only adds a "Show Bookmark" button when there is an "Edit Bookmark" button as opposed to a "Bookmark" button that is used to make new bookmarks
// @history        1.0.1 — Fix issue caused by data-remote attribute where bookmark could not be opened in the current tab
// @history        1.0.0 — Initial commit
// ==/UserScript==

(function () {
	`use strict`;

	// create array of the parent elements of the li element that makes up the native edit bookmark buttons
	let existing_edit_btns = Array.from(document.querySelectorAll(`*:has(> li > [id^="bookmark_form_trigger"][href*="edit"])`));

	// Check if the array exists and has elements
	if (Array.isArray(existing_edit_btns) && Boolean(existing_edit_btns.length)) {
		// console.log(`existing edit buttons exist on this page`);

		// proceed to iterate on each element in existing_edit_btns to make and insert a new show bookmark button
		existing_edit_btns.forEach(function (elm, i, arr) {
			// get the original li element which the link is a child of and make it a const so it cant be changed
			// orig is needed as a reference for the new "Show Bookmark" li elm to be added before
			const orig = elm.querySelector(`li`);

			let
				// clone orig to modify it and make the new show bookmark button element
				li_elm = orig.cloneNode(true),
				// make a variable specifically for the a element so i dont have to call a querySelector everytime
				a_elm = li_elm.querySelector(`a`);

			// remove the data-remote as it prevents the bookmark from being opened in the current tab
			a_elm.removeAttribute(`data-remote`);

			// get the original a element id and change it for the new one
			const a_elm_id = a_elm.getAttribute(`id`).replace(`bookmark_form`, `show_bookmark`);

			// get the original a element href and change it for the new one
			const a_elm_link_href = a_elm.getAttribute(`href`).replace(`/edit`, ``);

			// get the original a element textContent and change it for the new one
			const a_elm_text = a_elm.textContent.replace(/edit/i, `Show`);

			// modify the cloned element using the a_elm_* variables to make the new "Show Bookmark" button
			a_elm.setAttribute(`id`, a_elm_id);
			a_elm.setAttribute(`href`, a_elm_link_href);
			a_elm.textContent = a_elm_text;

			// add the new "Show Bookmark" button before the edit bookmark button
			orig.before(li_elm);
		});

	}// else { console.log(`existing edit buttons DO NOT exist on this page`); }
})();
