// ==UserScript==
// @name           Follow List in Top Nav Bar
// @namespace      https://github.com/w4tchdoge
// @version        1.1.0-20240612_234931
// @description    Add a button to go to your Follow List next to the notification bell in the top navigation bar
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/RR_Follow_List_in_Top_Nav_Bar.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/RR_Follow_List_in_Top_Nav_Bar.user.js
// @match          *://*.royalroad.com/*
// @run-at         document-start
// @license        AGPL-3.0-or-later
// @history        1.1.0 — Have script wait only until the notification element exists as opposed to waiting until everything loaded
// @history        1.0.1 — Change padding values to make it more aesthetically pleasing
// @history        1.0.0 — Initial userscript creation
// ==/UserScript==

(async function () {
	`use strict`;

	// from https://stackoverflow.com/a/61511955/11750206
	function waitForElm(selector) {
		return new Promise(resolve => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}

			const observer = new MutationObserver(mutations => {
				if (document.querySelector(selector)) {
					observer.disconnect();
					resolve(document.querySelector(selector));
				}
			});

			// If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
			observer.observe(document.documentElement, {
				childList: true,
				subtree: true
			});
		});
	}


	// Create a "Follow List" element that is to go in the top nav bar next to the notification bell
	const navBar_follow_list_main = Object.assign(document.createElement(`li`), {
		id: `userscript-navbutton-followlist-main`,
		className: `dropdown`,
		innerHTML: `<a href="/my/follows" class="dropdown-toggle"><i class="fas fa-bookmark" id="userscript-navbutton-followlist-icon"></i></a>`
	});

	// Code for changing padding based on media query modified from example at https://www.w3schools.com/howto/howto_js_media_queries.asp
	// Create function to change padding
	function PaddingChange(media_query) {
		if (media_query.matches) {
			navBar_follow_list_main.querySelector(`a`).style.padding = `17px 6px 10px 2px`;
		} else {
			navBar_follow_list_main.querySelector(`a`).style.padding = `17px 8px 10px 6px`;
		}
	}

	// Create media query used to trigger PaddingChange
	const media_query = window.matchMedia(`(max-width: 767px)`);

	// Calling PaddingChange at script runtime
	PaddingChange(media_query);

	// Make script listen for changes in width that would trigger the media query
	media_query.addEventListener(`change`, function () {
		PaddingChange(media_query);
	});

	// Find the notification bell
	const navBar_notifications = await waitForElm(`#header_notification_bar`);

	// Put the "Follow List" element after the notification bell
	navBar_notifications.after(navBar_follow_list_main);
})();