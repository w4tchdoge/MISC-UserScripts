// ==UserScript==
// @name           AO3: Bookmarks Button on Main Navbar
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20230529_162148
// @description    Adds a button called "Bookmarked Fics" to the main navbar (where the search bar is). Inspired by elli-lili-lunch's "Put Bookmarks Button on AO3 Home", which can be found at https://greasyfork.org/en/scripts/440048
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @match          *://archiveofourown.org/*
// @icon           https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org
// @run-at         document-idle
// @license        AGPL-3.0-or-later
// ==/UserScript==

(function () {
	`use strict`;

	// Get url to user bookmark page
	var bkmrks_url = document.evaluate(`.//div[@id="greeting"]//li//a[text()[contains(.,'My Bookmarks')]]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.getAttribute(`href`);

	// Create Bookmark button element
	var bkmrks_btn = Object.assign(document.createElement(`li`), {
		id: `navbar_bookmarks_button`,
		innerHTML: `<a href='${bkmrks_url}'><span class='dropdown-toggle'>Bookmarked Fics</span></a>`
	});

	// Find Search bar
	var srch_bar = document.querySelector(`ul.primary.navigation.actions li.search`);

	// Add created element before search bar
	srch_bar.before(bkmrks_btn);

})();