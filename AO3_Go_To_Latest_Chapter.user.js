// ==UserScript==
// @name           AO3: Go To to Latest Chapter
// @namespace      https://github.com/w4tchdoge
// @version        0.0.1
// @description    
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      
// @downloadURL    
// @match          *://archiveofourown.org/*works/*
// @match          *://archiveofourown.org/*works/*/latest
// @exclude        *://archiveofourown.org/*works/*/bookmarks
// @exclude        *://archiveofourown.org/*works/*/navigate
// @license        AGPL-3.0-or-later
// @run-at         document-start
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


	// Get current page url as a URL object
	const curr_url = new URL(window.location);

	// Get AO3 work ID
	const work_id = (() => {
		const pathname_segments = curr_url.pathname.split(`/`);
		const wid_index = (pathname_segments.findLastIndex(elm => elm === `works`)) + 1;
		const wid = pathname_segments.at(wid_index);
		return wid;
	})();

	// Check if URL ends with latest
	if (curr_url.pathname.split(`/`).at(-1).toString().toLowerCase() == `latest`) {

		// Stop further loading of webpage
		window.stop();

		// Fetch the html of the navigate page of the work
		const work_nav_page_resp_html = await (async () => {
			const fetch_url = `https://archiveofourown.org/works/${work_id}/navigate`;
			const fetch_resp = await fetch(fetch_url);
			const resp_text = await fetch_resp.text();

			const html_parser = new DOMParser();
			const html = html_parser.parseFromString(resp_text, `text/html`);

			return html;
		})();

		// Get URL for the latest chapter
		const latest_url = new URL(`${Array.from(work_nav_page_resp_html.querySelectorAll(`#main .chapter.index.group > li > a[href^="/works"]`)).at(-1).getAttribute(`href`)}#workskin`, `https://archiveofourown.org`);

		// console.log(`latest`, curr_url, work_id, latest_url);

		// Redirect to latest chapter
		window.location.replace(latest_url);

	}
	else {

		const main = await waitForElm(`#main`);

		const work_nav_actions = main.querySelector(`.work.navigation.actions`);

		if (work_nav_actions.querySelector(`.chapter.next`)) {

			// Fetch the html of the navigate page of the work
			const work_nav_page_resp_html = await (async () => {
				const fetch_url = `https://archiveofourown.org/works/${work_id}/navigate`;
				const fetch_resp = await fetch(fetch_url);
				const resp_text = await fetch_resp.text();

				const html_parser = new DOMParser();
				const html = html_parser.parseFromString(resp_text, `text/html`);

				return html;
			})();

			// Get URL for the latest chapter
			const latest_url = new URL(`${Array.from(work_nav_page_resp_html.querySelectorAll(`#main .chapter.index.group > li > a[href^="/works"]`)).at(-1).getAttribute(`href`)}#workskin`, `https://archiveofourown.org`);

			// Get next chapter elements
			// const next_chapter_elm_arr = Array.from(main.querySelectorAll(`li.chapter.next`));
			const next_chapter_elm_arr = Array.from(main.querySelectorAll(`li`)).filter(elm => elm.textContent === `Next Chapter →`);
			// console.log(next_chapter_elm_arr);
			// next_chapter_elm_arr.forEach(elm => { console.log(elm); });

			// Create latest chapter element using the next chapter element as a base
			const latest_chapter_elm = ((input_elm) => {
				let base_elm = input_elm.cloneNode(true);
				base_elm.classList.replace(`next`, `latest`);
				let link = base_elm.querySelector(`a`);
				link.setAttribute(`href`, latest_url.pathname);
				// link.textContent = `Latest Chapter ↠`;
				link.textContent = `Latest ↠`;

				return base_elm;
			})(next_chapter_elm_arr[0]);

			// console.log(latest_chapter_elm);

			// Add latest chapter elm after the next chapter elms
			// next_chapter_elm.after(latest_chapter_elm);
			next_chapter_elm_arr.forEach(element => {
				element.after(latest_chapter_elm.cloneNode(true));
			});

		} else { console.log(`\nYou are already on the latest chapter.`); }

	}

})();