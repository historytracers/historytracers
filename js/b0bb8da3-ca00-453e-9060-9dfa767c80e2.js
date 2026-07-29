// SPDX-License-Identifier: GPL-3.0-or-later

var localYupanaController = {
    "ROWS": 4,
    "state": null,
    "currentLevel": "units",
    "currentExercise": { a: 0, b: 0, expected: 0 },
    "phase": 0,
    "finalCongratsShown": false,
    "TextManager": null
};

function generateRandomNumbersByLevel() {
    if (localYupanaController.currentLevel === "units") {
        return { a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) };
    } else if (localYupanaController.currentLevel === "tens") {
        return { a: Math.floor(Math.random() * 90) + 10, b: Math.floor(Math.random() * 90) + 10 };
    } else if (localYupanaController.currentLevel === "hundreds") {
        return { a: Math.floor(Math.random() * 900) + 100, b: Math.floor(Math.random() * 900) + 100 };
    } else {
        return { a: Math.floor(Math.random() * 9000) + 1000, b: Math.floor(Math.random() * 9000) + 1000 };
    }
}

function setButtonVisibility(show) {
    var b = document.getElementById('resetTutorBtn');
    var l = document.getElementById('nextLevelBtn');
    if (b) b.classList.toggle('hidden', !show);
    if (l) l.classList.toggle('hidden', !show);
}

function showPhase1() {
    var tm = localYupanaController.TextManager;
    localYupanaController.phase = 1;
    document.getElementById('stepMessage').innerHTML = tm.getStepPrefix() + " " + tm.getStep1Instruction(tm.formatNumber(localYupanaController.currentExercise.a));
    document.getElementById('stepStatus').innerHTML = tm.getStepStatus(1, 2);
    document.getElementById('feedbackArea').innerHTML = '';
    setButtonVisibility(false);
}

function showPhase2() {
    var tm = localYupanaController.TextManager;
    localYupanaController.phase = 2;
    document.getElementById('stepMessage').innerHTML = tm.getStepPrefix() + " " + tm.getStep2Instruction(tm.formatNumber(localYupanaController.currentExercise.b));
    document.getElementById('stepStatus').innerHTML = tm.getStepStatus(2, 2);
    document.getElementById('feedbackArea').innerHTML = '';
}

function checkFinal() {
    var totalOk = true;
    var dig = htYupanaStateGetTotalValue(localYupanaController.state);
    if (dig !== localYupanaController.currentExercise.expected) return false;
    for (var i = 0; i < localYupanaController.ROWS; i++) {
        if (htYupanaStateGetRowDigit(localYupanaController.state, i) > 9) return false;
    }
    return true;
}

function startNewExercise() {
    localYupanaController.finalCongratsShown = false;
    localYupanaController.phase = 0;
    var nums = generateRandomNumbersByLevel();
    localYupanaController.currentExercise = { a: nums.a, b: nums.b, expected: nums.a + nums.b };
    document.getElementById('problemDisplay').innerHTML = localYupanaController.TextManager.formatNumber(nums.a) + " + " + localYupanaController.TextManager.formatNumber(nums.b);
    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateClear('#yupana1', localYupanaController.state);
    document.getElementById('feedbackArea').innerHTML = '';
    setButtonVisibility(true);
    showPhase1();
}

function resetTutorToStepOne() {
    localYupanaController.finalCongratsShown = false;
    localYupanaController.phase = 0;
    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateClear('#yupana1', localYupanaController.state);
    document.getElementById('feedbackArea').innerHTML = '';
    setButtonVisibility(true);
    showPhase1();
}

function toggleLevel() {
    var lvl = ["units", "tens", "hundreds", "thousands"];
    var badges = ["txt_levelUnits", "txt_levelTens", "txt_levelHundreds", "txt_levelThousands"];
    var colors = ["#ffb347", "#4caf50", "#ff7043", "#9c27b0"];
    var idx = lvl.indexOf(localYupanaController.currentLevel);
    if (idx < 3) {
        idx++;
        localYupanaController.currentLevel = lvl[idx];
        document.getElementById('levelBadge').innerHTML = localYupanaController.TextManager.get(badges[idx]);
        document.getElementById('levelBadge').style.background = colors[idx];
    } else {
        localYupanaController.currentLevel = "units";
        document.getElementById('levelBadge').innerHTML = localYupanaController.TextManager.get(badges[0]);
        document.getElementById('levelBadge').style.background = colors[0];
        document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + localYupanaController.TextManager.getFinalLevelMessage() + '</div>';
    }
    startNewExercise();
}

