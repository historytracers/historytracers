// SPDX-License-Identifier: GPL-3.0-or-later

var localYupanaController = {
    "ROWS": 4,
    "state": null,
    "currentLevel": "units",
    "currentExercise": { a: 0, b: 0, expected: 0 },
    "phase": 0,
    "evalCol": 0,
    "evalCarry": 0,
    "evalDone": false,
    "expectCarryClick": false,
    "finalCongratsShown": false,
    "stepNumber": 0,
    "totalSteps": 0,
    "TextManager": null
};

function generateRandomNumbersByLevel() {
    var l = localYupanaController.currentLevel;
    if (l === "units") return { a: rand(10), b: rand(10) };
    if (l === "tens") return { a: rand(90)+10, b: rand(90)+10 };
    if (l === "hundreds") return { a: rand(900)+100, b: rand(900)+100 };
    return { a: rand(9000)+1000, b: rand(9000)+1000 };
    function rand(m) { return Math.floor(Math.random() * m); }
}

function setVis(id, show) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !show);
}

function startNewExercise() {
    localYupanaController.finalCongratsShown = false;
    localYupanaController.phase = 0;
    localYupanaController.evalCol = 0;
    localYupanaController.evalCarry = 0;
    localYupanaController.evalDone = false;
    localYupanaController.expectCarryClick = false;
    var n = generateRandomNumbersByLevel();
    localYupanaController.currentExercise = { a: n.a, b: n.b, expected: n.a + n.b };
    document.getElementById('problemDisplay').innerHTML = fmt(n.a) + " + " + fmt(n.b);
    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateClear('#yupana1', localYupanaController.state);
    document.getElementById('feedbackArea').innerHTML = '';
    setVis('resetTutorBtn', true);
    setVis('nextLevelBtn', true);
    showPhase(1);
}

function fmt(n) {
    if (typeof n !== 'number' || isNaN(n)) return '0';
    try { return new Intl.NumberFormat($("#site_language").val()).format(n); }
    catch(e) { return n.toString(); }
}

function tm(id) { var el = document.getElementById(id); return el ? el.innerHTML : id; }

function countEvaluationSteps() {
    var a = localYupanaController.currentExercise.a;
    var b = localYupanaController.currentExercise.b;
    var count = 0, carry = 0;
    for (var p = 0; p < localYupanaController.ROWS; p++) {
        var dA = getDigit(a, p);
        var dB = getDigit(b, p);
        var total = dA + dB + carry;
        if (dA > 0 || dB > 0 || carry > 0) {
            count++;
        }
        if (total >= 10) {
            carry = 1;
        } else {
            carry = 0;
        }
    }
    if (carry > 0) count++;
    return count;
}

function updateStepStatus() {
    var t = localYupanaController.TextManager;
    document.getElementById('stepStatus').innerHTML = t.get('txt_stepStatus')
        .replace('{current}', localYupanaController.stepNumber)
        .replace('{total}', localYupanaController.totalSteps);
}

function showPhase(p) {
    setVis('nextLevelBtn', true);
    setVis('resetTutorBtn', true);
    localYupanaController.phase = p;
    var t = localYupanaController.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var a = localYupanaController.currentExercise.a;
    var b = localYupanaController.currentExercise.b;
    if (p === 1) {
        localYupanaController.stepNumber = 1;
        localYupanaController.totalSteps = 2 + countEvaluationSteps();
        document.getElementById('stepMessage').innerHTML = t.get('txt_stepPrefix') + " " + t.get('txt_step1Instruction').replace('{a}', fmt(a));
        updateStepStatus();
    } else if (p === 2) {
        localYupanaController.stepNumber = 2;
        document.getElementById('stepMessage').innerHTML = t.get('txt_stepPrefix') + " " + t.get('txt_step2Instruction').replace('{b}', fmt(b));
        updateStepStatus();
    } else if (p === 3) {
        setVis('nextStepBtn', false);
        document.getElementById('feedbackArea').innerHTML = '';
        startEvaluation();
        return;
    } else if (p === 4) {
        setVis('nextStepBtn', false);
        showCongratulations();
        return;
    }
    setVis('nextStepBtn', true);
    document.getElementById('feedbackArea').innerHTML = '';
}

function startEvaluation() {
    localYupanaController.evalCol = 0;
    localYupanaController.evalCarry = 0;
    localYupanaController.evalDone = false;
    localYupanaController.expectCarryClick = false;
    setVis('nextStepBtn', false);
    document.getElementById('stepStatus').innerHTML = '';
    processNextColumn();
}

