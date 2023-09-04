// ==UserScript==
// @name           Worm Story Search: Link AO3 Stories to Work Page
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20230904_200955
// @description    Changes the link of the story to go to the work page of the story on AO3 instead of the navigate page
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/WSS_Change_AO3_Link.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/WSS_Change_AO3_Link.user.js
// @match          *://wormstorysearch.com/*
// @match          *://www.wormstorysearch.com/*
// @icon           http://wormstorysearch.com/favicon.png
// @run-at         document-idle
// @license        AGPL-3.0-or-later
// @history        1.0.0 — Initial Release
// ==/UserScript==

(function () {
	`use strict`;

	// Regex for extracting work URL without specific chapter
	const re_wu = /(^https?:\/\/)(.*\.)?(archiveofourown\.org)(.*?)(\/works\/\d+)\/?.*$/gmi;

	// Get Table Rows
	var table_rows = document.querySelector('#stories-searchable-table tbody.rows');

	// Get Array of Stories
	var stories_arr = Array.from(table_rows.children);

	// Iterate on the array of Stories
	stories_arr.forEach((storyELM) => {

		// Try to get the blue box next to the title that says AO3
		var AO3_xp = `.//td[contains(concat(" ",normalize-space(@class)," ")," title ")]//a[contains(@href,"archiveofourown.org")]`;
		var AO3_tag = document.evaluate(AO3_xp, storyELM, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		if (Boolean(AO3_tag)) { // Run only if said blue box exists
			// Get the AO3 link
			var AO3_link = AO3_tag.getAttribute('href');

			// Remove all extraneous parts of the URL, leaving you with a URL in the format https://archiveofourown.org/works/{WORK_ID}
			AO3_link = AO3_link.replace(re_wu, '$1$3$5');

			// Replace all instances of old AO3 URL with the new one
			Array.from(storyELM.querySelectorAll('td.title a[data-track]')).forEach((el) => {
				el.href = AO3_link;
			});

			// Debug line of code, you can ignore it
			// console.log(`${storyELM.querySelector('td.title a[data-track]').href} - ${storyELM.querySelector('td.title a[data-track]').textContent}`);
		}
	});

})();