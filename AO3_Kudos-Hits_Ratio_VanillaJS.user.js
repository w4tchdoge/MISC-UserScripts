// ==UserScript==
// @name           AO3: Kudos/Hits Ratio VanillaJS
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0
// @description    Adds the Kudos to Hits ratio of a work as a percentage with optional (user configurable) coloured backgrounds depending on the ratio. Also adds the ability to sort based on the ratio.
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @match          *://archiveofourown.org/*
// @license        AGPL-3.0-or-later
// ==/UserScript==

(function () {
	`use strict`;

	/* <SETTINGS> */

	// Automatically count kudos/hits: true OR false
	var always_count = true;

	// Automatically sort works on the page by kudos/hits ratio (in descending order): true OR false
	var always_sort = false;

	// Hide hit count: true OR false
	var hide_hitcount = false;

	// Colour background depending on kudos/hits ratio: true OR false
	var colourbg = true;

	// Number of decimal places to be used in the percentage
	const kr_prctg_dp = 1;

	// lvl1, lvl2 — Values (in percentage) of the kudos/hits ratio separating the 3 different percentage bands a work can fall into
	const [lvl1, lvl2] = [4, 7];

	// ratio_red, ratio_yellow, ratio_green – The background colour of the kudos/hits ratio box for the 3 different percentage bands a work can  fall into
	const [ratio_red, ratio_yellow, ratio_green] = [`#A00000`, `#9F8600`, `#289200`];

	/* </SETTINGS> */

	// declare the button element variables
	var header_menu,
		ratio_menu,
		drop_menu,
		button_count,
		button_sort,
		button_settings,
		button_count_yes,
		button_count_no,
		button_sort_yes,
		button_sort_no,
		button_hide_yes,
		button_hide_no;

	// Check for user settings in Local Storage
	if (typeof (Storage) !== `undefined`) {

		var always_count_set = localStorage.getItem(`alwayscountlocal`);
		var always_sort_set = localStorage.getItem(`alwayssortlocal`);
		var hide_hitcount_set = localStorage.getItem(`hidehitcountlocal`);

		if (always_count_set == `no`) {
			always_count = false;
		}

		if (always_sort_set == `yes`) {
			always_sort = true;
		}

		if (hide_hitcount_set == `no`) {
			hide_hitcount = false;
		}
	}

	// set defaults for countableness and sortableness
	var countable = false;
	var sortable = false;
	var stats_page = false;

	// check if it's a list of works or bookmarks, or header on work page, and attach the menu
	checkCountable();

	// if set to automatic
	if (always_count) {
		countRatio();

		if (always_sort) {
			sortByRatio();
		}
	}


	// check if it's a list of works/bookmarks/statistics, or header on work page
	function checkCountable() {

		var found_stats = Array.from(document.querySelectorAll(`#main dl.stats`));

		if (found_stats.length) {

			if (found_stats.length !== 1 && (found_stats.at(-0).closest(`li`).matches(`.work`) || found_stats.at(-0).closest(`li`).matches(`.bookmark`))) {    // Checks if user is on a page that lists works/bookmarks

				countable = true;
				sortable = true;
				addRatioMenu();

			}
			else if (document.querySelectorAll(`#main div.work`).length) {

				countable = true;
				addRatioMenu();

			}
		}
	}

	function countRatio() {

		if (countable) {

			var countable_found_stats = document.querySelectorAll(`#main dl.stats`);

			for (let x of countable_found_stats) {
				var hits_value = x.querySelector(`dd.hits`) || `0`;
				var kudos_value = x.querySelector(`dd.kudos`) || `0`;

				// if hits & kudos were found
				if ((hits_value && kudos_value !== undefined) && (hits_value.textContent !== `0`) && (x.querySelector(`#usr_js_khr_ratio_value`) == null)) {

					// get counts
					var hits_count = parseInt(hits_value.textContent.replace(/\D/g, ``));
					var kudos_count = parseInt(kudos_value.textContent.replace(/\D/g, ``));

					// calculate percentage
					var kr_percentage = 100 * kudos_count / hits_count;

					// round percentage to desired number of decimal place 
					var kr_percentage_print = kr_percentage.toFixed(kr_prctg_dp);

					// add ratio stats
					var ratio_label = Object.assign(document.createElement(`dt`), {
						id: `usr_js_khr_ratio_label`,
						className: `kudoshits`,
						innerHTML: `Kudos/Hits:`
					});
					var ratio_value = Object.assign(document.createElement(`dd`), {
						id: `usr_js_khr_ratio_value`,
						className: `kudoshits`,
						style: `color: #2a2a2a; margin-left: 0.3em;`,
						innerHTML: `${kr_percentage_print}%`
					});
					x.append(ratio_label, ratio_value);

					// colour background depending on percentage
					if (colourbg && kr_percentage >= lvl2) {
						ratio_value.style.backgroundColor = ratio_green;
					}
					else if (colourbg && kr_percentage >= lvl1) {
						ratio_value.style.backgroundColor = ratio_yellow;
					}
					else if (colourbg) {
						ratio_value.style.backgroundColor = ratio_red;
					}

					if (hide_hitcount && !stats_page) {
						// hide hitcount label and value
						x.querySelector(`.hits`).setAttribute(`style`, `display: none;`);
					}

					// add attribute to the blurb for sorting
					x.closest(`li`).setAttribute(`kudospercent`, kr_percentage);
				}
				else {
					// add attribute to the blurb for sorting
					x.closest(`li`).setAttribute(`kudospercent`, 0);
				}
			}
		}
	}

	function sortByRatio(ascending) {

		if (sortable) {

			var sortable_list_elems = document.querySelector(`#main dl.stats`).closest(`li`).parentNode;
			var list_elements = sortable_list_elems.querySelectorAll(`:scope > li`);
			var new_list_elements = Array.from(list_elements).sort(function (a, b) {
				return parseFloat(b.getAttribute('kudospercent')) - parseFloat(a.getAttribute('kudospercent'));
			});

			if (ascending) {

				list_elements.forEach(function (elem) {
					elem.remove();
				});

				new_list_elements = new_list_elements.reverse();
				new_list_elements.forEach(function (elem) {
					sortable_list_elems.appendChild(elem);
				});
			}
			else {

				list_elements.forEach(function (elem) {
					elem.remove();

					new_list_elements.forEach(function (elem) {
						sortable_list_elems.appendChild(elem);
					});
				});
			}
		}
	}


	// attach the menu
	function addRatioMenu() {

		// get the header menu
		header_menu = document.querySelector(`ul.primary.navigation.actions`);

		// create and insert menu button
		ratio_menu = Object.assign(document.createElement(`li`), {
			className: `dropdown`,
			innerHTML: `<a>Kudos/hits</a>`
		});
		header_menu.querySelector(`li.search`).before(ratio_menu);

		// create and append dropdown menu
		drop_menu = Object.assign(document.createElement(`ul`), {
			className: `menu dropdown-menu`
		});
		ratio_menu.append(drop_menu);

		// create button – count
		button_count = Object.assign(document.createElement(`li`), {
			id: `KHR_btn_cnt_elm`,
			innerHTML: `<a id='KHR_btn_cnt_a'>Count on this page</a>`
		});
		button_count.onclick = function () {
			countRatio();
		};

		// create button – sort
		button_sort = Object.assign(document.createElement(`li`), {
			innerHTML: `<a>Sort on this page</a>`
		});
		button_sort.onclick = function () {
			sortByRatio();
		};

		// create button – settings
		button_settings = Object.assign(document.createElement(`li`), {
			innerHTML: `<a style="padding: 0.5em 0.5em 0.25em; text-align: center; font-weight: bold;">&mdash; Settings (click to change): &mdash;</a>`
		});

		// create button – always count
		button_count_yes = Object.assign(document.createElement(`li`), {
			className: `count-yes`,
			innerHTML: `<a>Count automatically: YES</a>`
		});
		button_count_yes.addEventListener(`click`, function (event) {
			localStorage.setItem('alwayscountlocal', 'no');
			button_count_yes.replaceWith(button_count_no);
		});

		// create button – not always count
		button_count_no = Object.assign(document.createElement(`li`), {
			className: `count-no`,
			innerHTML: `<a>Count automatically: NO</a>`
		});
		button_count_no.addEventListener(`click`, function (event) {
			localStorage.setItem('alwayscountlocal', 'yes');
			button_count_no.replaceWith(button_count_yes);
		});

		// create button – always sort
		button_sort_yes = Object.assign(document.createElement(`li`), {
			className: `sort-yes`,
			innerHTML: `<a>Sort automatically: YES</a>`
		});
		button_sort_yes.addEventListener(`click`, function (event) {
			localStorage.setItem('alwayssortlocal', 'no');
			button_sort_yes.replaceWith(button_sort_no);
		});

		// create button – not always sort
		button_sort_no = Object.assign(document.createElement(`li`), {
			className: `sort-no`,
			innerHTML: `<a>Sort automatically: NO</a>`
		});
		button_sort_no.addEventListener(`click`, function (event) {
			localStorage.setItem('alwayssortlocal', 'yes');
			button_sort_no.replaceWith(button_sort_yes);
		});

		// create button – hide hitcount
		button_hide_yes = Object.assign(document.createElement(`li`), {
			className: `hide-yes`,
			innerHTML: `<a>Hide hitcount: YES</a>`
		});
		button_hide_yes.addEventListener(`click`, function (event) {
			localStorage.setItem('hidehitcountlocal', 'no');
			document.querySelectorAll(`.stats .hits`).forEach(function (elem) {
				elem.removeAttribute(`style`);
			});
			button_hide_yes.replaceWith(button_hide_no);
		});

		// create button – don't hide hitcount
		button_hide_no = Object.assign(document.createElement(`li`), {
			className: `hide-no`,
			innerHTML: `<a>Hide hitcount: NO</a>`
		});
		button_hide_no.addEventListener(`click`, function (event) {
			localStorage.setItem('hidehitcountlocal', 'yes');
			document.querySelectorAll(`.stats .hits`).forEach(function (elem) {
				elem.setAttribute(`style`, `display: none;`);
			});
			button_hide_no.replaceWith(button_hide_yes);
		});

		// append buttons to the dropdown menu
		drop_menu.append(button_count);

		if (sortable) {
			drop_menu.append(button_sort);
		}

		if (typeof (Storage) !== `undefined`) {

			drop_menu.append(button_settings);

			if (always_count) {
				drop_menu.append(button_count_yes);
			}
			else {
				drop_menu.append(button_count_no);
			}

			if (always_sort) {
				drop_menu.append(button_sort_yes);
			}
			else {
				drop_menu.append(button_sort_no);
			}

			if (hide_hitcount) {
				drop_menu.append(button_hide_yes);
			}
			else {
				drop_menu.append(button_hide_no);
			}
		}

	}

})();
