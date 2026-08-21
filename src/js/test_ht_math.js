// SPDX-License-Identifier: GPL-3.0-or-later
//
// Unit tests for src/js/ht_math.js
//
// Run with:
//   node --test src/js/test_ht_math.js
//
// ht_math.js is a browser-only script. It is evaluated inside a Node.js `vm`
// sandbox with a recording stub for $ and stubs for the external helpers it
// relies on (htLocalImgSrc, mathKeywords, htWriteSumOnYupana and
// htPlotConstantContinuousChart). The test file intentionally does not start
// with "ht_" so the publisher's minifier (which processes files matching
// "^ht_") leaves it out of the generated js/ output.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const HT_MATH_PATH = path.join(__dirname, 'ht_math.js');
const HT_MATH_SRC = fs.readFileSync(HT_MATH_PATH, 'utf8');

function createSandbox() {
  const calls = [];
  const $ = function (selector) {
    calls.push(['$', selector]);
    const obj = {
      length: 0,
      html(value) { calls.push(['html', value]); return obj; },
      css(key, value) { calls.push(['css', key, value]); return obj; },
      attr(key, value) { calls.push(['attr', key, value]); return obj; },
      append(value) { calls.push(['append', value]); return obj; },
      after(value) { calls.push(['after', value]); return obj; },
      text(value) { calls.push(['text', value]); return obj; },
      val() { return obj; },
      on() { return obj; },
      prop() { return obj; },
      each() { return obj; },
      hide() { return obj; },
      show() { return obj; }
    };
    return obj;
  };
  $.calls = calls;

  const sandbox = {
    $,
    console,
    Math,
    JSON,
    setTimeout,
    clearTimeout
  };

  vm.createContext(sandbox);

  vm.runInContext(`
    htLocalImgSrc = true;
    mathKeywords = [];
    for (let i = 0; i < 200; i++) mathKeywords[i] = 'kw' + i;
    htWriteSumOnYupana = function () { return '[YUPANA]'; };
    chartCalls = [];
    htPlotConstantContinuousChart = function (opts) { chartCalls.push(opts); return opts; };
  `, sandbox);

  vm.runInContext(HT_MATH_SRC, sandbox);

  const run = (expr) => vm.runInContext(expr, sandbox);
  // Sandbox objects belong to a different realm; JSON round-trip converts
  // arrays back to plain test-side arrays for deep equality assertions.
  const plain = (expr) => run(`JSON.parse(JSON.stringify(${expr}))`);
  return { sandbox, run, plain, calls };
}

test('htGetImgSrcPrefix returns the CDN prefix unless local images are enabled', () => {
  const { run } = createSandbox();
  run('htLocalImgSrc = true');
  assert.equal(run('htGetImgSrcPrefix()'), '');
  run('htLocalImgSrc = false');
  assert.equal(run('htGetImgSrcPrefix()'), 'https://www.historytracers.org/');
});

test('htSplitDecimalDigit writes each base digit to consecutive cells', () => {
  const { run, calls } = createSandbox();
  calls.length = 0;
  run('htSplitDecimalDigit("#x", 3, 13, 2)');
  const htmlBySelector = {};
  let current = null;
  for (const entry of calls) {
    if (entry[0] === '$') current = entry[1];
    else if (entry[0] === 'html') htmlBySelector[current] = entry[1];
  }
  assert.deepEqual(htmlBySelector, { '#x3': 1, '#x2': 0, '#x1': 1, '#x0': 1 });
});

