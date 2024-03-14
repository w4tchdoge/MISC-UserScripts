// ==UserScript==
// @name           AO3: Get Current Chapter Word Count
// @namespace      https://github.com/w4tchdoge
// @version        1.1.1-20240314_210740
// @description    Counts and displays the number of words in the current chapter
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Current_Chapter_Word_Count.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Current_Chapter_Word_Count.user.js
// @match          *://archiveofourown.org/*works/*
// @exclude        *://archiveofourown.org/*works/*/bookmarks
// @icon           https://archiveofourown.org/favicon.ico
// @license        AGPL-3.0-or-later
// @history        1.1.1 — Modify the match rule so that it matches collections/*/works URLs as well; Add an exlude role so it doesn't work on works/*/bookmarks pages as it isn't designed to
// @history        1.1.0 — Implement a counting method that uses an attempted conversion of the Ruby regex code used by AO3 to JavaScript
// ==/UserScript==

(function () {
  'use strict';

  // Save current page URL to a var
  const currPG_URL = window.location.href;

  // Execute script only on multi-chapter works AND only when a single chapter is being viewed
  if (currPG_URL.includes('works') && currPG_URL.includes('chapters')) {

    // Attempted conversion of the Ruby regex code AO3 uses to JavaScript by looking at:
    // https://github.com/otwcode/otwarchive/blob/943f585818005be8df269d84ca454af478150e75/config/config.yml#L453
    // https://github.com/otwcode/otwarchive/blob/943f585818005be8df269d84ca454af478150e75/lib/word_counter.rb#L26
    // https://github.com/otwcode/otwarchive/blob/943f585818005be8df269d84ca454af478150e75/lib/word_counter.rb#L30C9-L31C95
    // Has not been tested on non-English works, feedback would be appreciated
    const word_count_regex = /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Thai}|((?!\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Thai})\w)+/gu;

    // function taken from https://stackoverflow.com/a/2901298/11750206
    function numberWithCommas(x) {

      var parts = x.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }


    // Get the HTML element containing the chapter's text content
    var text_node = document.querySelector('[role="article"]');

    // Extract the text content from the HTML element
    var text = text_node.innerText.replace(/chapter text\n\n/gmi, '');

    // Count the number of words
    // Counting method from:
    // https://stackoverflow.com/a/76673564/11750206
    // Regex substitutions from:
    // https://github.com/otwcode/otwarchive/blob/943f585818005be8df269d84ca454af478150e75/lib/word_counter.rb#L30C33-L30C68
    var word_count = [...text.replaceAll(/--/g, '—').replaceAll(/['’‘-]/g, '').matchAll(word_count_regex)].length;

    // Format the integer number to a thousands separated string
    word_count = numberWithCommas(word_count);

    // Code for Debugging
    // console.log(`Chapter Text:\n${text}\n\n`);
    console.log(`Word Count: ${word_count} words`);

    // Create element with the text "Words in Chapter"
    var chap_word_count_text = Object.assign(document.createElement('dt'), {
      id: 'chapter_words_text',
      className: 'chapter_words',
      innerText: 'Words in Chapter:'
    });

    // Create element with the word count of the chapter
    var chap_word_count_num = Object.assign(document.createElement('dd'), {
      id: 'chapter_words_num',
      className: 'chapter_words',
      innerText: word_count
    });

    // Get the element where the stats are displayed
    const stats_elem = document.querySelector('#main dl.work.meta.group dl.stats');

    // Append the created elements after the element containing the total word count of the fic
    stats_elem.querySelector('dd.words').after(chap_word_count_text, chap_word_count_num);
  }

})();
