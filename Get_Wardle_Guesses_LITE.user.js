// ==UserScript==
// @name           Copy Wardle Result and Guesses LITE
// @namespace      https://github.com/w4tchdoge
// @version        0.0.3-20240907_160541
// @description    Copies list of your Wardle guesses (spoilered for Discord) to your clipboard
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Get_Wardle_Guesses_LITE.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/Get_Wardle_Guesses_LITE.user.js
// @match          *://wardlegame.com/classic-*
// @grant          GM_setClipboard
// @grant          GM.setClipboard
// @grant          GM_registerMenuCommand
// @grant          GM.registerMenuCommand
// @require        https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @license        AGPL-3.0-or-later
// @history        0.0.3 — cleanup/redo guesses_arr and guesses_spoilers
// @history        0.0.2 — Initial git commit
// ==/UserScript==

(function () {
	`use strict`;

	function MAINfunk() {
		const guess_table = (() => {

			const elm_xp = `.//div[contains(concat(" ",normalize-space(@class)," ")," mb-2 ")]/parent::div[contains(concat(" ",normalize-space(@class)," ")," mt-2 ")][contains(@class,"w-11/12")]`;
			const elm = document.evaluate(elm_xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			return elm;

		})();

		// guess_table;

		// let names_elm_arr = Array.from(guess_table.querySelectorAll(`div.vehicle-name`)).reverse();
		const names_txt_arr = Array.from(guess_table.querySelectorAll(`div.vehicle-name`), elm => elm.textContent.trim()).reverse();

		const nations_txt_arr = (() => {

			let txt_arr = [];
			const elm_arr = Array.from(guess_table.querySelectorAll(`span[class^="fi"]`)).reverse();

			elm_arr.forEach((elm, index, arr) => {

				const nation_code = elm.classList[1].slice(3);
				let nation_name;

				// ISO 3166-1 alpha3 codes from https://en.wikipedia.org/wiki/ISO_3166-1
				switch (nation_code) {
					case `it`:
						nation_name = `ITY`;
						break;

					case `jp`:
						nation_name = `JPN`;
						break;

					case `gb`:
						nation_name = `GBR`;
						break;

					case `de`:
						nation_name = `DEU`;
						break;

					case `se`:
						nation_name = `SWE`;
						break;

					case `us`:
						nation_name = `USA`;
						break;

					case `fr`:
						nation_name = `FRA`;
						break;

					case `ru`:
						nation_name = `RUS`;
						break;

					case `cn`:
						nation_name = `CHN`;
						break;

					case `il`:
						nation_name = `ISR`;
						break;

					default:
						throw new Error("ERROR: Unknown Nation Code!");
				}

				txt_arr.push(nation_name);

			});

			return txt_arr;

		})();

		if (names_txt_arr.length != nations_txt_arr.length) {
			throw new Error("ERROR: Size of nations array and names array do not match!");
		}

		// console.log(`Names arr length: ${names_txt_arr.length}\nNations arr length: ${nations_txt_arr.length}`);

		const guesses_arr = (() => {

			let output_arr = [];

			[...Array(names_txt_arr.length)].forEach((_, index) => {

				const input_obj = { guess_no: (index + 1), name: names_txt_arr.at(index), nation: nations_txt_arr.at(index) };
				output_arr.push(input_obj);

			});

			return output_arr;

		})();

		const guesses_spoilers = (() => {

			let output_arr = [];

			guesses_arr.forEach((elm, index, arr) => {

				const spoiler_text = `${elm.guess_no}. ||${elm.name} **(${elm.nation})**||`;
				output_arr.push(spoiler_text);

			});

			return output_arr;

		})();

		return guesses_spoilers;

	}

	function SpoilerGuessesToClipboard() {

		const guesses_spoilers = MAINfunk();
		const cliptext = `My guesses:\n${guesses_spoilers.join(`\n`)}`;
		GM.setClipboard(cliptext);
		console.log(`
Wardle Guesses have been copied to clipboard! Clipboard should now be:

${cliptext}`);

	}

	GM.registerMenuCommand(`Copy Guesses to Clipboard`, SpoilerGuessesToClipboard);

})();
