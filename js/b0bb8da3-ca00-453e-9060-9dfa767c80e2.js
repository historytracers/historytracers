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
    "awaitingMovementStep": false,
    "pendingCarry": false,
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
    localYupanaController.awaitingMovementStep = false;
    localYupanaController.pendingCarry = false;
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
    localYupanaController.evalCarry = 0;
    localYupanaController.evalDone = false;
    localYupanaController.expectCarryClick = false;
    localYupanaController.awaitingMovementStep = false;
    localYupanaController.pendingCarry = false;
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
    document.getElementById('stepMessage').innerHTML = t.get('txt_stepPrefix') + " " + t.get(key)
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

function colValue(s, rowIdx) {
    var cv = [5,3,2,1], sum = 0;
    for (var c = 0; c < 4; c++) {
        if (s.red[rowIdx][c]) sum += cv[c];
        if (s.blue[rowIdx][c]) sum += cv[c];
    }
    return sum;
}

function getColumnMovements(dA, dB, carry) {
    var c1 = 0, c2 = 0, c3 = 0, c5 = 0;
    function add(v) { if (v === 5) c5++; else if (v === 3) c3++; else if (v === 2) c2++; else if (v === 1) c1++; }
    function addDigit(v) {
        if (v === 1) add(1);
        else if (v === 2) add(2);
        else if (v === 3) add(3);
        else if (v === 4) { add(3); add(1); }
        else if (v === 5) add(5);
        else if (v === 6) { add(5); add(1); }
        else if (v === 7) { add(5); add(2); }
        else if (v === 8) { add(5); add(3); }
        else if (v === 9) { add(5); add(3); add(1); }
    }
    addDigit(dA); addDigit(dB); if (carry > 0) add(1);
    var moves = [], guard = 0;
    while (guard++ < 50) {
        if (c5 >= 2) { c5 -= 2; moves.push('PISQA'); }
        else if (c3 >= 2) { c3 -= 2; c1 += 1; c5 += 1; moves.push('KIMSA'); }
        else if (c2 >= 2) { c2 -= 2; c1 += 1; c3 += 1; moves.push('ISKAY'); }
        else if (c1 >= 5) { c1 -= 5; c5 += 1; moves.push('KINKIN'); }
        else if (c1 >= 3) { c1 -= 3; c3 += 1; moves.push('KINKIN'); }
        else if (c1 >= 2) { c1 -= 2; c2 += 1; moves.push('KINKIN'); }
        else if (c2 >= 1 && c3 >= 1) { c2 -= 1; c3 -= 1; c5 += 1; moves.push('PICHANA'); }
        else if (c1 >= 1 && c2 >= 1) { c1 -= 1; c2 -= 1; c3 += 1; moves.push('PICHANA'); }
        else break;
    }
    return moves;
}

function formatMovements(moves) {
    var names = [];
    for (var i = 0; i < moves.length; i++) names.push(tm('txt_movement' + moves[i]));
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
        instr = tm('txt_evalCarryDigit')
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB)
            .replace(/\{total\}/g, total)
            .replace(/\{resultDigit\}/g, resultDigit);
    } else {
        instr = tm('txt_evalSimple')
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB)
            .replace(/\{total\}/g, total)
            .replace(/\{result\}/g, total);
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
        var pos1 = localYupanaController.digitPositions[localYupanaController.digitIdx];
        if (rowIdx !== pos1) return;
        htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
        var cv1 = [5,3,2,1], actual1 = 0;
        for (var c1 = 0; c1 < 4; c1++) if (s.red[rowIdx][c1]) actual1 += cv1[c1];
        if (actual1 === getDigit(localYupanaController.currentExercise.a, pos1)) {
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 2) {
        var pos2 = localYupanaController.digitPositions[localYupanaController.digitIdx];
        if (rowIdx !== pos2) return;
        if (s.blue[rowIdx][colIdx]) {
            s.blue[rowIdx][colIdx] = false;
        } else {
            s.blue[rowIdx][colIdx] = true;
        }
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
        var cv2 = [5,3,2,1], actual2 = 0;
        for (var c2 = 0; c2 < 4; c2++) if (s.blue[rowIdx][c2]) actual2 += cv2[c2];
        if (actual2 === getDigit(localYupanaController.currentExercise.b, pos2)) {
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
                localYupanaController.awaitingMovementStep = true;
                localYupanaController.pendingCarry = false;
                localYupanaController.movementsDone = ['PISQA'];
                document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' +
                    tm('txt_carryConfirmMessage')
                        .replace(/\{nextPlace\}/g, getPlaceName(rowIdx))
                        .replace(/\{movements\}/g, formatMovements(['PISQA'])) +
                    '</div>';
                setVis('nextStepBtn', true);
            }
            return;
        }

        if (localYupanaController.awaitingMovementStep) return;

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
            htYupanaRowSetGreen('#yupana1', s, col, need);
            localYupanaController.movementsDone = getColumnMovements(dA, dB, carry);
            localYupanaController.pendingCarry = total >= 10;
            localYupanaController.awaitingMovementStep = true;
            showMovementsMessage(getPlaceName(col));
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
    var rs = _('resetButton'); if (rs) rs.onclick = function() {
        localYupanaController.finalCongratsShown = false;
        localYupanaController.phase = 0;
        localYupanaController.evalDone = false;
        localYupanaController.expectCarryClick = false;
        localYupanaController.awaitingMovementStep = false;
        localYupanaController.pendingCarry = false;
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
        var s = localYupanaController.state;
        var a = localYupanaController.currentExercise.a;
        var b = localYupanaController.currentExercise.b;

        if (localYupanaController.awaitingMovementStep) {
            localYupanaController.awaitingMovementStep = false;
            if (localYupanaController.pendingCarry) {
                var col = localYupanaController.evalCol;
                localYupanaController.pendingCarry = false;
                localYupanaController.expectCarryClick = true;
                var nextCol = col + 1;
                s.gray[nextCol] = [false, false, false, true];
                htYupanaStateRenderCell('#yupana1', s, nextCol, 3);
                document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_carryFinalInstruction');
                document.getElementById('feedbackArea').innerHTML = '';
                setVis('nextStepBtn', false);
            } else {
                localYupanaController.evalCarry = 0;
                localYupanaController.evalCol = localYupanaController.evalCol + 1;
                processNextColumn();
            }
            return;
        }

        if (p === 1) {
            var pos1 = localYupanaController.digitPositions[localYupanaController.digitIdx];
            var cv1 = [5,3,2,1], actual1 = 0;
            for (var c1 = 0; c1 < 4; c1++) if (s.red[pos1][c1]) actual1 += cv1[c1];
            if (actual1 === getDigit(a, pos1)) advanceDigitPhase(1);
        } else if (p === 2) {
            var pos2 = localYupanaController.digitPositions[localYupanaController.digitIdx];
            var cv2 = [5,3,2,1], actual2 = 0;
            for (var c2 = 0; c2 < 4; c2++) if (s.blue[pos2][c2]) actual2 += cv2[c2];
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
