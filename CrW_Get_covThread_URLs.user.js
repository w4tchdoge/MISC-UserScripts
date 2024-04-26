// ==UserScript==
// @name           CrW Forums: Copy URLs of Threads with Covers
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240426_154332
// @description    Copies to clipboards all thread URLs on the watched threads page where the thread has a cover set by the author
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_Get_covThread_URLs.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_Get_covThread_URLs.user.js
// @match          *://forums.spacebattles.com/watched/threads*
// @match          *://forums.sufficientvelocity.com/watched/threads*
// @grant          GM_setClipboard
// @grant          GM.setClipboard
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @license        AGPL-3.0-or-later
// ==/UserScript==

(function () {
	`use strict`;

	function Get_covThread_URLs() {
		var thread_cover_stories_arr = Array.from(document.querySelectorAll(`.structItem-iconContainer > a:has(> img[class^="threadmarkIndexIcon"])`)), thread_cover_s_URLs_arr = [];

		thread_cover_stories_arr.forEach(function (elem) {
			let
				// Regex for extracting work URL without thread name
				re_wu = /(https?:\/\/forums?\..*?\.com\/threads\/).*\.(\d+\/)\S*$/gmi,
				ref_url = new URL(elem.href);
			// Make normalised thread URL
			var thread_url = `${ref_url.origin}${ref_url.pathname}`.replace(re_wu, `$1$2`);

			// console.log(ref_url);
			// console.log(thread_url);

			// Append thread URL to the empty array
			thread_cover_s_URLs_arr.push(thread_url);
		});

		var covThread_URLs = thread_cover_s_URLs_arr.join(`\n`);
		covThread_URLs += `\n`;

		GM.setClipboard(covThread_URLs);
	}

	GM.registerMenuCommand(`Copy covThread URLs to clipboard`, Get_covThread_URLs);

})();