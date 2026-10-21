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
const ASTRO_PATH = path.join(__dirname, '..', '..', 'js', 'astro.js');
const HT_COMMON_PATH = path.join(__dirname, 'ht_common.js');

const CALENDAR_SRC = fs.readFileSync(CALENDAR_PATH, 'utf8');
const ASTRO_SRC = fs.readFileSync(ASTRO_PATH, 'utf8');
const HT_COMMON_SRC = fs.readFileSync(HT_COMMON_PATH, 'utf8');

// Same values as lang/*/common_keywords.json keywords[144] and keywords[146].
const CODE_RABBIT_LINK = '<a href="https://www.coderabbit.ai/" target="_blank">CodeRabbit</a>';
const QODO_LINK = '<a href="https://www.qodo.ai/" target="_blank">Qodo</a>';

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
      show() { return obj; },
      remove() { return obj; },
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
  // the app and provides both the modulo helpers and sunpos() used by the
  // Chinese calendar converter.
  vm.runInContext(
    'function mod(a, b) { return a - (b * Math.floor(a / b)); }' +
    ' function amod(a, b) { return mod(a - 1, b) + 1; }',
    sandbox
  );

  vm.runInContext(ASTRO_SRC, sandbox);
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
    keywords[146] = ${JSON.stringify(QODO_LINK)};
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

test('htConvertGregorianYear handles years beyond the JS Date range', () => {
  const { run } = createSandbox();
  // -2500000 (e.g. the "Humans" entry in families.json) cannot be stored in
  // a Date object; the Julian day must stay a real number so every calendar
  // renders a year instead of "NaN".
  const now = new Date();
  const jd = run(`gregorian_to_jd(-2500000, ${now.getMonth()}, ${now.getDate()})`);
  assert.equal(Number.isFinite(jd), true, 'jd should be finite, got: ' + jd);
  const islamic = run(`htConvertGregorianYear('islamic', -2500000)`);
  assert.match(String(islamic), /^25773\d\d BC$/, 'islamic: ' + islamic);
  const hebrew = run(`htConvertGregorianYear('hebrew', -2500000)`);
  assert.doesNotMatch(String(hebrew), /NaN/);
  assert.match(String(hebrew), /^\d+ BC$/, 'hebrew: ' + hebrew);
  const gregory = run(`htConvertGregorianYear('gregory', -2500000)`);
  assert.equal(gregory, '2500000 BC');
  const julian = run(`htConvertGregorianYear('julian', -2500000)`);
  assert.doesNotMatch(String(julian), /NaN/);
  // Far-future years must work too.
  const future = run(`htConvertGregorianYear('islamic', 2500000)`);
  assert.doesNotMatch(String(future), /NaN/);
});

test('htConvertDate formats gregorian dates', () => {
  const { run } = createSandbox();
  const ct = new Date(2024, 0, 15, 0, 0, 0);
  ct.setFullYear(2024, 0, 15);
  const expected = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', calendar: 'gregory' }).format(ct);
  assert.equal(run(`htConvertDate('gregory', 'en-US', undefined, undefined, [2024, 1, 15])`), expected);
});

test('htConvertDate always uses the full month name by default', () => {
  const { run } = createSandbox();
  const ct = new Date(2024, 0, 15, 0, 0, 0);
  ct.setFullYear(2024, 0, 15);
  const expected = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', calendar: 'gregory' }).format(ct);
  assert.match(expected, /January/);
  assert.equal(run(`htConvertDate('gregory', 'en-US', undefined, undefined, [2024, 1, 15], 'long')`), expected);
  // Omitting the style now gives the same full month name.
  assert.equal(
    run(`htConvertDate('gregory', 'en-US', undefined, undefined, [2024, 1, 15])`),
    expected
  );
});

test('htConvertDate handles year zero and negative years', () => {
  const { run } = createSandbox();
  assert.equal(run(`htConvertDate('gregory', 'en-US', undefined, undefined, [0, 1, 1])`), 'January 1, 0');
  assert.equal(run(`htConvertDate('gregory', 'en-US', undefined, undefined, [-44, 3, 15])`), 'March 15, 45 BC');
});

