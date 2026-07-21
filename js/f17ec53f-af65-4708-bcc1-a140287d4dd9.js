// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};
var localAnswerVector = undefined;

function htInverseIskayMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana60', 1);
    local.inverseIskayLValues = htFillYupanaDecimalValues('#yupana60', lv, 1, 'red_dot_right_up');
    local.inverseIskayRValues = htFillYupanaDecimalValues('#yupana60', rv, 1, 'blue_dot_right_bottom');
}

function htInverseKimsaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana70', 1);
    local.inverseKimsaLValues = htFillYupanaDecimalValues('#yupana70', lv, 1, 'red_dot_right_up');
    local.inverseKimsaRValues = htFillYupanaDecimalValues('#yupana70', rv, 1, 'blue_dot_right_bottom');
}

function htInversePisqaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana80', 2);
    local.inversePisqaLValues = htFillYupanaDecimalValues('#yupana80', lv, 2, 'red_dot_right_up');
    local.inversePisqaRValues = htFillYupanaDecimalValues('#yupana80', rv, 2, 'blue_dot_right_bottom');
}

function htInversePichanaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana90', 1);
    local.inversePichanaLValues = htFillYupanaDecimalValues('#yupana90', lv, 1, 'red_dot_right_up');
    local.inversePichanaRValues = htFillYupanaDecimalValues('#yupana90', rv, 1, 'blue_dot_right_bottom');
}

function htInverseCancellationMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana100', 1);
    local.inverseCancellationLValues = htFillYupanaDecimalValues('#yupana100', lv, 1, 'red_dot_right_up');
    local.inverseCancellationRValues = htFillYupanaDecimalValues('#yupana100', rv, 1, 'blue_dot_right_bottom');
}

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector != undefined) {
        for (let i = 0; i < localAnswerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}

function htLoadContent() {
    local = { "inverseIskayRValues": [], "inverseIskayLValues": [], "inverseKimsaRValues": [], "inverseKimsaLValues": [], "inversePisqaRValues": [], "inversePisqaLValues": [], "inversePichanaRValues": [], "inversePichanaLValues": [], "inverseCancellationRValues": [], "inverseCancellationLValues": [], "pichanaLeftValue": 2, "pichanaRightValue": 1, "cancellationValue": 5, "sumFirstTime": true, "counter": 0, "answerVector": undefined };

    htWriteNavigation();

    $("#traineeUp6").on("click", function() {
        htCleanYupanaDecimalValues('#yupana60');
        htFillYupanaDecimalValues('#yupana60', 2, 1, 'red_dot_right_up');
        $("#leftHandImg6").attr("src","images/HistoryTracers/2Left_Hand_Small.png");
        $("#rightHandImg6").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
    });

    $("#traineeDown6").on("click", function() {
        $("#leftHandImg6").attr("src","images/HistoryTracers/3Left_Hand_Small.png");
        $("#rightHandImg6").attr("src","images/HistoryTracers/1Right_Hand_Small.png");
        htInverseIskayMove(3, 1);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana60', local.inverseIskayLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana60', local.inverseIskayRValues);
    });

    $("#traineeUp7").on("click", function() {
        htCleanYupanaDecimalValues('#yupana70');
        htFillYupanaDecimalValues('#yupana70', 4, 1, 'red_dot_right_up');
        $("#leftHandImg7").attr("src","images/HistoryTracers/4Left_Hand_Small.png");
        $("#rightHandImg7").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
    });

    $("#traineeDown7").on("click", function() {
        $("#leftHandImg7").attr("src","images/HistoryTracers/5Left_Hand_Small.png");
        $("#rightHandImg7").attr("src","images/HistoryTracers/1Right_Hand_Small.png");
        htInverseKimsaMove(5, 1);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana70', local.inverseKimsaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana70', local.inverseKimsaRValues);
    });

    $("#traineeUp8").on("click", function() {
        htCleanYupanaDecimalValues('#yupana80');
        htFillYupanaDecimalValues('#yupana80', 5, 2, 'red_dot_right_up');
        $("#leftHandImg8").attr("src","images/HistoryTracers/5Left_Hand_Small.png");
        $("#rightHandImg8").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
    });

    $("#traineeDown8").on("click", function() {
        $("#leftHandImg8").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
        $("#rightHandImg8").attr("src","images/HistoryTracers/5Right_Hand_Small.png");
        htInversePisqaMove(10, 5);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana80', local.inversePisqaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana80', local.inversePisqaRValues);
    });

    $(document).on("change", "input[name='pichanaMovement']", function() {
        if ($(this).val() === "3-2") {
            local.pichanaLeftValue = 3;
            local.pichanaRightValue = 2;
        } else {
            local.pichanaLeftValue = 2;
            local.pichanaRightValue = 1;
        }
        $("#leftHandImg9").attr("src","images/HistoryTracers/" + local.pichanaLeftValue + "Left_Hand_Small.png");
        $("#rightHandImg9").attr("src","images/HistoryTracers/" + local.pichanaRightValue + "Right_Hand_Small.png");
        htInversePichanaMove(local.pichanaLeftValue, local.pichanaRightValue);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana90', local.inversePichanaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana90', local.inversePichanaRValues);
    });

    $("#traineeUp9").on("click", function() {
        htCleanYupanaDecimalValues('#yupana90');
        htFillYupanaDecimalValues('#yupana90', 1, 1, 'red_dot_right_up');
        $("#leftHandImg9").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
        $("#rightHandImg9").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
    });

    $("#traineeDown9").on("click", function() {
        $("#leftHandImg9").attr("src","images/HistoryTracers/" + local.pichanaLeftValue + "Left_Hand_Small.png");
        $("#rightHandImg9").attr("src","images/HistoryTracers/" + local.pichanaRightValue + "Right_Hand_Small.png");
        htInversePichanaMove(local.pichanaLeftValue, local.pichanaRightValue);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana90', local.inversePichanaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana90', local.inversePichanaRValues);
    });

    $(document).on("change", "input[name='cancellationMovement']", function() {
        local.cancellationValue = parseInt($(this).val(), 10);
        $("#leftHandImg10").attr("src","images/HistoryTracers/" + local.cancellationValue + "Left_Hand_Small.png");
        $("#rightHandImg10").attr("src","images/HistoryTracers/" + local.cancellationValue + "Right_Hand_Small.png");
        htInverseCancellationMove(local.cancellationValue, local.cancellationValue);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana100', local.inverseCancellationLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana100', local.inverseCancellationRValues);
    });

    $("#traineeUp10").on("click", function() {
        htCleanYupanaDecimalValues('#yupana100');
        $("#leftHandImg10").attr("src","images/HistoryTracers/0Left_Hand_Small.png");
        $("#rightHandImg10").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
    });

    $("#traineeDown10").on("click", function() {
        $("#leftHandImg10").attr("src","images/HistoryTracers/" + local.cancellationValue + "Left_Hand_Small.png");
        $("#rightHandImg10").attr("src","images/HistoryTracers/" + local.cancellationValue + "Right_Hand_Small.png");
        htInverseCancellationMove(local.cancellationValue, local.cancellationValue);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana100', local.inverseCancellationLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana100', local.inverseCancellationRValues);
    });

    if (local.sumFirstTime) {
        htInverseIskayMove(3, 1);
        htInverseKimsaMove(5, 1);
        htInversePisqaMove(10, 5);
        htInversePichanaMove(2, 1);
        htInverseCancellationMove(5, 5);
        local.sumFirstTime = false;
    }

    htSetImageSrc("leftHandImg6", "images/HistoryTracers/3Left_Hand_Small.png");
    htSetImageSrc("rightHandImg6", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("leftHandImg7", "images/HistoryTracers/5Left_Hand_Small.png");
    htSetImageSrc("rightHandImg7", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("leftHandImg8", "images/HistoryTracers/1Left_Hand_Small.png");
    htSetImageSrc("rightHandImg8", "images/HistoryTracers/5Right_Hand_Small.png");
    htSetImageSrc("leftHandImg9", "images/HistoryTracers/2Left_Hand_Small.png");
    htSetImageSrc("rightHandImg9", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("leftHandImg10", "images/HistoryTracers/5Left_Hand_Small.png");
    htSetImageSrc("rightHandImg10", "images/HistoryTracers/5Right_Hand_Small.png");
    return false;
}
