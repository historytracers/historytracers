// SPDX-License-Identifier: GPL-3.0-or-later

var rValues = [];
var lValues = [];

var rValues2 = [];
var lValues2 = [];

var leftbe2d7ec9 = 0;
var rightbe2d7ec9 = 0;
var inverseSelectedbe2d7ec9 = "0";

var mayaProductVector = [];
var firstVector = [];
var secondVector = [];

var localAnswerVectorbe2d7ec9 = undefined;
var currentExampleIdx = 0;
var initialColorChange = 0;


function htUpdateYupanabe2d7ec9(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana0', 2);
    rvalues2 = htFillYupanaDecimalValues('#yupana0', lv, 2, 'red_dot_right_up');
    lvalues2 = htFillYupanaDecimalValues('#yupana0', rv, 2, 'blue_dot_right_bottom');

    $("#rightHandImg3").attr("src", "images/HistoryTracers/"+lv+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", "images/HistoryTracers/"+rv+"Left_Hand_Small.png");
}

function htUpdateValuesbe2d7ec9(left, right) {
    leftbe2d7ec9 = left;
    rightbe2d7ec9 = right;

    if (left == 10 && right == 0) {
        left = 5;
        right = 5;
    }
    $("#rightHandImg3").attr("src", "images/HistoryTracers/"+right+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", "images/HistoryTracers/"+left+"Left_Hand_Small.png");
}

function htResetValuesbe2d7ec9() {
    if (yupanaSelected == "-1") {
        return;
    }

    if (yupanaSelected == "0") {
        htUpdateValuesbe2d7ec9(2, 2);
    } else if (yupanaSelected == "1") {
        htUpdateValuesbe2d7ec9(3, 3);
    } else if (yupanaSelected == "2") {
        htUpdateValuesbe2d7ec9(5, 5);
    } else if (yupanaSelected == "3") {
        htUpdateValuesbe2d7ec9(1, 2);
    } else if (yupanaSelected == "4") {
        htUpdateValuesbe2d7ec9(1, 1);
    }
}

function htSetValuesbe2d7ec9() {
    if (yupanaSelected == "-1") {
        return;
    }

    if (yupanaSelected == "0") {
        htUpdateValuesbe2d7ec9(3, 1);
    } else if (yupanaSelected == "1") {
        htUpdateValuesbe2d7ec9(5, 1);
    } else if (yupanaSelected == "2") {
        htUpdateValuesbe2d7ec9(10, 0);
    } else if (yupanaSelected == "3") {
        htUpdateValuesbe2d7ec9(3, 0);
    } else if (yupanaSelected == "4") {
        htUpdateValuesbe2d7ec9(2, 0);
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
                    initialColorChange = 1;
                }
            } else if (totalRows == 4) {
                initialColorChange = (horizontalLength == 3 || verticalLength == 3) ? 0 : 1;
            } else if (totalRows == 3 && (horizontalLength == 1 || verticalLength == 1)) {
                initialColorChange = 1;
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
    initialColorChange = 0;

    var first = parseInt($("#firstV").val());
    firstVector = htMesoamericanNumberOrder(first);

    var second = parseInt($("#secondV").val());
    secondVector = htMesoamericanNumberOrder(second);

    htFillWriteMesoTableHeader(tableId, secondVector);

    var product = first * second;
    mayaProductVector = htMesoamericanNumberOrder(product);
    $("#thirdV").val(product);

    if (firstVector.length > 1) {
        firstVector.reverse();
    }

    if (secondVector.length > 1) {
        secondVector.reverse();
    }

    if (mayaProductVector.length > 1) {
        mayaProductVector.reverse();
    }


    htFillWriteTableBody(tableId, firstVector, secondVector, mayaProductVector);
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

    if (mayaProductVector.length == 0) {
        return;
    }

    var verticalLength = secondVector.length;
    var horizontalLength = firstVector.length;
    var productLength = mayaProductVector.length;
    if (horizontalLength == 1 && verticalLength == 1 && productLength > 1) {
        htChangeCleanUnused();

        $($(".imgAddProd").get().reverse()).each(function(index, element) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[0]+".png");
        });

        $(".resChanged").each(function(index, element) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[1]+".png");
        });
        return;
    }

    htChangeCleanUnused();

    var verticalLengthP1 = secondVector.length + 1;
    var productIdx = initialColorChange;
    var cell = 1;
    var row = 2;

    var additional = productIdx - 1;
    $($(".imgAddProd").get().reverse()).each(function(index, element) {
        if (additional < 0) { 
            return false;
        }

        $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[additional]+".png");
        additional--;
    });

    
    var test = (horizontalLength == 1 && verticalLength == 1 && productLength > 1);
    $(".resChanged").each(function(index, element) {
        if (test) {
            $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[index]+".png");
        } else {
            if (index < verticalLength ) {
                $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[productIdx]+".png");
                productIdx++;
            } else {
                if ( (cell % verticalLength) == 0) {
                    $(this).attr("src", "images/HistoryTracers/Maya_"+mayaProductVector[productIdx]+".png");
                    productIdx++;
                    row++;
                } else {
                    $(this).attr("src", "images/HistoryTracers/Maya_0.png");
                }
                if (productIdx >= productLength) {
                    return false;
                }
            }
            cell++;
        }
    });
}


function htUpdateInverseHandsbe2d7ec9(left, right) {
    $("#rightHandImg4").attr("src", "images/HistoryTracers/"+right+"Right_Hand_Small.png");
    $("#leftHandImg4").attr("src", "images/HistoryTracers/"+left+"Left_Hand_Small.png");
}

