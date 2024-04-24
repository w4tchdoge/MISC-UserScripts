// ==UserScript==
// @name           AO3: Get URLs of Works from a Series page
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240424_190219
// @description    Gets the URLs of all the works displayed on a series page where each work URL is on a new line
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Get_Series_Work_URLs.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Get_Series_Work_URLs.user.js
// @match          *://archiveofourown.org/series/*
// @grant          GM_setClipboard
// @grant          GM.setClipboard
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @license        AGPL-3.0-or-later
// ==/UserScript==

(function () {
	`use strict`;

	function Get_Series_Work_URLs() {
		// Get the a elements containing the work URL for all the works on the series page
		const works_a_elm_arr = Array.from(document.querySelectorAll(`.series.work.index.group > li .header > h4.heading > a:first-of-type`));

		// Define vars used in the process of making the string to be pasted to the clipboard
		var works_urls_arr = [], works_urls_str;

		// Iterate on works_a_elm_arr to fill works_urls_arr with work URLs
		works_a_elm_arr.forEach(function (elm) {
			works_urls_arr.push(elm.href);
		});

		// Join URLs in works_urls_arr with a newlne
		works_urls_str = works_urls_arr.join(`\n`);

		// Paste to the clipboard
		GM.setClipboard(works_urls_str);
		// console.log(works_urls_str);
	}

	// Make menu command to trigger the function
	GM.registerMenuCommand(`Copy Work URLs to clipboard`, Get_Series_Work_URLs);

})();