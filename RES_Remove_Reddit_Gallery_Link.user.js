// ==UserScript==
// @name           RES: Remove Reddit Gallery Link from RES Expando
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240824_153732
// @description    Removes the `https://www.reddit.com/gallery/*` link that is on images for the redditgallery expando
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/RES_Remove_Reddit_Gallery_Link.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/RES_Remove_Reddit_Gallery_Link.user.js
// @match          *://www.reddit.com/r/*/comments/*
// @match          *://old.reddit.com/r/*/comments/*
// @license        AGPL-3.0-or-later
// @history        1.0.0 — initial commit
// ==/UserScript==

(function () {
	`use strict`;

	// Do the thing
	Array.from(document.querySelectorAll(`div.res-expando-box div.res-gallery > div.res-gallery-pieces div.res-media-independent > div > a.res-expando-link`)).forEach((element) => {
		// console.log(element.getAttribute(`href`));
		element.removeAttribute(`href`);
	});

})();