// ==UserScript==
// @name           Reddit IMG URL Search
// @namespace      https://github.com/w4tchdoge
// @version        1.1.0-20231220_185454
// @description    Searches Reddit for IMG URLs based on the filename of the current image. Initial support is for Discord attachments
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Reddit_IMG_URL_Search.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Reddit_IMG_URL_Search.user.js
// @match          *://cdn.discordapp.com/attachments/*
// @match          *://media.discordapp.net/attachments/*
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @license        AGPL-3.0-or-later
// @history        1.1.0 — Enables the script to work on files that do not consist of just the Reddit-generated-filename
// @history        1.0.0 — Initial userscript creation
// ==/UserScript==

(function () {
	`use strict`;

	// Create a function for the main code to go in for the purposes of making a keyboard shortcut and a menu command in the userscript manager
	function Reddit_IMG_URL_srch() {

		// Gets the URL of the current webpage
		const page_URL = new URL(window.location.href);

		// Extracts the filename without the file extensions from the URL
		// The first .split function creates an array from the pathname using "/" as a delimiter
		// The .slice function removes all but the last element from the array created by the first .split, which is the raw filename
		// the .toString function converts the array of 1 element into a string
		// The second .split function splits the filename into separate chunks based on 3 separate delimiters
		var filename_parts = page_URL.pathname.split(`/`).slice(-1).toString().split(/[\(\)._-]/);
		// The .find function searches the filename_parts array for an element with length of 13 which is the length of the filenames of image files uploaded to Reddit
		var filename_noExt = filename_parts.find((elem) => {
			return elem.length > 12;
		});

		// Construct the search URL to be used on Reddit
		var reddit_search_URL = `https://www.reddit.com/search?q=site:redd.it+url:redd.it/${filename_noExt}&restrict_sr=&include_over_18=on&sort=new&t=all`;

		// Open the Reddit Search URL in a new tab
		window.open(reddit_search_URL, `_blank`).focus();
	}

	// Below taken from https://stackoverflow.com/a/2511474/11750206
	// Handler for the Keyboard Shortcut for Reddit IMG URL Search
	function RIUS_handler(e) {

		// Keyboard Shortcut for Reddit IMG URL Search — Shift + Alt + K
		if (e.shiftKey && e.altKey && e.code === `KeyK`) {

			// Execute Reddit IMG URL Search
			Reddit_IMG_URL_srch();
		}
	}

	// Register the RIUS handler
	document.addEventListener(`keyup`, RIUS_handler, false);

	GM.registerMenuCommand(`Search Reddit for IMG URL`, Reddit_IMG_URL_srch);

})();
