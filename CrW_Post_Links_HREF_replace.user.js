// ==UserScript==
// @name           Sufficient Velocity/SpaceBattles: Remove thread title from post links
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240128_042120
// @description    Removes the thread title from the href in the post number link and the post share link
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_Post_Links_HREF_replace.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_Post_Links_HREF_replace.user.js
// @match          *://forums.sufficientvelocity.com/threads/*
// @match          *://forums.spacebattles.com/threads/*
// @license        AGPL-3.0-or-later
// @history        1.0.0 — Initial release
// ==/UserScript==

(function () {
	`use strict`;

	// Get array of elements whose href is to be changed
	var
		shareLinks_arr = Array.from(document.querySelectorAll(`.message-attribution ul a[aria-label="Share"]`)),
		numLinks_arr = Array.from(document.querySelectorAll(`.message-attribution ul.message-attribution-opposite li:last-child a`));

	// href modification function for SV and SB
	function SV_SB_sub(elem, regex, substitution) {
		// Get the current href
		var elem_href = elem.getAttribute(`href`);

		// Remove thread title from href
		elem_href = elem_href.replace(regex, substitution);

		// Set new href
		elem.setAttribute(`href`, elem_href);

	}

	// RegEx and substition to be used
	const
		regex = /(\/threads\/)(.*\.)(\d+)(\/post-\d+)/gmi,
		subst = `$1$3$4`;

	// Modify the href of all the share links
	shareLinks_arr.forEach(elm => { // the share links
		SV_SB_sub(elm, regex, subst);
	});

	// Modify the href of all the num links
	numLinks_arr.forEach(elm => { // the num links
		SV_SB_sub(elm, regex, subst);
	});

})();