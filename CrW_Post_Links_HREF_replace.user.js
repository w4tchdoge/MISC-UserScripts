// ==UserScript==
// @name           Sufficient Velocity/SpaceBattles: Remove thread title from post links
// @namespace      https://github.com/w4tchdoge
// @version        1.2.0-20240510_175143
// @description    Removes the thread title from the href in the post number link and the post share link
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_Post_Links_HREF_replace.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_Post_Links_HREF_replace.user.js
// @match          *://forums.sufficientvelocity.com/threads/*
// @match          *://forums.spacebattles.com/threads/*
// @match          *://forum.questionablequesting.com/threads/*
// @license        AGPL-3.0-or-later
// @history        1.2.0 — Add functionality to also modify the timestamp links. Change the modification of the post num links to have the post "ID" only, not the thread "ID"
// @history        1.1.0 — Add QQ as a @match as QQ has migrated to XenForo2
// @history        1.0.0 — Initial release
// ==/UserScript==

(function () {
	`use strict`;

	// Get array of elements whose href is to be changed
	var
		// The href of the share button
		shareLinks_arr = Array.from(document.querySelectorAll(`.message-attribution ul a[aria-label="Share"]`)),

		// The href of the post number at the top right of a post
		numLinks_arr = Array.from(document.querySelectorAll(`.message-attribution ul.message-attribution-opposite li:last-child a`)),

		// The href of the date/timestamp of the post that are at the top left of the post (the area that does not include any post author details, just the text of the post)
		dateLinks_arr = Array.from(document.querySelectorAll(`.message-attribution ul.message-attribution-main.listInline a`));

	// href modification function for all XenForo2 sites
	function XF2_postNum_sub(elem, regex, substitution) {
		// Get the current href
		let elem_href = elem.getAttribute(`href`);

		// Remove thread title from href
		elem_href = elem_href.replace(regex, substitution);

		// Set new href
		elem.setAttribute(`href`, elem_href);

	}

	// RegEx and substition to be used
	const
		regex = /(\/threads\/)(.*\.)(\d+)(\/post-)(\d+)/gmi,
		incl_threadID_subst = `$1$3$4$5`,
		only_postID_subst = `/posts/$5`;

	// Modify the href of all the num links
	numLinks_arr.forEach(function (elm) { // the num links
		XF2_postNum_sub(elm, regex, only_postID_subst);
	});

	// Modify the href of all the date links
	dateLinks_arr.forEach(function (elm) { // the date links
		XF2_postNum_sub(elm, regex, incl_threadID_subst);
	});

	// Modify the href of all the share links
	shareLinks_arr.forEach(function (elm) { // the share links
		XF2_postNum_sub(elm, regex, incl_threadID_subst);
	});

})();