// ==UserScript==
// @name           AO3: Bookmarks Button on Main Navbar
// @namespace      https://github.com/w4tchdoge
// @version        1.0.1-20230826_090532
// @description    Adds a button called "Bookmarked Fics" to the main navbar (where the search bar is). Inspired by elli-lili-lunch's "Put Bookmarks Button on AO3 Home", which can be found at https://greasyfork.org/en/scripts/440048
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @match          *://archiveofourown.org/*
// @icon           https://archiveofourown.org/favicon.ico
// @run-at         document-idle
// @license        AGPL-3.0-or-later
// @history        1.0.1 — Change the displayed text to be the same as in the original bookmarks button from the user dropdown area
// @history        1.0.0 — Initial Release
// ==/UserScript==

(function () {
	`use strict`;

	// Get the user bookmark page button from the user dropdown
	var bkmrks_btn = document.evaluate(`.//div[@id="greeting"]//li//a[text()[contains(.,'My Bookmarks')]]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

	// Get the URL and displayed text from the user bookmarks button
	var bkmrks_url = bkmrks_btn.getAttribute(`href`),
		bkmrks_txt = bkmrks_btn.textContent;

	// Create the new Bookmark button element
	var bkmrks_btn = Object.assign(document.createElement(`li`), {
		id: `navbar_bookmarks_button`,
		innerHTML: `<a href='${bkmrks_url}'><span class='dropdown-toggle'>${bkmrks_txt}</span></a>`
	});

	// Find Search bar
	var srch_bar = document.querySelector(`ul.primary.navigation.actions li.search`);

	// Add created element before search bar
	srch_bar.before(bkmrks_btn);

})();
