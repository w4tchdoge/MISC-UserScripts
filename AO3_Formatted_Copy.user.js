// ==UserScript==
// @name           AO3 Formatted Copy
// @namespace      https://github.com/w4tchdoge
// @version        2.4.2-20240320_142747
// @description    Copy the curretly open AO3 work in the folloring MarkDown format '- [work name](work url) – [author name](author url) — '
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Formatted_Copy.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Formatted_Copy.user.js
// @match          *://archiveofourown.org/*works/*
// @match          *://archiveofourown.org/*series/*
// @exclude        *://archiveofourown.org/*works/*/bookmarks
// @icon           https://archiveofourown.org/favicon.ico
// @grant          GM_setClipboard
// @grant          GM.setClipboard
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @license        AGPL-3.0-or-later
// @history        2.4.2 — Add a match rule for series pages
// @history        2.4.1 — Modify the match rule so that it matches collections/*/works URLs as well; Add an exlude role so it doesn't work on works/*/bookmarks pages as it isn't designed to
// @history        2.4.0 — Add ability to copy work as a generic Note formatting for the Notes section
// @history        2.3.4 — Fix Re-read Formatting not escaping underscores that are not part of a URL
// ==/UserScript==

const re_wu = /(^https?:\/\/)(.*\.)?(archiveofourown\.org)(.*?)(\/works\/\d+)\/?.*$/gmi;     /* Regex for extracting work URL without specific chapter */
const re_su = /(^https?:\/\/)(.*\.)?(archiveofourown\.org)(.*?)(\/series\/\d+)\/?.*$/gmi;    /* Regex for extracting series URL while stripping unnecessary parts */
const re_ch = /(\d(\d+)?)(\/)(\?|\d(\d+)?)/gmi;                                              /* Regex for spacing out chapter counts (e.g. 3/? → 3 / ?) */
const re_mu = /(?<!(\\|http(\S(\S+?))?))(_)/gmi;                                             /* Regex for escaping underscores that are not part of URLs for Markdown */
const re_ms = /(~|\*)/gmi;                                                                   /* Regex for escaping characters used in MD syntax that may appear in work or series titles – DO NO USE ON ANYTHING THAT COULD CONTAIN A URL */
const re_ap = /’|ʼ|‘/gmi;                                                                    /* Regex for replacing multiple apostrophe-like characters with an apostrophe */

function html_decode(txt_str) {
	let doc = new DOMParser().parseFromString(txt_str, `text/html`);
	return doc.documentElement.textContent;
}

