// ==UserScript==
// @name           MAL → AniList
// @namespace      https://github.com/w4tchdoge
// @version        1.0.2-20240528_225522
// @description    Adds a button on MAL and AniDB to go to the AniList version of the page.
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/MAL2AniList.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/MAL2AniList.user.js
// @match          *://myanimelist.net/manga/*
// @match          *://myanimelist.net/anime/*
// @match          *://anidb.net/anime/*
// @connect        graphql.anilist.co
// @license        AGPL-3.0-or-later
// @grant          GM_xmlhttpRequest
// @grant          GM.xmlHttpRequest
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @history        1.0.2 — Fix script not working on AniDB pages with multiple MAL links. If there are multiple MAL links it gets the AL equivalent title for the first MAL link
// @history        1.0.1 — cleanup the script to remove all instances of var
// ==/UserScript==

(async function () {
	`use strict`;

	function CheckIfString(input) {
		if (typeof input != `string`) {
			// console.log(`${input} is not a string`);
			return input.toString();
		} else {
			// console.log(`${input} is a string`);
			return input;
		}
	}

	const
		website = CheckIfString(window.location.hostname),
		request_headers = { "Content-Type": "application/json" };

	let GQ_type, GQ_idMal;

	if (website == `anidb.net`) {
		const MAL_URL = new URL(CheckIfString(document.querySelectorAll(`div.group.thirdparty.english a[href*="myanimelist.net"]`)[0].href));

		GQ_type = `ANIME`;
		GQ_idMal = CheckIfString(MAL_URL.pathname.split(`/`).at(-1));
	}

	if (website == `myanimelist.net`) {
		const MAL_URL = new URL(window.location);

		GQ_type = CheckIfString(MAL_URL.pathname.split(`/`).at(-2).toUpperCase());
		GQ_idMal = CheckIfString(MAL_URL.pathname.split(`/`).at(-1));
	}

	// console.log(`type: ${GQ_type}\nidMal: ${GQ_idMal}`);

	const
		request_query = `
query ($req_idMal: Int, $req_type: MediaType) {
	Media (idMal: $req_idMal, type: $req_type) {
		siteUrl
	}
}
`,
		request_variables = { "req_idMal": GQ_idMal, "req_type": GQ_type },
		request_data = JSON.stringify({ query: request_query, variables: request_variables });

	// console.log(request_data);

	const AniListGQ_response = await GM.xmlHttpRequest({
		method: "POST",
		url: "https://graphql.anilist.co",
		data: request_data,
		headers: request_headers,
		// headers: request_headers,
		// onload: function (response) {
		// console.log(JSON.parse(response.responseText));
		// }
	});

	const anilist_url = JSON.parse(AniListGQ_response.responseText).data.Media.siteUrl;

	// console.log(`request_output: ${AniListGQ_response.responseText}`);
	// console.log(`anilist url: ${anilist_url}`);

	if (website == `anidb.net`) {
		const
			MAL_icon_div_elm = (function () {
				if (Boolean(document.querySelector(`*:has(>a.i_icon.i_resource_mal.brand)`)) == false) {
					return document.querySelector(`*:has(>.i_icon.i_resource_mal.brand)`);
				} else {
					return document.querySelector(`*:has(>a.i_icon.i_resource_mal.brand)`);
				}
			})(),
			AL_icon_div_elm = Object.assign(document.createElement(`div`), {
				className: `icons`,
				innerHTML: `<a rel="noopener noreferrer" target="_blank" class="i_icon i_resource_anilist brand" href="${anilist_url}" data-anidb-rel="anidb::extern" itemprop="sameAs" title="AniList" style="background-image: url(https://anilist.co/img/icons/icon.svg); height: 18px; width: 19px; background-size: cover; margin: 0;"><span class="text">AniList</span></a>`
			});

		MAL_icon_div_elm.after(AL_icon_div_elm);
	}

	if (website == `myanimelist.net`) {
		const
			MAL_horiz_navbar = document.querySelector(`#horiznav_nav > ul`),
			AL_navbar_entry = Object.assign(document.createElement(`li`), {
				innerHTML: `<a rel="noopener noreferrer" href="${anilist_url}" target="_blank"><img src="https://anilist.co/img/icons/icon.svg" height=13 style="position: relative;transform: translate(-1px, 2px);" />AniList</a>`
			});

		MAL_horiz_navbar.append(AL_navbar_entry);
	}

})();
