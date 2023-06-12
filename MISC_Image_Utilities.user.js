// ==UserScript==
// @name           MISC Image Utilities
// @namespace      https://github.com/w4tchdoge
// @version        3.4.0-20230612_133820
// @description    Miscellaneous IMG related utilities
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/MISC_Image_Utilities.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/MISC_Image_Utilities.user.js
// @include        /^https?:\/\/(.*?)\.(.*?)discord(.*?)\/(.*?)avatar(.*?)$/
// @include        /^https?:\/\/(.*?)\.(.*?)discord(.*?)\/(.*?)banners(.*?)$/
// @include        /^https?:\/\/pbs\.twimg\.com\/media\/(.*?)$/
// @include        /^https?:\/\/preview\.redd\.it\/(.*?)$/
// @grant          GM_registerMenuCommand
// @license        AGPL-3.0-or-later
// @history        3.4.0 — Added support for Discord banner images
// ==/UserScript==

/* SCRIPT GOES FUCKY WUCKY IF YOU SET THIS TO TRUE, EXCEPT NOT ANYMORE XD */
const discord_autofix = true;
const twitter_autofix = true;
const ireddit_autofix = true;


function Discord_gen_IMG_Util(url_par_inx, re_ser, re_rep) {
	var init_url = window.location.href;
	var url_parts = init_url.split(`/`)
		.filter(part => part !== ``);

	var to_rep = url_parts[url_par_inx];
	var repd_str = to_rep.replace(re_ser, re_rep);

	var newurl = `${url_parts[0]}//${url_parts.slice(1, -1).join(`/`)}/${repd_str}`;

	return {
		to_rep: to_rep,
		re_ser: re_ser,
		re_rep: re_rep,
		newurl: newurl
	};
}

const currPG_URL = window.location.href;

