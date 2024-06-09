// ==UserScript==
// @name           Lofter/Miyoushe: Display Source Resolution Images
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240610_012803
// @description    Changes image links on Lofter/Miyoushe posts to display the full resolution source image
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Lofter-Miyoushe_Display_Source_IMG.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Lofter-Miyoushe_Display_Source_IMG.user.js
// @match          *://*.lofter.com/post/*
// @match          *://*.miyoushe.com/*article/*
// @run-at         document-idle
// @license        AGPL-3.0-or-later
// @history        1.0.0 — Initial commit
// ==/UserScript==

(function () {
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

	async function DisplaySourceImage(change_a_href = false, img_direct_parent_selector, img_selector) {

		// const dir_par_selector = `${img_direct_parent_selector}:has(>${img_selector})`;
		const dir_par_selector = `${img_direct_parent_selector} ${img_selector}`;
		const wait_for_load = await waitForElm(dir_par_selector);

		Array.from(document.querySelectorAll(dir_par_selector)).forEach(function (element, index, array) {
			const initial_src = element.getAttribute(`src`);
			const new_src = (() => {
				const url_obj = new URL(initial_src);
				const new_url = `https://${url_obj.hostname}${url_obj.pathname}`;
				return new_url;
			})();
			// console.log(`Initial link: ${initial_src}\nNew Link: ${new_src}\n\n`);

			element.setAttribute(`src`, new_src);

			if (change_a_href == true) {
				// const direct_parent_w_href_selector = `${dir_par_selector.split(/\s(?=img)/i).join(`:has(>`)})`;

				const split_reg_exp = new RegExp(`\\s(?=${img_selector})`, `i`);
				// console.log(split_reg_exp);

				const direct_parent_w_href_selector = `${dir_par_selector.split(split_reg_exp).join(`:has(>`)})`;
				let direct_parent_w_href = document.querySelectorAll(direct_parent_w_href_selector)[index];
				direct_parent_w_href.setAttribute(`href`, new_src);
			}
		});
	}


	const current_page_url = new URL(window.location);

	if (current_page_url.hostname.includes(`lofter`)) {
		DisplaySourceImage(true, `div.main.inner div.img a`, `img`);
	}

	if (current_page_url.hostname.includes(`miyoushe`)) {
		DisplaySourceImage(false, `div.mhy-article-page__main div.mhy-img-article`, `img`);
	}

})();