function getDigit(val, pos) {
    return Math.floor(val / Math.pow(10, pos)) % 10;
}

function colValue(s, rowIdx) {
    var cv = [5,3,2,1], sum = 0;
    for (var c = 0; c < 4; c++) {
        if (s.red[rowIdx][c]) sum += cv[c];
        if (s.blue[rowIdx][c]) sum += cv[c];
    }
    return sum;
}

function processNextColumn() {
    var s = localYupanaController.state;
    var col = localYupanaController.evalCol;
    var carry = localYupanaController.evalCarry;
    var maxC = localYupanaController.ROWS;

    if (col >= maxC && carry === 0) {
        showPhase(4);
        return;
    }

    var dA = getDigit(localYupanaController.currentExercise.a, col);
    var dB = getDigit(localYupanaController.currentExercise.b, col);
    var total = dA + dB + carry;

    if (dA === 0 && dB === 0 && carry === 0 && col < maxC) {
        localYupanaController.evalCol = col + 1;
        localYupanaController.evalCarry = 0;
        processNextColumn();
        return;
    }

    if (col >= maxC && carry > 0) {
        localYupanaController.expectCarryClick = true;
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_carryFinalInstruction');
        s.gray[col] = [false, false, false, true];
        htYupanaStateRenderCell('#yupana1', s, col, 3);
        return;
    }

    var resultDigit = total >= 10 ? total - 10 : total;
    var instr;
    if (total >= 10) {
        instr = getPlaceName(col) + ": " + dA + " + " + dB + " = " + total + ". This exceeds 9. <strong>Carry 1 to " + getPlaceName(col + 1) + "</strong>. Set the " + getPlaceName(col) + " to <strong>" + resultDigit + "</strong> using green markers.";
    } else {
        instr = getPlaceName(col) + ": " + dA + " + " + dB + " = " + total + ". <strong>Set the " + getPlaceName(col) + " to " + total + "</strong> using green markers.";
    }
    document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + instr;

    localYupanaController.stepNumber++;
    updateStepStatus();
    localYupanaController.evalDone = false;
    s.green[col] = [false, false, false, false];
    for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
}

function getPlaceName(idx) {
    var names = [tm('txt_units'), tm('txt_tens'), tm('txt_hundreds'), tm('txt_thousands')];
    return idx < names.length ? names[idx] : tm('txt_next');
}

function showCongratulations() {
    localYupanaController.finalCongratsShown = true;
    htYupanaStateDrawGreen('#yupana1', localYupanaController.state, localYupanaController.currentExercise.expected);
    var t = localYupanaController.TextManager;
    document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + t.getPerfectMessage(
        fmt(localYupanaController.currentExercise.a),
        fmt(localYupanaController.currentExercise.b),
        fmt(localYupanaController.currentExercise.expected)) + '</div>';
    document.getElementById('stepMessage').innerHTML = '';
    document.getElementById('stepStatus').innerHTML = '';
    setVis('resetTutorBtn', true);
    setVis('nextLevelBtn', true);
}

