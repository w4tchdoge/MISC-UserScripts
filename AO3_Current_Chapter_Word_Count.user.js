// ==UserScript==
// @name           AO3: Get Current Chapter Word Count
// @namespace      https://github.com/w4tchdoge
// @version        1.0.0-20230621_160023
// @description    Counts the number of words in the current chapter
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Current_Chapter_Word_Count.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Current_Chapter_Word_Count.user.js
// @match          *://archiveofourown.org/*
// @license        AGPL-3.0-or-later
// ==/UserScript==

(function () {
  'use strict';

  // Save current page URL to a var
  const currPG_URL = window.location.href;

  // Execute script only on multi-chapter works AND only when a single chapter is being viewed
  if (currPG_URL.includes('works') && currPG_URL.includes('chapters')) {

    function Word_Counter(content, simpleWordCount = false) {
      // function adapted from https://github.com/Kirozen/vsce-wordcounter/blob/master/src/wordCounter.ts

      const WORD_RE = /[\S]+/g;

      if (!content) {
        return 0;
      }

      const matches = content.match(WORD_RE);
      if (Boolean(matches)) {
        return matches.length;
      }
      return 0;
    }

    function numberWithCommas(x) {
      // function taken from https://stackoverflow.com/a/2901298/11750206

      var parts = x.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }


    // Get the HTML element containing the chapter's text content
    var text_node = document.querySelector('[role="article"]');

    // Extract the text content from the HTML element
    var text = text_node.innerText.replace(/chapter text\n\n/gmi, '');

    // Count the number of words
    var word_count = numberWithCommas(Word_Counter(text));

    // console.log(text);
    // console.log(word_count);

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
