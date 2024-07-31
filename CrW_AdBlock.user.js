// ==UserScript==
// @name           SB/SV - Remove Threadmark Ads
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0
// @description    Remove the Ad spaces from threadmarked SB/SV threads and make sure posts with threadmarks look the same as normal posts
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_AdBlock.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_AdBlock.user.js
// @match          *://forums.spacebattles.com/threads/*
// @match          *://forums.sufficientvelocity.com/threads/*
// @run-at         document-start
// @license        AGPL-3.0-or-later
// @history        1.0.0 — Initial commit
// ==/UserScript==

(async function () {
	`use strict`;

	// from https://stackoverflow.com/a/61511955/11750206
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

	// const normal_margin_top = getComputedStyle(await waitForElm(`article.message--post:not(.hasThreadmark)`)).marginTop;
	const normal_margin_top = `8px`;

	const CrW_AdBlock_CSS = `
	  /* Remove the Ad space */
  div.samCodeUnit:has(div[class^="removeAdLink"]),
  div.adContainer:has(div[class^="removeAdLink"]) {
    display: none
  }

  /* Make the margin-top of the threadmark consistent with others */
  article.hasThreadmark {
    margin-top: ${normal_margin_top}
  }
`;

	// Create AdBlock <style> element
	const CrW_ABlock_userStyle = Object.assign(document.createElement(`style`), {
		id: `CrW_AdBlock_userStyle`,
		type: `text/css`,
		media: `all`,
		textContent: CrW_AdBlock_CSS
	});

	// Wait for <head> element to load in with at least one linked stylesheet
	const CrW_DOM_head = await waitForElm(`head:has(> link[rel="stylesheet"])`);

	CrW_DOM_head.appendChild(CrW_ABlock_userStyle);

})();