if (currPG_URL.toLowerCase().toString().includes(`discordapp`)) {
	if (currPG_URL.toLowerCase().toString().includes(`guilds`)) {
		function Discord_WEBPtoPNG_noSIZE() {
			var { to_rep, re_ser, re_rep, newurl } = Discord_gen_IMG_Util(7, /^(.*?)(\.(webp)).*?$/i, `$1.png?size=4096&quality=lossless`);

			window.location.href = newurl;

			console.log(`href:`, url_parts);
			console.log(`
	regex:
	to replace: ${to_rep}
	regex strings: \"${re_ser}\", \"${re_rep}\"
	final string: ${repd_str}`
			);
		}

		function Discord_WEBPtoPNG_yesSIZE() {
			var { to_rep, re_ser, re_rep, newurl } = Discord_gen_IMG_Util(7, /^(.*?)(\.webp)(\?size=).*?$/i, `$1.png$34096&quality=lossless`);

			window.location.href = newurl;

			console.log(`href:`, url_parts);
			console.log(`
	regex:
	to replace: ${to_rep}
	regex strings: \"${re_ser}\", \"${re_rep}\"
	final string: ${repd_str}`
			);
		}

		function Discord_LosslessImage_noSIZE() {
			var { newurl } = Discord_gen_IMG_Util(7, /^(.*)(\..(.+)?)\??.*?$/i, `$1$2?size=4096&quality=lossless`);

			window.location.href = newurl;
		}

		function Discord_LosslessImage_yesSIZE() {
			var { newurl } = Discord_gen_IMG_Util(7, /^(.*)\.(.*?)(\?size=).*?$/i, `$1.$2?size=4096&quality=lossless`);

			window.location.href = newurl;
		}

		function Discord_WEBPtoPNG() {
			if (currPG_URL.toLowerCase().toString().includes(`.webp`) && currPG_URL.toLowerCase().toString().includes(`size`) === false && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_WEBPtoPNG_noSIZE();
			}
			if (currPG_URL.toLowerCase().toString().includes(`.webp`) && currPG_URL.toLowerCase().toString().includes(`size`) === true && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_WEBPtoPNG_yesSIZE();
			}
		}

		function Discord_LosslessImage() {
			if (currPG_URL.toLowerCase().toString().includes(`size`) === false && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_LosslessImage_noSIZE();
			}
			if (currPG_URL.toLowerCase().toString().includes(`size`) && currPG_URL.includes(`quality`) === false) {
				Discord_LosslessImage_yesSIZE();
			}
		}

		GM_registerMenuCommand(`Discord – WEBP → PNG`, Discord_WEBPtoPNG);
		GM_registerMenuCommand(`Discord – Lossless Image`, Discord_LosslessImage);

		if (discord_autofix === true && currPG_URL.toLowerCase().toString().includes(`webp`)) {
			Discord_WEBPtoPNG();
		}
		if (discord_autofix === true && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
			Discord_LosslessImage();
		}
	}
	else if (currPG_URL.toLowerCase().toString().includes(`banners`)) {
		function Discord_WEBPtoPNG_noSIZE() {
			var { to_rep, re_ser, re_rep, newurl } = Discord_gen_IMG_Util(4, /^(.*?)(\.(webp)).*?$/i, `$1.png?size=4096&quality=lossless`);

			window.location.href = newurl;

			console.log(`href:`, url_parts);
			console.log(`
	regex:
	to replace: ${to_rep}
	regex strings: \"${re_ser}\", \"${re_rep}\"
	final string: ${repd_str}`
			);
		}

		function Discord_WEBPtoPNG_yesSIZE() {
			var { to_rep, re_ser, re_rep, newurl } = Discord_gen_IMG_Util(4, /^(.*?)(\.webp)(\?size=).*?$/i, `$1.png$34096&quality=lossless`);

			window.location.href = newurl;

			console.log(`href:`, url_parts);
			console.log(`
	regex:
	to replace: ${to_rep}
	regex strings: \"${re_ser}\", \"${re_rep}\"
	final string: ${repd_str}`
			);
		}

		function Discord_LosslessImage_noSIZE() {
			var { newurl } = Discord_gen_IMG_Util(4, /^(.*)(\..(.+)?)\??.*?$/i, `$1$2?size=4096&quality=lossless`);

			window.location.href = newurl;
		}

		function Discord_LosslessImage_yesSIZE() {
			var { newurl } = Discord_gen_IMG_Util(4, /^(.*)\.(.*?)(\?size=).*?$/i, `$1.$2?size=4096&quality=lossless`);

			window.location.href = newurl;
		}

		function Discord_WEBPtoPNG() {
			if (currPG_URL.toLowerCase().toString().includes(`.webp`) && currPG_URL.toLowerCase().toString().includes(`size`) === false && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_WEBPtoPNG_noSIZE();
			}
			if (currPG_URL.toLowerCase().toString().includes(`.webp`) && currPG_URL.toLowerCase().toString().includes(`size`) === true && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_WEBPtoPNG_yesSIZE();
			}
		}

		function Discord_LosslessImage() {
			if (currPG_URL.toLowerCase().toString().includes(`size`) === false && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_LosslessImage_noSIZE();
			}
			if (currPG_URL.toLowerCase().toString().includes(`size`) && currPG_URL.includes(`quality`) === false) {
				Discord_LosslessImage_yesSIZE();
			}
		}

		GM_registerMenuCommand(`Discord – WEBP → PNG`, Discord_WEBPtoPNG);
		GM_registerMenuCommand(`Discord – Lossless Image`, Discord_LosslessImage);

		if (discord_autofix === true && currPG_URL.toLowerCase().toString().includes(`webp`)) {
			Discord_WEBPtoPNG();
		}
		if (discord_autofix === true && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
			Discord_LosslessImage();
		}
	}
	else {
		function Discord_WEBPtoPNG_noSIZE() {
			var { to_rep, re_ser, re_rep, newurl } = Discord_gen_IMG_Util(4, /^(.*?)(\.(webp)).*?$/i, `$1.png?size=4096&quality=lossless`);

			window.location.href = newurl;

			console.log(`href:`, url_parts);
			console.log(`
	regex:
	to replace: ${to_rep}
	regex strings: \"${re_ser}\", \"${re_rep}\"
	final string: ${repd_str}`
			);
		}

		function Discord_WEBPtoPNG_yesSIZE() {
			var { to_rep, re_ser, re_rep, newurl } = Discord_gen_IMG_Util(4, /^(.*?)(\.webp)(\?size=).*?$/i, `$1.png$34096&quality=lossless`);

			window.location.href = newurl;

			console.log(`href:`, url_parts);
			console.log(`
	regex:
	to replace: ${to_rep}
	regex strings: \"${re_ser}\", \"${re_rep}\"
	final string: ${repd_str}`
			);
		}

		function Discord_LosslessImage_noSIZE() {
			var { newurl } = Discord_gen_IMG_Util(4, /^(.*)(\..(.+)?)\??.*?$/i, `$1$2?size=4096&quality=lossless`);

			window.location.href = newurl;
		}

		function Discord_LosslessImage_yesSIZE() {
			var { newurl } = Discord_gen_IMG_Util(4, /^(.*)\.(.*?)(\?size=).*?$/i, `$1.$2?size=4096&quality=lossless`);

			window.location.href = newurl;
		}

		function Discord_WEBPtoPNG() {
			if (currPG_URL.toLowerCase().toString().includes(`.webp`) && currPG_URL.toLowerCase().toString().includes(`size`) === false && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_WEBPtoPNG_noSIZE();
			}
			if (currPG_URL.toLowerCase().toString().includes(`.webp`) && currPG_URL.toLowerCase().toString().includes(`size`) === true && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_WEBPtoPNG_yesSIZE();
			}
		}

		function Discord_LosslessImage() {
			if (currPG_URL.toLowerCase().toString().includes(`size`) === false && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
				Discord_LosslessImage_noSIZE();
			}
			if (currPG_URL.toLowerCase().toString().includes(`size`) && currPG_URL.includes(`quality`) === false) {
				Discord_LosslessImage_yesSIZE();
			}
		}

		GM_registerMenuCommand(`Discord – WEBP → PNG`, Discord_WEBPtoPNG);
		GM_registerMenuCommand(`Discord – Lossless Image`, Discord_LosslessImage);

		if (discord_autofix === true && currPG_URL.toLowerCase().toString().includes(`webp`)) {
			Discord_WEBPtoPNG();
		}
		if (discord_autofix === true && currPG_URL.toLowerCase().toString().includes(`quality`) === false) {
			Discord_LosslessImage();
		}
	}
}

