// ==UserScript==
// @name           Reddit IMG URL Search
// @namespace      https://github.com/w4tchdoge
// @version        2.0.2-20231228_182342
// @description    Searches Reddit for IMG URLs based on the filename of the current image. Initial support is for Discord attachments
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Reddit_IMG_URL_Search.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Reddit_IMG_URL_Search.user.js
// @match          *://i.redd.it/*
// @match          *://preview.redd.it/*
// @match          *://cdn.discordapp.com/attachments/*
// @match          *://media.discordapp.net/attachments/*
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @run-at         document-start
// @license        AGPL-3.0-or-later
// @history        2.0.2 — Change script metadata to indicate that it should run as soon as possible, as the script only requires the current page URL to function
// @history        2.0.1 — Remove unnecessary bits of code introduced in v2.0.0
// @history        2.0.0 — Adds capability to work on i.redd.it and preview.redd.it URLs
// @history        1.1.0 — Enables the script to work on files that do not consist of just the Reddit-generated-filename
// @history        1.0.0 — Initial userscript creation
// ==/UserScript==

(function () {
	`use strict`;

	// Gets the URL of the current webpage
	const page_URL = new URL(window.location.href);

	// Function for getting the filename without file extension when the image is on the redd.it domain
	function reddit_domain_Reddit_IMG_URL_srch() {

		// Construct filename without extension
		// As this is a redd.it url it is simpler due to being able to the pathname of the URL containing only the filename
		var filename_noExt = page_URL.pathname.split(`.`)[0].slice(1);

		return filename_noExt;
	}

	// Function for getting the filename without file extension when the image isn't on the redd.it domain
	function Generic_Reddit_IMG_URL_srch() {

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

		return filename_noExt;
	}

	function Reddit_IMG_URL_srch() {

		// Define the variable for the filename without extension to be stored
		var filename_noExt;

		// if-else to fill filename_noExt appropriately
		if (page_URL.hostname.includes(`redd.it`)) {
			filename_noExt = reddit_domain_Reddit_IMG_URL_srch();
		} else {
			filename_noExt = Generic_Reddit_IMG_URL_srch();
		}

		// Construct the search URL to be used on Reddit – Alt 1
		var reddit_search_URL = `https://www.reddit.com/search?q=url:redd.it/${filename_noExt}&restrict_sr=&include_over_18=on&sort=new&t=all`;

		// Construct the search URL to be used on Reddit – Alt 2
		// var reddit_search_URL = `https://www.reddit.com/search?q=site:redd.it+url:redd.it/${filename_noExt}&restrict_sr=&include_over_18=on&sort=new&t=all`;

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