function onCellClick(rowIdx, colIdx) {
    if (localYupanaController.finalCongratsShown) return;
    var s = localYupanaController.state;
    var phase = localYupanaController.phase;

    if (phase === 1) {
        htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
    } else if (phase === 2) {
        if (s.red[rowIdx][colIdx] || s.blue[rowIdx][colIdx]) {
            s.red[rowIdx][colIdx] = false;
            s.blue[rowIdx][colIdx] = false;
        } else {
            s.blue[rowIdx][colIdx] = true;
        }
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
    } else {
        return;
    }

    if (phase === 1) {
        var redOk = true;
        for (var i = 0; i < localYupanaController.ROWS; i++) {
            var cv = [5, 3, 2, 1];
            var actual = 0;
            for (var c = 0; c < 4; c++) {
                if (s.red[i][c]) actual += cv[c];
            }
            var target = Math.floor(localYupanaController.currentExercise.a / Math.pow(10, i)) % 10;
            if (actual !== target) { redOk = false; break; }
        }
        if (redOk) {
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + localYupanaController.TextManager.getCorrectMessage() + '</div>';
            localYupanaController.phase = 1;
        }
    }

    if (phase === 2) {
        var anyOver = false;
        for (var i = 0; i < localYupanaController.ROWS; i++) {
            if (htYupanaStateGetRowDigit(s, i) > 9) { anyOver = true; break; }
        }
        if (anyOver) {
            document.getElementById('feedbackArea').innerHTML = '';
            return;
        }
        if (checkFinal()) {
            localYupanaController.finalCongratsShown = true;
            htYupanaStateDrawGreen('#yupana1', s, localYupanaController.currentExercise.expected);
            document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + localYupanaController.TextManager.getPerfectMessage(
                localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.a),
                localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.b),
                localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.expected)) + '</div>';
            setButtonVisibility(true);
        }
    }
}

function htLoadContent() {
    htWriteNavigation();

    localYupanaController.TextManager = {
        get: function(id) {
            var el = document.getElementById(id);
            return el ? el.innerHTML : id;
        },
        format: function(t, d) {
            for (var k in d) {
                if (d.hasOwnProperty(k)) {
                    var v = d[k];
                    if (v === undefined || v === null) v = '';
                    t = t.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
                }
            }
            return t;
        },
        getStepPrefix: function() { return this.get('txt_stepPrefix'); },
        getCorrectMessage: function() { return this.get('txt_correctMessage'); },
        getPerfectMessage: function(a, b, r) { return this.format(this.get('txt_perfectMessage'), { a: a, b: b, result: r }); },
        getCongratsMessage: function(a, b, r) { return this.format(this.get('txt_congratsMessage'), { a: a, b: b, result: r }); },
        getFinalLevelMessage: function() { return this.get('txt_finalLevelMessage'); },
        getStep1Instruction: function(a) { return this.format(this.get('txt_step1Instruction'), { a: a }); },
        getStep2Instruction: function(b) { return this.format(this.get('txt_step2Instruction'), { b: b }); },
        getStepStatus: function(c, t) { return this.format(this.get('txt_stepStatus'), { current: c, total: t }); },
        formatNumber: function(n) {
            if (typeof n !== 'number' || isNaN(n)) return '0';
            try { return new Intl.NumberFormat($("#site_language").val()).format(n); }
            catch(e) { return n.toString(); }
        },
        getLevelUnits: function() { return this.get('txt_levelUnits'); },
        getLevelTens: function() { return this.get('txt_levelTens'); },
        getLevelHundreds: function() { return this.get('txt_levelHundreds'); },
        getLevelThousands: function() { return this.get('txt_levelThousands'); }
    };

    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateClear('#yupana1', localYupanaController.state);

    for (var row = 1; row <= localYupanaController.ROWS; row++) {
        for (var col = 1; col <= 4; col++) {
            (function(r, c) {
                $('#yupana1 #tc' + c + 'f' + r).on("click", function() {
                    onCellClick(localYupanaController.ROWS - r, c - 1);
                });
            })(row, col);
        }
    }

    var _ = function(id) { return document.getElementById(id); };
    var ex = _('resetTutorBtn'); if (ex) ex.onclick = function() { startNewExercise(); };
    var rs = _('resetButton'); if (rs) rs.onclick = function() { resetTutorToStepOne(); };
    var lv = _('nextLevelBtn'); if (lv) lv.onclick = function() { toggleLevel(); };

    _('stepMessage') && (_('stepMessage').innerHTML = localYupanaController.TextManager.getStepPrefix() + " " + localYupanaController.TextManager.get('txt_welcomeMessage'));

    startNewExercise();

    window.htSorobanLoadContent = undefined;
    window.htTriangleLoadContent = undefined;
    window.htLoadExercise = undefined;
    return false;
}
