// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

var localYupanaController = {
    "ROWS": 4,
    "state": null,
    "currentExercise": { first: 0, second: 0, value: 0, times: 0, expected: 0 },
    "currentTotal": 0,
    "currentStep": 0,
    "phase": 0,
    "evalCol": 0,
    "evalCarry": 0,
    "evalDone": false,
    "expectCarryClick": false,
    "awaitingMovementStep": false,
    "awaitingDigitStep": false,
    "carryJustPlaced": false,
    "pendingCarry": false,
    "movementsDone": [],
    "digitPositions": [],
    "digitIdx": 0,
    "finalCongratsShown": false,
    "stepNumber": 0,
    "totalSteps": 0,
    "TextManager": null
};

function getExerciseFromInputs() {
    var first = parseInt($("#ia2yupana0").val(), 10);
    var second = parseInt($("#ia2yupana1").val(), 10);
    if (isNaN(first)) first = 0;
    if (isNaN(second)) second = 0;
    first = Math.max(0, Math.min(9, first));
    second = Math.max(0, Math.min(9, second));
    return {
        first: first,
        second: second,
        value: (second === 0) ? 0 : first,
        times: second,
        expected: first * second
    };
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
    localYupanaController.awaitingDigitStep = false;
    localYupanaController.carryJustPlaced = false;
    localYupanaController.pendingCarry = false;
    var n = getExerciseFromInputs();
    localYupanaController.currentExercise = n;
    localYupanaController.currentTotal = 0;
    localYupanaController.currentStep = 0;
    document.getElementById('problemDisplay').innerHTML = fmt(n.first) + " × " + fmt(n.second);
    document.getElementById('multTable').innerHTML = '';
    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateClear('#yupana1', localYupanaController.state);
    document.getElementById('feedbackArea').innerHTML = '';
    setVis('resetTutorBtn', true);
    showPhase(1);
}

function fmt(n) {
    if (typeof n !== 'number' || isNaN(n)) return '0';
    try { return new Intl.NumberFormat($("#site_language").val()).format(n); }
    catch(e) { return n.toString(); }
}

function tm(id) { var el = document.getElementById(id); return el ? el.innerHTML : id; }

function getA() { return localYupanaController.currentTotal; }
function getB() { return localYupanaController.currentExercise.value; }

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

function countEvaluationSteps(a, b) {
    var count = 0, carry = 0;
    for (var p = 0; p < localYupanaController.ROWS; p++) {
        var dA = getDigit(a, p);
        var dB = getDigit(b, p);
        var total = dA + dB + carry;
        if (dA > 0 || dB > 0) {
            count++;
        }
        if (total >= 10) {
            carry = 1;
            count++;
        } else {
            carry = 0;
        }
    }
    if (carry > 0) count++;
    return count;
}

function computeTotalSteps() {
    var value = localYupanaController.currentExercise.value;
    var times = localYupanaController.currentExercise.times;
    var steps = countDigitSteps(value);
    if (times > 1) steps += countDigitSteps(value);
    for (var k = 1; k < times - 1; k++) {
        steps += countDigitSteps(value);
    }
    for (var k = 1; k < times; k++) {
        steps += countEvaluationSteps(k * value, value);
    }
    return steps;
}

function updateStepStatus() {
    var t = localYupanaController.TextManager;
    document.getElementById('stepStatus').innerHTML = t.get('txt_stepStatus')
        .replace('{current}', localYupanaController.stepNumber)
        .replace('{total}', localYupanaController.totalSteps);
}

