// ==UserScript==
// @name           MAL → AniList
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240517_183033
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
// ==/UserScript==

(async function () {
	`use strict`;

	const website = window.location.hostname.toString();
	var
		GQ_idMal,
		GQ_type,
		anilist_url,
		request_headers = { "Content-Type": "application/json" };

	if (website == `anidb.net`) {
		let MAL_URL = new URL(document.querySelector(`.info .icons a[title="MAL"]`).href.toString());

		GQ_type = `ANIME`;
		GQ_idMal = MAL_URL.pathname.split(`/`).slice(-1).toString();
	}

	if (website == `myanimelist.net`) {
		let MAL_URL = new URL(window.location);

		GQ_type = MAL_URL.pathname.split(`/`).slice(-2, -1).toString().toUpperCase();
		GQ_idMal = MAL_URL.pathname.split(`/`).slice(-1).toString();
	}

	// console.log(`type: ${GQ_type}\nidMal: ${GQ_idMal}`);

	var
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

	anilist_url = JSON.parse(AniListGQ_response.responseText).data.Media.siteUrl;

	// console.log(`request_output: ${AniListGQ_response.responseText}`);
	// console.log(`anilist url: ${anilist_url}`);

	if (website == `anidb.net`) {
		let MAL_icon_div_elm = document.querySelector(`*:has(>a.i_icon.i_resource_mal.brand)`);
		let AL_icon_div_elm = Object.assign(document.createElement(`div`), {
			className: `icons`,
			innerHTML: `<a rel="noopener noreferrer" target="_blank" class="i_icon i_resource_anilist brand" href="${anilist_url}" data-anidb-rel="anidb::extern" itemprop="sameAs" title="AniList" style="background-image: url(https://anilist.co/img/icons/icon.svg); height: 18px; width: 19px; background-size: cover; margin: 0;"><span class="text">AniList</span></a>`
		});

		MAL_icon_div_elm.after(AL_icon_div_elm);
	}

	if (website == `myanimelist.net`) {
		let MAL_horiz_navbar = document.querySelector(`#horiznav_nav > ul`);
		let AL_navbar_entry = Object.assign(document.createElement(`li`), {
			innerHTML: `<a rel="noopener noreferrer" href="${anilist_url}" target="_blank"><img src="https://anilist.co/img/icons/icon.svg" height=13 style="position: relative;transform: translate(-1px, 2px);" />AniList</a>`
		});

		MAL_horiz_navbar.append(AL_navbar_entry);
	}

})();
