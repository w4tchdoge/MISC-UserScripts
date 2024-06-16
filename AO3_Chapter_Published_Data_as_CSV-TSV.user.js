// ==UserScript==
// @name           AO3: Chapter Published Data as CSV/TSV
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20240616_193023
// @description    Get the chapter title, chapter number, and chapter publish date—and a calculated days between chapter updates—as a CSV or TSV file which can be downloaded using a button added by the userscript
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Chapter_Published_Data_as_CSV-TSV.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Chapter_Published_Data_as_CSV-TSV.user.js
// @match          *://archiveofourown.org/*works/*/navigate
// @run-at         document-end
// @license        AGPL-3.0-or-later
// @history        1.0.0 — Initial publish
// ==/UserScript==

(function () {
	`use strict`;

	// from https://stackoverflow.com/a/1414175/11750206 ; used to convert the 'true' & 'false' strings in localStorage to actual booleans
	const stringToBoolean = (stringValue) => {
		switch (stringValue?.toLowerCase()?.trim()) {
			case "true":
			case "yes":
			case "1":
				return true;

			case "false":
			case "no":
			case "0":
			case null:
			case undefined:
				return false;

			default:
				return JSON.parse(stringValue);
		}
	};


	const default_settings = {
		use_csv: true
	};

	let use_csv = default_settings.use_csv;

	if (typeof Storage != `undefined`) {
		switch (Boolean(localStorage.getItem(`AO3_ChPubDataScript_UseCSV`))) {
			case true:
				use_csv = stringToBoolean(localStorage.getItem(`AO3_ChPubDataScript_UseCSV`));
				break;

			case false:
				use_csv = default_settings.use_csv;
				localStorage.setItem(`AO3_ChPubDataScript_UseCSV`, default_settings.use_csv);
				break;

			default:
				use_csv = default_settings.use_csv;
				break;
		}
	} else {
		use_csv = default_settings.use_csv;
	}

	const AO3ChPbD_useCSV_yes = Object.assign(document.createElement(`li`), {
		id: `AO3ChPbD_useCSV_yes`,
		innerHTML: (() => {

			const el_a = Object.assign(document.createElement(`a`), {
				style: `display: inline-flex;`,
				innerHTML: `Toggle Download File Format: ${(() => {

					const el_b = Object.assign(document.createElement(`pre`), {
						style: `padding-left: 0.4em; padding-right: 0.5em; font-size: 1.1em; position: relative; top: -0.12987em;`,
						textContent: `.csv`
					});
					return el_b.outerHTML;

				})()} (Reload required for changes to take effect)`
			});

			return el_a.outerHTML;

		})()
	});
	AO3ChPbD_useCSV_yes.addEventListener(`click`, function (element) {
		localStorage.setItem(`AO3_ChPubDataScript_UseCSV`, false);
		AO3ChPbD_useCSV_yes.replaceWith(AO3ChPbD_useCSV_no);
	});

	const AO3ChPbD_useCSV_no = Object.assign(document.createElement(`li`), {
		id: `AO3ChPbD_useCSV_no`,
		innerHTML: (() => {

			const el_a = Object.assign(document.createElement(`a`), {
				style: `display: inline-flex;`,
				innerHTML: `Toggle Download File Format: ${(() => {

					const el_b = Object.assign(document.createElement(`pre`), {
						style: `padding-left: 0.4em; padding-right: 0.5em; font-size: 1.1em; position: relative; top: -0.12987em;`,
						textContent: `.tsv`
					});
					return el_b.outerHTML;

				})()} (Reload required for changes to take effect)`
			});

			return el_a.outerHTML;

		})()
	});
	AO3ChPbD_useCSV_no.addEventListener(`click`, function (element) {
		localStorage.setItem(`AO3_ChPubDataScript_UseCSV`, true);
		AO3ChPbD_useCSV_no.replaceWith(AO3ChPbD_useCSV_yes);
	});

	const chapters_array = Array.from(document.querySelectorAll(`ol.chapter.index.group > li:has(span)`));
	// const chapters_array = (async function () {
	// 	const chapters_nodelist = await waitForElmAll(`ol.chapter.index.group > li`);
	// 	const out_array = Array.from(chapters_nodelist);
	// 	return out_array;
	// })();

	const work_id = document.querySelector(`h2.heading > a[href*="works"]`).getAttribute(`href`).split(`/`).at(-1);
	// const work_id = (async function () {
	// 	const id_elm = await waitForElm(`h2.heading > a[href*="works"]`);
	// 	const id_text = id_elm.getAttribute(`href`).split(`/`).at(-1);
	// 	return id_text;
	// })();

	const chapters_data = (() => {
		const data_array = [];

		chapters_array.forEach((element, index) => {
			const chapter_num = index + 1;
			// const pub_date = (new Date(element.querySelector(`span`).textContent.trim().split(/[\(\)]/i).filter(n => n).at(0))).toUTCString();
			const pub_date = element.querySelector(`span`).textContent.trim().split(/[\(\)]/i).filter(n => n).at(0);
			// const chapter_title = element.querySelector(`a`).textContent.trim().split(/\d+\.\s/i).at(-1);
			const chapter_title = `${element.querySelector(`a`).textContent.trim().split(/\d+\.\s/i).at(-1)}`;

			const output_array = (() => {
				let out_arr;

				switch (use_csv) {
					case true:
						out_arr = [chapter_num, `"${chapter_title}"`, pub_date];
						return out_arr;

					case false:
						out_arr = [chapter_num, chapter_title, pub_date];
						return out_arr;

					default:
						out_arr = [chapter_num, `"${chapter_title}"`, pub_date];
						return out_arr;
				}

			})();

			data_array.push(output_array);
		});

		data_array.at(0).push(0);

		data_array.forEach((element, index, array) => {
			if (index > 0) {
				const current_elm_date_timestamp = (new Date(element.at(2))).getTime();
				const previous_elm_date_timestap = (new Date(array.at(index - 1).at(2))).getTime();

				const days_since = (current_elm_date_timestamp - previous_elm_date_timestap) / 60000 / 60 / 24;
				element.push(days_since);
			} else {
				return;
			}
		});

		return data_array;

	})();

	const file_headers = [`Chapter Num`, `Chapter Title`, `Published Date`, `Days Since Last Update`];

	const file_output_str = (() => {

		let out_str;

		switch (use_csv) {
			case true:
				out_str = `${file_headers.join(`,`)}\n`;
				chapters_data.forEach(data_row => {
					out_str += `${data_row.join(`,`)}\n`;
				});
				return out_str;

			case false:
				out_str = `${file_headers.join(`\t`)}\n`;
				chapters_data.forEach(data_row => {
					out_str += `${data_row.join(`\t`)}\n`;
				});
				return out_str;

			default:
				out_str = `${file_headers.join(`,`)}\n`;
				chapters_data.forEach(data_row => {
					out_str += `${data_row.join(`,`)}\n`;
				});
				return out_str;
		}


		// let tsv_string = `${file_headers.join(`\t`)}\n`;
		// let csv_string = `${file_headers.join(`,`)}\n`;

		// chapters_data.forEach(data_row => {
		// tsv_string += `${data_row.join(`\t`)}\n`;
		// csv_string += `${data_row.join(`,`)}\n`;
		// });

		// return tsv_string;
		// return csv_string;

	})();

	const date_string = (new Date()).toISOString().replaceAll(/[-:]|\.\d+/g, ``);
	// const tsv_blob = new Blob([file_output_str], { type: 'text/tab-separated-values;charset=utf-8,' });
	// const tsv_blob = new Blob([file_output_str], { type: 'text/tab-separated-values' });
	// const tsv_blob = new Blob([file_output_str], { type: 'text/csv-values' });

	const [out_blob, download_str] = (() => {
		let o_b, dl_str;

		switch (use_csv) {
			case true:
				o_b = new Blob([file_output_str], { type: 'text/csv-values' });
				dl_str = `AO3_${work_id}_CHs_Pub_Data_${date_string}.csv`;
				return [o_b, dl_str];

			case false:
				o_b = new Blob([file_output_str], { type: 'text/tab-separated-values' });
				dl_str = `AO3_${work_id}_CHs_Pub_Data_${date_string}.tsv`;
				return [o_b, dl_str];

			default:
				o_b = new Blob([file_output_str], { type: 'text/csv-values' });
				dl_str = `AO3_${work_id}_CHs_Pub_Data_${date_string}.csv`;
				return [o_b, dl_str];
		}

	})();

	const blob_url = URL.createObjectURL(out_blob);
	const download_link_elm = Object.assign(document.createElement(`li`), {
		style: `margin-top: 2em;`,
		innerHTML: (() => {
			const element = Object.assign(document.createElement(`a`), {
				className: `button`,
				href: blob_url,
				// download: `AO3_${work_id}_CHs_Pub_Data_${date_string}.tsv`,
				download: download_str,
				textContent: `Download Chapter Published Data`,
			});
			return element.outerHTML;
		})()
	});

	const chp_index_group = document.querySelector(`ol.chapter.index.group`);
	chp_index_group.appendChild(download_link_elm);

	if (use_csv == true || use_csv == `true`) {
		chp_index_group.appendChild(AO3ChPbD_useCSV_yes);
	} else {
		chp_index_group.appendChild(AO3ChPbD_useCSV_no);
	}

})();
