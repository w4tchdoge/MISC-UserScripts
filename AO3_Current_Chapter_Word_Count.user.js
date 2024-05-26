// ==UserScript==
// @name           AO3: Get Current Chapter Word Count
// @namespace      https://github.com/w4tchdoge
// @version        1.1.3-20240526_162943
// @description    Counts and displays the number of words in the current chapter
// @author         w4tchdoge
// @homepage       https://github.com/w4tchdoge/MISC-UserScripts
// @updateURL      https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Current_Chapter_Word_Count.user.js
// @downloadURL    https://github.com/w4tchdoge/MISC-UserScripts/raw/main/AO3_Current_Chapter_Word_Count.user.js
// @match          *://archiveofourown.org/*works/*
// @exclude        *://archiveofourown.org/*works/*/bookmarks
// @icon           https://archiveofourown.org/favicon.ico
// @license        AGPL-3.0-or-later
// @history        1.1.3 — Get rid of the element containing the words "Chapter Text" using removeChild() so I don't have to use RegEx to get rid of it. Also some miscellaneous cleanup
// @history        1.1.2 — Switch to using Intl.NumberFormat for making the word count thousands separated
// @history        1.1.1 — Modify the match rule so that it matches collections/*/works URLs as well; Add an exlude role so it doesn't work on works/*/bookmarks pages as it isn't designed to
// @history        1.1.0 — Implement a counting method that uses an attempted conversion of the Ruby regex code used by AO3 to JavaScript
// ==/UserScript==

(function () {
  `use strict`;

  // Save current page URL to a variable
  const curr_page_url = new URL(window.location);

  // Execute script only on multi-chapter works AND only when a single chapter is being viewed
  if (curr_page_url.pathname.includes(`works`) && curr_page_url.pathname.includes(`chapters`)) {

    // Attempted conversion of the Ruby regex code AO3 uses to JavaScript by looking at:
    // https://github.com/otwcode/otwarchive/blob/943f585818005be8df269d84ca454af478150e75/config/config.yml#L453
    // https://github.com/otwcode/otwarchive/blob/943f585818005be8df269d84ca454af478150e75/lib/word_counter.rb#L26
    // https://github.com/otwcode/otwarchive/blob/943f585818005be8df269d84ca454af478150e75/lib/word_counter.rb#L30C9-L31C95
    // Has not been tested on non-English works, feedback would be appreciated
    const word_count_regex = /\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Thai}|((?!\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Thai})\w)+/gu;

    // Get the Chapter Text
    const chapter_text = (function () {
      // Get the HTML element containing the chapter's text content
      let elm_parent = document.querySelector(`[role="article"]:has(> #work)`).cloneNode(true);
      // Remove the child element with the text "Chapter Text"
      elm_parent.removeChild(elm_parent.querySelector(`#work`));

      // Return only the textContent of the HTML element
      return elm_parent.textContent;
    })();

    // Couting and formatting the number of words
    const word_count = (function () {
      // Count the number of words
      // Counting method from:
      // https://stackoverflow.com/a/76673564/11750206
      // Regex substitutions from:
      // https://github.com/otwcode/otwarchive/blob/943f585818005be8df269d84ca454af478150e75/lib/word_counter.rb#L30C33-L30C68
      const word_count_int = [...chapter_text.replaceAll(/--/g, `—`).replaceAll(/['’‘-]/g, ``).matchAll(word_count_regex)].length;

      // Format the integer number to a thousands separated string
      // Reference for Intl.NumberFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
      const word_count_str = new Intl.NumberFormat({ style: `decimal` }).format(word_count_int);
      return word_count_str;
    })();

    // Code for Debugging
    // console.log(`Chapter Text:\n${text}\n\n`);
    console.log(`Word Count: ${word_count} words`);

    // Create element with the text "Words in Chapter"
    const chap_word_count_text = Object.assign(document.createElement(`dt`), {
      id: `chapter_words_text`,
      className: `chapter_words`,
      textContent: `Words in Chapter:`
    });

    // Create element with the word count of the chapter
    const chap_word_count_num = Object.assign(document.createElement(`dd`), {
      id: `chapter_words_num`,
      className: `chapter_words`,
      textContent: word_count
    });

    // Get the element where the stats are displayed
    const stats_elem = document.querySelector(`#main dl.work.meta.group dl.stats`);

    // Append the created elements after the element containing the total word count of the fic
    stats_elem.querySelector(`dd.words`).after(chap_word_count_text, chap_word_count_num);
  }
})();
