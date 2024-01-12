// ==UserScript==
// @name           FFF - Extract Supported Sites
// @namespace      https://github.com/w4tchdoge
// @version        1.0.1-20240112_181800
// @description    Extract the list of sites supported by the FanFicFare Calibre Plugin
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/FFF_XTract_Sites.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/FFF_XTract_Sites.user.js
// @match          *://*.github.com/JimmXinu/FanFicFare/wiki/SupportedSites*
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @grant          GM_setClipboard
// @grant          GM.setClipboard
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @license        AGPL-3.0-or-later
// @history        1.0.1 — Add copying site list as both standard RegEx and RegEx suitable for TextMate Language JSON files
// @history        1.0.0 — Initial commit
// ==/UserScript==

(function () {
	`use strict`;

	var sites_arr = Array.from(document.querySelectorAll(`#wiki-body h4`)).slice(0, -2);

	sites_arr.forEach(function (elm, i, arr) {
		arr[i] = arr[i].textContent;
	});

	function RawSiteList() {
		var paste = sites_arr.join(`\n`);
		GM.setClipboard(paste);
	}

	function RegExSiteList() {
		var known_sections_regex = `^\\[(${sites_arr.join(`|`)})\\]\\s*`;
		GM.setClipboard(known_sections_regex);
	}

	function JSON_escd_RegExSiteList() {
		var json_escd_known_sections_regex = `^\\[(${sites_arr.join(`|`)})\\]\\s*`.replaceAll(/(?<!\\)\\(?!\\)/gi, `\\\\`);
		GM.setClipboard(json_escd_known_sections_regex);
	}

	GM.registerMenuCommand(`Copy Site List as JSON Escaped RegEx`, JSON_escd_RegExSiteList);
	GM.registerMenuCommand(`Copy Site List as RegEx`, RegExSiteList);
	GM.registerMenuCommand(`Copy Raw Site List`, RawSiteList);

})();