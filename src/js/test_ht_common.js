// SPDX-License-Identifier: GPL-3.0-or-later
//
// Unit tests for src/js/ht_common.js
//
// Run with:
//   node --test src/js/test_ht_common.js
//
// ht_common.js is a browser-only script. It is evaluated inside a Node.js
// `vm` sandbox with minimal stubs for $, document, and window. Calendar
// helpers come from js/calendar.js plus the mod/amod helpers that the app
// loads from js/astro.js. The test file intentionally does not start with
// "ht_" so the publisher's minifier (which processes files matching "^ht_")
// leaves it out of the generated js/ output.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const CALENDAR_PATH = path.join(__dirname, '..', '..', 'js', 'calendar.js');
const HT_COMMON_PATH = path.join(__dirname, 'ht_common.js');

const CALENDAR_SRC = fs.readFileSync(CALENDAR_PATH, 'utf8');
const HT_COMMON_SRC = fs.readFileSync(HT_COMMON_PATH, 'utf8');

// Same value as lang/*/common_keywords.json keywords[144].
const CODE_RABBIT_LINK = '<a href="https://www.coderabbit.ai/" target="_blank">CodeRabbit</a>';

function createSandbox() {
  const calls = [];
  const $ = function (selector) {
    calls.push(['$', selector]);
    const obj = {
      length: 0,
      prop() { calls.push(['prop', ...arguments]); return obj; },
      html() { calls.push(['html', ...arguments]); return obj; },
      append() { calls.push(['append', ...arguments]); return obj; },
      text() { calls.push(['text', ...arguments]); return obj; },
      css() { calls.push(['css', ...arguments]); return obj; },
      val() { calls.push(['val', ...arguments]); return obj; },
      on() { calls.push(['on', ...arguments]); return obj; },
      off() { calls.push(['off', ...arguments]); return obj; },
      each() { calls.push(['each', ...arguments]); return obj; },
      hide() { return obj; },
      show() { return obj; }
    };
    return obj;
  };
  $.calls = calls;

  const sandbox = {
    $,
    console,
    Date,
    Intl,
    Math,
    JSON,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    URLSearchParams,
    navigator: { language: 'en-US', userLanguage: 'en-US' },
    window: {
      addEventListener() {},
      innerWidth: 1024,
      location: { href: 'http://localhost/', search: '' },
      history: { replaceState() {}, pushState() {} },
      open() { return null; }
    },
    document: {
      addEventListener() {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
      getElementById() { return null; },
      getElementsByClassName() { return []; },
      execCommand() { return false; },
      createElement() { return {}; }
    }
  };

  vm.createContext(sandbox);

  // mod/amod are defined in js/astro.js, which loads before js/calendar.js in
  // the app and provides the modulo helpers the calendar converter relies on.
  vm.runInContext(
    'function mod(a, b) { return a - (b * Math.floor(a / b)); }' +
    ' function amod(a, b) { return mod(a - 1, b) + 1; }',
    sandbox
  );

  vm.runInContext(CALENDAR_SRC, sandbox);
  vm.runInContext(HT_COMMON_SRC, sandbox);

  // ht_common.js declares `let keywords = []`; assign through the context so
  // the lexical binding actually used by the functions is populated.
  vm.runInContext(`
    keywords = [];
    for (let i = 0; i < 200; i++) keywords[i] = 'kw' + i;
    keywords[35] = 'Editors of History Tracers';
    keywords[37] = 'Reviewers of History Tracers';
    keywords[41] = 'JD';
    keywords[43] = 'BC';
    keywords[144] = ${JSON.stringify(CODE_RABBIT_LINK)};
  `, sandbox);

  const run = (expr) => vm.runInContext(expr, sandbox);
  return { sandbox, run, calls };
}

test('htAdjustGregorianZeroYear replaces the last year token with zero', () => {
  const { run } = createSandbox();
  assert.equal(run(`htAdjustGregorianZeroYear('January 1, 2024')`), 'January 1, 0');
  assert.equal(run(`htAdjustGregorianZeroYear('  Jan 5  2024  ')`), 'Jan 5 0');
  assert.equal(run(`htAdjustGregorianZeroYear('2024')`), '0');
  assert.equal(run(`htAdjustGregorianZeroYear('')`), '');
  assert.equal(run(`htAdjustGregorianZeroYear(null)`), '');
  assert.equal(run(`htAdjustGregorianZeroYear(123)`), 123);
});

test('htConvertGregorianYearToJD matches gregorian_to_jd for the current month/day', () => {
  const { run } = createSandbox();
  const now = new Date();
  const expected = run(`gregorian_to_jd(2024, ${now.getMonth()}, ${now.getDate()})`);
  assert.equal(run(`htConvertGregorianYearToJD(2024)`), expected);
});

test('htConvertGregorianYear converts gregorian years', () => {
  const { run } = createSandbox();
  assert.equal(run(`htConvertGregorianYear('gregory', 2024)`), '2024');
  assert.equal(run(`htConvertGregorianYear('gregory', -1000)`), '1000 BC');
  assert.equal(run(`htConvertGregorianYear('gregory', 'now')`), String(new Date().getFullYear()));
  assert.equal(run(`htConvertGregorianYear('hispanic', 2024)`), '2062');
  const now = new Date();
  const jd = run(`gregorian_to_jd(2024, ${now.getMonth()}, ${now.getDate()})`);
  assert.equal(run(`htConvertGregorianYear('julian', 2024)`), jd + ' JD');
  const meso = run(`htConvertGregorianYear('mesoamerican', 2024)`);
  assert.match(meso, /Haab:/);
  assert.match(meso, /Tzolkin:/);
});

test('htConvertDate formats gregorian dates', () => {
  const { run } = createSandbox();
  const ct = new Date(2024, 0, 15, 0, 0, 0);
  ct.setFullYear(2024, 0, 15);
  const expected = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', calendar: 'gregory' }).format(ct);
  assert.equal(run(`htConvertDate('gregory', 'en-US', undefined, undefined, [2024, 1, 15])`), expected);
});

test('htConvertDate handles year zero and negative years', () => {
  const { run } = createSandbox();
  assert.equal(run(`htConvertDate('gregory', 'en-US', undefined, undefined, [0, 1, 1])`), 'Jan 1, 0');
  assert.equal(run(`htConvertDate('gregory', 'en-US', undefined, undefined, [-44, 3, 15])`), 'Mar 15, 45 BC');
});

test('htConvertDate converts unix epoch to gregorian', () => {
  const { run } = createSandbox();
  const ct = new Date(0);
  ct.setUTCSeconds(0);
  const expected = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', calendar: 'gregory' }).format(ct);
  assert.equal(run(`htConvertDate('gregory', 'en-US', 0)`), expected);
});

test('htConvertDate converts julian epochs', () => {
  const { run } = createSandbox();
  assert.equal(run(`htConvertDate('julian', 'en-US', undefined, 2451545)`), '2451544.5 JD');
});

test('htConvertDate returns a mesoamerican long count with Haab and Tzolkin', () => {
  const { run } = createSandbox();
  const result = run(`htConvertDate('mesoamerican', 'en-US', undefined, undefined, [2024, 1, 15])`);
  assert.match(result, /^\d+\.\d+\.\d+\.\d+\.\d+\.\d+\.\d+\.\d+ \( Haab: \d+ \w+, Tzolkin: \d+ \w+ \)$/);
});

test('htConvertDate converts inca and shaka dates', () => {
  const { run } = createSandbox();
  assert.equal(run(`htConvertDate('inca', 'en-US', undefined, undefined, [2024, 1, 15])`), '26 Capac Raymi, 586');
  assert.equal(run(`htConvertDate('shaka', 'en-US', undefined, undefined, [2024, 1, 15])`), '25.Pausa.1945');
});

test('htConvertDate returns empty string when required parameters are missing', () => {
  const { run } = createSandbox();
  assert.equal(run(`htConvertDate(undefined, 'en-US')`), '');
  assert.equal(run(`htConvertDate('gregory', undefined)`), '');
});

test('date wrapper functions delegate to htConvertDate', () => {
  const { run } = createSandbox();
  assert.equal(
    run(`htConvertGregorianDate('gregory', 'en-US', 2024, 1, 15)`),
    run(`htConvertDate('gregory', 'en-US', undefined, undefined, [2024, 1, 15])`)
  );
  assert.equal(
    run(`htConvertUnixDate('gregory', 'en-US', 0)`),
    run(`htConvertDate('gregory', 'en-US', 0)`)
  );
  assert.equal(
    run(`htConvertJulianDate('julian', 'en-US', 2451545)`),
    run(`htConvertDate('julian', 'en-US', undefined, 2451545)`)
  );
});

test('htResetAnswers ignores non-array vectors', () => {
  const { run, calls } = createSandbox();
  calls.length = 0;
  run(`htResetAnswers('x')`);
  run(`htResetAnswers(null)`);
  run(`htResetAnswers(42)`);
  assert.equal(calls.length, 0);
});

test('htResetAnswers clears answers, checkboxes and explanations', () => {
  const { run, calls } = createSandbox();
  calls.length = 0;
  run(`htResetAnswers([0, 0])`);

  const selectors = calls.filter(([type]) => type === '$').map(([, sel]) => sel);
  for (const expected of [
    '#answer0', '#answer1',
    'input[name="exercise0"]', 'input[name="exercise1"]',
    '#explanation0', '#explanation1'
  ]) {
    assert.ok(selectors.includes(expected), `expected $(${JSON.stringify(expected)}) to be used`);
  }

  assert.ok(calls.some(([type, value]) => type === 'text' && value === ''));
  assert.ok(calls.some(([type, key, value]) => type === 'prop' && key === 'checked' && value === false));
  assert.equal(calls.filter(([type]) => type === 'css').length, 2);
});

test('htFillWebPage joins array reviewers and substitutes CodeRabbit', () => {
  const { run } = createSandbox();
  run(`
    captured = [];
    htFillClassContentV2 = function (table, last_update, page_authors, page_reviewers, index) {
      captured.push(page_reviewers);
    };
  `);

  function reviewersOf(reviewers) {
    run(`captured.length = 0; htFillWebPage('p', { title: 'T', last_update: 1787192329, authors: null, reviewers: ${JSON.stringify(reviewers)}, type: 'class', version: 2, index: 0 });`);
    return run(`captured[0]`);
  }

  assert.equal(reviewersOf(['CodeRabbit']), CODE_RABBIT_LINK);
  assert.equal(reviewersOf(['Alice', 'Bob']), 'Alice, Bob');
  assert.equal(reviewersOf(['Alice', 'CodeRabbit']), 'Alice, ' + CODE_RABBIT_LINK);
  assert.equal(reviewersOf(['CodeRabbit', 'CodeRabbit']), CODE_RABBIT_LINK + ', ' + CODE_RABBIT_LINK);
  assert.equal(reviewersOf('CodeRabbit'), CODE_RABBIT_LINK);
  assert.equal(reviewersOf('CodeRabbit and Team'), CODE_RABBIT_LINK + ' and Team');
  assert.equal(reviewersOf('Alice, CodeRabbit'), 'Alice, ' + CODE_RABBIT_LINK);
  assert.equal(reviewersOf('CodeRabbit, CodeRabbit and Team'), CODE_RABBIT_LINK + ', ' + CODE_RABBIT_LINK + ' and Team');
  assert.equal(reviewersOf(null), 'Reviewers of History Tracers');
  assert.equal(reviewersOf([]), 'Reviewers of History Tracers');
});