test('htCompleteMesoamericanCalendar left-pads vectors to 8 periods', () => {
  const { plain } = createSandbox();
  assert.deepEqual(plain('htCompleteMesoamericanCalendar([1, 2, 3])'), [0, 0, 0, 0, 0, 1, 2, 3]);
  assert.deepEqual(plain('htCompleteMesoamericanCalendar([])'), [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(plain('htCompleteMesoamericanCalendar([1, 2, 3, 4, 5, 6, 7, 8])'), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(plain('htCompleteMesoamericanCalendar([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])'), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('htMesoamericanNumberOrder converts a number to base-20 digits', () => {
  const { plain } = createSandbox();
  assert.deepEqual(plain('htMesoamericanNumberOrder(0)'), [0]);
  assert.deepEqual(plain('htMesoamericanNumberOrder(1)'), [1]);
  assert.deepEqual(plain('htMesoamericanNumberOrder(20)'), [0, 1]);
  assert.deepEqual(plain('htMesoamericanNumberOrder(400)'), [0, 0, 1]);
  assert.deepEqual(plain('htMesoamericanNumberOrder(12345)'), [5, 17, 10, 1]);
});

test('htMayaImageName builds the Maya image path, normalizing small negatives', () => {
  const { run } = createSandbox();
  assert.equal(run('htMayaImageName(0)'), 'images/HistoryTracers/Maya_0.png');
  assert.equal(run('htMayaImageName(13)'), 'images/HistoryTracers/Maya_13.png');
  assert.equal(run('htMayaImageName(-5)'), 'images/HistoryTracers/Maya_5.png');
  assert.equal(run('htMayaImageName(-25)'), 'images/HistoryTracers/Maya_-25.png');
});

test('htIsNumeric recognizes numeric strings and rejects others', () => {
  const { run } = createSandbox();
  assert.equal(run('htIsNumeric("123")'), true);
  assert.equal(run('htIsNumeric("12.5")'), true);
  assert.equal(run('htIsNumeric(42)'), true);
  assert.equal(run('htIsNumeric("12px")'), false);
  assert.equal(run('htIsNumeric("")'), false);
  assert.equal(run('htIsNumeric("abc")'), false);
  assert.equal(run('htIsNumeric(Infinity)'), false);
  assert.equal(run('htIsNumeric(null)'), false);
});

test('htModifyArrow clamps the value and toggles arrow visibility', () => {
  const { run, calls } = createSandbox();
  assert.equal(run('htModifyArrow("#a", 5)'), 5);
  assert.equal(run('htModifyArrow("#a", -3)'), 0);
  assert.equal(run('htModifyArrow("#a", 12)'), 9);

  calls.length = 0;
  run('htModifyArrow("#a", -3)');
  assert.deepEqual(calls.filter(([type]) => type === 'css'), [
    ['css', 'display', 'none'],
    ['css', 'visibility', 'hidden']
  ]);
  calls.length = 0;
  run('htModifyArrow("#a", 5)');
  assert.deepEqual(calls.filter(([type]) => type === 'css'), [
    ['css', 'display', 'block'],
    ['css', 'visibility', 'visible']
  ]);
});

test('htSetImageForMembers splits the value into left/right images', () => {
  const { run, calls } = createSandbox();
  calls.length = 0;
  run('htSetImageForMembers("#left", "Left.png", "#right", "Right.png", 7)');
  const attr = calls.filter(([type]) => type === 'attr').map(([, k, v]) => `${k}=${v}`);
  assert.deepEqual(attr, [
    'src=images/HistoryTracers/2Left.png',
    'src=images/HistoryTracers/5Right.png'
  ]);

  calls.length = 0;
  run('htSetImageForMembers("#left", "Left.png", "#right", "Right.png", 12)');
  assert.equal(calls.length, 0);
});

test('htAddTDtoGradeTable builds a Maya table cell', () => {
  const { run } = createSandbox();
  assert.equal(
    run(`htAddTDtoGradeTable(1, 2, 3, 4, '', false)`),
    '<td ><img class="resChanged" id="imgres3" onclick="htImageZoom(\'imgres3\', \'0%\')" src="images/HistoryTracers/Maya_3.png" /> <span class="timesAdd">×</span> <img class="imgAdd" id="imgresa9" onclick="htImageZoom(\'imgresa9\', \'0%\')" src="images/HistoryTracers/Maya_4.png" /></td>'
  );
  assert.equal(
    run(`htAddTDtoGradeTable(1, 2, 3, 0, '', false)`),
    '<td ><img class="resChanged" id="imgres3" onclick="htImageZoom(\'imgres3\', \'0%\')" src="images/HistoryTracers/Maya_3.png" /></td>'
  );
  assert.equal(
    run(`htAddTDtoGradeTable(1, 2, 3, 25, '', false)`),
    '<td ><img class="resChanged" id="imgres3" onclick="htImageZoom(\'imgres3\', \'0%\')" src="images/HistoryTracers/Maya_3.png" /></td>'
  );
  assert.match(
    run(`htAddTDtoGradeTable(1, 2, 3, 4, 'width:10px', true)`),
    /^<td style="width:10px">/
  );
  assert.match(
    run(`htAddTDtoGradeTable(1, 2, 3, 4, '', true)`),
    /class="noChanged"/
  );
});

test('htConstantVector returns a vector filled with the given value', () => {
  const { plain } = createSandbox();
  assert.deepEqual(plain('htConstantVector(5, 3)'), [3, 3, 3, 3, 3]);
  assert.deepEqual(plain('htConstantVector(0, "x")'), []);
});

test('htCosineValues and htSineValues return 256 samples', () => {
  const { run } = createSandbox();
  const cos = run('htCosineValues(1)');
  assert.equal(cos.x.length, 256);
  assert.equal(cos.y.length, 256);
  assert.equal(cos.x[0], 0);
  assert.equal(cos.x[255], 255 / 256);
  assert.equal(cos.y[0], 1);
  assert.equal(cos.y[1], Math.cos((Math.PI / 2 / 255)));

  const sin = run('htSineValues(1)');
  assert.equal(sin.y[0], 0);
  assert.equal(sin.y[1], Math.sin(Math.PI / 2 / 255));
});

test('htSecantValues and htCosecantValues invert the base values', () => {
  const { run } = createSandbox();
  assert.equal(run('htSecantValues(1).y[0]'), 1);
  assert.ok(Number.isFinite(run('htSecantValues(1).y[1]')));
  assert.equal(run('htCosecantValues(1).y[0]'), Infinity);
  assert.equal(run('htTanValues(1).y[0]'), 0);
  assert.equal(run('htTanValues(1).x.length'), 256);
});

test('htCotangentValues returns 512 samples with null at singularities', () => {
  const { run } = createSandbox();
  const cot = run('htCotangentValues(1)');
  const step = 2 / 511;
  assert.equal(cot.y.length, 512);
  assert.equal(cot.y[0], null);
  assert.equal(cot.y[100], Math.cos(step * 100) / Math.sin(step * 100));
});

test('htInverseValues returns the 1/x curve', () => {
  const { run } = createSandbox();
  const inv = run('htInverseValues()');
  assert.equal(inv.y.length, 255);
  assert.equal(inv.x[0], 0);
  assert.equal(inv.x[1], 1 / 255);
  assert.equal(inv.y[0], 255);
  assert.equal(inv.y[1], 255 / 2);
});

test('htDrawMultiplicationTable renders the expected star matrix', () => {
  const { run, calls } = createSandbox();
  calls.length = 0;
  run('htDrawMultiplicationTable("#t", 3, 2)');
  const html = calls.find(([type]) => type === 'html')[1];
  assert.equal((html.match(/fa-solid fa-star/g) || []).length, 6);
  assert.equal((html.match(/<br \/>/g) || []).length, 12);

  calls.length = 0;
  run('htDrawMultiplicationTable("#t", -2, 1)');
  const negHtml = calls.find(([type]) => type === 'html')[1];
  assert.equal((negHtml.match(/fa-solid fa-star/g) || []).length, 2);
  assert.equal((negHtml.match(/<br \/>/g) || []).length, 12);
  assert.ok(negHtml.startsWith('<br />'.repeat(6) + '-'), 'expected leading blank rows then a minus sign');
});

test('htResetMultiplicationTable writes the reset message', () => {
  const { run, calls } = createSandbox();
  calls.length = 0;
  run('htResetMultiplicationTable("#t")');
  const html = calls.find(([type]) => type === 'html')[1];
  assert.equal(html, 'kw17' + '<br />'.repeat(10));
});

test('htMultMakeMultiplicationTableText builds step-by-step addition text', () => {
  const { run, calls } = createSandbox();

  calls.length = 0;
  run('htMultMakeMultiplicationTableText(6, 2, "#table", "#cell")');
  const html = calls.find(([type]) => type === 'html')[1];
  assert.equal(html, '1) 0 + 6 = 6:<br />[YUPANA]2) 6 + 6 = 12:<br />[YUPANA]0 + 0 + 1 (kw67) = 1:<br />[YUPANA]');

  calls.length = 0;
  run('htMultMakeMultiplicationTableText(0, 3, "#table", "#cell")');
  assert.equal(calls.find(([type]) => type === 'html')[1], '0 x 3: <br />kw5<br />');
});

test('htPlotSineCosine plots cosine, sine and the constant line', () => {
  const { sandbox, run } = createSandbox();
  run('chartCalls.length = 0');
  run('htPlotSineCosine("t", true, true, 4)');
  const opts = sandbox.chartCalls[0];
  assert.equal(opts.datasets.length, 3);
  assert.equal(opts.xVector.length, 256);
  assert.equal(opts.ymin, -1);
  assert.equal(opts.ymax, 1.2);
  assert.equal(opts.datasets[2].data.length, 256);
  assert.ok(opts.datasets[2].data.every(v => v === 1));

  run('chartCalls.length = 0');
  run('htPlotSineCosine("t", false, true, 1)');
  assert.equal(sandbox.chartCalls[0].datasets.length, 1);
  assert.equal(sandbox.chartCalls[0].ymin, 0);
});

test('htPlotTan, htPlotCotangent, htPlotInverse, htPlotSecant and htPlotCosecant', () => {
  const { sandbox, run } = createSandbox();

  run('chartCalls.length = 0');
  run('htPlotTan("t", 2)');
  let opts = sandbox.chartCalls[0];
  assert.equal(opts.datasets.length, 1);
  assert.equal(opts.datasets[0].label, 'kw66');

  run('chartCalls.length = 0');
  run('htPlotCotangent("t", "COT", 4)');
  opts = sandbox.chartCalls[0];
  assert.equal(opts.datasets[0].label, 'COT');
  assert.equal(opts.ymin, 0);
  assert.equal(opts.ymax, 5);

  run('chartCalls.length = 0');
  run('htPlotInverse("t", "XL", "YL")');
  opts = sandbox.chartCalls[0];
  assert.equal(opts.datasets[0].label, 'YL');
  assert.equal(opts.ymax, 20);

  run('chartCalls.length = 0');
  run('htPlotSecant("t", "XL", "SEC", 2)');
  assert.equal(sandbox.chartCalls[0].datasets[0].label, 'SEC');

  run('chartCalls.length = 0');
  run('htPlotCosecant("t", "XL", "CSC", 2)');
  assert.equal(sandbox.chartCalls[0].datasets[0].label, 'CSC');
});

test('htFillMultiplicationTable builds chart datasets', () => {
  const { sandbox, run } = createSandbox();

  run('chartCalls.length = 0');
  run('htFillMultiplicationTable("#t", 1, 2, false, true)');
  let opts = sandbox.chartCalls[0];
  assert.equal(opts.datasets.length, 2);
  assert.equal(opts.datasets[0].label, 'kw161');
  assert.equal(opts.datasets[0].data.length, 11);
  assert.equal(opts.xVector.length, 11);

  run('chartCalls.length = 0');
  run('htFillMultiplicationTable("#t", 1, 2, false)');
  opts = sandbox.chartCalls[0];
  assert.equal(opts.xVector.length, 21);
  assert.equal(opts.datasets[0].data.length, 21);

  assert.equal(run('htFillMultiplicationTable("#t", 3, 2, false)'), undefined);

  run('chartCalls.length = 0');
  run('htFillMultiplicationTable("#t", -2, -1, false)');
  opts = sandbox.chartCalls[0];
  assert.equal(opts.xVector[0], -10);
  assert.ok(opts.xVector[opts.xVector.length - 1] === 0, 'last x vector entry should be zero');
  assert.equal(opts.datasets.length, 2);
});

test('htPlotLinearFunction builds a single-dataset chart', () => {
  const { sandbox, run } = createSandbox();
  run('chartCalls.length = 0');
  run('htPlotLinearFunction("#t", 1, 1, false, true)');
  const opts = sandbox.chartCalls[0];
  assert.equal(opts.datasets.length, 1);
  assert.equal(opts.xVector.length, 21);
  assert.equal(opts.datasets[0].data.length, 21);
  assert.equal(opts.ymin, -10);
  assert.equal(opts.ymax, 10);
});
