// ==UserScript==
// @name           CrW Forum (SB/SV/QQ) Formatted Copy
// @namespace      https://github.com/w4tchdoge
// @version        2.2.1-20240615_165557
// @description    Copy the curretly open CrW Forum work in the folloring MarkDown format '- [work name](work url) – [author name](author url) — '
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_Forum_Formatted_Copy.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/CrW_Forum_Formatted_Copy.user.js
// @match          *://forums.spacebattles.com/threads/*
// @match          *://forums.sufficientvelocity.com/threads/*
// @match          *://forum.questionablequesting.com/threads/*
// @grant          GM_setClipboard
// @grant          GM.setClipboard
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @license        AGPL-3.0-or-later
// @history        2.2.1 — Make sure page num is not captured when getting the normalised thread url. Move regexs and variables into the functions they are used in. Get auth name and url from the thread header area which is on every page of the thread as opposed to the first message of the thread
// @history        2.2.0 — Remove QQ specific sections as QQ has now migrated to XenForo2
// @history        2.1.1 — Remove the trailing forward slash when pasting the MD formatted string into clipboard
// @history        2.1.0 — Split the genWork function into two functions that handle the work information and author information separately
// @history        2.0.1 — Use the URL contructor to make page_url so as to get rid any links to a specific post of a thread
// @history        2.0.0 — Rewrite to use a general formatting function (as in AO3FC)
// @history        1.0.1 — Add logging to console at specific steps
// @history        1.0.0 — Initial creation of script w/ basic comments
// ==/UserScript==

(function () {
	`use strict`;

	// Regex for spacing out chapter counts (e.g. 3/? → 3 / ?)
	const re_ch = /(\d(\d+)?)(\/)(\?|\d(\d+)?)/gmi;

	function html_decode(txt_str) {
		const doc = new DOMParser().parseFromString(txt_str, `text/html`);
		return doc.documentElement.textContent;
	}

	function CrW_gen_Work_Copy(s_t) {

		const re_wu = /(https?:\/\/forums?\..*?\.com\/threads\/).*\.(\d+\/)/gmi;    /* Regex for extracting work URL without thread name */
		const re_wt = /[-: ]*(\[([^\]]+)\]|\(([^\)]+)\))[-: ]*/gmi;                 /* Regex for extracting work title without [] blocks or () blocks or leading/trailing spaces/dashes/colons */
		const re_ms = /(~|\*)/gmi;                                                  /* Regex for escaping characters used in MD syntax that may appear in work or series titles – DO NO USE ON ANYTHING THAT COULD CONTAIN A URL */
		const re_ap = /’|ʼ|‘/gmi;                                                   /* Regex for replacing multiple apostrophe-like characters with an apostrophe */

		const re_https = /http(?!s)/i;
		const re_pgnum = /page-\d+/i;

		console.log(`
Executing Formatting for XF2 Forums
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		// Get the URL of the current webpage
		const ref_url = new URL(window.location);

		// Get Work Title and Work URL
		const wrk_title = html_decode(document.querySelector(`.p-body-header .p-title-value`).textContent.replace(re_wt, ``).replace(re_ap, `'`).replace(re_ms, `\\$1`).trim());
		const wrk_url = `${ref_url.origin.replace(re_https, `https`)}${ref_url.pathname.split(re_pgnum).at(0)}`.replace(re_wu, `$1$2`);

		console.log(`
Work Title:
${wrk_title}
------------------------
Work URL:
${wrk_url}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);


		return {
			wrk_title: wrk_title,
			wrk_url: wrk_url,
		};
	}

	function CrW_gen_Auth_Copy(s_t) {

		// Get element containing auth name and url
		const auth_details = document.querySelector(`.p-body-header .p-description li:has(> i[title*="Thread starter"]) a.username`);

		// Get Author Name and Author URL
		const auth_name = auth_details.textContent.trim();
		const auth_url = auth_details.href;

		console.log(`
Author Name:
${auth_name}
------------------------
Author URL:
${auth_url}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		return {
			auth_name: auth_name,
			auth_url: auth_url
		};
	}

	function CrW_Frmt_Copy() {
		// Regex for escaping underscores that are not part of URLs for Markdown
		const re_mu = /(?<!(\\|http(\S(\S+?))?))(_)/gmi;

		const s_t = performance.now();	// used for measuring time taken to execute script

		console.log(`
Beginning execution of CrW Formatted Copy Shortcut (UserScript)
Executing MarkDown Formatting
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		const { wrk_title, wrk_url } = CrW_gen_Work_Copy(s_t);
		const { auth_name, auth_url } = CrW_gen_Auth_Copy(s_t);

		// Debug Line
		// console.log(`\n${wrk_title}\n${wrk_url.slice(0, -1)}\n${auth_name}\n${auth_url.slice(0, -1)}`);

		// Generate final MD formatted text
		const final_out = `[${wrk_title}](${wrk_url.slice(0, -1)}) – [${auth_name}](${auth_url.slice(0, -1)}) — `.replace(re_mu, `\\$4`);
		console.log(`
Final Clipboard:
${final_out}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		// Paste final MD formatted text to clipboard
		GM.setClipboard(final_out);
		console.log(`
final_out pasted to clipboard
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		console.log(`
CrW Formatted Copy Shortcut (UserScript) executed successfully
------------------------
Time Elapsed: ${performance.now() - s_t}ms
———————————————————————————`
		);
	}

	function CrW_Norm_URL_Copy() {
		const s_t = performance.now();	// used for measuring time taken to execute script

		console.log(`
Beginning execution of CrW Formatted Copy Shortcut (UserScript)
Executing Normalised Thread URL Copy
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		const { wrk_url } = CrW_gen_Work_Copy(s_t);

		// Generate final MD formatted text
		const final_out = wrk_url;
		console.log(`
Final Clipboard:
${final_out}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		// Paste final MD formatted text to clipboard
		GM.setClipboard(final_out);
		console.log(`
final_out pasted to clipboard
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		console.log(`
CrW Formatted Copy Shortcut (UserScript) executed successfully
------------------------
Time Elapsed: ${performance.now() - s_t}ms
———————————————————————————`
		);
	}

	// Below taken from https://stackoverflow.com/a/2511474/11750206
	// Handler for the Keyboard Shortcut for CrW Formatted Copy
	function CrWFC_handler(e) {

		// Keyboard Shortcut for CrW Formatted Copy — Shift + Alt + K
		if (e.shiftKey && e.altKey && e.code === `KeyK`) {

			// Execute CrW Formatted Copy
			CrW_Frmt_Copy();
		}
	}

	// Register the CrWFC handler
	document.addEventListener(`keyup`, CrWFC_handler, false);

	GM.registerMenuCommand(`Copy Work as formatted`, CrW_Frmt_Copy);
	GM.registerMenuCommand(`Copy normalised Thread URL`, CrW_Norm_URL_Copy);

})();