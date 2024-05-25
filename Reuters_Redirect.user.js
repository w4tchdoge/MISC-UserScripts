// ==UserScript==
// @name           Reuters: Redirect to Neuters
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240525_164011
// @description    Redirect Reuters pages to neuters.de
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Reuters_Redirect.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Reuters_Redirect.user.js
// @match          *://*.reuters.com/*
// @match          *://*.neuters.de/*
// @license        AGPL-3.0-or-later
// @grant          GM_setValue
// @grant          GM.setValue
// @grant          GM_getValue
// @grant          GM.getValue
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// ==/UserScript==

(async function () {
	`use strict`;

	// Don't run on frames or iframes -- taken from https://stackoverflow.com/a/1535421/11750206
	if (window.top != window.self) {
		return;
	}

	const
		curr_page_url = new URL(window.location),
		url_scheme = `https://`,
		url_hash = curr_page_url.hash,
		url_path = curr_page_url.pathname,
		url_search = curr_page_url.search,
		neuters = `neuters.de`;

	let redirect_boolean = await GM.getValue(`redirect_boolean`, undefined);
	if (redirect_boolean == undefined) {
		GM.setValue(`redirect_boolean`, true);
	}


	if (curr_page_url.hostname.includes(`reuters.com`) && redirect_boolean) {
		window.stop();
		const new_url = `${url_scheme}${neuters}${url_path}${url_search}${url_hash}`;
		// console.log(new_url);
		window.location.replace(new_url);
	}

	const have_the_stars_aligned = (curr_page_url.hostname.includes(neuters) && Boolean(GM.getValue));
	console.log(`Have the stars aligned?: ${have_the_stars_aligned}`);

	if (have_the_stars_aligned) {
		const orig_footer_div = document.querySelector(`footer > div`);
		orig_footer_div.setAttribute(`id`, `original_neuters_footer_div`);
		orig_footer_div.style.paddingTop = `0.5em`;

		const
			toggle_neuters_redirect_main_div = Object.assign(document.createElement(`div`),
				{
					id: `toggle_neuters_redirect`,
					innerHTML: `<div id="neuters_redirect_text" style="padding-bottom: 0.2em;">Toggle Neuters Redirect</div>`
				}
			),
			neuters_redirect_true = Object.assign(document.createElement(`div`),
				{
					id: `neuters_redirect_true`,
					innerHTML: `<span>Neuters Redirect: </span><span style="color: green">On</span>`
				}
			),
			neuters_redirect_false = Object.assign(document.createElement(`div`),
				{
					id: `neuters_redirect_false`,
					innerHTML: `<span>Neuters Redirect: </span><span style="color: red">Off</span>`
				}
			);

		orig_footer_div.before(toggle_neuters_redirect_main_div);

		switch (redirect_boolean) {
			case false:
				toggle_neuters_redirect_main_div.appendChild(neuters_redirect_false);
				break;

			case true:
				toggle_neuters_redirect_main_div.appendChild(neuters_redirect_true);
				break;

			default:
				break;
		}

		async function ToggleNeutersRedirect(rdr_bool) {
			switch (rdr_bool) {
				case false:
					redirect_boolean = true;
					GM.setValue(`redirect_boolean`, redirect_boolean);
					console.log(`Reuters Redirect now set to: ${await GM.getValue(`redirect_boolean`)}`);
					document.querySelector(`#neuters_redirect_false`).replaceWith(neuters_redirect_true);
					break;

				case true:
					redirect_boolean = false;
					GM.setValue(`redirect_boolean`, redirect_boolean);
					console.log(`Reuters Redirect now set to: ${await GM.getValue(`redirect_boolean`)}`);
					document.querySelector(`#neuters_redirect_true`).replaceWith(neuters_redirect_false);
					break;

				default:
					break;
			}
		}

		toggle_neuters_redirect_main_div.addEventListener(`mousedown`, function (event) {
			ToggleNeutersRedirect(redirect_boolean);
		});

	}

})();
