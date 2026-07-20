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
    local = { "inverseIskayRValues": [], "inverseIskayLValues": [], "inverseKimsaRValues": [], "inverseKimsaLValues": [], "inversePisqaRValues": [], "inversePisqaLValues": [], "inversePichanaRValues": [], "inversePichanaLValues": [], "sumFirstTime": true, "counter": 0, "answerVector": undefined };

    htWriteNavigation();

    $("#traineeUp6").on("click", function() {
        htCleanYupanaDecimalValues('#yupana60', 1);
        htFillYupanaDecimalValues('#yupana60', 3, 1, 'red_dot_right_up');
        $("#leftHandImg6").attr("src","images/HistoryTracers/3Left_Hand_Small.png");
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana60', 1);
            htFillYupanaDecimalValues('#yupana60', 1, 1, 'red_dot_right_up');
            htFillYupanaDecimalValues('#yupana60', 2, 1, 'blue_dot_right_bottom');
            $("#leftHandImg6").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
            $("#rightHandImg6").attr("src","images/HistoryTracers/2Right_Hand_Small.png");
            setTimeout(function() {
                $("#leftHandImg6").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
                $("#rightHandImg6").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
                htInverseIskayMove(1, 0);
                var totals = htSumYupanaVectors(local.inverseIskayLValues, local.inverseIskayRValues);
                htFillYupanaDecimalValues('#yupana60', totals, 1, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown6").on("click", function() {
        $("#leftHandImg6").attr("src","images/HistoryTracers/3Left_Hand_Small.png");
        $("#rightHandImg6").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
        htInverseIskayMove(3, 0);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana60', local.inverseIskayLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana60', local.inverseIskayRValues);
    });

    $("#traineeUp7").on("click", function() {
        htCleanYupanaDecimalValues('#yupana70', 1);
        htFillYupanaDecimalValues('#yupana70', 5, 1, 'red_dot_right_up');
        $("#leftHandImg7").attr("src","images/HistoryTracers/5Left_Hand_Small.png");
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana70', 1);
            htFillYupanaDecimalValues('#yupana70', 1, 1, 'red_dot_right_up');
            htFillYupanaDecimalValues('#yupana70', 3, 1, 'blue_dot_right_bottom');
            htFillYupanaDecimalValues('#yupana70', 1, 1, 'blue_dot_right_bottom');
            $("#leftHandImg7").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
            $("#rightHandImg7").attr("src","images/HistoryTracers/4Right_Hand_Small.png");
            setTimeout(function() {
                $("#leftHandImg7").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
                $("#rightHandImg7").attr("src","images/HistoryTracers/3Right_Hand_Small.png");
                htInverseKimsaMove(1, 3);
                var totals = htSumYupanaVectors(local.inverseKimsaLValues, local.inverseKimsaRValues);
                htFillYupanaDecimalValues('#yupana70', totals, 1, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown7").on("click", function() {
        $("#leftHandImg7").attr("src","images/HistoryTracers/5Left_Hand_Small.png");
        $("#rightHandImg7").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
        htInverseKimsaMove(5, 0);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana70', local.inverseKimsaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana70', local.inverseKimsaRValues);
    });

    $("#traineeUp8").on("click", function() {
        htCleanYupanaDecimalValues('#yupana80', 2);
        htFillYupanaDecimalValues('#yupana80', 10, 2, 'red_dot_right_up');
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana80', 2);
            htFillYupanaDecimalValues('#yupana80', 5, 2, 'red_dot_right_up');
            $("#leftHandImg8").attr("src","images/HistoryTracers/5Left_Hand_Small.png");
            setTimeout(function() {
                htInversePisqaMove(5, 0);
                var totals = htSumYupanaVectors(local.inversePisqaLValues, local.inversePisqaRValues);
                htFillYupanaDecimalValues('#yupana80', totals, 2, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown8").on("click", function() {
        $("#leftHandImg8").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
        $("#rightHandImg8").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
        htInversePisqaMove(10, 0);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana80', local.inversePisqaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana80', local.inversePisqaRValues);
    });

    $("#traineeUp9").on("click", function() {
        htCleanYupanaDecimalValues('#yupana90', 1);
        htFillYupanaDecimalValues('#yupana90', 2, 1, 'red_dot_right_up');
        $("#leftHandImg9").attr("src","images/HistoryTracers/2Left_Hand_Small.png");
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana90', 1);
            htFillYupanaDecimalValues('#yupana90', 1, 1, 'red_dot_right_up');
            htFillYupanaDecimalValues('#yupana90', 1, 1, 'blue_dot_right_bottom');
            $("#leftHandImg9").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
            $("#rightHandImg9").attr("src","images/HistoryTracers/1Right_Hand_Small.png");
            setTimeout(function() {
                $("#leftHandImg9").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
                $("#rightHandImg9").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
                htInversePichanaMove(1, 0);
                var totals = htSumYupanaVectors(local.inversePichanaLValues, local.inversePichanaRValues);
                htFillYupanaDecimalValues('#yupana90', totals, 1, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown9").on("click", function() {
        $("#leftHandImg9").attr("src","images/HistoryTracers/2Left_Hand_Small.png");
        $("#rightHandImg9").attr("src","images/HistoryTracers/0Right_Hand_Small.png");
        htInversePichanaMove(2, 0);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana90', local.inversePichanaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana90', local.inversePichanaRValues);
    });

    if (local.sumFirstTime) {
        htInverseIskayMove(3, 0);
        htInverseKimsaMove(5, 0);
        htInversePisqaMove(10, 0);
        htInversePichanaMove(2, 0);
        local.sumFirstTime = false;
    }

    htSetImageSrc("leftHandImg6", "images/HistoryTracers/3Left_Hand_Small.png");
    htSetImageSrc("rightHandImg6", "images/HistoryTracers/0Right_Hand_Small.png");
    htSetImageSrc("leftHandImg7", "images/HistoryTracers/5Left_Hand_Small.png");
    htSetImageSrc("rightHandImg7", "images/HistoryTracers/0Right_Hand_Small.png");
    htSetImageSrc("leftHandImg8", "images/HistoryTracers/1Left_Hand_Small.png");
    htSetImageSrc("rightHandImg8", "images/HistoryTracers/0Right_Hand_Small.png");
    htSetImageSrc("leftHandImg9", "images/HistoryTracers/2Left_Hand_Small.png");
    htSetImageSrc("rightHandImg9", "images/HistoryTracers/0Right_Hand_Small.png");
    return false;
}
