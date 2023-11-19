// ==UserScript==
// @name           CrW Forum (SB/SV/QQ) Formatted Copy
// @namespace      https://github.com/w4tchdoge
// @version        1.0.1-20231119_223253
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
// @history        1.0.1 — Add logging to console at specific steps
// @history        1.0.0 — Initial creation of script w/ basic comments
// ==/UserScript==

(function () {
	`use strict`;

	const re_wu = /(https?:\/\/forums?\..*?\.com\/threads\/).*\.(\d+\/)/gmi;    /* Regex for extracting work URL without thread name */
	const re_wt = /[-: ]*(\[([^\]]+)\]|\(([^\)]+)\))[-: ]*/gmi;                 /* Regex for extracting work title without [] blocks or () blocks or leading/trailing spaces/dashes/colons */
	const re_ch = /(\d(\d+)?)(\/)(\?|\d(\d+)?)/gmi;                             /* Regex for spacing out chapter counts (e.g. 3/? → 3 / ?) */
	const re_mu = /(?<!(\\|http(\S(\S+?))?))(_)/gmi;                            /* Regex for escaping underscores that are not part of URLs for Markdown */
	const re_ms = /(~|\*)/gmi;                                                  /* Regex for escaping characters used in MD syntax that may appear in work or series titles – DO NO USE ON ANYTHING THAT COULD CONTAIN A URL */
	const re_ap = /’|ʼ|‘/gmi;                                                   /* Regex for replacing multiple apostrophe-like characters with an apostrophe */

	function html_decode(txt_str) {
		let doc = new DOMParser().parseFromString(txt_str, `text/html`);
		return doc.documentElement.textContent;
	}

	function CrW_Frmt_Copy() {
		let s_t = performance.now();	// used for measuring time taken to execute script

		console.log(`
Beginning execution of CrW Formatted Copy Shortcut (UserScript)
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Get the URL of the current webpage */
		const page_url = window.location.href;

		/* Define vars used in assembling the  */
		var wrk_title, wrk_url, auth_name, auth_url;

		/* Check if the current page is a QQ page, as QQ has a different DOM structure compared to SB/SV */
		if (page_url.includes(`questionablequesting.com`)) {  // If the page is a QQ page

			console.log(`
Executing Formatting for QQ
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
			);

			/* Get Work Title and Work URL */
			wrk_title = html_decode(document.querySelector(`.titleBar h1`).textContent.trim().replace(re_wt, ``).replace(re_ap, `'`).replace(re_ms, `\\$1`));
			wrk_url = page_url.replace(re_wu, `$1$2`);
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

			/* Vars used to locate the Author Name & Author URL */
			let
				auth_first_msg_XP = `.//li[contains(concat(" ",normalize-space(@class)," ")," message ")][contains(concat(" ",normalize-space(@class)," ")," hasThreadmark ")][count(.//div[contains(concat(" ",normalize-space(@class)," ")," threadmarker ")]//span[contains(., "Threadmarks")]) > 0]`,
				auth_first_msg = document.evaluate(auth_first_msg_XP, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
				auth_details = auth_first_msg.querySelector(`div.messageUserInfo > div[class^=messageUserBlock] .userText > a`);

			/* Get Author Name and Author URL */
			auth_name = auth_details.textContent;
			auth_url = auth_details.href;
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

		} else {  // If the page is not a QQ page

			/* Get Work Title and Work URL */
			wrk_title = html_decode(document.querySelector(`.p-body-header .p-title-value`).textContent.trim().replace(re_wt, ``).replace(re_ap, `'`).replace(re_ms, `\\$1`));
			wrk_url = page_url.replace(re_wu, `$1$2`);
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

			/* Vars used to locate the Author Name & Author URL */
			let
				auth_first_msg_XP = `.//article[contains(concat(" ",normalize-space(@class)," ")," hasThreadmark ")][count(.//*[contains(concat(" ",normalize-space(@class)," ")," message-cell--threadmark-header ")]//span//label[text()[contains(.,"Threadmarks")]]) > 0]`,
				auth_first_msg = document.evaluate(auth_first_msg_XP, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue,
				auth_details = auth_first_msg.querySelector(`.message-cell--user .message-userDetails .message-name`);

			/* Get Author Name and Author URL */
			auth_name = auth_details.textContent;
			auth_url = auth_details.querySelector(`a`).href;
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

		}

		/* Debug Line */
		// console.log(`\n${wrk_title}\n${wrk_url}\n${auth_name}\n${auth_url}`);

		/* Generate final MD formatted text */
		let final_out = `[${wrk_title}](${wrk_url}) – [${auth_name}](${auth_url})`;
		console.log(`
Final Clipboard:
${final_out}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Paste final MD formatted text to clipboard */
		GM.setClipboard(final_out);
		console.log(`
final_out pasted to clipboard
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

	}

	/* Below taken from https://stackoverflow.com/a/2511474/11750206 */
	/* Handler for the Keyboard Shortcut for CrW Formatted Copy */
	function CrWFC_handler(e) {

		/* Keyboard Shortcut for CrW Formatted Copy — Shift + Alt + K */
		if (e.shiftKey && e.altKey && e.code === `KeyK`) {

			/* Execute CrW Formatted Copy */
			CrW_Frmt_Copy();
		}
	}

	/* Register the CrWFC handler */
	document.addEventListener(`keyup`, CrWFC_handler, false);

	GM.registerMenuCommand(`Copy Work as formatted`, CrW_Frmt_Copy);

})();