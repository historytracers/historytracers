// SPDX-License-Identifier: GPL-3.0-or-later

var localYupanaController = {
    "ROWS": 4,
    "state": null,
    "currentLevel": "units",
    "currentExercise": { a: 0, b: 0, expected: 0 },
    "phase": 0,
    "evalCol": 0,
    "evalDone": false,
    "expectBorrowRewrite": false,
    "borrowRewriteTargets": {},
    "borrowJustTaken": false,
    "awaitingMovementStep": false,
    "awaitingDigitStep": false,
    "movementsDone": [],
    "digitPositions": [],
    "digitIdx": 0,
    "finalCongratsShown": false,
    "stepNumber": 0,
    "totalSteps": 0,
    "TextManager": null
};

function generateRandomNumbersByLevel() {
    var l = localYupanaController.currentLevel;
    if (l === "units") {
        var a = rand(9) + 1;
        return { a: a, b: rand(a) + 1 };
    }
    if (l === "tens") {
        var a = rand(90) + 10;
        return { a: a, b: rand(a) + 1 };
    }
    var a = rand(900) + 100;
    return { a: a, b: rand(a) + 1 };
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
    localYupanaController.evalDone = false;
    localYupanaController.expectBorrowRewrite = false;
    localYupanaController.borrowRewriteTargets = {};
    localYupanaController.borrowJustTaken = false;
    localYupanaController.awaitingMovementStep = false;
    localYupanaController.awaitingDigitStep = false;
    var n = generateRandomNumbersByLevel();
    localYupanaController.currentExercise = { a: n.a, b: n.b, expected: n.a - n.b };
    document.getElementById('problemDisplay').innerHTML = fmt(n.a) + " − " + fmt(n.b);
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

function getRowRedValue(rowIdx) {
    var s = localYupanaController.state;
    var cv = [5,3,2,1], sum = 0;
    for (var c = 0; c < 4; c++) if (s.red[rowIdx][c]) sum += cv[c];
    return sum;
}

function countEvaluationSteps() {
    var a = localYupanaController.currentExercise.a;
    var b = localYupanaController.currentExercise.b;
    var digits = [];
    for (var p = 0; p < localYupanaController.ROWS; p++) digits.push(getDigit(a, p));
    var count = 0;
    for (var col = 0; col < localYupanaController.ROWS; col++) {
        var dA = digits[col];
        var dB = getDigit(b, col);
        if (dA === 0 && dB === 0) continue;
        if (dB > dA) {
            count += 2;
            var t = col + 1;
            while (t < localYupanaController.ROWS && digits[t] === 0) { digits[t] = 9; t++; }
            if (t < localYupanaController.ROWS) digits[t] -= 1;
        } else {
            count += 1;
        }
    }
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
        localYupanaController.digitPositions = getDigitPositions(a);
        localYupanaController.digitIdx = 0;
        localYupanaController.stepNumber = 1;
        localYupanaController.totalSteps = countDigitSteps(a) + countDigitSteps(b) + countEvaluationSteps();
        updateStepStatus();
        if (localYupanaController.digitPositions.length === 0) {
            showPhase(2);
            return;
        }
        showDigitInstruction(1);
    } else if (p === 2) {
        localYupanaController.digitPositions = getDigitPositions(b);
        localYupanaController.digitIdx = 0;
        localYupanaController.stepNumber = countDigitSteps(a) + 1;
        updateStepStatus();
        if (localYupanaController.digitPositions.length === 0) {
            showPhase(3);
            return;
        }
        showDigitInstruction(2);
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
    localYupanaController.evalDone = false;
    localYupanaController.expectBorrowRewrite = false;
    localYupanaController.borrowRewriteTargets = {};
    localYupanaController.borrowJustTaken = false;
    localYupanaController.awaitingMovementStep = false;
    setVis('nextStepBtn', false);
    document.getElementById('stepStatus').innerHTML = '';
    processNextColumn();
}

function getDigit(val, pos) {
    return Math.floor(val / Math.pow(10, pos)) % 10;
}

function getDigitPositions(n) {
    var positions = [];
    var p = 0;
    while (Math.pow(10, p) <= n) {
        if (getDigit(n, p) !== 0) positions.push(p);
        p++;
    }
    return positions;
}

function countDigitSteps(n) {
    return getDigitPositions(n).length;
}

function showDigitInstruction(phase) {
    var t = localYupanaController.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var pos = localYupanaController.digitPositions[localYupanaController.digitIdx];
    var n = (phase === 1) ? localYupanaController.currentExercise.a : localYupanaController.currentExercise.b;
    var key = (phase === 1) ? 'txt_step1DigitInstruction' : 'txt_step2DigitInstruction';
    localYupanaController.awaitingDigitStep = false;
    document.getElementById('feedbackArea').innerHTML = '';
    document.getElementById('stepMessage').innerHTML = t.get('txt_stepPrefix') + " " + t.get(key)
        .replace(/\{step\}/g, localYupanaController.stepNumber)
        .replace(/\{placeName\}/g, getPlaceName(pos))
        .replace(/\{digit\}/g, getDigit(n, pos));
    updateStepStatus();
}

function advanceDigitPhase(phase) {
    localYupanaController.digitIdx++;
    if (localYupanaController.digitIdx < localYupanaController.digitPositions.length) {
        localYupanaController.stepNumber++;
        showDigitInstruction(phase);
    } else {
        if (phase === 1) showPhase(2);
        else showPhase(3);
    }
}

function digitRep(v) {
    var r = {1:0, 2:0, 3:0, 5:0};
    if (v === 10) { r[5] = 2; return r; }
    if (v === 1) r[1] = 1;
    else if (v === 2) r[2] = 1;
    else if (v === 3) r[3] = 1;
    else if (v === 4) { r[3] = 1; r[1] = 1; }
    else if (v === 5) r[5] = 1;
    else if (v === 6) { r[5] = 1; r[1] = 1; }
    else if (v === 7) { r[5] = 1; r[2] = 1; }
    else if (v === 8) { r[5] = 1; r[3] = 1; }
    else if (v === 9) { r[5] = 1; r[3] = 1; r[1] = 1; }
    return r;
}

function getColumnMovements(dA, dB, borrow, didBorrow) {
    // Inverse movements used to subtract sEff = dB + borrow from dA.
    // If the column borrowed from the next one, the borrowed 10 is brought
    // down (PISQA inverse when subtracting a 5) and combined with dA.
    var sEff = dB + borrow;
    var R = digitRep(dA);
    var B = digitRep(sEff);
    var moves = [];
    if (sEff === 0 && !didBorrow) return moves;
    if (didBorrow) {
        R[5] += 2;
        if (B[5] >= 1) {
            R[5] -= 1;
            B[5] -= 1;
            moves.push({ name: 'PISQA', op: '10 − 5 = 5' });
        }
    }
    function isEmpty(c) { return c[1] + c[2] + c[3] + c[5] === 0; }
    function addMove(name, op) { moves.push({ name: name, op: op }); }
    var guard = 0;
    while (guard++ < 60) {
        if (R[1] >= 1 && B[1] >= 1) { R[1]--; B[1]--; addMove('CANCEL', '1 − 1 = 0'); }
        else if (R[2] >= 1 && B[2] >= 1) { R[2]--; B[2]--; addMove('CANCEL', '2 − 2 = 0'); }
        else if (R[3] >= 1 && B[3] >= 1) { R[3]--; B[3]--; addMove('CANCEL', '3 − 3 = 0'); }
        else if (R[5] >= 1 && B[5] >= 1) { R[5]--; B[5]--; addMove('CANCEL', '5 − 5 = 0'); }
        else if (R[3] >= 1 && B[2] >= 1) { R[3]--; B[2]--; R[1]++; addMove('PICHANA', '3 − 2 = 1'); }
        else if (R[5] >= 1 && B[2] >= 1) { R[5]--; B[2]--; R[3]++; addMove('PICHANA', '5 − 2 = 3'); }
        else if (R[5] >= 1 && B[3] >= 1) { R[5]--; B[3]--; R[2]++; addMove('PICHANA', '5 − 3 = 2'); }
        else if (R[3] >= 1 && B[1] >= 1) { R[3]--; B[1]--; R[2]++; addMove('ISKAY', '3 − 1 = 2'); }
        else if (R[5] >= 1 && B[1] >= 1) { R[5]--; B[1]--; R[3]++; R[1]++; addMove('KIMSA', '5 − 1 = 4'); }
        else if (R[2] >= 1 && B[1] >= 1) { R[2]--; B[1]--; R[1]++; addMove('PICHANA', '2 − 1 = 1'); }
        else break;
        if (isEmpty(B)) break;
    }
    return moves;
}

function formatMovements(moves) {
    var inverseNames = { ISKAY: 1, KIMSA: 1, PISQA: 1, PICHANA: 1 };
    var names = [];
    for (var i = 0; i < moves.length; i++) {
        var m = moves[i];
        var label;
        if (typeof m === 'string') {
            label = tm('txt_movement' + m);
            if (inverseNames[m]) label += " (" + tm('txt_inverse') + ")";
        } else {
            label = tm('txt_movement' + m.name);
            if (inverseNames[m.name]) {
                label += " (" + tm('txt_inverse') + ": " + m.op + ")";
            } else {
                label += " (" + m.op + ")";
            }
        }
        names.push(label);
    }
    return names.join(", ");
}

function showMovementsMessage(placeName) {
    var moves = localYupanaController.movementsDone;
    var msg;
    if (moves.length === 0) {
        msg = tm('txt_noMovementsMessage').replace(/\{placeName\}/g, placeName);
    } else {
        msg = tm('txt_movementsMessage')
            .replace(/\{placeName\}/g, placeName)
            .replace(/\{movements\}/g, formatMovements(moves));
    }
    document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + msg + '</div>';
    setVis('nextStepBtn', true);
}

function showColumnSolve(col, dA, dB, didBorrow) {
    var s = localYupanaController.state;
    var result = didBorrow ? dA + 10 - dB : dA - dB;
    localYupanaController.stepNumber++;
    updateStepStatus();
    localYupanaController.evalDone = false;
    if (result === 0) {
        s.red[col] = [false, false, false, false];
        s.blue[col] = [0, 0, 0, 0];
        s.green[col] = [false, false, false, false];
        for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
        localYupanaController.movementsDone = getColumnMovements(dA, dB, 0, false);
        localYupanaController.awaitingMovementStep = true;
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_evalZero')
                .replace(/\{step\}/g, localYupanaController.stepNumber)
                .replace(/\{placeName\}/g, getPlaceName(col))
                .replace(/\{digitA\}/g, dA)
                .replace(/\{digitB\}/g, dB)
                .replace(/\{result\}/g, result);
        showMovementsMessage(getPlaceName(col));
        return;
    }
    if (didBorrow && result === 9) {
        s.green[col] = [false, false, false, false];
        htYupanaRowSetGreen('#yupana1', s, col, result);
        localYupanaController.movementsDone = getColumnMovements(dA, dB, 0, true);
        localYupanaController.awaitingMovementStep = true;
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_evalNine')
                .replace(/\{step\}/g, localYupanaController.stepNumber)
                .replace(/\{placeName\}/g, getPlaceName(col))
                .replace(/\{digitA\}/g, dA)
                .replace(/\{digitB\}/g, dB)
                .replace(/\{result\}/g, result);
        showMovementsMessage(getPlaceName(col));
        return;
    }
    var instr;
    if (didBorrow) {
        instr = tm('txt_evalBorrow')
            .replace(/\{step\}/g, localYupanaController.stepNumber)
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB)
            .replace(/\{result\}/g, result);
    } else {
        instr = tm('txt_evalSimple')
            .replace(/\{step\}/g, localYupanaController.stepNumber)
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB)
            .replace(/\{result\}/g, result);
    }
    document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + instr;
    document.getElementById('feedbackArea').innerHTML = '';
    s.green[col] = [false, false, false, false];
    for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
}

