// ==UserScript==
// @name           Get Page Title
// @namespace      https://github.com/w4tchdoge
// @version        1.0.3-20230529_160631
// @description    Paste the title of the current webpage into the clipboard
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @match          *://*/*
// @grant          GM_registerMenuCommand
// @grant          GM_setClipboard
// @license        AGPL-3.0-or-later
// ==/UserScript==

function html_decode(txt_str) {
	let doc = new DOMParser().parseFromString(txt_str, `text/html`);
	return doc.documentElement.textContent;
}

function copy_pg_title() {
	let ttl = html_decode(document.title);
	GM_setClipboard(ttl);
	console.log(
		`
Executed Get Page Title (UserScript)
------------------------
Page Title:
${ttl}
———————————————————————————`
	);
}

GM_registerMenuCommand(`Copy Page Title`, copy_pg_title);