test('htConvertDate renders islamic dates far outside the JS Date range', () => {
  const { run } = createSandbox();
  // -2500000 years is beyond the ~271,821 years a Date can hold; the pure
  // Intl path would give "Invalid time value"/"NaN".
  const result = run(`htConvertDate('islamic', 'en-US', undefined, undefined, [-2500000, 1, 15])`);
  assert.equal(String(result).includes('NaN'), false, 'no NaN in result: ' + result);
  assert.equal(String(result).includes('Invalid'), false, 'no Invalid in result: ' + result);
  // Year -2500000 converts to islamic year -2577368, month 2 (Safar).
  assert.match(String(result), /^\S+\.? 16, -2577368 AH$/);
  // The full-month style still gets the long month name.
  const longResult = run(`htConvertDate('islamic', 'en-US', undefined, undefined, [-2500000, 1, 15], 'long')`);
  assert.match(String(longResult), /Safar 16, -2577368 AH/);
});

test('htConvertDate renders chinese dates far outside the JS Date range', () => {
  const { run } = createSandbox();
  // The astronomical new-moon series is only fitted around the present.  For
  // -2500000 it used to return year 0 (and undefined stem/branch names);
  // the mean-motion fallback must keep a coherent Chinese date instead.
  const yearOnly = run(`htConvertGregorianYear('chinese', -2500000)`);
  assert.match(String(yearOnly), /^249730[23] BC$/, 'chinese year: ' + yearOnly);
  const result = run(`htConvertDate('chinese', 'en-US', undefined, undefined, [-2500000, 1, 15])`);
  assert.match(String(result), /^Ji-Mao \(Rabbit\) \(12th\), 1[3456], 2497303 BC$/);
  assert.equal(String(result).includes('undefined'), false, 'no undefined in result: ' + result);
  // Just outside the Date range the year must also stay numeric.
  assert.match(String(run(`htConvertGregorianYear('chinese', -272000)`)), /^26930[12] BC$/);
  // Normal dates keep using the astronomical converter.
  assert.match(String(run(`htConvertGregorianYear('chinese', 2000)`)), /^469[78]$/);
  assert.match(String(run(`htConvertDate('chinese', 'en-US', undefined, undefined, [2000, 6, 15])`)),
               /^Geng-Chen \(Dragon\) \(5th\), 1[234], 4698$/);
});

test('every calendar converts extreme years without NaN or year zero', () => {
  const { run } = createSandbox();
  const calendars = ['gregory', 'hebrew', 'hispanic', 'islamic', 'julian',
                    'mesoamerican', 'emesoamerican', 'persian', 'french',
                    'shaka', 'chinese', 'aymara', 'mapuche', 'inca',
                    'javanese', 'japanese'];
  for (const calendar of calendars) {
    for (const year of [-2500000, 2500000]) {
      const result = String(run(`htConvertGregorianYear(${JSON.stringify(calendar)}, ${year})`));
      assert.doesNotMatch(result, /NaN|undefined|Infinity/, `${calendar} ${year}: ${result}`);
      assert.notEqual(result, '0', `${calendar} ${year} returned zero`);
    }
  }
});

test('htConvertDate converts French Revolutionary and Hispanic dates', () => {
  const { run } = createSandbox();
  // Remote French years must not hang and must still get a coherent date.
  assert.match(String(run(`htConvertGregorianDate('french', 'en-US', -2500000, 1, 15)`)),
               /^Année 2501792 BC Mois Niv&ocirc;se Décade III Jour du Sextidi \(6\)$/);
  // Normal French dates keep the astronomical converter.
  assert.equal(run(`htConvertGregorianDate('french', 'en-US', 2000, 1, 15)`),
               'Année 208 Mois Niv&ocirc;se Décade III Jour du Quintidi (5)');
  // The Hispanic era is 38 years ahead of the Gregorian calendar, for every
  // input type (calendar date, unix epoch and Julian day).
  assert.equal(run(`htConvertGregorianDate('hispanic', 'en-US', 2000, 1, 15)`), 'January 15, 2038');
  assert.equal(run(`htConvertGregorianDate('hispanic', 'en-US', 1131, 1, 1)`), 'January 1, 1169');
  assert.equal(run(`htConvertJulianDate('hispanic', 'en-US', 2451544.5)`), 'January 1, 2038');
  assert.match(String(run(`htConvertUnixDate('hispanic', 'en-US', 947894400)`)), /2038/);
  assert.match(String(run(`htConvertGregorianDate('hispanic', 'en-US', -2500000, 1, 15)`)),
               /^January 15, 2499963 BC$/);
});

