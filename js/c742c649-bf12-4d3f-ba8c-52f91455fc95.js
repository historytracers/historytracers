// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htIskayMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana10', 1);
    local.iskayLVvalues = htFillYupanaDecimalValues('#yupana10', lv, 1, 'red_dot_right_up');
    local.iskayRVvalues = htFillYupanaDecimalValues('#yupana10', rv, 1, 'blue_dot_right_bottom');
}

function htKimsaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana20', 1);
    local.kimsaLVvalues = htFillYupanaDecimalValues('#yupana20', lv, 1, 'red_dot_right_up');
    local.kimsaRVvalues = htFillYupanaDecimalValues('#yupana20', rv, 1, 'blue_dot_right_bottom');
}

function htPisqaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana30', 2);
    local.pisqaLVvalues = htFillYupanaDecimalValues('#yupana30', lv, 2, 'red_dot_right_up');
    local.pisqaRVvalues = htFillYupanaDecimalValues('#yupana30', rv, 2, 'blue_dot_right_bottom');
}

function htPichanaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana40', 1);
    local.pichanaLVvalues = htFillYupanaDecimalValues('#yupana40', lv, 1, 'red_dot_right_up');
    local.pichanaRVvalues = htFillYupanaDecimalValues('#yupana40', rv, 1, 'blue_dot_right_bottom');
}

function htKinkinMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana50', 1);
    local.kinkinLVvalues = htFillYupanaDecimalValues('#yupana50', lv, 1, 'red_dot_right_up');
    local.kinkinRVvalues = htFillYupanaDecimalValues('#yupana50', rv, 1, 'blue_dot_right_bottom');
}

function htLoadExercise() {
    if (local.answerVector == undefined) {
        local.answerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(local.answerVector);
    }
}