function htResetInverseValuesbe2d7ec9() {
    htCleanYupanaDecimalValues('#yupana2');

    if (inverseSelectedbe2d7ec9 == "0") {
        // Inverse ISKAY: 3 - 1 = 2
        htUpdateInverseHandsbe2d7ec9(3, 1);
        htFillYupanaDecimalValues('#yupana2', 3, 2, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana2', 1, 2, 'blue_dot_right_bottom');
    } else if (inverseSelectedbe2d7ec9 == "1") {
        // Inverse KIMSA: 5 - 1 = 4
        htUpdateInverseHandsbe2d7ec9(5, 1);
        htFillYupanaDecimalValues('#yupana2', 5, 2, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana2', 1, 2, 'blue_dot_right_bottom');
    } else if (inverseSelectedbe2d7ec9 == "2") {
        // Inverse PISQA: 10 - 5 = 5
        htUpdateInverseHandsbe2d7ec9(1, 5);
        htFillYupanaDecimalValues('#yupana2', 10, 2, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana2', 5, 2, 'blue_dot_right_bottom');
    } else if (inverseSelectedbe2d7ec9 == "3") {
        // Inverse PICHANA: 3 - 2 = 1
        htUpdateInverseHandsbe2d7ec9(3, 2);
        htFillYupanaDecimalValues('#yupana2', 3, 2, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana2', 2, 2, 'blue_dot_right_bottom');
    } else if (inverseSelectedbe2d7ec9 == "4") {
        // Inverse KINKIN: two unit markers (1 + 1), one red and one blue
        htUpdateInverseHandsbe2d7ec9(1, 1);
        htFillYupanaDecimalValues('#yupana2', 1, 2, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana2', 1, 2, 'blue_dot_right_bottom');
    }
}

function htSetInverseValuesbe2d7ec9() {
    htCleanYupanaDecimalValues('#yupana2');

    if (inverseSelectedbe2d7ec9 == "0") {
        // Inverse ISKAY: 3 - 1 = 2
        htUpdateInverseHandsbe2d7ec9(2, 0);
        htFillYupanaDecimalValues('#yupana2', 2, 2, 'red_dot_right_up');
    } else if (inverseSelectedbe2d7ec9 == "1") {
        // Inverse KIMSA: 5 - 1 = 4
        htUpdateInverseHandsbe2d7ec9(4, 0);
        htFillYupanaDecimalValues('#yupana2', 4, 2, 'red_dot_right_up');
    } else if (inverseSelectedbe2d7ec9 == "2") {
        // Inverse PISQA: 10 - 5 = 5
        htUpdateInverseHandsbe2d7ec9(5, 0);
        htFillYupanaDecimalValues('#yupana2', 5, 2, 'red_dot_right_up');
    } else if (inverseSelectedbe2d7ec9 == "3") {
        // Inverse PICHANA: 3 - 2 = 1
        htUpdateInverseHandsbe2d7ec9(1, 0);
        htFillYupanaDecimalValues('#yupana2', 1, 2, 'red_dot_right_up');
    } else if (inverseSelectedbe2d7ec9 == "4") {
        // Inverse KINKIN: the two unit markers cancel out (1 + 1 -> 0, no markers)
        htUpdateInverseHandsbe2d7ec9(0, 0);
    }
}

(function() {
"use strict";

// SPDX-License-Identifier: GPL-3.0-or-later

var controller = {
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

function generateRandomNumbersByLevel() {
    var l = controller.currentLevel;
    if (l === "units") return { a: rand(10), b: rand(10) };
    if (l === "tens") return { a: rand(90)+10, b: rand(90)+10 };
    return { a: rand(900)+100, b: rand(900)+100 };
    function rand(m) { return Math.floor(Math.random() * m); }
}

function setVis(id, show) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !show);
}

function startNewExercise() {
    controller.finalCongratsShown = false;
    controller.phase = 0;
    controller.evalCol = 0;
    controller.evalCarry = 0;
    controller.evalDone = false;
    controller.expectCarryClick = false;
    controller.awaitingMovementStep = false;
    controller.awaitingDigitStep = false;
    controller.carryJustPlaced = false;
    controller.pendingCarry = false;
    var n = generateRandomNumbersByLevel();
    controller.currentExercise = { a: n.a, b: n.b, expected: n.a + n.b };
    document.getElementById('problemDisplay').innerHTML = fmt(n.a) + " + " + fmt(n.b);
    controller.state = htYupanaNewState(controller.ROWS);
    htYupanaStateClear('#yupana1', controller.state);
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

function tm(id) { var el = document.getElementById('add_' + id); return el ? el.innerHTML : id; }

function countEvaluationSteps() {
    var a = controller.currentExercise.a;
    var b = controller.currentExercise.b;
    var count = 0, carry = 0;
    for (var p = 0; p < controller.ROWS; p++) {
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

function updateStepStatus() {
    var t = controller.TextManager;
    document.getElementById('stepStatus').innerHTML = t.get('txt_stepStatus')
        .replace('{current}', controller.stepNumber)
        .replace('{total}', controller.totalSteps);
}

function showPhase(p) {
    setVis('nextLevelBtn', true);
    setVis('resetTutorBtn', true);
    controller.phase = p;
    var t = controller.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var a = controller.currentExercise.a;
    var b = controller.currentExercise.b;
    if (p === 1) {
        controller.digitPositions = getDigitPositions(a);
        controller.digitIdx = 0;
        controller.stepNumber = 1;
        controller.totalSteps = countDigitSteps(a) + countDigitSteps(b) + countEvaluationSteps();
        updateStepStatus();
        if (controller.digitPositions.length === 0) {
            showPhase(2);
            return;
        }
        showDigitInstruction(1);
    } else if (p === 2) {
        controller.digitPositions = getDigitPositions(b);
        controller.digitIdx = 0;
        controller.stepNumber = countDigitSteps(a) + 1;
        updateStepStatus();
        if (controller.digitPositions.length === 0) {
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
    controller.evalCol = 0;
    controller.evalCarry = 0;
    controller.evalDone = false;
    controller.expectCarryClick = false;
    controller.awaitingMovementStep = false;
    controller.pendingCarry = false;
    controller.carryJustPlaced = false;
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
    var t = controller.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var pos = controller.digitPositions[controller.digitIdx];
    var n = (phase === 1) ? controller.currentExercise.a : controller.currentExercise.b;
    var key = (phase === 1) ? 'txt_step1DigitInstruction' : 'txt_step2DigitInstruction';
    controller.awaitingDigitStep = false;
    document.getElementById('feedbackArea').innerHTML = '';
    document.getElementById('stepMessage').innerHTML = t.get('txt_stepPrefix') + " " + t.get(key)
        .replace(/\{step\}/g, controller.stepNumber)
        .replace(/\{placeName\}/g, getPlaceName(pos))
        .replace(/\{digit\}/g, getDigit(n, pos));
    updateStepStatus();
}

function advanceDigitPhase(phase) {
    controller.digitIdx++;
    if (controller.digitIdx < controller.digitPositions.length) {
        controller.stepNumber++;
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
    var moves = controller.movementsDone;
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
    var s = controller.state;
    var col = controller.evalCol;
    var carry = controller.evalCarry;
    var maxC = controller.ROWS;

    if (col >= maxC && carry === 0) {
        showPhase(4);
        return;
    }

    var dA = getDigit(controller.currentExercise.a, col);
    var dB = getDigit(controller.currentExercise.b, col);
    var total = dA + dB + carry;

    if (dA === 0 && dB === 0 && col < maxC) {
        controller.evalCol = col + 1;
        controller.evalCarry = 0;
        processNextColumn();
        return;
    }

    if (col >= maxC && carry > 0) {
        controller.expectCarryClick = true;
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_carryFinalInstruction');
        s.gray[col] = [false, false, false, true];
        htYupanaStateRenderCell('#yupana1', s, col, 3);
        return;
    }

    var resultDigit = total >= 10 ? total - 10 : total;

    if (resultDigit === 0) {
        controller.stepNumber++;
        updateStepStatus();
        controller.evalDone = false;
        s.red[col] = [false, false, false, false];
        s.blue[col] = [0, 0, 0, 0];
        s.green[col] = [false, false, false, false];
        for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
        controller.movementsDone = getColumnMovements(dA, dB, carry);
        controller.pendingCarry = total >= 10;
        controller.awaitingMovementStep = true;
        var carryTerm = carry > 0 ? " + 1 (" + tm('txt_carrying') + ")" : "";
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_evalZero')
                .replace(/\{placeName\}/g, getPlaceName(col))
                .replace(/\{digitA\}/g, dA)
                .replace(/\{digitB\}/g, dB + carryTerm)
                .replace(/\{total\}/g, total);
        showMovementsMessage(getPlaceName(col));
        return;
    }

    var carryTerm = carry > 0 ? " + 1 (" + tm('txt_carrying') + ")" : "";
    var instr;
    if (total >= 10) {
        instr = tm('txt_evalCarryDigit')
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB + carryTerm)
            .replace(/\{total\}/g, total)
            .replace(/\{resultDigit\}/g, resultDigit);
    } else {
        instr = tm('txt_evalSimple')
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB + carryTerm)
            .replace(/\{total\}/g, total)
            .replace(/\{result\}/g, total);
    }
    document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + instr;
    document.getElementById('feedbackArea').innerHTML = '';

    controller.stepNumber++;
    updateStepStatus();
    controller.evalDone = false;
    s.green[col] = [false, false, false, false];
    for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
}

function getPlaceName(idx) {
    var names = [tm('txt_units'), tm('txt_tens'), tm('txt_hundreds'), tm('txt_thousands')];
    return idx < names.length ? names[idx] : tm('txt_next');
}

function showCongratulations() {
    controller.finalCongratsShown = true;
    htYupanaStateDrawGreen('#yupana1', controller.state, controller.currentExercise.expected);
    var t = controller.TextManager;
    document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + t.getPerfectMessage(
        fmt(controller.currentExercise.a),
        fmt(controller.currentExercise.b),
        fmt(controller.currentExercise.expected)) + '</div>';
    document.getElementById('stepMessage').innerHTML = '';
    document.getElementById('stepStatus').innerHTML = '';
    setVis('resetTutorBtn', true);
    setVis('nextLevelBtn', true);
}

function onCellClick(rowIdx, colIdx) {
    if (controller.finalCongratsShown) return;
    var s = controller.state;
    var phase = controller.phase;

    if (phase === 1) {
        var pos1 = controller.digitPositions[controller.digitIdx];
        if (rowIdx !== pos1) return;
        if (controller.awaitingDigitStep) return;
        htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
        var cv1 = [5,3,2,1], actual1 = 0;
        for (var c1 = 0; c1 < 4; c1++) if (s.red[rowIdx][c1]) actual1 += cv1[c1];
        if (actual1 === getDigit(controller.currentExercise.a, pos1)) {
            controller.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 2) {
        var pos2 = controller.digitPositions[controller.digitIdx];
        if (rowIdx !== pos2) return;
        if (controller.awaitingDigitStep) return;
        s.blue[rowIdx][colIdx] = s.blue[rowIdx][colIdx] ? 0 : 1;
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
        var cv2 = [5,3,2,1], actual2 = 0;
        for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * s.blue[rowIdx][c2];
        if (actual2 === getDigit(controller.currentExercise.b, pos2)) {
            controller.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 3) {
        // User is resolving a column
        var col = controller.evalCol;
        var carry = controller.evalCarry;
        var dA = getDigit(controller.currentExercise.a, col);
        var dB = getDigit(controller.currentExercise.b, col);
        var total = dA + dB + carry;

        if (controller.expectCarryClick) {
            // User clicking to confirm carry
            if (s.gray[rowIdx] && s.gray[rowIdx][colIdx]) {
                s.gray[rowIdx][colIdx] = false;
                s.blue[rowIdx][colIdx] += 1;
                htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
                controller.expectCarryClick = false;
                controller.awaitingMovementStep = true;
                controller.pendingCarry = false;
                controller.carryJustPlaced = true;
                controller.movementsDone = ['PISQA'];
                controller.stepNumber++;
                updateStepStatus();
                document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' +
                    tm('txt_carryConfirmMessage')
                        .replace(/\{nextPlace\}/g, getPlaceName(rowIdx))
                        .replace(/\{movements\}/g, formatMovements(['PISQA'])) +
                    '</div>';
                setVis('nextStepBtn', true);
            }
            return;
        }

        if (controller.awaitingMovementStep) return;

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
        if (col >= controller.ROWS) need = carry;

        if (actual === need) {
            htYupanaRowSetGreen('#yupana1', s, col, need);
            controller.movementsDone = getColumnMovements(dA, dB, carry);
            controller.pendingCarry = total >= 10;
            controller.awaitingMovementStep = true;
            showMovementsMessage(getPlaceName(col));
        }
        return;
    }
}

function toggleLevel() {
    var lvls = ["units","tens","hundreds"];
    var bg = ["#ffb347","#4caf50","#ff7043"];
    var idx = lvls.indexOf(controller.currentLevel);
    if (idx === 2) {
        controller.currentLevel = "units";
        document.getElementById('levelBadge').innerHTML = tm('txt_levelUnits');
        document.getElementById('levelBadge').style.background = bg[0];
        showLevelCongrats(tm('txt_lastLevelMessage'));
        return;
    }
    idx++;
    controller.currentLevel = lvls[idx];
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

function updateLevelBadge() {
    var lvls = ["units", "tens", "hundreds"];
    var bg = ["#ffb347", "#4caf50", "#ff7043"];
    var idx = lvls.indexOf(controller.currentLevel);
    if (idx < 0) idx = 0;
    document.getElementById('levelBadge').innerHTML = tm('txt_level' + lvls[idx].charAt(0).toUpperCase() + lvls[idx].slice(1));
    document.getElementById('levelBadge').style.background = bg[idx];
}

function init() {
    controller.currentLevel = "units";
    updateLevelBadge();
    controller.TextManager = {
        get: tm,
        format: function(t, d) {
            for (var k in d) { if(d.hasOwnProperty(k)) { var v=d[k]; if(v===undefined||v===null)v=''; t=t.replace(new RegExp('\\{'+k+'\\}','g'),v); } }
            return t;
        },
        getPerfectMessage: function(a,b,r) { return this.format(tm('txt_perfectMessage'),{a:a,b:b,result:r}); }
    };

    controller.state = htYupanaNewState(controller.ROWS);
    htYupanaStateClear('#yupana1', controller.state);


    var _ = function(id) { return document.getElementById(id); };
    var ex = _('resetTutorBtn'); if (ex) ex.onclick = function() { startNewExercise(); };
    var rs = _('resetButton'); if (rs) rs.onclick = function() {
        controller.finalCongratsShown = false;
        controller.phase = 0;
        controller.evalDone = false;
        controller.expectCarryClick = false;
        controller.awaitingMovementStep = false;
        controller.awaitingDigitStep = false;
        controller.carryJustPlaced = false;
        controller.pendingCarry = false;
        controller.state = htYupanaNewState(controller.ROWS);
        htYupanaStateClear('#yupana1', controller.state);
        document.getElementById('feedbackArea').innerHTML = '';
        setVis('nextStepBtn', true);
        setVis('nextLevelBtn', true);
        setVis('resetTutorBtn', true);
        showPhase(1);
    };
    var lv = _('nextLevelBtn'); if (lv) lv.onclick = function() { toggleLevel(); };
    var ns = _('nextStepBtn'); if (ns) ns.onclick = function() {
        var p = controller.phase;
        var s = controller.state;
        var a = controller.currentExercise.a;
        var b = controller.currentExercise.b;

        if (controller.awaitingMovementStep) {
            controller.awaitingMovementStep = false;
            if (controller.pendingCarry) {
                var col = controller.evalCol;
                controller.pendingCarry = false;
                controller.expectCarryClick = true;
                var nextCol = col + 1;
                s.gray[nextCol] = [false, false, false, true];
                htYupanaStateRenderCell('#yupana1', s, nextCol, 3);
                document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_carryFinalInstruction');
                document.getElementById('feedbackArea').innerHTML = '';
                setVis('nextStepBtn', false);
            } else {
                controller.evalCarry = controller.carryJustPlaced ? 1 : 0;
                controller.carryJustPlaced = false;
                controller.evalCol = controller.evalCol + 1;
                processNextColumn();
            }
            return;
        }

        if (p === 1) {
            var pos1 = controller.digitPositions[controller.digitIdx];
            var cv1 = [5,3,2,1], actual1 = 0;
            for (var c1 = 0; c1 < 4; c1++) if (s.red[pos1][c1]) actual1 += cv1[c1];
            if (actual1 === getDigit(a, pos1)) advanceDigitPhase(1);
        } else if (p === 2) {
            var pos2 = controller.digitPositions[controller.digitIdx];
            var cv2 = [5,3,2,1], actual2 = 0;
            for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * s.blue[pos2][c2];
            if (actual2 === getDigit(b, pos2)) advanceDigitPhase(2);
        }
    };

    _('stepMessage') && (_('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_welcomeMessage'));
    startNewExercise();

}

window.htBe2YupanaAdd = {
    "init": init,
    "handleCell": onCellClick
};
})();

(function() {
"use strict";

// SPDX-License-Identifier: GPL-3.0-or-later

var controller = {
    "ROWS": 4,
    "state": null,
    "currentLevel": 1,
    "currentExercise": { value: 0, times: 0, expected: 0 },
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

function generateRandomNumbersByLevel() {
    var l = controller.currentLevel;
    return { value: rand(8)+2, times: l };
    function rand(m) { return Math.floor(Math.random() * m); }
}

function setVis(id, show) {
    var el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', !show);
}

function startNewExercise() {
    controller.finalCongratsShown = false;
    controller.phase = 0;
    controller.evalCol = 0;
    controller.evalCarry = 0;
    controller.evalDone = false;
    controller.expectCarryClick = false;
    controller.awaitingMovementStep = false;
    controller.awaitingDigitStep = false;
    controller.carryJustPlaced = false;
    controller.pendingCarry = false;
    var n = generateRandomNumbersByLevel();
    controller.currentExercise = { value: n.value, times: n.times, expected: n.value * n.times };
    controller.currentTotal = 0;
    controller.currentStep = 0;
    document.getElementById('problemDisplay').innerHTML = fmt(n.value) + " × " + fmt(n.times);
    document.getElementById('multTable').innerHTML = '';
    controller.state = htYupanaNewState(controller.ROWS);
    htYupanaStateClear('#yupana1', controller.state);
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

function tm(id) { var el = document.getElementById('mult_' + id); return el ? el.innerHTML : id; }

function getA() { return controller.currentTotal; }
function getB() { return controller.currentExercise.value; }

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
    for (var p = 0; p < controller.ROWS; p++) {
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
    var value = controller.currentExercise.value;
    var times = controller.currentExercise.times;
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
    var t = controller.TextManager;
    document.getElementById('stepStatus').innerHTML = t.get('txt_stepStatus')
        .replace('{current}', controller.stepNumber)
        .replace('{total}', controller.totalSteps);
}

function showPhase(p) {
    setVis('nextLevelBtn', true);
    setVis('resetTutorBtn', true);
    controller.phase = p;
    var t = controller.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var value = controller.currentExercise.value;
    if (p === 1) {
        controller.digitPositions = getDigitPositions(value);
        controller.digitIdx = 0;
        controller.stepNumber = 1;
        controller.totalSteps = computeTotalSteps();
        updateStepStatus();
        if (controller.digitPositions.length === 0) {
            showPhase(2);
            return;
        }
        showDigitInstruction(1);
    } else if (p === 2) {
        controller.digitPositions = getDigitPositions(value);
        controller.digitIdx = 0;
        updateStepStatus();
        if (controller.digitPositions.length === 0) {
            showPhase(3);
            return;
        }
        showDigitInstruction(2);
    } else if (p === 5) {
        controller.digitPositions = getDigitPositions(value);
        controller.digitIdx = 0;
        updateStepStatus();
        if (controller.digitPositions.length === 0) {
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
    controller.evalCol = 0;
    controller.evalCarry = 0;
    controller.evalDone = false;
    controller.expectCarryClick = false;
    controller.awaitingMovementStep = false;
    controller.pendingCarry = false;
    controller.carryJustPlaced = false;
    setVis('nextStepBtn', false);
    document.getElementById('stepStatus').innerHTML = '';
    processNextColumn();
}

function showDigitInstruction(phase) {
    var t = controller.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var pos = controller.digitPositions[controller.digitIdx];
    var n = controller.currentExercise.value;
    var key = (phase === 1 || phase === 5) ? 'txt_step1DigitInstruction' : 'txt_step2DigitInstruction';
    controller.awaitingDigitStep = false;
    document.getElementById('feedbackArea').innerHTML = '';
    document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + t.get(key)
        .replace(/\{step\}/g, controller.stepNumber)
        .replace(/\{placeName\}/g, getPlaceName(pos))
        .replace(/\{digit\}/g, getDigit(n, pos))
        .replace(/\{value\}/g, n);
    updateStepStatus();
}

function advanceDigitPhase(phase) {
    controller.digitIdx++;
    if (controller.digitIdx < controller.digitPositions.length) {
        controller.stepNumber++;
        showDigitInstruction(phase);
    } else {
        if (phase === 1) {
            controller.currentTotal = controller.currentExercise.value;
            controller.currentStep = 1;
            appendMultRow();
            controller.stepNumber++;
            if (controller.currentStep >= controller.currentExercise.times) {
                showPhase(4);
            } else {
                showPhase(2);
            }
        } else {
            if (controller.currentStep >= controller.currentExercise.times) {
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
    var value = controller.currentExercise.value;
    var k = controller.currentStep;
    var result = controller.currentTotal;
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
    var moves = controller.movementsDone;
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
    var s = controller.state;
    var col = controller.evalCol;
    var carry = controller.evalCarry;
    var maxC = controller.ROWS;
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
        controller.evalCol = col + 1;
        controller.evalCarry = 0;
        processNextColumn();
        return;
    }

    if (col >= maxC && carry > 0) {
        controller.stepNumber++;
        updateStepStatus();
        controller.expectCarryClick = true;
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_carryFinalInstruction').replace(/\{step\}/g, controller.stepNumber);
        s.gray[col] = [false, false, false, true];
        htYupanaStateRenderCell('#yupana1', s, col, 3);
        return;
    }

    var resultDigit = total >= 10 ? total - 10 : total;

    if (resultDigit === 0) {
        controller.stepNumber++;
        updateStepStatus();
        controller.evalDone = false;
        s.red[col] = [false, false, false, false];
        s.blue[col] = [0, 0, 0, 0];
        s.green[col] = [false, false, false, false];
        s.redCarry[col] = [false, false, false, false];
        for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
        controller.movementsDone = getColumnMovements(dA, dB, carry);
        controller.pendingCarry = total >= 10;
        controller.awaitingMovementStep = true;
        var carryTerm = carry > 0 ? " + 1 (" + tm('txt_carrying') + ")" : "";
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_evalZero')
                .replace(/\{step\}/g, controller.stepNumber)
                .replace(/\{placeName\}/g, getPlaceName(col))
                .replace(/\{digitA\}/g, dA)
                .replace(/\{digitB\}/g, dB + carryTerm)
                .replace(/\{total\}/g, total);
        showMovementsMessage(getPlaceName(col));
        return;
    }

    var carryTerm = carry > 0 ? " + 1 (" + tm('txt_carrying') + ")" : "";
    controller.stepNumber++;
    updateStepStatus();
    var instr;
    if (total >= 10) {
        instr = tm('txt_evalCarryDigit')
            .replace(/\{step\}/g, controller.stepNumber)
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB + carryTerm)
            .replace(/\{total\}/g, total)
            .replace(/\{resultDigit\}/g, resultDigit);
    } else {
        instr = tm('txt_evalSimple')
            .replace(/\{step\}/g, controller.stepNumber)
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB + carryTerm)
            .replace(/\{total\}/g, total)
            .replace(/\{result\}/g, total);
    }
    document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + instr;
    document.getElementById('feedbackArea').innerHTML = '';

    controller.evalDone = false;
    s.green[col] = [false, false, false, false];
    for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
}

function completeIteration() {
    var value = controller.currentExercise.value;
    var times = controller.currentExercise.times;
    controller.currentTotal = controller.currentTotal + value;
    controller.currentStep++;
    appendMultRow();
    if (controller.currentStep < times) {
        var s = controller.state;
        for (var i = 0; i < s.rows; i++) {
            s.red[i] = s.green[i].slice();
            s.green[i] = [false, false, false, false];
            s.gray[i] = [false, false, false, false];
            s.blue[i] = [0, 0, 0, 0];
            s.redCarry[i] = [false, false, false, false];
            for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, i, c);
        }
        controller.stepNumber++;
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
    controller.finalCongratsShown = true;
    htYupanaStateDrawGreen('#yupana1', controller.state, controller.currentExercise.expected);
    var t = controller.TextManager;
    document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + t.getPerfectMessage(
        fmt(controller.currentExercise.value),
        fmt(controller.currentExercise.times),
        fmt(controller.currentExercise.expected)) + '</div>';
    document.getElementById('stepMessage').innerHTML = '';
    document.getElementById('stepStatus').innerHTML = '';
    setVis('resetTutorBtn', true);
    setVis('nextLevelBtn', true);
}

function onCellClick(rowIdx, colIdx) {
    if (controller.finalCongratsShown) return;
    var s = controller.state;
    var phase = controller.phase;
    var n = controller.currentExercise.value;

    if (phase === 1) {
        var pos1 = controller.digitPositions[controller.digitIdx];
        if (rowIdx !== pos1) return;
        if (controller.awaitingDigitStep) return;
        htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
        var cv1 = [5,3,2,1], actual1 = 0;
        for (var c1 = 0; c1 < 4; c1++) if (s.red[rowIdx][c1]) actual1 += cv1[c1];
        if (actual1 === getDigit(n, pos1)) {
            controller.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 2 || phase === 5) {
        var pos2 = controller.digitPositions[controller.digitIdx];
        if (rowIdx !== pos2) return;
        if (controller.awaitingDigitStep) return;
        s.blue[rowIdx][colIdx] = s.blue[rowIdx][colIdx] ? 0 : 1;
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
        var cv2 = [5,3,2,1], actual2 = 0;
        for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * s.blue[rowIdx][c2];
        if (actual2 === getDigit(n, pos2)) {
            controller.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 3) {
        // User is resolving a column
        var col = controller.evalCol;
        var carry = controller.evalCarry;
        var a = getA();
        var b = getB();
        var dA = getDigit(a, col);
        var dB = getDigit(b, col);
        var total = dA + dB + carry;

        if (controller.expectCarryClick) {
            // User clicking to confirm carry
            if (s.gray[rowIdx] && s.gray[rowIdx][colIdx]) {
                s.gray[rowIdx][colIdx] = false;
                s.redCarry[rowIdx][colIdx] = true;
                htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
                controller.expectCarryClick = false;
                controller.awaitingMovementStep = true;
                controller.pendingCarry = false;
                controller.carryJustPlaced = true;
                controller.movementsDone = ['PISQA'];
                document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' +
                    tm('txt_carryConfirmMessage')
                        .replace(/\{nextPlace\}/g, getPlaceName(rowIdx))
                        .replace(/\{movements\}/g, formatMovements(['PISQA'])) +
                    '</div>';
                setVis('nextStepBtn', true);
            }
            return;
        }

        if (controller.awaitingMovementStep) return;

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
        if (col >= controller.ROWS) need = carry;

        if (actual === need) {
            htYupanaRowSetGreen('#yupana1', s, col, need);
            controller.movementsDone = getColumnMovements(dA, dB, carry);
            controller.pendingCarry = total >= 10;
            controller.awaitingMovementStep = true;
            showMovementsMessage(getPlaceName(col));
        }
        return;
    }
}

function updateLevelBadge() {
    var lvl = controller.currentLevel;
    var bg = ["#ffb347", "#4caf50", "#ff7043"];
    var el = document.getElementById('levelBadge');
    if (!el) return;
    el.innerHTML = tm('txt_level') + " " + lvl;
    el.style.background = bg[(lvl - 1) % bg.length];
}

function toggleLevel() {
    var lvl = controller.currentLevel;
    if (lvl >= 9) {
        controller.currentLevel = 1;
        updateLevelBadge();
        showLevelCongrats(tm('txt_lastLevelMessage'));
        return;
    }
    controller.currentLevel = lvl + 1;
    updateLevelBadge();
    startNewExercise();
}

function showLevelCongrats(msg) {
    document.getElementById('stepMessage').innerHTML = '';
    document.getElementById('stepStatus').innerHTML = '';
    document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + msg + '</div>';
    setVis('nextStepBtn', false);
    setVis('nextLevelBtn', false);
}

function init() {
    controller.currentLevel = 1;
    updateLevelBadge();
    htSetImageSrc("ArmsAntonio", "images/Archive/PrimerNuevaCoronicayBuenoGobiernoManuscrito_0362.jpg");

    controller.TextManager = {
        get: tm,
        format: function(t, d) {
            for (var k in d) { if(d.hasOwnProperty(k)) { var v=d[k]; if(v===undefined||v===null)v=''; t=t.replace(new RegExp('\\{'+k+'\\}','g'),v); } }
            return t;
        },
        getPerfectMessage: function(v,t,r) { return this.format(tm('txt_perfectMessage'),{value:v,times:t,result:r}); }
    };

    controller.state = htYupanaNewState(controller.ROWS);
    htYupanaStateClear('#yupana1', controller.state);


    var _ = function(id) { return document.getElementById(id); };
    var ex = _('resetTutorBtn'); if (ex) ex.onclick = function() { startNewExercise(); };
    var rs = _('resetButton'); if (rs) rs.onclick = function() {
        controller.finalCongratsShown = false;
        controller.phase = 0;
        controller.evalDone = false;
        controller.expectCarryClick = false;
        controller.awaitingMovementStep = false;
        controller.awaitingDigitStep = false;
        controller.carryJustPlaced = false;
        controller.pendingCarry = false;
        controller.currentTotal = 0;
        controller.currentStep = 0;
        document.getElementById('multTable').innerHTML = '';
        controller.state = htYupanaNewState(controller.ROWS);
        htYupanaStateClear('#yupana1', controller.state);
        document.getElementById('feedbackArea').innerHTML = '';
        setVis('nextStepBtn', true);
        setVis('nextLevelBtn', true);
        setVis('resetTutorBtn', true);
        showPhase(1);
    };
    var lv = _('nextLevelBtn'); if (lv) lv.onclick = function() { toggleLevel(); };
    var ns = _('nextStepBtn'); if (ns) ns.onclick = function() {
        var p = controller.phase;
        var s = controller.state;
        var n = controller.currentExercise.value;

        if (controller.awaitingMovementStep) {
            controller.awaitingMovementStep = false;
            if (controller.pendingCarry) {
                var col = controller.evalCol;
                controller.pendingCarry = false;
                controller.expectCarryClick = true;
                controller.stepNumber++;
                updateStepStatus();
                var nextCol = col + 1;
                s.gray[nextCol] = [false, false, false, true];
                htYupanaStateRenderCell('#yupana1', s, nextCol, 3);
                document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
                    tm('txt_carryFinalInstruction').replace(/\{step\}/g, controller.stepNumber);
                document.getElementById('feedbackArea').innerHTML = '';
                setVis('nextStepBtn', false);
            } else {
                controller.evalCarry = controller.carryJustPlaced ? 1 : 0;
                controller.carryJustPlaced = false;
                controller.evalCol = controller.evalCol + 1;
                processNextColumn();
            }
            return;
        }

        if (p === 1) {
            var pos1 = controller.digitPositions[controller.digitIdx];
            var cv1 = [5,3,2,1], actual1 = 0;
            for (var c1 = 0; c1 < 4; c1++) if (s.red[pos1][c1]) actual1 += cv1[c1];
            if (actual1 === getDigit(n, pos1)) advanceDigitPhase(1);
        } else if (p === 2 || p === 5) {
            var pos2 = controller.digitPositions[controller.digitIdx];
            var cv2 = [5,3,2,1], actual2 = 0;
            for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * s.blue[pos2][c2];
            if (actual2 === getDigit(n, pos2)) advanceDigitPhase(p);
        }
    };

    updateLevelBadge();
    _('stepMessage') && (_('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_welcomeMessage'));
    startNewExercise();

}

window.htBe2YupanaMult = {
    "init": init,
    "handleCell": onCellClick
};
})();

(function() {
"use strict";

// SPDX-License-Identifier: GPL-3.0-or-later

var controller = {
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
    var l = controller.currentLevel;
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
    controller.finalCongratsShown = false;
    controller.phase = 0;
    controller.evalCol = 0;
    controller.evalDone = false;
    controller.expectBorrowRewrite = false;
    controller.borrowRewriteTargets = {};
    controller.borrowJustTaken = false;
    controller.awaitingMovementStep = false;
    controller.awaitingDigitStep = false;
    var n = generateRandomNumbersByLevel();
    controller.currentExercise = { a: n.a, b: n.b, expected: n.a - n.b };
    document.getElementById('problemDisplay').innerHTML = fmt(n.a) + " − " + fmt(n.b);
    controller.state = htYupanaNewState(controller.ROWS);
    htYupanaStateClear('#yupana1', controller.state);
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

function tm(id) { var el = document.getElementById('sub_' + id); return el ? el.innerHTML : id; }

function getRowRedValue(rowIdx) {
    var s = controller.state;
    var cv = [5,3,2,1], sum = 0;
    for (var c = 0; c < 4; c++) if (s.red[rowIdx][c]) sum += cv[c];
    return sum;
}

function countEvaluationSteps() {
    var a = controller.currentExercise.a;
    var b = controller.currentExercise.b;
    var digits = [];
    for (var p = 0; p < controller.ROWS; p++) digits.push(getDigit(a, p));
    var count = 0;
    for (var col = 0; col < controller.ROWS; col++) {
        var dA = digits[col];
        var dB = getDigit(b, col);
        if (dA === 0 && dB === 0) continue;
        if (dB > dA) {
            count += 2;
            var t = col + 1;
            while (t < controller.ROWS && digits[t] === 0) { digits[t] = 9; t++; }
            if (t < controller.ROWS) digits[t] -= 1;
        } else {
            count += 1;
        }
    }
    return count;
}

function updateStepStatus() {
    var t = controller.TextManager;
    document.getElementById('stepStatus').innerHTML = t.get('txt_stepStatus')
        .replace('{current}', controller.stepNumber)
        .replace('{total}', controller.totalSteps);
}

function showPhase(p) {
    setVis('nextLevelBtn', true);
    setVis('resetTutorBtn', true);
    controller.phase = p;
    var t = controller.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var a = controller.currentExercise.a;
    var b = controller.currentExercise.b;
    if (p === 1) {
        controller.digitPositions = getDigitPositions(a);
        controller.digitIdx = 0;
        controller.stepNumber = 1;
        controller.totalSteps = countDigitSteps(a) + countDigitSteps(b) + countEvaluationSteps();
        updateStepStatus();
        if (controller.digitPositions.length === 0) {
            showPhase(2);
            return;
        }
        showDigitInstruction(1);
    } else if (p === 2) {
        controller.digitPositions = getDigitPositions(b);
        controller.digitIdx = 0;
        controller.stepNumber = countDigitSteps(a) + 1;
        updateStepStatus();
        if (controller.digitPositions.length === 0) {
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
    controller.evalCol = 0;
    controller.evalDone = false;
    controller.expectBorrowRewrite = false;
    controller.borrowRewriteTargets = {};
    controller.borrowJustTaken = false;
    controller.awaitingMovementStep = false;
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
    var t = controller.TextManager || { get: tm, format: function(t,d) { for (var k in d) if(d.hasOwnProperty(k)) t=t.replace(new RegExp('\\{'+k+'\\}','g'),d[k]); return t; } };
    var pos = controller.digitPositions[controller.digitIdx];
    var n = (phase === 1) ? controller.currentExercise.a : controller.currentExercise.b;
    var key = (phase === 1) ? 'txt_step1DigitInstruction' : 'txt_step2DigitInstruction';
    controller.awaitingDigitStep = false;
    document.getElementById('feedbackArea').innerHTML = '';
    document.getElementById('stepMessage').innerHTML = t.get('txt_stepPrefix') + " " + t.get(key)
        .replace(/\{step\}/g, controller.stepNumber)
        .replace(/\{placeName\}/g, getPlaceName(pos))
        .replace(/\{digit\}/g, getDigit(n, pos));
    updateStepStatus();
}

function advanceDigitPhase(phase) {
    controller.digitIdx++;
    if (controller.digitIdx < controller.digitPositions.length) {
        controller.stepNumber++;
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
    var moves = controller.movementsDone;
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
    var s = controller.state;
    var result = didBorrow ? dA + 10 - dB : dA - dB;
    controller.stepNumber++;
    updateStepStatus();
    controller.evalDone = false;
    if (result === 0) {
        s.red[col] = [false, false, false, false];
        s.blue[col] = [0, 0, 0, 0];
        s.green[col] = [false, false, false, false];
        for (var c = 0; c < 4; c++) htYupanaStateRenderCell('#yupana1', s, col, c);
        controller.movementsDone = getColumnMovements(dA, dB, 0, false);
        controller.awaitingMovementStep = true;
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_evalZero')
                .replace(/\{step\}/g, controller.stepNumber)
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
        controller.movementsDone = getColumnMovements(dA, dB, 0, true);
        controller.awaitingMovementStep = true;
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_evalNine')
                .replace(/\{step\}/g, controller.stepNumber)
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
            .replace(/\{step\}/g, controller.stepNumber)
            .replace(/\{placeName\}/g, getPlaceName(col))
            .replace(/\{digitA\}/g, dA)
            .replace(/\{digitB\}/g, dB)
            .replace(/\{result\}/g, result);
    } else {
        instr = tm('txt_evalSimple')
            .replace(/\{step\}/g, controller.stepNumber)
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
    var s = controller.state;
    var col = controller.evalCol;
    var maxC = controller.ROWS;

    if (col >= maxC) {
        showPhase(4);
        return;
    }

    var dA = getRowRedValue(col);
    var dB = getDigit(controller.currentExercise.b, col);

    if (dA === 0 && dB === 0) {
        controller.evalCol = col + 1;
        processNextColumn();
        return;
    }

    if (dB > dA) {
        controller.stepNumber++;
        updateStepStatus();
        controller.expectBorrowRewrite = true;
        controller.borrowRewriteTargets = {};
        var t = col + 1;
        while (t < maxC && getRowRedValue(t) === 0) {
            controller.borrowRewriteTargets[t] = { old: 0, new: 9 };
            t++;
        }
        if (t >= maxC) t = maxC - 1;
        var oldDigit = getRowRedValue(t);
        controller.borrowRewriteTargets[t] = { old: oldDigit, new: oldDigit - 1 };
        var list = [];
        for (var r in controller.borrowRewriteTargets) {
            var o = controller.borrowRewriteTargets[r];
            var deriv = (o.old === 0) ? (o.old + " + 10 − 1 = " + o.new) : (o.old + " − 1 = " + o.new);
            list.push(getPlaceName(parseInt(r)) + " " + tm('txt_as') + " " + o.new + " (" + deriv + ")");
        }
        document.getElementById('stepMessage').innerHTML = tm('txt_stepPrefix') + " " +
            tm('txt_borrowInstruction')
                .replace(/\{step\}/g, controller.stepNumber)
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
    controller.finalCongratsShown = true;
    htYupanaStateDrawGreen('#yupana1', controller.state, controller.currentExercise.expected);
    var t = controller.TextManager;
    document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + t.getPerfectMessage(
        fmt(controller.currentExercise.a),
        fmt(controller.currentExercise.b),
        fmt(controller.currentExercise.expected)) + '</div>';
    document.getElementById('stepMessage').innerHTML = '';
    document.getElementById('stepStatus').innerHTML = '';
    setVis('resetTutorBtn', true);
    setVis('nextLevelBtn', true);
}

function onCellClick(rowIdx, colIdx) {
    if (controller.finalCongratsShown) return;
    var s = controller.state;
    var phase = controller.phase;

    if (phase === 1) {
        var pos1 = controller.digitPositions[controller.digitIdx];
        if (rowIdx !== pos1) return;
        if (controller.awaitingDigitStep) return;
        htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
        var cv1 = [5,3,2,1], actual1 = 0;
        for (var c1 = 0; c1 < 4; c1++) if (s.red[rowIdx][c1]) actual1 += cv1[c1];
        if (actual1 === getDigit(controller.currentExercise.a, pos1)) {
            controller.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 2) {
        var pos2 = controller.digitPositions[controller.digitIdx];
        if (rowIdx !== pos2) return;
        if (controller.awaitingDigitStep) return;
        s.blue[rowIdx][colIdx] = s.blue[rowIdx][colIdx] ? 0 : 1;
        htYupanaStateRenderCell('#yupana1', s, rowIdx, colIdx);
        var cv2 = [5,3,2,1], actual2 = 0;
        for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * s.blue[rowIdx][c2];
        if (actual2 === getDigit(controller.currentExercise.b, pos2)) {
            controller.awaitingDigitStep = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + tm('txt_correctMessage') + '</div>';
        }
        return;
    }

    if (phase === 3) {
        var col = controller.evalCol;

        if (controller.expectBorrowRewrite) {
            if (!controller.borrowRewriteTargets.hasOwnProperty(rowIdx)) return;
            htYupanaStateToggleCell('#yupana1', s, rowIdx, colIdx, 'red');
            var allOk = true;
            for (var r in controller.borrowRewriteTargets) {
                if (getRowRedValue(parseInt(r)) !== controller.borrowRewriteTargets[r].new) {
                    allOk = false;
                    break;
                }
            }
            if (allOk) {
                controller.expectBorrowRewrite = false;
                controller.borrowJustTaken = true;
                controller.awaitingMovementStep = true;
                document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' +
                    tm('txt_borrowConfirmMessage')
                        .replace(/\{nextPlace\}/g, getPlaceName(col + 1)) +
                    '</div>';
                setVis('nextStepBtn', true);
            }
            return;
        }

        if (controller.awaitingMovementStep) return;

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
        var dB = getDigit(controller.currentExercise.b, col);
        var need = dB > dA ? dA + 10 - dB : dA - dB;

        if (actual === need) {
            htYupanaRowSetGreen('#yupana1', s, col, need);
            controller.movementsDone = getColumnMovements(dA, dB, 0, dB > dA);
            controller.awaitingMovementStep = true;
            showMovementsMessage(getPlaceName(col));
        }
        return;
    }
}

function toggleLevel() {
    var lvls = ["units","tens","hundreds"];
    var bg = ["#ffb347","#4caf50","#ff7043"];
    var idx = lvls.indexOf(controller.currentLevel);
    if (idx === 2) {
        controller.currentLevel = "units";
        document.getElementById('levelBadge').innerHTML = tm('txt_levelUnits');
        document.getElementById('levelBadge').style.background = bg[0];
        showLevelCongrats(tm('txt_lastLevelMessage'));
        return;
    }
    idx++;
    controller.currentLevel = lvls[idx];
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

function updateLevelBadge() {
    var lvls = ["units", "tens", "hundreds"];
    var bg = ["#ffb347", "#4caf50", "#ff7043"];
    var idx = lvls.indexOf(controller.currentLevel);
    if (idx < 0) idx = 0;
    document.getElementById('levelBadge').innerHTML = tm('txt_level' + lvls[idx].charAt(0).toUpperCase() + lvls[idx].slice(1));
    document.getElementById('levelBadge').style.background = bg[idx];
}

function init() {
    controller.currentLevel = "units";
    updateLevelBadge();
    controller.TextManager = {
        get: tm,
        format: function(t, d) {
            for (var k in d) { if(d.hasOwnProperty(k)) { var v=d[k]; if(v===undefined||v===null)v=''; t=t.replace(new RegExp('\\{'+k+'\\}','g'),v); } }
            return t;
        },
        getPerfectMessage: function(a,b,r) { return this.format(tm('txt_perfectMessage'),{a:a,b:b,result:r}); }
    };

    controller.state = htYupanaNewState(controller.ROWS);
    htYupanaStateClear('#yupana1', controller.state);


    var _ = function(id) { return document.getElementById(id); };
    var ex = _('resetTutorBtn'); if (ex) ex.onclick = function() { startNewExercise(); };
    var rs = _('resetButton'); if (rs) rs.onclick = function() {
        controller.finalCongratsShown = false;
        controller.phase = 0;
        controller.evalDone = false;
        controller.expectBorrowRewrite = false;
        controller.borrowRewriteTargets = {};
        controller.borrowJustTaken = false;
        controller.awaitingMovementStep = false;
        controller.awaitingDigitStep = false;
        controller.state = htYupanaNewState(controller.ROWS);
        htYupanaStateClear('#yupana1', controller.state);
        document.getElementById('feedbackArea').innerHTML = '';
        setVis('nextStepBtn', true);
        setVis('nextLevelBtn', true);
        setVis('resetTutorBtn', true);
        showPhase(1);
    };
    var lv = _('nextLevelBtn'); if (lv) lv.onclick = function() { toggleLevel(); };
    var ns = _('nextStepBtn'); if (ns) ns.onclick = function() {
        var p = controller.phase;
        var a = controller.currentExercise.a;
        var b = controller.currentExercise.b;

        if (controller.awaitingMovementStep) {
            controller.awaitingMovementStep = false;
            if (controller.borrowJustTaken) {
                controller.borrowJustTaken = false;
                var bcol = controller.evalCol;
                var bdA = getRowRedValue(bcol);
                var bdB = getDigit(controller.currentExercise.b, bcol);
                showColumnSolve(bcol, bdA, bdB, true);
            } else {
                controller.evalCol = controller.evalCol + 1;
                processNextColumn();
            }
            return;
        }

        if (p === 1) {
            var pos1 = controller.digitPositions[controller.digitIdx];
            var cv1 = [5,3,2,1], actual1 = 0;
            for (var c1 = 0; c1 < 4; c1++) if (controller.state.red[pos1][c1]) actual1 += cv1[c1];
            if (actual1 === getDigit(a, pos1)) advanceDigitPhase(1);
        } else if (p === 2) {
            var pos2 = controller.digitPositions[controller.digitIdx];
            var cv2 = [5,3,2,1], actual2 = 0;
            for (var c2 = 0; c2 < 4; c2++) actual2 += cv2[c2] * controller.state.blue[pos2][c2];
            if (actual2 === getDigit(b, pos2)) advanceDigitPhase(2);
        }
    };

    _('stepMessage') && (_('stepMessage').innerHTML = tm('txt_stepPrefix') + " " + tm('txt_welcomeMessage'));
    startNewExercise();

}

window.htBe2YupanaSub = {
    "init": init,
    "handleCell": onCellClick
};
})();


var htBe2ActiveOperation = "sum";

function htBe2ActiveYupanaModule() {
    if (htBe2ActiveOperation == "mult") {
        return window.htBe2YupanaMult;
    }
    if (htBe2ActiveOperation == "sub") {
        return window.htBe2YupanaSub;
    }
    return window.htBe2YupanaAdd;
}

function htLoadContent() {
    $( "input[name='yupanaradio2']" ).on( "change", function() {
        yupanaSelected = $(this).val();
        htResetValuesbe2d7ec9();

        htUpdateYupanabe2d7ec9(leftbe2d7ec9, rightbe2d7ec9);
    });

    $( "input[name='yupanaradio3']" ).on( "change", function() {
        inverseSelectedbe2d7ec9 = $(this).val();
        htResetInverseValuesbe2d7ec9();
    });

    $("#traineeUp4").on("click", function() {
        htSetInverseValuesbe2d7ec9();
    });

    $("#traineeDown4").on("click", function() {
        htResetInverseValuesbe2d7ec9();
    });

    $("#traineeUp3").on("click", function() {
        htSetValuesbe2d7ec9();

        var totals = htSumYupanaVectors(rvalues2, lvalues2);
        htCleanYupanaDecimalValues('#yupana0', 2);
        htFillYupanaDecimalValues('#yupana0', totals, 2, 'red_dot_right_up');
    });

    $("#traineeDown3").on("click", function() {
        htResetValuesbe2d7ec9();
        htUpdateYupanabe2d7ec9(leftbe2d7ec9, rightbe2d7ec9);
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

    for (var row = 1; row <= 4; row++) {
        for (var col = 1; col <= 4; col++) {
            (function(r, c) {
                $('#yupana1 #tc' + c + 'f' + r).on("click", function() {
                    htBe2ActiveYupanaModule().handleCell(4 - r, c - 1);
                });
            })(row, col);
        }
    }

    $( "input[name='yupanaop']" ).on( "change", function() {
        htBe2ActiveOperation = $(this).val();
        var multTable = document.getElementById('multTable');
        if (multTable) {
            multTable.innerHTML = '';
        }
        htBe2ActiveYupanaModule().init();
    });

    htWriteNavigation();

    htSetImageSrc("leftHandImg3", "images/HistoryTracers/5Left_Hand_Small.png");
    htSetImageSrc("rightHandImg3", "images/HistoryTracers/5Right_Hand_Small.png");
    htSetImageSrc("leftHandImg4", "images/HistoryTracers/3Left_Hand_Small.png");
    htSetImageSrc("rightHandImg4", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("imgPoma", "images/Archive/PrimerNuevaCoronicayBuenoGobiernoManuscrito_0362.jpg");

    htResetInverseValuesbe2d7ec9();

    window.htBe2YupanaAdd.init();
    return false;
}
