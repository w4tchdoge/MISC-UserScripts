// ==UserScript==
// @name           Gelbooru: Open Post's IQDB link in the same tab
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20260902_184932
// @description    Open the IQDB reverse image search link for a Gelbooru post in the same tab instead of opening it in a new tab
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/refs/heads/main/Gelbooru-Open-IQDB-in-SameTab.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/refs/heads/main/Gelbooru-Open-IQDB-in-SameTab.user.js
// @match          *://gelbooru.com/index.php*
// @license        AGPL-3.0-or-later
// @run-at         document-body
// @history        1.0.0 — Script creation
// ==/UserScript==

(async function () {
	`use strict`;

	const curr_search_params = new URLSearchParams(window.location.search);

	if (curr_search_params.getAll(`s`).includes(`view`) && curr_search_params.getAll(`page`).includes(`post`)) {

		function waitForElm(selector, search_root = document) {
			return new Promise(resolve => {
				if (search_root.querySelector(selector)) {
					return resolve(search_root.querySelector(selector));
				}

				const observer = new MutationObserver(mutations => {
					if (search_root.querySelector(selector)) {
						observer.disconnect();
						resolve(search_root.querySelector(selector));
					}
				});

				// If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
				observer.observe(document.documentElement, {
					childList: true,
					subtree: true
				});
			});
		}

		let iqdb_link = await waitForElm(`ul#tag-list li > a[href*="iqdb.org"]`);
		iqdb_link.removeAttribute(`target`);

	}
})();