function onCellClick(rowIdx, colIdx) {
    if (localYupanaController.finalCongratsShown) return;
    var s = localYupanaController.state;
    var phase = localYupanaController.phase;

    if (phase === 1) {
        htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
        var ok = true;
        for (var i = 0; i < localYupanaController.ROWS; i++) {
            var cv = [5,3,2,1], actual = 0;
            for (var c = 0; c < 4; c++) if (s.red[i][c]) actual += cv[c];
            if (actual !== getDigit(localYupanaController.currentExercise.a, i)) { ok = false; break; }
        }
        if (ok) {
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 2) {
        if (s.blue[rowIdx][colIdx]) {
            s.blue[rowIdx][colIdx] = false;
        } else {
            s.blue[rowIdx][colIdx] = true;
        }
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
        var ok = true;
        for (var i = 0; i < localYupanaController.ROWS; i++) {
            var cv = [5,3,2,1], actual = 0;
            for (var c = 0; c < 4; c++) if (s.blue[i][c]) actual += cv[c];
            if (actual !== getDigit(localYupanaController.currentExercise.b, i)) { ok = false; break; }
        }
        if (ok) {
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 3) {
        // User is resolving a column
        var col = localYupanaController.evalCol;
        var carry = localYupanaController.evalCarry;
        var dA = getDigit(localYupanaController.currentExercise.a, col);
        var dB = getDigit(localYupanaController.currentExercise.b, col);
        var total = dA + dB + carry;

        if (localYupanaController.expectCarryClick) {
            // User clicking to confirm carry
            if (s.gray[rowIdx] && s.gray[rowIdx][colIdx]) {
                s.gray[rowIdx][colIdx] = false;
                s.green[rowIdx][colIdx] = true;
                htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
                localYupanaController.expectCarryClick = false;
                localYupanaController.evalCarry = 0;
                localYupanaController.evalCol = col + 1;
                processNextColumn();
            }
            return;
        }

        // User clicking to set green markers in the current column
        if (rowIdx !== col) return; // only allow clicks in the current column

        // Toggle green on/off in this cell
        if (s.green[rowIdx][colIdx]) {
            s.green[rowIdx][colIdx] = false;
        } else {
            s.green[rowIdx][colIdx] = true;
        }
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);

        // Check if column is correct
        var cv = [5,3,2,1], actual = 0;
        for (var c = 0; c < 4; c++) if (s.green[rowIdx][c]) actual += cv[c];
        var need = total >= 10 ? total - 10 : total;
        if (col >= localYupanaController.ROWS) need = carry;

        if (actual === need) {
            // Column resolved
            htYupanaRowSetGreen('#yupana1', s, col, need);
            if (total >= 10) {
                // Show gray carry marker in next column
                localYupanaController.expectCarryClick = true;
                var nextCol = col + 1;
                s.gray[nextCol] = [false, false, false, true]; // tc4 (value 1)
                htYupanaStateRenderCell('#yupana1', s, nextCol, 3);
                document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_carryFinalInstruction');
            } else {
                localYupanaController.evalCarry = 0;
                localYupanaController.evalCol = col + 1;
                processNextColumn();
            }
        }
        return;
    }
}

function toggleLevel() {
    var lvls = ["units","tens","hundreds","thousands"];
    var bg = ["#ffb347","#4caf50","#ff7043","#9c27b0"];
    var idx = lvls.indexOf(localYupanaController.currentLevel);
    if (idx < 3) {
        idx++;
        localYupanaController.currentLevel = lvls[idx];
        document.getElementById('levelBadge').innerHTML = tm('txt_level' + lvls[idx].charAt(0).toUpperCase() + lvls[idx].slice(1));
        document.getElementById('levelBadge').style.background = bg[idx];
    } else {
        localYupanaController.currentLevel = "units";
        document.getElementById('levelBadge').innerHTML = tm('txt_levelUnits');
        document.getElementById('levelBadge').style.background = bg[0];
        document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + tm('txt_finalLevelMessage') + '</div>';
    }
    startNewExercise();
}

function htLoadContent() {
    htWriteNavigation();

    localYupanaController.TextManager = {
        get: tm,
        format: function(t, d) {
            for (var k in d) { if(d.hasOwnProperty(k)) { var v=d[k]; if(v===undefined||v===null)v=''; t=t.replace(new RegExp('\\{'+k+'\\}','g'),v); } }
            return t;
        },
        getPerfectMessage: function(a,b,r) { return this.format(tm('txt_perfectMessage'),{a:a,b:b,result:r}); }
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
    var rs = _('resetButton'); if (rs) rs.onclick = function() { startNewExercise(); };
    var lv = _('nextLevelBtn'); if (lv) lv.onclick = function() { toggleLevel(); };
    var ns = _('nextStepBtn'); if (ns) ns.onclick = function() {
        var p = localYupanaController.phase;
        var s = localYupanaController.state;
        var ex = localYupanaController.currentExercise;
        var ok = true;
        if (p === 1) {
            for (var i = 0; i < localYupanaController.ROWS; i++) {
                var cv = [5,3,2,1], actual = 0;
                for (var c = 0; c < 4; c++) if (s.red[i][c]) actual += cv[c];
                if (actual !== getDigit(ex.a, i)) { ok = false; break; }
            }
            if (ok) showPhase(2);
        } else if (p === 2) {
            for (var i = 0; i < localYupanaController.ROWS; i++) {
                var cv = [5,3,2,1], actual = 0;
                for (var c = 0; c < 4; c++) if (s.blue[i][c]) actual += cv[c];
                if (actual !== getDigit(ex.b, i)) { ok = false; break; }
            }
            if (ok) showPhase(3);
        }
    };

    _('stepMessage') && (_('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_welcomeMessage'));
    startNewExercise();

    window.htSorobanLoadContent = undefined;
    window.htTriangleLoadContent = undefined;
    window.htLoadExercise = undefined;
    return false;
}
