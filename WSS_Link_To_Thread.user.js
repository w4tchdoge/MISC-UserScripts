// ==UserScript==
// @name           Worm Story Search: Change Threadmark page link to Thread page link
// @namespace      https://github.com/w4tchdoge
// @version        1.0.1-20241208_120940
// @description    Remove the `/threadmarks` at the end of all SV/SB/QQ URLs to have them go to the thread page instead of the threadmarks page
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/WSS_Link_To_Thread.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/WSS_Link_To_Thread.user.js
// @match          *://wormstorysearch.com/*
// @match          *://www.wormstorysearch.com/*
// @icon           http://wormstorysearch.com/favicon.png
// @run-at         document-idle
// @license        AGPL-3.0-or-later
// @history        1.0.1 — Make the links to threads use HTTPS
// @history        1.0.0 — Initial commit
// ==/UserScript==

(function () {
	`use strict`;

	// Get Table Rows
	const table_rows = document.querySelector('#stories-searchable-table tbody.rows');

	// Get Array of Stories
	const stories_arr = Array.from(table_rows.children);

	// Iterate on the array of Stories
	stories_arr.forEach((storyELM) => {

		Array.from(storyELM.querySelectorAll('td.title a[data-track][href*="/threads/"]')).forEach((elm, index, arr) => {
			const re_wu = /(https?:\/\/forums?\..*?\.com\/threads\/).*\.(\d+\/)/gmi;    /* Regex for extracting work URL without thread name */
			const re_pgnum = /(page-\d+)|(reader.)|(threadmarks.?)/i;

			const initial_url = new URL(elm.getAttribute(`href`));
			const output_url = `https://${initial_url.hostname}${initial_url.pathname.split(re_pgnum).at(0)}`.replace(re_wu, `$1$2`).slice(0, -1);

			// console.log(`#${index + 1}. ${output_url}`);

			elm.setAttribute(`href`, output_url);
		});

	});
})();