function showPhase(p) {
    setVis('resetTutorBtn', true);
    localYupanaController.phase = p;
    var t = localYupanaController.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var value = localYupanaController.currentExercise.value;
    if (p === 1) {
        localYupanaController.digitPositions = getDigitPositions(value);
        localYupanaController.digitIdx = 0;
        localYupanaController.stepNumber = 1;
        localYupanaController.totalSteps = computeTotalSteps();
        updateStepStatus();
        if (localYupanaController.digitPositions.length === 0) {
            showPhase(2);
            return;
        }
        showDigitInstruction(1);
    } else if (p === 2) {
        localYupanaController.digitPositions = getDigitPositions(value);
        localYupanaController.digitIdx = 0;
        updateStepStatus();
        if (localYupanaController.digitPositions.length === 0) {
            showPhase(3);
            return;
        }
        showDigitInstruction(2);
    } else if (p === 5) {
        localYupanaController.digitPositions = getDigitPositions(value);
        localYupanaController.digitIdx = 0;
        updateStepStatus();
        if (localYupanaController.digitPositions.length === 0) {
            showPhase(3);
            return;
        }
        showDigitInstruction(5);
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
    localYupanaController.carryJustPlaced = false;
    setVis('nextStepBtn', false);
    document.getElementById('stepStatus').innerHTML = '';
    processNextColumn();
}

function showDigitInstruction(phase) {
    var t = localYupanaController.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var pos = localYupanaController.digitPositions[localYupanaController.digitIdx];
    var n = localYupanaController.currentExercise.value;
    var key = (phase === 1 || phase === 5) ? 'txt_step1DigitInstruction' : 'txt_step2DigitInstruction';
    localYupanaController.awaitingDigitStep = false;
    document.getElementById('feedbackArea').innerHTML = '';
    document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + t.get(key)
        .replace(/\{step\}/g, localYupanaController.stepNumber)
        .replace(/\{placeName\}/g, getPlaceName(pos))
        .replace(/\{digit\}/g, getDigit(n, pos))
        .replace(/\{value\}/g, n);
    updateStepStatus();
}

function advanceDigitPhase(phase) {
    localYupanaController.digitIdx++;
    if (localYupanaController.digitIdx < localYupanaController.digitPositions.length) {
        localYupanaController.stepNumber++;
        showDigitInstruction(phase);
    } else {
        if (phase === 1) {
            localYupanaController.currentTotal = localYupanaController.currentExercise.value;
            localYupanaController.currentStep = 1;
            appendMultRow();
            localYupanaController.stepNumber++;
            if (localYupanaController.currentStep >= localYupanaController.currentExercise.times) {
                showPhase(4);
            } else {
                showPhase(2);
            }
        } else {
            if (localYupanaController.currentStep >= localYupanaController.currentExercise.times) {
                showPhase(4);
            } else {
                showPhase(3);
            }
        }
    }
}

function appendMultRow() {
    var el = document.getElementById('multTable');
    if (!el) return;
    var value = localYupanaController.currentExercise.value;
    var k = localYupanaController.currentStep;
    var result = localYupanaController.currentTotal;
    var div = document.createElement('div');
    div.className = 'mult-row';
    div.innerHTML = fmt(k) + " × " + fmt(value) + " = <strong>" + fmt(result) + "</strong>";
    el.appendChild(div);
}

function colValue(s, rowIdx) {
    var cv = [5,3,2,1], sum = 0;
    for (var c = 0; c < 4; c++) {
        if (s.red[rowIdx][c]) sum += cv[c];
        sum += cv[c] * s.blue[rowIdx][c];
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
        if (c5 >= 2) { c5 -= 2; moves.push({ name: 'PISQA', op: '5 + 5 = 10' }); }
        else if (c3 >= 2) { c3 -= 2; c1 += 1; c5 += 1; moves.push({ name: 'KIMSA', op: '3 + 3 = 1 + 5' }); }
        else if (c2 >= 2) { c2 -= 2; c1 += 1; c3 += 1; moves.push({ name: 'ISKAY', op: '2 + 2 = 1 + 3' }); }
        else if (c1 >= 5) { c1 -= 5; c5 += 1; moves.push({ name: 'KINKIN', op: '1 + 1 + 1 + 1 + 1 = 5' }); }
        else if (c1 >= 3) { c1 -= 3; c3 += 1; moves.push({ name: 'KINKIN', op: '1 + 1 + 1 = 3' }); }
        else if (c1 >= 2) { c1 -= 2; c2 += 1; moves.push({ name: 'KINKIN', op: '1 + 1 = 2' }); }
        else if (c2 >= 1 && c3 >= 1) { c2 -= 1; c3 -= 1; c5 += 1; moves.push({ name: 'PICHANA', op: '2 + 3 = 5' }); }
        else if (c1 >= 1 && c2 >= 1) { c1 -= 1; c2 -= 1; c3 += 1; moves.push({ name: 'PICHANA', op: '1 + 2 = 3' }); }
        else break;
    }
    return moves;
}

function formatMovements(moves) {
    var names = [];
    for (var i = 0; i < moves.length; i++) {
        var m = moves[i];
        if (typeof m === 'string') {
            names.push(tm('txt_movement' + m));
        } else {
            names.push(tm('txt_movement' + m.name) + " (" + m.op + ")");
        }
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

function processNextColumn() {
    var s = localYupanaController.state;
    var col = localYupanaController.evalCol;
    var carry = localYupanaController.evalCarry;
    var maxC = localYupanaController.ROWS;
    var a = getA();
    var b = getB();

    if (col >= maxC && carry === 0) {
        completeIteration();
        return;
    }

    var dA = getDigit(a, col);
    var dB = getDigit(b, col);
    var total = dA + dB + carry;

    if (dA === 0 && dB === 0 && carry === 0 && col < maxC) {
        localYupanaController.evalCol = col + 1;
        localYupanaController.evalCarry = 0;
        processNextColumn();
        return;
    }

    if (col >= maxC && carry > 0) {
        localYupanaController.stepNumber++;
        updateStepStatus();
        localYupanaController.expectCarryClick = true;
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_carryFinalInstruction').replace(/\{step\}/g, localYupanaController.stepNumber);
        s.gray[col] = [false, false, false, true];
        htYupanaStateRenderCell('#yupana1', s, col, 3);
        return;
    }

    var resultDigit = total >= 10 ? total - 10 : total;

    if (resultDigit === 0) {
        localYupanaController.stepNumber++;
        updateStepStatus();
        localYupanaController.evalDone = false;
        s.red[col] = [false, false, false, false];
        s.blue[col] = [0, 0, 0, 0];
        s.green[col] = [false, false, false, false];
        s.redCarry[col] = [false, false, false, false];
        for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
        localYupanaController.movementsDone = getColumnMovements(dA, dB, carry);
        localYupanaController.pendingCarry = total >= 10;
        localYupanaController.awaitingMovementStep = true;
        var carryTerm = carry > 0 ? " + 1 (" + tm('txt_carrying') + ")" : "";
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_evalZero')
                .replace(/\{step\}/g, localYupanaController.stepNumber)
                .replace(/\{placeName\}/g, getPlaceName(col))
                .replace(/\{digitA\}/g, dA)
                .replace(/\{digitB\}/g, dB + carryTerm)
                .replace(/\{total\}/g, total);
        showMovementsMessage(getPlaceName(col));
        return;
    }

    var carryTerm = carry > 0 ? " + 1 (" + tm('txt_carrying') + ")" : "";
    localYupanaController.stepNumber++;
    updateStepStatus();
    var instr;
    if (total >= 10) {
        instr = tm('txt_evalCarryDigit')
            .replace(/\{step\}/g, localYupanaController.stepNumber)
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB + carryTerm)
            .replace(/\{total\}/g, total)
            .replace(/\{resultDigit\}/g, resultDigit);
    } else {
        instr = tm('txt_evalSimple')
            .replace(/\{step\}/g, localYupanaController.stepNumber)
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB + carryTerm)
            .replace(/\{total\}/g, total)
            .replace(/\{result\}/g, total);
    }
    document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + instr;
    document.getElementById('feedbackArea').innerHTML = '';

    localYupanaController.evalDone = false;
    s.green[col] = [false, false, false, false];
    for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
}

function completeIteration() {
    var value = localYupanaController.currentExercise.value;
    var times = localYupanaController.currentExercise.times;
    localYupanaController.currentTotal = localYupanaController.currentTotal + value;
    localYupanaController.currentStep++;
    appendMultRow();
    if (localYupanaController.currentStep < times) {
        var s = localYupanaController.state;
        for (var i = 0; i < s.rows; i++) {
            s.red[i] = s.green[i].slice();
            s.green[i] = [false, false, false, false];
            s.gray[i] = [false, false, false, false];
            s.blue[i] = [0, 0, 0, 0];
            s.redCarry[i] = [false, false, false, false];
            for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, i, c);
        }
        localYupanaController.stepNumber++;
        showPhase(5);
    } else {
        showPhase(4);
    }
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
        fmt(localYupanaController.currentExercise.first),
        fmt(localYupanaController.currentExercise.second),
        fmt(localYupanaController.currentExercise.expected)) + '</div>';
    document.getElementById('stepMessage').innerHTML = '';
    document.getElementById('stepStatus').innerHTML = '';
    setVis('resetTutorBtn', true);
}

