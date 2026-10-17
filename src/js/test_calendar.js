// SPDX-License-Identifier: GPL-3.0-or-later
//
// Unit tests for js/calendar.js
//
// Run with:
//   node --test src/js/test_calendar.js
//
// js/calendar.js is a browser-only script, so it is evaluated inside a Node.js
// `vm` sandbox.  js/astro.js loads first because calendar.js uses its
// astronomical helpers (sunpos, mod, amod, ...) for the French Revolutionary
// and Chinese calendars.  The test file intentionally does not start with
// "ht_" so the publisher's minifier (which processes files matching "^ht_")
// leaves it out of the generated js/ output.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ASTRO_PATH = path.join(__dirname, '..', '..', 'js', 'astro.js');
const CALENDAR_PATH = path.join(__dirname, '..', '..', 'js', 'calendar.js');

const ASTRO_SRC = fs.readFileSync(ASTRO_PATH, 'utf8');
const CALENDAR_SRC = fs.readFileSync(CALENDAR_PATH, 'utf8');

function createSandbox() {
  const sandbox = {
    console,
    Date,
    Intl,
    Math,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    Number
  };

  vm.createContext(sandbox);
  vm.runInContext(ASTRO_SRC, sandbox);
  vm.runInContext(CALENDAR_SRC, sandbox);

  const run = (expr) => vm.runInContext(expr, sandbox);
  const runJSON = (expr) => JSON.parse(run(`JSON.stringify(${expr})`));
  return { sandbox, run, runJSON };
}

test('Gregorian dates round-trip through Julian days', () => {
  const { run, runJSON } = createSandbox();
  const dates = [
    [2000, 1, 1],
    [2024, 2, 29],
    [2000, 12, 31],
    [0, 1, 1],
    [-44, 3, 15],
    [-2500000, 1, 15],
    [2500000, 12, 31]
  ];

  for (const [year, month, day] of dates) {
    const jd = run(`gregorian_to_jd(${year}, ${month}, ${day})`);
    assert.equal(Number.isFinite(jd), true, `${year}-${month}-${day}: JD is finite`);
    assert.deepEqual(runJSON(`jd_to_gregorian(${jd})`), [year, month, day]);
  }
});

test('Hebrew, Islamic and Persian dates convert from known Julian days', () => {
  const { run, runJSON } = createSandbox();
  const jd = run('gregorian_to_jd(2000, 1, 15)');

  const hebrew = runJSON(`jd_to_hebrew(${jd})`);
  assert.deepEqual(hebrew, [5760, 11, 8]);
  assert.equal(run(`hebrew_to_jd(${hebrew[0]}, ${hebrew[1]}, ${hebrew[2]})`), jd);

  const islamic = runJSON(`jd_to_islamic(${jd})`);
  assert.deepEqual(islamic, [1420, 10, 8]);
  assert.equal(run(`islamic_to_jd(${islamic[0]}, ${islamic[1]}, ${islamic[2]})`), jd);

  const persian = runJSON(`jd_to_persian(${jd})`);
  assert.deepEqual(persian, [1378, 10, 25]);
  assert.equal(run(`persian_to_jd(${persian[0]}, ${persian[1]}, ${persian[2]})`), jd);
});

test('Shaka dates convert from known Julian days', () => {
  const { run, runJSON } = createSandbox();
  const jd = run('gregorian_to_jd(2024, 1, 15)');
  const shaka = runJSON(`jd_to_indian_civil(${jd})`);

  assert.deepEqual(shaka, [1945, 10, 25]);
  assert.equal(run(`indian_civil_to_jd(${shaka[0]}, ${shaka[1]}, ${shaka[2]})`), jd);
});

test('French Revolutionary dates convert known and remote dates', () => {
  const { run, runJSON } = createSandbox();

  assert.deepEqual(runJSON(`jd_to_french_revolutionary(gregorian_to_jd(1792, 9, 22))`),
                   [1, 1, 1, 1]);
  assert.deepEqual(runJSON(`jd_to_french_revolutionary(gregorian_to_jd(2000, 1, 15))`),
                   [208, 4, 3, 5]);

  // For remote years the astronomical equinox series diverges; the arithmetic
  // fallback must still return a complete, finite date instead of looping.
  const remote = runJSON(`jd_to_french_revolutionary(gregorian_to_jd(-2500000, 1, 15))`);
  assert.deepEqual(remote, [-2501792, 4, 3, 6]);
  assert.equal(remote.every(Number.isFinite), true);
  assert.ok(remote[1] >= 1 && remote[1] <= 13, 'month is in range: ' + remote[1]);

  // The inverse uses the same Gregorian anchor for remote years.
  assert.equal(run('french_revolutionary_to_jd(-2501792, 4, 3, 6)'),
               run('gregorian_to_jd(-2500000, 1, 15)'));
});

test('Chinese dates convert modern and remote dates without year zero', () => {
  const { run, runJSON } = createSandbox();

  assert.deepEqual(runJSON(`jd_to_chinese(gregorian_to_jd(2000, 1, 15), 0)`),
                   [4697, 12, 10, 0]);
  assert.deepEqual(runJSON(`jd_to_chinese(gregorian_to_jd(2000, 6, 15), 0)`),
                   [4698, 5, 14, 0]);
  assert.equal(run('chinese_to_jd(4698, 5, 14, 0)'),
               run('gregorian_to_jd(2000, 6, 15)'));

  // The astronomical new-moon series cannot resolve very remote dates, so the
  // mean-motion fallback must return a coherent year/month/day (not 0/0/0).
  const remote = runJSON(`jd_to_chinese(gregorian_to_jd(-2500000, 1, 15), 0)`);
  assert.deepEqual(remote, [-2497303, 12, 15, 0]);
  assert.notEqual(remote[0], 0, 'Chinese year must not be zero');
  assert.ok(remote[1] >= 1 && remote[1] <= 12, 'month is in range: ' + remote[1]);
  assert.ok(remote[2] >= 1 && remote[2] <= 30, 'day is in range: ' + remote[2]);
});

