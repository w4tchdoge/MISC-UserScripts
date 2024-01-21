// ==UserScript==
// @name           Royal Road: Add Word Count to Statistics Section
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240121_224010
// @description    Adds the word count of a fiction (taken from the information tooltip in the Pages statistic) as it's own statistic
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/RR_Word_Count_in_Stats.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/RR_Word_Count_in_Stats.user.js
// @match          *://*.royalroad.com/fiction/*
// @exclude        *://*.royalroad.com/fiction/*/*/chapter/*
// @license        AGPL-3.0-or-later
// @history        1.0.0 — Initial release
// ==/UserScript==

(function () {
	`use strict`;

	// Check if the Statistics section exists
	var stats_page_exists = Boolean(document.querySelector(`.fiction-stats .stats-content .list-unstyled li:has(> i)`));

	// Define variables in advance (this is for easier debugging on my part when I copy paste these into the console during initial testing to see if everything works)
	var
		statsPage_pages_elem,
		word_count_str,
		elm_wordcount_title,
		elm_wordcount_data;

	// Only execute the main body of code if stats_page_exists is true
	if (stats_page_exists == true) {

		// Get the element which contains the word "Pages" and which also contains the word count in an informational tooltip
		statsPage_pages_elem = document.querySelector(`.fiction-stats .stats-content .list-unstyled li:has(> i)`);

		// Get Word Count
		word_count_str = statsPage_pages_elem.querySelector(`i`).getAttribute(`data-content`).replace(/.*calculated from (.*) words./gmi, `$1`);

		// Make the "Heading" element that describes the data below it. i.e. it says "Words"
		elm_wordcount_title = Object.assign(document.createElement(`li`), {
			id: `userscript-words-title`,
			innerHTML: `Words :`
		});

		// Add the required classes to the above DOM element
		elm_wordcount_title.classList.add(`bold`, `uppercase`);

		// Make the "Data" element that has the actual data. i.e. it says the word count
		elm_wordcount_data = Object.assign(document.createElement(`li`), {
			id: `userscript-words-data`,
			innerHTML: `${word_count_str}`
		});

		// Add the required classes to the above DOM element
		elm_wordcount_data.classList.add(`bold`, `uppercase`, `font-red-sunglo`);

		// Add the word count elements before the page count elements
		statsPage_pages_elem.before(elm_wordcount_title, elm_wordcount_data);

	}
})();