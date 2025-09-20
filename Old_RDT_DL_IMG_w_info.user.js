// ==UserScript==
// @name           Old Reddit: Download IMG post with title
// @namespace      https://github.com/w4tchdoge
// @version        1.2.1-20250908_120142
// @description    Add a button next to the IMG domain to download the IMG with the post title, old reddit shortlink ID, and IMG name in the output filename
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/refs/heads/main/Old_RDT_DL_IMG_w_info.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/refs/heads/main/Old_RDT_DL_IMG_w_info.user.js
// @match          *://www.reddit.com/r/*/comments/*
// @match          *://old.reddit.com/r/*/comments/*
// @grant          GM_xmlhttpRequest
// @grant          GM.xmlhttpRequest
// @connect        redd.it
// @connect        i.imgur.com
// @run-at         document-start
// @license        AGPL-3.0-or-later
// @history        1.2.1 — Change the `Accept` header in the xmlHttpRequest to use `image/*`. Move getting latest curl version to it's own function
// @history        1.2.0 — Add subreddit name to the filename
// @history        1.1.0 — Switch to using xmlhttpRequest function from the userscript extension instead of fetch in order to bypass CORS
// @history        1.0.0 — Initial script release
// ==/UserScript==

(async function () {
	`use strict`;

	// modified from https://stackoverflow.com/a/61511955/11750206
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

	// modified from
	// https://bobbyhadz.com/blog/javascript-download-image#how-to-download-images-using-javascript
	// and
	// https://stackoverflow.com/a/68722398/11750206
	async function downloadImage(img_src, dl_name, curl_ver = LATEST_CURL_VER) {

		// get image from source link as a blob via xmlHttpRequest
		// and create an object url from the blob so the script can download it
		const resp = await GM.xmlHttpRequest(
			{
				method: `GET`,
				url: img_src,
				responseType: `blob`,
				headers: {
					"Accept": `image/*, */*;q=0.8`,
					"User-Agent": `curl/${curl_ver}`
				}
			}
		);
		const img_blob = await resp.response;
		const img_href = URL.createObjectURL(img_blob);

		// make an anchor elm with the blob image and a filename to be downloaded with
		const blob_anchor_elm = Object.assign(document.createElement(`a`), {
			href: img_href,
			download: dl_name
		});
		blob_anchor_elm.style.display = `none`;

		// download the blob img and do cleanup
		document.body.appendChild(blob_anchor_elm);
		blob_anchor_elm.click();
		document.body.removeChild(blob_anchor_elm);
		window.URL.revokeObjectURL(img_href);
	}

	async function getLatestCurl() {
		const curl_gh_repo_url = `https://api.github.com/repositories/569041/releases/latest`;
		const gh_api_resp = await fetch(curl_gh_repo_url,
			{ headers: { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' } }
		);
		const gh_api_resp_json = await gh_api_resp.json();
		const curl_ver = gh_api_resp_json.name;
		return curl_ver;
	}


	// wait for <head> to load so i can do shit
	const HTML_DOC_HEAD = await waitForElm(`head`);

	// check if it's old reddit because fuck that new shit i dont wanna bother accounting for it
	const OLD_REDDIT = (() => {
		if (HTML_DOC_HEAD.hasAttribute(`prefix`)) { return false; } else { return true; }
	})();

	if (OLD_REDDIT == true) {

		// get the latest curl version to be used as a header in the xmlHttpRequest
		const LATEST_CURL_VER = await getLatestCurl();

		const input_elm = await waitForElm(`div[role="main"] a.title`);

		const subname = await (async () => {
			const subnameA = await waitForElm(`span.redditname > a`);
			const subnameText = subnameA.textContent.trim();
			return subnameText;
		})();

		const [img_url, post_title_safe, filename] = ((input_elm) => {

			const img_url = input_elm.href.toString();
			const filename = img_url.split(`/`).at(-1);
			const post_title_safe = input_elm.textContent.trim().replaceAll(/[\\\/\:\*\?\"\<\>\|]/gmi, `_`);

			return [img_url, post_title_safe, filename];
		})(input_elm);

		const shortlink_id = await (async () => {
			const shortlink_elm = await waitForElm(`.linkinfo .shortlink > input`);
			const slid = shortlink_elm.getAttribute(`value`).split(`/`).at(-1);
			return slid;
		})();

		const dl_filename_str = `${post_title_safe} - reddit ${shortlink_id} [${subname}] - ${filename}`;

		const img_dl_btn = Object.assign(document.createElement(`span`), {
			className: `domain`,
			id: `img_post_dl_btn`,
			innerHTML: ` (<a>DL IMG</a>)`
		});
		img_dl_btn.addEventListener(`click`, function (event) {
			downloadImage(img_url, dl_filename_str, LATEST_CURL_VER)
				.then(() => { console.log(`The image in the reddit post with ID [${shortlink_id}] has been downloaded`); })
				.catch(err => { console.log(`Error encouterer while downloading the image in the reddit post with ID [${shortlink_id}]`, err); });
		});

		document.querySelector(`span.domain:not(#img_post_dl_btn)`).after(img_dl_btn);
	}

})();