function onCellClick(rowIdx, colIdx) {
    if (localYupanaController.finalCongratsShown) return;
    var s = localYupanaController.state;
    var phase = localYupanaController.phase;
    var n = localYupanaController.currentExercise.value;

    if (phase === 1) {
        var pos1 = localYupanaController.digitPositions[localYupanaController.digitIdx];
        if (rowIdx !== pos1) return;
        if (localYupanaController.awaitingDigitStep) return;
        htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
        var cv1 = [5,3,2,1], actual1 = 0;
        for (var c1 = 0; c1 < 4; c1++) if (s.red[rowIdx][c1]) actual1 += cv1[c1];
        if (actual1 === getDigit(n, pos1)) {
            localYupanaController.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 2 || phase === 5) {
        var pos2 = localYupanaController.digitPositions[localYupanaController.digitIdx];
        if (rowIdx !== pos2) return;
        if (localYupanaController.awaitingDigitStep) return;
        s.blue[rowIdx][colIdx] = s.blue[rowIdx][colIdx] ? 0 : 1;
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
        var cv2 = [5,3,2,1], actual2 = 0;
        for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * s.blue[rowIdx][c2];
        if (actual2 === getDigit(n, pos2)) {
            localYupanaController.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 3) {
        // User is resolving a column
        var col = localYupanaController.evalCol;
        var carry = localYupanaController.evalCarry;
        var a = getA();
        var b = getB();
        var dA = getDigit(a, col);
        var dB = getDigit(b, col);
        var total = dA + dB + carry;

        if (localYupanaController.expectCarryClick) {
            // User clicking to confirm carry
            if (s.gray[rowIdx] && s.gray[rowIdx][colIdx]) {
                s.gray[rowIdx][colIdx] = false;
                s.redCarry[rowIdx][colIdx] = true;
                htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
                localYupanaController.expectCarryClick = false;
                localYupanaController.awaitingMovementStep = true;
                localYupanaController.pendingCarry = false;
                localYupanaController.carryJustPlaced = true;
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

function htFillWriteTableBody(tableId, horizontalVector, verticalVector, productVector) {
    const $tableElement = $(tableId);

    var totalRows = productVector.length;
    var rowspan = totalRows + 1;
    var horizontalLength = horizontalVector.length;
    var verticalLength = verticalVector.length;
    var productRC = horizontalLength * verticalLength ;
    var horizontalIdx = 0; 
    var productIdx = 0; 
    var colors = [ "lightyellow", "lightgreen", "lightgray", "#FFA8B5", "E48E65" ];
    var initialColorIdx = 0;
    for (let i = 0; productIdx < totalRows; i++) {
        var row = "<tr>";
        if (i == 0) {
            for (let j = 0 ; j < verticalLength; j++) {
                row += "<td style=\"background-color: lightblue\"><img id=\"imgres0"+j+"\" onclick=\"htImageZoom('imgres0"+j+"', '0%')\" src=\"images/HistoryTracers/Maya_"+verticalVector[j]+".png\" /></td>";
            }
            row += "<td style=\"background-color: lightblue\" rowspan=\""+rowspan+"\"> = </td><td style=\"background-color: lightblue\">&nbsp;</td></tr>";
            $tableElement.append(row);
            var idx = 0;
            if (horizontalLength != totalRows) {
                for (let w =  horizontalLength; w < totalRows; w++) {
                    row = "<tr><td style=\"background-color: lightblue\">&nbsp;</td>";
                    for (let j = 0 ; j < verticalLength; j++) {
                        row += (j == 0) ? "<td style=\"background-color: "+colors[0]+"\"><img class=\"imgAddProd\" id=\"addprod"+productIdx+"\" onclick=\"htImageZoom('imgprod"+productIdx+"', '0%')\" src=\"\" /></td>": "<td>&nbsp;</td>";
                    }
                    row += htAddTDtoGradeTable(i*1000, rowspan++, productVector[productIdx], -1, "background-color: "+colors[idx], true);
                    row += "</tr>";
                    productIdx++;

                    if (totalRows == 5) {
                        if ( (horizontalLength == 3 && verticalLength == 3) || ((horizontalLength != 3 || verticalLength != 3) && w != horizontalLength)) {
                            idx++;
                        }
                    } else if (totalRows == 4 && (horizontalLength == 3 || verticalLength == 3)) {
                        idx++;
                    }

                    $tableElement.append(row);
                }
            }
            if (totalRows == 5) {
                if ((horizontalLength != 3 || verticalLength != 3) && (horizontalLength == 2 || verticalLength == 2)) { 
                    local.initialColorChange = 1;
                }
            } else if (totalRows == 4) {
                local.initialColorChange = (horizontalLength == 3 || verticalLength == 3) ? 0 : 1;
            } else if (totalRows == 3 && (horizontalLength == 1 || verticalLength == 1)) {
                local.initialColorChange = 1;
            }
            continue;
        }

        var currentHorizontal = horizontalVector[horizontalIdx]; 
        row += htAddTDtoGradeTable(i*1000, rowspan++, currentHorizontal, -1, "background-color: lightblue", true);

        var currentColorIdx = initialColorIdx;
        for (let j = 0 ; j < verticalLength; j++) {
            var currentTotal = currentHorizontal*verticalVector[j];
            var additional = -1;
            if (currentTotal > 19) {
                currentTotal = currentHorizontal;
                additional = verticalVector[j];
            }
            row += htAddTDtoGradeTable(i*100, rowspan++, currentTotal, additional, "background-color: "+colors[currentColorIdx], false);
            currentColorIdx++;
        }
        row += htAddTDtoGradeTable(i*10, rowspan++, productVector[productIdx], -1, "background-color: "+colors[currentColorIdx - 1], true);
        row += "</tr>";
        initialColorIdx++;
        $tableElement.append(row);

        horizontalIdx++;
        productIdx++;
    }
}

function htFillCalcTable6481070f0 (tableId) {
    const $tableElement = $(tableId);

    if ($tableElement.length === 0) {
        return;
    }
    $tableElement.empty();
    local.initialColorChange = 0;

    var first = parseInt($("#firstV").val());
    local.firstVector = htMesoamericanNumberOrder(first);

    var second = parseInt($("#secondV").val());
    local.secondVector = htMesoamericanNumberOrder(second);

    htFillWriteMesoTableHeader(tableId, local.secondVector);

    var product = first * second;
    local.mayaProductVector = htMesoamericanNumberOrder(product);
    $("#thirdV").val(product);

    if (local.firstVector.length > 1) {
        local.firstVector.reverse();
    }

    if (local.secondVector.length > 1) {
        local.secondVector.reverse();
    }

    if (local.mayaProductVector.length > 1) {
        local.mayaProductVector.reverse();
    }


    htFillWriteTableBody(tableId, local.firstVector, local.secondVector, local.mayaProductVector);
}

function htChangeCleanUnused() {
        $(".imgAdd").each(function(index, element) {
            $(this).remove();
        });

        $(".timesAdd").each(function(index, element) {
            $(this).remove();
        });
}

function htChangeCalcTable6481070f0 (tableId) {
    const $tableElement = $(tableId);

    if ($tableElement.length === 0) {
        return;
    }

    if (local.mayaProductVector.length == 0) {
        return;
    }

    var verticalLength = local.secondVector.length;
    var horizontalLength = local.firstVector.length;
    var productLength = local.mayaProductVector.length;
    if (horizontalLength == 1 && verticalLength == 1 && productLength > 1) {
        htChangeCleanUnused();

        $($(".imgAddProd").get().reverse()).each(function(index, element) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+local.mayaProductVector[0]+".png");
        });

        $(".resChanged").each(function(index, element) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+local.mayaProductVector[1]+".png");
        });
        return;
    }

    htChangeCleanUnused();

    var verticalLengthP1 = local.secondVector.length + 1;
    var productIdx = local.initialColorChange;
    var cell = 1;
    var row = 2;

    var additional = productIdx - 1;
    $($(".imgAddProd").get().reverse()).each(function(index, element) {
        if (additional < 0) { 
                htSetImageSrc("imgl10000", "images/HistoryTracers/Maya_4.png");
    return false;
        }

        $(this).attr("src", "images/HistoryTracers/Maya_"+local.mayaProductVector[additional]+".png");
        additional--;
    });

    
    var test = (horizontalLength == 1 && verticalLength == 1 && productLength > 1);
    $(".resChanged").each(function(index, element) {
        if (test) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+local.mayaProductVector[index]+".png");
        } else {
            if (index < verticalLength ) {
                $(this).attr("src", "images/HistoryTracers/Maya_"+local.mayaProductVector[productIdx]+".png");
                productIdx++;
            } else {
                if ( (cell % verticalLength) == 0) {
                    $(this).attr("src", "images/HistoryTracers/Maya_"+local.mayaProductVector[productIdx]+".png");
                    productIdx++;
                    row++;
                } else {
                    $(this).attr("src", "images/HistoryTracers/Maya_0.png");
                }
                if (productIdx >= productLength) {
                        htSetImageSrc("imgl10000", "images/HistoryTracers/Maya_4.png");
    return false;
                }
            }
            cell++;
        }
    });
}