function processNextColumn() {
    var s = localYupanaController.state;
    var col = localYupanaController.evalCol;
    var maxC = localYupanaController.ROWS;

    if (col >= maxC) {
        showPhase(4);
        return;
    }

    var dA = getRowRedValue(col);
    var dB = getDigit(localYupanaController.currentExercise.b, col);

    if (dA === 0 && dB === 0) {
        localYupanaController.evalCol = col + 1;
        processNextColumn();
        return;
    }

    if (dB > dA) {
        localYupanaController.stepNumber++;
        updateStepStatus();
        localYupanaController.expectBorrowRewrite = true;
        localYupanaController.borrowRewriteTargets = {};
        var t = col + 1;
        while (t < maxC && getRowRedValue(t) === 0) {
            localYupanaController.borrowRewriteTargets[t] = 9;
            t++;
        }
        if (t >= maxC) t = maxC - 1;
        localYupanaController.borrowRewriteTargets[t] = getRowRedValue(t) - 1;
        var list = [];
        for (var r in localYupanaController.borrowRewriteTargets) {
            list.push(getPlaceName(parseInt(r)) + " → " + localYupanaController.borrowRewriteTargets[r]);
        }
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_borrowInstruction')
                .replace(/\{step\}/g, localYupanaController.stepNumber)
                .replace(/\{placeName\}/g, getPlaceName(col))
                .replace(/\{nextPlace\}/g, getPlaceName(col + 1))
                .replace(/\{digitA\}/g, dA)
                .replace(/\{digitB\}/g, dB)
                .replace(/\{rewriteList\}/g, list.join(", "));
        document.getElementById('feedbackArea').innerHTML = '';
        setVis('nextStepBtn', false);
        return;
    }

    showColumnSolve(col, dA, dB, false);
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
        var pos1 = localYupanaController.digitPositions[localYupanaController.digitIdx];
        if (rowIdx !== pos1) return;
        if (localYupanaController.awaitingDigitStep) return;
        htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
        var cv1 = [5,3,2,1], actual1 = 0;
        for (var c1 = 0; c1 < 4; c1++) if (s.red[rowIdx][c1]) actual1 += cv1[c1];
        if (actual1 === getDigit(localYupanaController.currentExercise.a, pos1)) {
            localYupanaController.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 2) {
        var pos2 = localYupanaController.digitPositions[localYupanaController.digitIdx];
        if (rowIdx !== pos2) return;
        if (localYupanaController.awaitingDigitStep) return;
        s.blue[rowIdx][colIdx] = s.blue[rowIdx][colIdx] ? 0 : 1;
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
        var cv2 = [5,3,2,1], actual2 = 0;
        for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * s.blue[rowIdx][c2];
        if (actual2 === getDigit(localYupanaController.currentExercise.b, pos2)) {
            localYupanaController.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 3) {
        var col = localYupanaController.evalCol;

        if (localYupanaController.expectBorrowRewrite) {
            if (!localYupanaController.borrowRewriteTargets.hasOwnProperty(rowIdx)) return;
            htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
            var allOk = true;
            for (var r in localYupanaController.borrowRewriteTargets) {
                if (getRowRedValue(parseInt(r)) !== localYupanaController.borrowRewriteTargets[r]) {
                    allOk = false;
                    break;
                }
            }
            if (allOk) {
                localYupanaController.expectBorrowRewrite = false;
                localYupanaController.borrowJustTaken = true;
                localYupanaController.awaitingMovementStep = true;
                document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' +
                    tm('txt_borrowConfirmMessage')
                        .replace(/\{nextPlace\}/g, getPlaceName(col + 1)) +
                    '</div>';
                setVis('nextStepBtn', true);
            }
            return;
        }

        if (localYupanaController.awaitingMovementStep) return;

        if (rowIdx !== col) return;

        if (s.green[rowIdx][colIdx]) {
            s.green[rowIdx][colIdx] = false;
        } else {
            s.green[rowIdx][colIdx] = true;
        }
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);

        var cv = [5,3,2,1], actual = 0;
        for (var c = 0; c < 4; c++) if (s.green[rowIdx][c]) actual += cv[c];
        var dA = getRowRedValue(col);
        var dB = getDigit(localYupanaController.currentExercise.b, col);
        var need = dB > dA ? dA + 10 - dB : dA - dB;

        if (actual === need) {
            htYupanaRowSetGreen('#yupana1', s, col, need);
            localYupanaController.movementsDone = getColumnMovements(dA, dB, 0, dB > dA);
            localYupanaController.awaitingMovementStep = true;
            showMovementsMessage(getPlaceName(col));
        }
        return;
    }
}