if (currPG_URL.toLowerCase().toString().includes(`twimg`)) {
	function Twitter_Image2PNG() {
		var init_url = window.location.href;
		var url_parts = init_url.split(`/`)
			.filter(part => part !== ``);

		var to_rep = url_parts[3];
		var re_ser = /^(.*?)(\?.*|\..*)?$/i;
		var re_rep = `$1?format=png&name=4096x4096`;
		var repd_str = to_rep.replace(re_ser, re_rep);

		var newurl = `${url_parts[0]}//${url_parts[1]}/${url_parts[2]}/${repd_str}`;
		window.location.href = newurl;

		// 	console.log(`href:`, url_parts);
		// 	console.log(`
		// regex:
		// to replace: ${to_rep}
		// regex strings: \"${re_ser}\", \"${re_rep}\"
		// final string: ${repd_str}`
		// 	);
	}

	GM_registerMenuCommand(`Twitter – Image → PNG`, Twitter_Image2PNG);

	if (twitter_autofix === true && currPG_URL.toLowerCase().toString().includes(`4096x4096`) === false) {
		Twitter_Image2PNG();
	}
}

if (currPG_URL.toLowerCase().toString().includes(`preview.redd.it`)) {
	function i_redd_it_FixPreview() {
		var init_url = window.location.href;
		var url_parts = init_url.split(`/`)
			.filter(part => part !== ``);

		var to_rep = url_parts[2];
		var re_ser = /^(.*?\..*?)\?.*$/i;
		var re_rep = `$1`;
		var repd_str = to_rep.replace(re_ser, re_rep);

		var newurl = `${url_parts[0]}//i.redd.it/${repd_str}`;
		window.location.href = newurl;
	}

	GM_registerMenuCommand(`Reddit – preview.redd.it → i.redd.it`, i_redd_it_FixPreview);

	if (ireddit_autofix === true) {
		i_redd_it_FixPreview();
	}
}