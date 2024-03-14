// ==UserScript==
// @name           AO3: Add button to Show Bookmark
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240314_205205
// @description    Adds a "Show Bookmark" button before the "Edit Bookmark" button on the page where you view a work's bookmarks
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Show_Bookmark_btn.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Show_Bookmark_btn.user.js
// @match          *://archiveofourown.org/*/bookmarks
// @license        AGPL-3.0-or-later
// @history        1.0.0 — Initial commit
// ==/UserScript==

(function () {
	`use strict`;

	// create empty array and fill it with the parent elements of the li element that makes up the native edit bookmark buttons
	var
		existing_edit_btns = [],
		existing_edit_btns = document.querySelectorAll(`*:has(> li > [id^="bookmark_form_trigger"])`);

	// proceed to iterate on each element in existing_edit_btns to make and insert a new show bookmark button
	existing_edit_btns.forEach(function (elm, i, arr) {
		// get the original li element which the link is a child of and make it a const so it cant be changed
		const orig = elm.querySelector(`li`);
		// clone orig to modify it and make the new show bookmark button element
		var li_elm = orig.cloneNode(true);
		// make a var specifically for the a element so i dont have to call a querySelector everytime
		var a_elm = li_elm.querySelector(`a`);

		// get the original a element id and change it for the new one
		var
			a_elm_id = a_elm.getAttribute(`id`).toString(),
			a_elm_id = a_elm_id.replace(`bookmark_form`, `show_bookmark`);

		// get the original a element href and change it for the new one
		var
			a_elm_link_href = a_elm.getAttribute(`href`).toString(),
			a_elm_link_href = a_elm_link_href.replace(`/edit`, ``);

		// get the original a element textContent and change it for the new one
		var
			a_elm_text = a_elm.textContent,
			a_elm_text = a_elm_text.replace(/edit/i, `Show`);

		// modify the cloned element using the a_elm_* variable to make the new show bookmark button
		a_elm.setAttribute(`id`, a_elm_id);
		a_elm.setAttribute(`href`, a_elm_link_href);
		a_elm.textContent = a_elm_text;

		// add the new show bookmark button before the edit bookmark button
		orig.before(li_elm);
	});


})();