function toggleLevel() {
    var lvls = ["units","tens","hundreds"];
    var bg = ["#ffb347","#4caf50","#ff7043"];
    var idx = lvls.indexOf(localYupanaController.currentLevel);
    if (idx === 2) {
        localYupanaController.currentLevel = "units";
        document.getElementById('levelBadge').innerHTML = tm('txt_levelUnits');
        document.getElementById('levelBadge').style.background = bg[0];
        showLevelCongrats(tm('txt_lastLevelMessage'));
        return;
    }
    idx++;
    localYupanaController.currentLevel = lvls[idx];
    document.getElementById('levelBadge').innerHTML = tm('txt_level' + lvls[idx].charAt(0).toUpperCase() + lvls[idx].slice(1));
    document.getElementById('levelBadge').style.background = bg[idx];
    startNewExercise();
}

function showLevelCongrats(msg) {
    document.getElementById('stepMessage').innerHTML = '';
    document.getElementById('stepStatus').innerHTML = '';
    document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + msg + '</div>';
    setVis('nextStepBtn', false);
    setVis('nextLevelBtn', false);
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
    var rs = _('resetButton'); if (rs) rs.onclick = function() {
        localYupanaController.finalCongratsShown = false;
        localYupanaController.phase = 0;
        localYupanaController.evalDone = false;
        localYupanaController.expectBorrowRewrite = false;
        localYupanaController.borrowRewriteTargets = {};
        localYupanaController.borrowJustTaken = false;
        localYupanaController.awaitingMovementStep = false;
        localYupanaController.awaitingDigitStep = false;
        localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
        htYupanaStateClear('#yupana1', localYupanaController.state);
        document.getElementById('feedbackArea').innerHTML = '';
        setVis('nextStepBtn', true);
        setVis('nextLevelBtn', true);
        setVis('resetTutorBtn', true);
        showPhase(1);
    };
    var lv = _('nextLevelBtn'); if (lv) lv.onclick = function() { toggleLevel(); };
    var ns = _('nextStepBtn'); if (ns) ns.onclick = function() {
        var p = localYupanaController.phase;
        var a = localYupanaController.currentExercise.a;
        var b = localYupanaController.currentExercise.b;

        if (localYupanaController.awaitingMovementStep) {
            localYupanaController.awaitingMovementStep = false;
            if (localYupanaController.borrowJustTaken) {
                localYupanaController.borrowJustTaken = false;
                var bcol = localYupanaController.evalCol;
                var bdA = getRowRedValue(bcol);
                var bdB = getDigit(localYupanaController.currentExercise.b, bcol);
                showColumnSolve(bcol, bdA, bdB, true);
            } else {
                localYupanaController.evalCol = localYupanaController.evalCol + 1;
                processNextColumn();
            }
            return;
        }

        if (p === 1) {
            var pos1 = localYupanaController.digitPositions[localYupanaController.digitIdx];
            var cv1 = [5,3,2,1], actual1 = 0;
            for (var c1 = 0; c1 < 4; c1++) if (localYupanaController.state.red[pos1][c1]) actual1 += cv1[c1];
            if (actual1 === getDigit(a, pos1)) advanceDigitPhase(1);
        } else if (p === 2) {
            var pos2 = localYupanaController.digitPositions[localYupanaController.digitIdx];
            var cv2 = [5,3,2,1], actual2 = 0;
            for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * localYupanaController.state.blue[pos2][c2];
            if (actual2 === getDigit(b, pos2)) advanceDigitPhase(2);
        }
    };

    _('stepMessage') && (_('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_welcomeMessage'));
    startNewExercise();

    window.htSorobanLoadContent = undefined;
    window.htTriangleLoadContent = undefined;
    window.htLoadExercise = undefined;
    return false;
}