test('Aymara, Mapuche, Inca, Javanese and Japanese dates round-trip', () => {
  const { run, runJSON } = createSandbox();
  const jd = run('gregorian_to_jd(2024, 1, 15)');
  const calendars = [
    ['jd_to_aymara', 'aymara_to_jd'],
    ['jd_to_mapuche', 'mapuche_to_jd'],
    ['jd_to_inca', 'inca_to_jd'],
    ['jd_to_javanese', 'javanese_to_jd'],
    ['jd_to_japanese', 'japanese_to_jd']
  ];

  for (const [forward, inverse] of calendars) {
    const date = runJSON(`${forward}(${jd})`);
    assert.equal(date.every(Number.isFinite), true, `${forward}: ${JSON.stringify(date)}`);
    assert.equal(run(`${inverse}.apply(null, ${JSON.stringify(date)})`), jd,
                 `${forward} round-trip`);
  }
});

test('Mayan long count converts from the Mayan epoch', () => {
  const { run, runJSON } = createSandbox();
  const epoch = run('mayan_count_to_jd(0, 0, 0, 0, 0)');

  assert.equal(epoch, 584282.5);
  assert.deepEqual(runJSON(`jd_to_mayan_count(${epoch})`), [0, 0, 0, 0, 0, 0, 0, 0]);

  const jd = run('gregorian_to_jd(2000, 1, 15)');
  const count = runJSON(`jd_to_mayan_count(${jd})`);
  assert.equal(run(`mayan_count_to_jd(${count[3]}, ${count[4]}, ${count[5]}, ${count[6]}, ${count[7]})`),
               jd);
});

test('Mayan Haab and Tzolkin cycles convert from known Julian days', () => {
  const { run, runJSON } = createSandbox();
  const epoch = run('mayan_count_to_jd(0, 0, 0, 0, 0)');
  const modern = run('gregorian_to_jd(2000, 1, 15)');

  // Long Count 0.0.0.0.0 is 8 Cumku, 4 Ahau in the surviving inscriptions.
  assert.deepEqual(runJSON(`jd_to_mayan_haab(${epoch})`), [18, 8]);
  assert.deepEqual(runJSON(`jd_to_mayan_tzolkin(${epoch})`), [20, 4]);
  assert.deepEqual(runJSON(`jd_to_mayan_haab(${modern})`), [15, 4]);
  assert.deepEqual(runJSON(`jd_to_mayan_tzolkin(${modern})`), [16, 12]);
});

test('Japanese nengo and leap helpers', () => {
  const { run, runJSON } = createSandbox();

  assert.deepEqual(runJSON('japaneseNengo(2024, 1)'), { year: 6, name: 'Reiwa' });
  assert.deepEqual(runJSON('japaneseNengo(2019, 5)'), { year: 1, name: 'Reiwa' });
  assert.equal(run('japaneseNengo(1867, 1)'), null);
  assert.equal(run('japaneseLeapYear(2024)'), true);
  assert.equal(run('japaneseLeapYear(2023)'), false);
});

test('Julian-day wrappers used by the application convert correctly', () => {
  const { run, runJSON } = createSandbox();
  const jd = run('gregorian_to_jd(2024, 1, 15)');

  assert.deepEqual(runJSON(`calcJulian(${jd})`), [2024, 1, 15]);
  assert.deepEqual(runJSON('calcUnixTime(0)'), [1970, 1, 1]);
  assert.deepEqual(runJSON(`setJulian(${jd})`), [2024, 1, 15]);
  assert.deepEqual(runJSON(`calcModifiedJulian(${jd} - 2400000.5)`), [2024, 1, 15]);
  assert.deepEqual(runJSON(`calcGregSerial(${jd} - 1721424.5)`), [2024, 1, 15]);
});

test('all calendar converters return finite values for extreme years', () => {
  const { run, runJSON } = createSandbox();
  const calendars = [
    ['jd_to_hebrew', 1],
    ['jd_to_islamic', 1],
    ['jd_to_persian', 1],
    ['jd_to_french_revolutionary', 1],
    ['jd_to_indian_civil', 1],
    ['jd_to_aymara', 1],
    ['jd_to_mapuche', 1],
    ['jd_to_inca', 1],
    ['jd_to_javanese', 1],
    ['jd_to_japanese', 1],
    ['jd_to_mayan_count', 1],
    ['jd_to_chinese', 2]
  ];

  for (const year of [-2500000, 2500000]) {
    const jd = run(`gregorian_to_jd(${year}, 1, 15)`);
    for (const [calendar, arity] of calendars) {
      const args = arity === 2 ? `${jd}, 0` : `${jd}`;
      const result = runJSON(`${calendar}(${args})`);
      assert.equal(Array.isArray(result), true, `${calendar} ${year}: array result`);
      assert.equal(result.every(Number.isFinite), true,
                   `${calendar} ${year}: ${JSON.stringify(result)}`);
    }
  }
});