function AO3_genWork_Copy(s_t) {
	/* Get Work Title */
	let wrk_title = html_decode(document.querySelector(`#main .title`).textContent.trim().replace(re_ap, `'`).replace(re_ms, `\\$1`));
	console.log(
		`
Work Title:
${wrk_title}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
	);

	/* Get Work URL */
	let wrk_url = window.location.href.replace(re_wu, `$1$3$5`);
	console.log(
		`
Work URL:
${wrk_url}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
	);

	/* Get Author(s) of the work */
	/* Try to add exception for anon authors */
	let au_list = document.querySelectorAll(`#workskin > .preface .byline a[rel='author']`);
	let a_nm = [];
	let a_pg = [];
	let authors = [];
	for (let x of au_list) {
		a_nm.push(x.textContent.replace(re_ms, `\\$1`));
		a_pg.push(x.href);
		authors.push(`[${x.textContent.replace(re_ms, `\\$1`)}](${x.href})`);
	}
	console.log(
		`
Author(s):
${a_nm.join(`\n`)}
------------------------
Author Page(s):
${a_pg.join(`\n`)}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
	);

	return {
		wrk_title: wrk_title,
		wrk_url: wrk_url,
		authors: authors
	};
}

function AO3_Frmt_Copy() {
	let s_t = performance.now();

	console.log(
		`
Beginning execution of AO3 Formatted Copy Shortcut (UserScript)
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
	);

	if (window.location.href.includes(`works`)) {		/* Check if the page is a work page */

		console.log(
			`
Executing General Formatting for \"Works\"
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		var { wrk_title, wrk_url, authors } = AO3_genWork_Copy(s_t);

		/* Generate final MD formatted text */
		let final_out = `[${wrk_title}](${wrk_url}) – ${authors.join(`, `)} — `.replace(re_mu, `\\$4`);
		console.log(
			`
Final Clipboard:
${final_out}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Paste final MD formatted text to clipboard */
		GM_setClipboard(final_out);
		console.log(
			`
final_out pasted to clipboard
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

	}

	if (window.location.href.includes(`series`)) {		/* Check if the page is a series page */

		console.log(
			`
Executing Formatting for \"Series\"
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Get Series Title */
		let srs_title = html_decode(document.querySelector(`#inner #main h2.heading`).textContent.trim().replace(re_ap, `'`).replace(re_ms, `\\$1`));
		console.log(
			`
Series Title:
${srs_title}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Get Series URL */
		let srs_url = window.location.href.replace(re_su, `$1$3$5`);
		console.log(
			`
Series URL:
${srs_url}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Get Author(s) of the series */
		let au_list = document.querySelectorAll(`dl.series.meta.group a[rel='author']`);
		let a_nm = [];
		let a_pg = [];
		let authors = [];
		for (let x of au_list) {
			a_nm.push(x.textContent.replace(re_ms, `\\$1`));
			a_pg.push(x.href);
			authors.push(`[${x.textContent.replace(re_ms, `\\$1`)}](${x.href})`);
		}
		console.log(
			`
Author(s):
${a_nm.join(`\n`)}
------------------------
Author Page(s):
${a_pg.join(`\n`)}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Get works in the series */
		let wr_list = document.querySelectorAll(`ul.series.work.index.group li.work`);
		let w_nm = [];
		let w_pg = [];
		let works = [];
		// var wrksx = [];
		for (let x of wr_list) {

			// Select the Title element of the work via XPath and assign it to a variable
			let w_xp = `.//div[contains(concat(" ",normalize-space(@class)," ")," header ")]//h4[contains(concat(" ",normalize-space(@class)," ")," heading ")]/a[contains(@href,"works")][not(preceding-sibling::*)]`;
			let wx = document.evaluate(w_xp, x, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

			// Select the Chapter # element of the work via XPath and assign it to a variable
			let chp_xp = `.//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dd[contains(concat(" ",normalize-space(@class)," ")," chapters ")]`;
			let wkx = document.evaluate(chp_xp, x, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

			// Format the work title and url into MarkDown hyperlink and assign it to a variable
			let wfmt = `[${wx.textContent.replace(re_ms, `\\$1`)}](${wx.href})`;

			// Add the work title and url to two separate arrays
			w_nm.push(wx.textContent.replace(re_ms, `\\$1`));
			w_pg.push(wx.href);

			// works.push(wfmt);
			// wrksx.push(`\t${1 + Array.from(wr_list).indexOf(x)}. ${wfmt} — ${wkx.textContent.replace(re_ch, `$1 $3 $4`)}`)

			// Add the MD list formatted work hyperlink to an array
			works.push(`\t${1 + Array.from(wr_list).indexOf(x)}. ${wfmt} — ${wkx.textContent.replace(re_ch, `$1 $3 $4`)}`);

		}
		// for (let x of works) {
		// 	wrksx.push(`\t${1 + works.indexOf(x)}. ${x} — ${flr}`);
		// }
		console.log(
			`
Work Name(s):
${w_nm.join(`\n`)}
------------------------
Work Page(s):
${w_pg.join(`\n`)}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Get publishing status of the series */
		let pub_xp = `//dl[contains(concat(" ",normalize-space(@class)," ")," series ")][contains(concat(" ",normalize-space(@class)," ")," meta ")][contains(concat(" ",normalize-space(@class)," ")," group ")]//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dt[contains(text(), "Complete")]/following-sibling::*[1]`;
		let pub_r = document.evaluate(pub_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
		if (pub_r == `No`) {
			var pb_s = `Ongoing`;
			var pub_st = `? \\[Ongoing\\]`;
			var wks_end = `\n\t${wr_list.length + 1}. ?`;
		} else if (pub_r == `Yes`) {
			var pb_s = `Completed`;
			var pub_st = `${wr_list.length} \\[Completed\\]`;
			var wks_end = ``;
		}
		console.log(
			`
Series Publishing Status:
${pb_s}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Generate final MD formatted text */
		/* var srs_f_o = `- [${srs_title}](${srs_url}) – ${authors.join(`, `)} (**Series** | ${wr_list.length} / ${pub_st})
${wrksx.join(`\n`)}${wks_end}`.replace(re_mu, `\\$4`); */
		let srs_f_o = `- [${srs_title}](${srs_url}) – ${authors.join(`, `)} (**Series** | ${wr_list.length} / ${pub_st})
${works.join(`\n`)}${wks_end}`.replace(re_mu, `\\$4`);
		console.log(
			`
Final Clipboard:
${srs_f_o}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Paste final MD formatted text to clipboard */
		GM_setClipboard(srs_f_o);
		console.log(
			`
final_out pasted to clipboard
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

	}

	console.log(
		`
AO3 Formatted Copy Shortcut (UserScript) executed successfully
------------------------
Time Elapsed: ${performance.now() - s_t}ms
———————————————————————————`
	);
}

function AO3_Reread_Format_Copy() {
	function generic_rr_frmt() {
		// Select the Chapter # element & Wordcount element of the work via XPath and assign it to a variable for later
		var chp_xp = `.//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dd[contains(concat(" ",normalize-space(@class)," ")," chapters ")]`;
		var chp_cnt = document.evaluate(chp_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		var wrd_xp = `.//dl[contains(concat(" ",normalize-space(@class)," ")," stats ")]//dd[contains(concat(" ",normalize-space(@class)," ")," words ")]`;
		var wrd_cnt = document.evaluate(wrd_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

		var word_count = `?`;
		if ((chp_cnt.textContent.split(`/`).at(0) == rr_end - rr_sta + 1) || (chp_cnt.textContent.split(`/`).at(0) == 1)) {
			word_count = wrd_cnt.textContent.replace(/,/g, ``);
			console.log(
				`
# of Chapters to Re-read = # of Chapters Published
Word Count set to work's current word cout (${word_count} words)
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
			);
		} else {
			console.log(
				`
# of Chapters to Re-read ≠ # of Chapters Published
Word Count left as unknown
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
			);
		}

		var cr_dt = `${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, `0`)}/${new Date().getDate().toString().padStart(2, `0`)}`;

		return {
			word_count: word_count,
			cr_dt: cr_dt
		};

	}

	// RegEx that will be used
	var re_se_si = /^(\d(?:\d+)?)$/;
	var re_se_mu = /^(\d(?:\d+)?)\D(?:\D+)?(\d(?:\d+)?)$/;

	var rr_start_end = prompt(
		`Input start and end chapter numbers for re-read in the form:
'start_#, end_#'`
	);
	while ((re_se_mu.test(rr_start_end) || re_se_si.test(rr_start_end)) == false) {
		rr_start_end = prompt(
			`Incorrect input, try again.

Input start and end chapter numbers for re-read in the form: 'start_#, end_#'`
		);
	}

	try {
		rr_start_end = JSON.parse(`[${rr_start_end.replace(re_se_mu, `$1,$2`)}]`);
	} catch (SyntaxError) {
		rr_start_end = JSON.parse(`[${parseInt(rr_start_end)}]`);
	}

	if (rr_start_end.length == 1) {

		var s_t = performance.now();

		console.log(
			`
Beginning execution of AO3 Formatted Copy Shortcut (UserScript)
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		console.log(
			`
Executing Re-read Formatting for \"Works\"
Single Chapter Re-read
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		var { wrk_title, wrk_url, authors } = AO3_genWork_Copy(s_t);

		console.log(`
Re-reading Chapter: ${rr_start_end.at(-0).toString().padStart(2, `0`)}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		var { word_count, cr_dt } = generic_rr_frmt();

		/* Generate final MD formatted text */
		let final_out = `- [${wrk_title}](${wrk_url}) – ${authors.join(`, `)} —— Bookmark Link
\t- Re-read Chapter ${rr_start_end.at(-0).toString().padStart(2, `0`)} (${word_count} words) –– ${cr_dt}`.replace(re_mu, `\\$4`);
		console.log(
			`
Final Clipboard:
${final_out}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Paste final MD formatted text to clipboard */
		GM_setClipboard(final_out);
		console.log(
			`
final_out pasted to clipboard
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

	} else {

		var s_t = performance.now();

		console.log(
			`
Beginning execution of AO3 Formatted Copy Shortcut (UserScript)
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		console.log(
			`
Executing Re-read Formatting for \"Works\"
Multi Chapter Re-read
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		var { wrk_title, wrk_url, authors } = AO3_genWork_Copy(s_t);

		var rr_sta = rr_start_end.at(-0).toString().padStart(2, `0`);
		var rr_end = rr_start_end.at(-1).toString().padStart(2, `0`);

		console.log(
			`
Re-read Start Chapter: ${rr_sta}
Re-read End Chapter  : ${rr_end}

# of Chapters to Re-read:
${rr_end - rr_sta + 1}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		var { word_count, cr_dt } = generic_rr_frmt();

		/* Generate final MD formatted text */
		let final_out = `- [${wrk_title}](${wrk_url}) – ${authors.join(`, `)} —— Bookmark Link
\t- Re-read Chapter ${rr_sta} - Chapter ${rr_end} (${word_count} words) –– ${cr_dt} - ?
\t\t- ${cr_dt} -- Chapter ${rr_sta}`.replace(re_mu, `\\$4`);
		console.log(
			`
Final Clipboard:
${final_out}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);

		/* Paste final MD formatted text to clipboard */
		GM_setClipboard(final_out);
		console.log(
			`
final_out pasted to clipboard
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
		);
	}
}

function NoteSection_Frmt_Copy() {

	let s_t = performance.now();

	console.log(
		`
Beginning execution of AO3 Formatted Copy Shortcut (UserScript)
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
	);

	console.log(
		`
Executing Note Formatting for \"Works\"
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
	);

	var { wrk_title, wrk_url, authors } = AO3_genWork_Copy(s_t);

	/* Generate final MD formatted text */
	let final_out = `- [${wrk_title}](${wrk_url}) – ${authors.join(`, `)} —— Bookmark Link
\t- `.replace(re_mu, `\\$4`);
	console.log(
		`
Final Clipboard:
${final_out}
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
	);

	/* Paste final MD formatted text to clipboard */
	GM_setClipboard(final_out);
	console.log(
		`
final_out pasted to clipboard
------------------------
Time Elapsed:
${performance.now() - s_t} ms
———————————————————————————`
	);

}

/* Below taken from https://stackoverflow.com/a/2511474/11750206 */
/* Handler for the Keyboard Shortcut for AO3 Formatted Copy */
function AO3FC_handler(e) {

	/* Keyboard Shortcut for AO3 Formatted Copy — Shift + Alt + K */
	if (e.shiftKey && e.altKey && e.code === `KeyK`) {

		/* Execute AO3 Formatted Copy */
		AO3_Frmt_Copy();
	}
}

/* Register the AO3FC handler */
document.addEventListener(`keyup`, AO3FC_handler, false);

/* Add Options to the Tampermonkey Popup Menu to execute each function */
GM.registerMenuCommand(`Copy Work/Series as formatted`, AO3_Frmt_Copy);
GM.registerMenuCommand(`Copy Work w/ re-read formatting`, AO3_Reread_Format_Copy);
GM.registerMenuCommand(`Copy Work w/ Note Formatting`, NoteSection_Frmt_Copy);