function htLoadContent() {
    local = { "iskayRValues": [], "iskayLValues": [], "kimsaRValues": [], "kimsaLValues": [], "pisqaRValues": [], "pisqaLValues": [], "pichanaRValues": [], "pichanaLValues": [], "kinkinRValues": [], "kinkinLValues": [], "sumFirstTime": true, "counter": 0, "answerVector": undefined }; 

    htWriteNavigation();

    local.counter = 0;
    local.counter = htModifyArrow('.htUpArrow', local.counter);
    local.counter = htModifyArrow('.htDownArrow', local.counter);

    $("#traineeUp0").on("click", function() {
        local.counter++;
        local.counter = htModifyArrow('.htUpArrow', local.counter);
        local.counter = htModifyArrow('.htDownArrow', local.counter);

        htSetImageForMembers('#leftHandImg0', 'Left_Hand_Small.png', '#rightHandImg0', 'Right_Hand_Small.png', local.counter);
        htCleanYupanaDecimalValues('#yupana0', 1);
        htFillYupanaDecimalValues('#yupana0', local.counter, 1, 'red_dot_right_up');
    });

    $("#traineeDown0").on("click", function() {
        local.counter--;
        local.counter = htModifyArrow('.htDownArrow', local.counter);
        local.counter = htModifyArrow('.htUpArrow', local.counter);

        htSetImageForMembers('#leftHandImg0', 'Left_Hand_Small.png', '#rightHandImg0', 'Right_Hand_Small.png', local.counter);
        htCleanYupanaDecimalValues('#yupana0', 1);
        htFillYupanaDecimalValues('#yupana0', local.counter, 1, 'red_dot_right_up');
    });

    $("#traineeUp1").on("click", function() {
        htCleanYupanaDecimalValues('#yupana10', 1);
        htFillYupanaDecimalValues('#yupana10', 1, 1, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana10', 2, 1, 'blue_dot_right_bottom');
        $("#leftHandImg1").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana10', 1);
            htFillYupanaDecimalValues('#yupana10', 1, 1, 'red_dot_right_up');
            htFillYupanaDecimalValues('#yupana10', 3, 1, 'blue_dot_right_bottom');
            $("#rightHandImg1").attr("src","images/HistoryTracers/3Right_Hand_Small.png");
            setTimeout(function() {
                $("#leftHandImg1").attr("src","images/HistoryTracers/0Left_Hand_Small.png");
                $("#rightHandImg1").attr("src","images/HistoryTracers/4Right_Hand_Small.png");
                htIskayMove(1, 3);
                var totals = htSumYupanaVectors(local.iskayLValues, local.iskayRValues);
                htFillYupanaDecimalValues('#yupana10', totals, 1, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown1").on("click", function() {
        $("#leftHandImg1").attr("src","images/HistoryTracers/2Left_Hand_Small.png");
        $("#rightHandImg1").attr("src","images/HistoryTracers/2Right_Hand_Small.png");
        htIskayMove(2, 2);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana10', local.iskayLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana10', local.iskayRValues);
    });

    $("#traineeUp2").on("click", function() {
        htCleanYupanaDecimalValues('#yupana20', 1);
        htFillYupanaDecimalValues('#yupana20', 1, 1, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana20', 3, 1, 'blue_dot_right_bottom');
        $("#leftHandImg2").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana20', 1);
            htFillYupanaDecimalValues('#yupana20', 5, 1, 'red_dot_right_up');
            htFillYupanaDecimalValues('#yupana20', 1, 1, 'blue_dot_right_bottom');
            $("#rightHandImg2").attr("src","images/HistoryTracers/1Right_Hand_Small.png");
            setTimeout(function() {
                $("#leftHandImg2").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
                $("#rightHandImg2").attr("src","images/HistoryTracers/5Right_Hand_Small.png");
                htKimsaMove(5, 1);
                var totals = htSumYupanaVectors(local.iskayLValues, local.iskayRValues);
                htFillYupanaDecimalValues('#yupana20', totals, 1, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown2").on("click", function() {
        $("#leftHandImg2").attr("src","images/HistoryTracers/3Left_Hand_Small.png");
        $("#rightHandImg2").attr("src","images/HistoryTracers/3Right_Hand_Small.png");
        htKimsaMove(3, 3);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana20', local.iskayLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana20', local.iskayRValues);
    });

    $("#traineeUp3").on("click", function() {
        htCleanYupanaDecimalValues('#yupana30', 2);
        htFillYupanaDecimalValues('#yupana30', 5, 2, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana30', 5, 2, 'blue_dot_right_bottom');
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana30', 2);
            htFillYupanaDecimalValues('#yupana30', 10, 2, 'red_dot_right_up');
            setTimeout(function() {
                htPisqaMove(10, 0);
                var totals = htSumYupanaVectors(local.pisqaLValues, local.pisqaRValues);
                htFillYupanaDecimalValues('#yupana30', totals, 2, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown3").on("click", function() {
        htPisqaMove(5, 5);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana30', local.pisqaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana30', local.pisqaRValues);
    });

    $("#traineeUp4").on("click", function() {
        htCleanYupanaDecimalValues('#yupana40', 1);
        htFillYupanaDecimalValues('#yupana40', 2, 1, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana40', 0, 1, 'blue_dot_right_bottom');
        $("#leftHandImg4").attr("src","images/HistoryTracers/2Left_Hand_Small.png");
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana40', 1);
            htFillYupanaDecimalValues('#yupana40', 3, 1, 'red_dot_right_up');
            htFillYupanaDecimalValues('#yupana40', 0, 1, 'blue_dot_right_bottom');
            setTimeout(function() {
                $("#leftHandImg4").attr("src","images/HistoryTracers/0Left_Hand_Small.png");
                $("#rightHandImg4").attr("src","images/HistoryTracers/3Right_Hand_Small.png");
                htPichanaMove(3, 0);
                var totals = htSumYupanaVectors(local.pichanaLValues, local.pichanaRValues);
                htFillYupanaDecimalValues('#yupana40', totals, 1, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown4").on("click", function() {
        $("#leftHandImg4").attr("src","images/HistoryTracers/2Left_Hand_Small.png");
        $("#rightHandImg4").attr("src","images/HistoryTracers/1Right_Hand_Small.png");
        htPichanaMove(2, 1);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana40', local.pichanaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana40', local.pichanaRValues);
    });

    $("#traineeUp5").on("click", function() {
        htCleanYupanaDecimalValues('#yupana50', 1);
        htFillYupanaDecimalValues('#yupana50', 1, 1, 'red_dot_right_up');
        htFillYupanaDecimalValues('#yupana50', 0, 1, 'blue_dot_right_bottom');
        setTimeout(function() {
            htCleanYupanaDecimalValues('#yupana50', 1);
            htFillYupanaDecimalValues('#yupana50', 2, 1, 'red_dot_right_up');
            htFillYupanaDecimalValues('#yupana50', 0, 1, 'blue_dot_right_bottom');
            setTimeout(function() {
                $("#leftHandImg5").attr("src","images/HistoryTracers/0Left_Hand_Small.png");
                $("#rightHandImg5").attr("src","images/HistoryTracers/2Right_Hand_Small.png");
                htKinkinMove(2, 0);
                var totals = htSumYupanaVectors(local.kinkinLValues, local.kinkinRValues);
                htFillYupanaDecimalValues('#yupana50', totals, 1, 'red_dot_right_up');
            }, 1500);
        }, 1500);
    });

    $("#traineeDown5").on("click", function() {
        $("#leftHandImg5").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
        $("#rightHandImg5").attr("src","images/HistoryTracers/1Right_Hand_Small.png");
        htKinkinMove(1, 1);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana50', local.kinkinLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana50', local.kinkinRValues);
    });

    if (local.sumFirstTime) {
        htIskayMove(2, 2);
        htKimsaMove(3, 3);
        htPisqaMove(5, 5);
        htPichanaMove(2, 1);
        htKinkinMove(1, 1);
        local.sumFirstTime = false;
    }

    htSetImageSrc("leftHandImg0", "images/HistoryTracers/0Left_Hand_Small.png");
    htSetImageSrc("leftHandImg1", "images/HistoryTracers/2Left_Hand_Small.png");
    htSetImageSrc("leftHandImg2", "images/HistoryTracers/3Left_Hand_Small.png");
    htSetImageSrc("leftHandImg3", "images/HistoryTracers/5Left_Hand_Small.png");
    htSetImageSrc("leftHandImg4", "images/HistoryTracers/2Left_Hand_Small.png");
    htSetImageSrc("leftHandImg5", "images/HistoryTracers/1Left_Hand_Small.png");
    htSetImageSrc("rightHandImg0", "images/HistoryTracers/0Right_Hand_Small.png");
    htSetImageSrc("rightHandImg1", "images/HistoryTracers/2Right_Hand_Small.png");
    htSetImageSrc("rightHandImg2", "images/HistoryTracers/3Right_Hand_Small.png");
    htSetImageSrc("rightHandImg3", "images/HistoryTracers/5Right_Hand_Small.png");
    htSetImageSrc("rightHandImg4", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("rightHandImg5", "images/HistoryTracers/1Right_Hand_Small.png");
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
