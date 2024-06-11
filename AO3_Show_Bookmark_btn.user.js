// ==UserScript==
// @name           AO3: Add button to Show Bookmark
// @namespace      https://github.com/w4tchdoge
// @version        2.0.0-20240611_145813
// @description    Adds a "Show Bookmark" button before the "Edit Bookmark" button on the page where you view a work's bookmarks
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Show_Bookmark_btn.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Show_Bookmark_btn.user.js
// @match          *://archiveofourown.org/*chapters/*
// @match          *://archiveofourown.org/*works/*
// @match          *://archiveofourown.org/*/bookmarks
// @match          *://archiveofourown.org/bookmarks*
// @license        AGPL-3.0-or-later
// @history        2.0.0 — Add a link to view a user's bookmark in the stats area that is present when viewing a chapter (https://i.imgur.com/a5O1lpD.png)
// @history        1.0.3 — Make sure script works on bookmark searches. Add a check to make sure that the script only executes if the existing_edit_btns array has elements in it
// @history        1.0.2 — Make sure script only adds a "Show Bookmark" button when there is an "Edit Bookmark" button as opposed to a "Bookmark" button that is used to make new bookmarks
// @history        1.0.1 — Fix issue caused by data-remote attribute where bookmark could not be opened in the current tab
// @history        1.0.0 — Initial commit
// ==/UserScript==

(async function () {
	`use strict`;

	const current_page_url = new URL(window.location);
	const bkmrk_page_check = current_page_url.pathname.includes(`bookmarks`);

	if (bkmrk_page_check && Boolean(document.querySelector(`a[id^="bookmark_form_trigger"]`))) {

		// create array of the parent elements of the li element that makes up the native edit bookmark buttons
		const existing_edit_btns = Array.from(document.querySelectorAll(`*:has(> li > [id^="bookmark_form_trigger"][href*="edit"])`));

		// Check if the array exists and has elements
		if (Array.isArray(existing_edit_btns) && Boolean(existing_edit_btns.length)) {
			// console.log(`existing edit buttons exist on this page`);
			console.log(`
Add "Show Bookmark" Button userscript:
One or more "Edit Bookmark" buttons exist on this page.
Proceeding to add "Show Bookmark" buttons next to them.`
			);

			// proceed to iterate on each element in existing_edit_btns to make and insert a new show bookmark button
			existing_edit_btns.forEach(function (elm, i, arr) {
				// get the original li element which the link is a child of and make it a const so it cant be changed
				// orig is needed as a reference for the new "Show Bookmark" li elm to be added before
				const orig = elm.querySelector(`li`);

				let
					// clone orig to modify it and make the new show bookmark button element
					li_elm = orig.cloneNode(true),
					// make a variable specifically for the a element so i dont have to call a querySelector everytime
					a_elm = li_elm.querySelector(`a`);

				// remove the data-remote as it prevents the bookmark from being opened in the current tab
				a_elm.removeAttribute(`data-remote`);

				// get the original a element id and change it for the new one
				const a_elm_id = a_elm.getAttribute(`id`).replace(`bookmark_form`, `show_bookmark`);

				// get the original a element href and change it for the new one
				const a_elm_link_href = a_elm.getAttribute(`href`).replace(`/edit`, ``);

				// get the original a element textContent and change it for the new one
				const a_elm_text = a_elm.textContent.replace(/edit/i, `Show`);

				// modify the cloned element using the a_elm_* variables to make the new "Show Bookmark" button
				a_elm.setAttribute(`id`, a_elm_id);
				a_elm.setAttribute(`href`, a_elm_link_href);
				a_elm.textContent = a_elm_text;

				// add the new "Show Bookmark" button before the edit bookmark button
				orig.before(li_elm);
			});

		} else {
			console.log(`
Add "Show Bookmark" Button userscript:
No "Edit Bookmark" buttons exist on this page.`
			);
		}
	}

	if (!bkmrk_page_check && Boolean(document.querySelector(`dd.bookmarks a`))) {

		const bookmark_page_href = document.querySelector(`dd.bookmarks a`).getAttribute(`href`);

		const bkmrk_fetch_resp_txt = await (async () => {
			const fetch_resp = await fetch(bookmark_page_href);
			const resp_text = await fetch_resp.text();
			return resp_text;
		})();

		// console.log(bkmrk_fetch_resp_txt);
		const html_parser = new DOMParser();
		const html_bookmark_page_html = html_parser.parseFromString(bkmrk_fetch_resp_txt, `text/html`);
		// console.log(html_bookmark_page_html);
		const edit_bookmark_elem = html_bookmark_page_html.querySelector(`a[id^="bookmark_form_trigger"]`).cloneNode();

		// console.log(edit_bookmark_elem);

		const work_is_already_bookmarked = edit_bookmark_elem.href.includes(`edit`);
		if (!work_is_already_bookmarked) {
			console.log(`
Add "Show Bookmark" Button userscript:
User does not have the work bookmarked.`
			);
		}
		if (work_is_already_bookmarked) {
			console.log(`
Add "Show Bookmark" Button userscript:
User has the work bookmarked.`
			);
			const
				show_bookmark_href = edit_bookmark_elem.getAttribute(`href`).split(/\/edit/i).at(0),
				all_public_bkmrks_link = document.querySelector(`.work.meta.group dl.stats dd[class^="bookmark"]:has(>a)`);

			// console.log(show_bookmark_href);

			const dt_user_bookmark_elem = Object.assign(document.createElement(`dt`), {
				id: `show_user_bookmark_dt`,
				className: `user_bookmark`,
				innerHTML: `User Bookmark:`
			});

			const dd_user_bookmark_elem = Object.assign(document.createElement(`dd`), {
				className: `user_bookmark`,
				id: `show_user_bookmark_dd`,
				innerHTML: (() => {
					const element = Object.assign(document.createElement(`a`), {
						href: `${show_bookmark_href}`,
						id: `show_user_bookmark_a`,
						innerHTML: `View`
					});
					return element.outerHTML;
				})()
			});

			all_public_bkmrks_link.after(dt_user_bookmark_elem, dd_user_bookmark_elem);
		}
	}

})();