function htLoadExercise() {
    if (local.answerVector == undefined) {
        local.answerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(local.answerVector);
    }
}

function htLoadContent() {
    local = { "lValues": [], "rValues": [], "mayaProductVector": [], "firstVector": [], "secondVector": [], "answerVector": undefined, "currentExampleIdx": 0, "initialColorChange": 0 }; 

    htWriteNavigation();

    localYupanaController.TextManager = {
        get: tm,
        format: function(t, d) {
            for (var k in d) { if(d.hasOwnProperty(k)) { var v=d[k]; if(v===undefined||v===null)v=''; t=t.replace(new RegExp('\\{'+k+'\\}','g'),v); } }
            return t;
        },
        getPerfectMessage: function(v,t,r) { return this.format(tm('txt_perfectMessage'),{value:v,times:t,result:r}); }
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

    $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
    });

    var _ = function(id) { return document.getElementById(id); };
    var ex = _('resetTutorBtn'); if (ex) ex.onclick = function() { startNewExercise(); };
    var rs = _('resetButton'); if (rs) rs.onclick = function() {
        localYupanaController.finalCongratsShown = false;
        localYupanaController.phase = 0;
        localYupanaController.evalDone = false;
        localYupanaController.expectCarryClick = false;
        localYupanaController.awaitingMovementStep = false;
        localYupanaController.awaitingDigitStep = false;
        localYupanaController.carryJustPlaced = false;
        localYupanaController.pendingCarry = false;
        localYupanaController.currentTotal = 0;
        localYupanaController.currentStep = 0;
        document.getElementById('multTable').innerHTML = '';
        localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
        htYupanaStateClear('#yupana1', localYupanaController.state);
        document.getElementById('feedbackArea').innerHTML = '';
        setVis('nextStepBtn', true);
        setVis('resetTutorBtn', true);
        showPhase(1);
    };
    var ns = _('nextStepBtn'); if (ns) ns.onclick = function() {
        var p = localYupanaController.phase;
        var s = localYupanaController.state;
        var n = localYupanaController.currentExercise.value;

        if (localYupanaController.awaitingMovementStep) {
            localYupanaController.awaitingMovementStep = false;
            if (localYupanaController.pendingCarry) {
                var col = localYupanaController.evalCol;
                localYupanaController.pendingCarry = false;
                localYupanaController.expectCarryClick = true;
                localYupanaController.stepNumber++;
                updateStepStatus();
                var nextCol = col + 1;
                s.gray[nextCol] = [false, false, false, true];
                htYupanaStateRenderCell('#yupana1', s, nextCol, 3);
                document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
                    tm('txt_carryFinalInstruction').replace(/\{step\}/g, localYupanaController.stepNumber);
                document.getElementById('feedbackArea').innerHTML = '';
                setVis('nextStepBtn', false);
            } else {
                localYupanaController.evalCarry = localYupanaController.carryJustPlaced ? 1 : 0;
                localYupanaController.carryJustPlaced = false;
                localYupanaController.evalCol = localYupanaController.evalCol + 1;
                processNextColumn();
            }
            return;
        }

        if (p === 1) {
            var pos1 = localYupanaController.digitPositions[localYupanaController.digitIdx];
            var cv1 = [5,3,2,1], actual1 = 0;
            for (var c1 = 0; c1 < 4; c1++) if (s.red[pos1][c1]) actual1 += cv1[c1];
            if (actual1 === getDigit(n, pos1)) advanceDigitPhase(1);
        } else if (p === 2 || p === 5) {
            var pos2 = localYupanaController.digitPositions[localYupanaController.digitIdx];
            var cv2 = [5,3,2,1], actual2 = 0;
            for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * s.blue[pos2][c2];
            if (actual2 === getDigit(n, pos2)) advanceDigitPhase(p);
        }
    };

    _('stepMessage') && (_('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_welcomeMessage'));
    startNewExercise();

    $('.ordercheck').change(function(){
        var id = $(this).attr("id");
        if (id == undefined) {
            return;
        }

        if ($(this).is(':checked')) {
            htSetMultColors("multexample1", "red", id);
        } else {
            htSetMultColors("multexample1", "black", id);
        }
    });

    $("#traineeUp3").on("click", function() {
        if (local.currentExampleIdx >= 4) {
            local.currentExampleIdx = 0;
        }

        $("#imgm"+local.currentExampleIdx).attr("src", "images/HistoryTracers/Maya_2.png");
        local.currentExampleIdx++;
    });

    // Clearing an <img> with src="" does not repaint in the viewer's WebKit
    // (the old glyph stays on screen until an unrelated repaint), so use a
    // transparent 1x1 image to reliably clear the cell in all browsers.
    var blankImg = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    $("#traineeDown3").addClass("htResetHit").on("click", function() {
        for (let i = 0; i < 4; i++) {
            $("#imgm"+i).attr("src", blankImg);
        }
        $("#imgm0").attr("src", "images/HistoryTracers/Maya_2.png");
        local.currentExampleIdx = 1;
    });

    $("#firstV").on("keyup", function() {
        var val = $(this).val();
        if (val > 999) {
            $(this).val(999);
        } else if (val < 0) {
            $(this).val(0);
        }
    });

    $("#secondV").on("keyup", function() {
        var val = $(this).val();
        if (val > 999) {
            $(this).val(999);
        } else if (val < 0) {
            $(this).val(0);
        }
    });

    $("#equalCalc").on("click", function() {
        htFillCalcTable6481070f0 ("#calcGrid");
    });

    $("#changeResult").on("click", function() {
        htChangeCalcTable6481070f0 ("#calcGrid");
    });

    htFillCalcTable6481070f0 ("#calcGrid");

    htSetImageSrc("imgMA", "images/Mapswire/mapswire-continent_na-printable-map-north-america-robinson-269_mesoamerica2.jpg");
    htSetImageSrc("imgl0", "images/HistoryTracers/Maya_1.png");
    htSetImageSrc("imgl1", "images/HistoryTracers/Maya_1.png");
    htSetImageSrc("imgl00", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgl10", "images/HistoryTracers/Maya_1.png");
    htSetImageSrc("imgl100", "images/HistoryTracers/Maya_1.png");
    htSetImageSrc("imgl000", "images/HistoryTracers/Maya_1.png");
    htSetImageSrc("imgl00000", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgl10000", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgm0", "images/HistoryTracers/Maya_2.png");
    local.currentExampleIdx = 1;
    htSetImageSrc("imgm000", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgm100", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgm200", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgm300", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgt0", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgt1", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgt00", "images/HistoryTracers/Maya_4.png");
    htSetImageSrc("imgt10", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgt000", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgt100", "images/HistoryTracers/Maya_2.png");
        htSetImageSrc("imgl10000", "images/HistoryTracers/Maya_4.png");
    return false;
}

function htCheckAnswers()
{
    if (local.answerVector != undefined) {
        for (let i = 0; i < local.answerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, local.answerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}
