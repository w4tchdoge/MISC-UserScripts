// ==UserScript==
// @name           AO3: Visible Full-page Index Button
// @namespace      https://github.com/w4tchdoge
// @version        1.3.0-20230530_122204
// @description    Moves or copies (setting is user configurable) the "Full-page index" button to the main work navigation bar for ease of access
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @match          *://archiveofourown.org/*
// @icon           https://archiveofourown.org/favicon.ico
// @license        AGPL-3.0-or-later
// ==/UserScript==

(function () {
	`use strict`;

	/* IMPORTANT – Change this value depending on whether or not you want the initial "Full-page index" button remove from the "Chapter Index" dropdown – IMPORTANT */
	const remove_ini_fpi_btn = true;

	// Only execute the rest of the script if the "Chapter Index" element exists (this is so it doesn't throw an error in the console when viewing an entire work or a single chapter work)
	if (document.querySelector(`ul.work.navigation.actions li[class="chapter"]`) != null) {

		// Find the "Chapter Index" button on the main work navbar
		var ch_indx_btn = document.querySelector(`ul.work.navigation.actions li[class="chapter"]`);

		// Get the "Full-page index" button using XPATH
		var ini_fpi_btn = document.evaluate(`//*[@id="chapter_index"]/li[*/text()[contains(.,'Full-page index')]]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		// Get the href attribute of the "Full-page index" button that normally lives within the "Chapter Index" dropdown
		var fpi_href = ini_fpi_btn.querySelector(`a`).getAttribute(`href`);

		// Create a slightly modified copy of the "Full-page index" button element
		var fpi_button = Object.assign(document.createElement(`a`), {
			id: `navbar_full_page_index_btn`,
			href: `${fpi_href}`,
			innerHTML: `Full-page index`
		});

		// Append the modified copy to the "Chapter Index" button element such that it appears to the right of it in the main work navbar
		ch_indx_btn.append(fpi_button);

		// Code to run if the original "Full-page index" button is to be removed
		if (remove_ini_fpi_btn == true) {

			// Remove the "Full-page index" button from the "Chapter Index" dropdown if remove_ini_fpi_btn is set to true
			ini_fpi_btn.remove();

			// Remove the padding-right on the "Go" button in the "Chapter Index" dropdown
			document.querySelector(`ul#chapter_index select#selected_id+span`).setAttribute(`style`, `padding-right: 0 !important;`);

		}

	}
	else if (document.querySelector(`ul.work.navigation.actions li.chapter.bychapter`) != null) {

		// Find the "Chapter by Chapter" button on the main work navbar
		var ch_by_ch_btn = document.querySelector(`ul.work.navigation.actions li.chapter.bychapter`);

		// Set up RegEx to get the work ID
		const re_wid = /(^https?:\/\/)(.*\.)?(archiveofourown\.org)(.*?)(\/works\/\d+)\/?.*$/gmi;

		// Construct href for the "Full-page Index" button
		var fpi_href = `${window.location.href.replace(re_wid, `$5`)}/navigate`;

		// Create the "Full-page index" button element
		var fpi_button = Object.assign(document.createElement(`a`), {
			id: `navbar_full_page_index_btn`,
			href: `${fpi_href}`,
			style: `margin-left: 0.3em`,
			innerHTML: `Full-page index`
		});

		// Append the "Full-page index" button to the "Chapter by Chapter" button
		ch_by_ch_btn.append(fpi_button);
	}

})();
