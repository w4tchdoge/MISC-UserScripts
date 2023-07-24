// ==UserScript==
// @name           Old/New Twitter Toggle
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0
// @description    Adds ability to switch back and forth between dimdem's Old Twitter layout and the current Twitter layout
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/twitterToggle.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/twitterToggle.user.js
// @match          *://twitter.com/*
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @license        AGPL-3.0-or-later
// ==/UserScript==

(function () {
	`use strict`;

	const curr_pgURL = window.location.href,
		new_twit_str = `newtwitter=true`;

	function toggleTwitter() {
		switch (curr_pgURL.includes(new_twit_str)) {
			case true:
				const regex = /(https?:.*)\?newtwitter=true/i;
				var base_tweet_URL = curr_pgURL.replace(regex, `$1`);

				window.location.href = base_tweet_URL;
				break;

			case false:
				window.location.href = `${curr_pgURL}?${new_twit_str}`;
				break;

			default:
				break;
		}
	}

	/* Below taken from https://stackoverflow.com/a/2511474/11750206 */
	/* Handler for the Keyboard Shortcut for Toggle Twitter */
	function toggleTwitter_handler(e) {
		/* Keyboard Shortcut for Toggle Twitter — Shift + Alt + K */
		if (e.shiftKey && e.altKey && e.code === `KeyK`) {
			/* Execute  */
			toggleTwitter();
		}
	}
	/* Register the toggleTwitter handler */
	document.addEventListener(`keyup`, toggleTwitter_handler, false);

	GM.registerMenuCommand(`Toggle Twitter`, toggleTwitter);

})();