test('htConvertDate renders ancient hebrew, persian and gregorian dates', () => {
  const { run } = createSandbox();
  const hebrewResult = run(`htConvertDate('hebrew', 'en-US', undefined, undefined, [-2500000, 1, 15])`);
  assert.match(String(hebrewResult), /-2496211/);
  const persianResult = run(`htConvertDate('persian', 'en-US', undefined, undefined, [-2500000, 1, 15])`);
  assert.match(String(persianResult), /-2500625/);
  // Just past the Date range the gregorian fallback keeps the same format as
  // the in-range engine path ("January 15, 272001 BC").
  const gregorianResult = run(`htConvertDate('gregory', 'en-US', undefined, undefined, [-272000, 1, 15])`);
  assert.equal(String(gregorianResult), 'January 15, 272001 BC');
  const zeroResult = run(`htConvertDate('gregory', 'en-US', undefined, undefined, [-272000, 1, 1])`);
  assert.equal(String(zeroResult).includes('NaN'), false, 'no NaN in result: ' + zeroResult);
});

test('htFormatOutOfRangeCalendar keeps hebrew leap-month names', () => {
  const { run } = createSandbox();
  // Month 12 is "Adar" in non-leap years and "Adar I" in leap years, so the
  // reference year must match the target year's leap structure.
  const leapYear = run(`(function(){for(var y=-2499999;y>=-2500050;y--){if(hebrew_leap(y)) return y} return 0})()`);
  assert.notEqual(leapYear, 0);
  const leapJd = run(`hebrew_to_jd(${leapYear}, 12, 1)`);
  assert.match(String(run(`htFormatOutOfRangeCalendar('hebrew', 'en-US', ${leapJd}, 'medium')`)), /Adar I/);
  assert.equal(run(`hebrew_leap(5778)`), false);
  const nonLeapJd = run(`hebrew_to_jd(5778, 12, 1)`);
  assert.match(String(run(`new Intl.DateTimeFormat('en-US',{dateStyle:'medium',calendar:'hebrew'}).format((function(){var g=jd_to_gregorian(${nonLeapJd});var d=new Date(g[0],g[1]-1,g[2],0,0,0);d.setFullYear(g[0],g[1]-1,g[2]);return d})())`)), / Adar /);
});

test('htConvertDate converts unix epoch to gregorian', () => {
  const { run } = createSandbox();
  const ct = new Date(0);
  ct.setUTCSeconds(0);
  const expected = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', calendar: 'gregory' }).format(ct);
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
  assert.equal(reviewersOf(['']), 'Reviewers of History Tracers');
  assert.equal(reviewersOf(['   ']), 'Reviewers of History Tracers');
  assert.equal(reviewersOf('   '), 'Reviewers of History Tracers');
  assert.equal(reviewersOf(['Alice', '']), 'Alice');
  assert.equal(reviewersOf(['', 'CodeRabbit', '']), CODE_RABBIT_LINK);
});

test('htFillWebPage joins array reviewers and substitutes Qodo', () => {
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

  assert.equal(reviewersOf(['Qodo']), QODO_LINK);
  assert.equal(reviewersOf(['Alice', 'Qodo']), 'Alice, ' + QODO_LINK);
  assert.equal(reviewersOf('Qodo'), QODO_LINK);
  assert.equal(reviewersOf('Qodo and Team'), QODO_LINK + ' and Team');
  assert.equal(reviewersOf(['Alice', 'CodeRabbit', 'Qodo']), 'Alice, ' + CODE_RABBIT_LINK + ', ' + QODO_LINK);
});
