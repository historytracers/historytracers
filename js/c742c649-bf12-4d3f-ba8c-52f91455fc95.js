// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htFillCurrentYupanaSum()
{
    local.lvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana0').val(), 5, 'red_dot_right_up');
    local.rvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana1').val(), 5, 'blue_dot_right_bottom');
    if (local.sumFirstTime) {
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
    }
}

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
    local = { "lvalues": [], "rvalues": [], "iskayRValues": [], "iskayLValues": [], "kimsaRValues": [], "kimsaLValues": [], "pisqaRValues": [], "pisqaLValues": [], "pichanaRValues": [], "pichanaLValues": [], "kinkinRValues": [], "kinkinLValues": [], "sumFirstTime": true, "counter": 0, "answerVector": undefined }; 

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
        $("#leftHandImg1").attr("src","images/HistoryTracers/0Left_Hand_Small.png");
        $("#rightHandImg1").attr("src","images/HistoryTracers/4Right_Hand_Small.png");
        htIskayMove(1, 3);
        var totals = htSumYupanaVectors(local.iskayLValues, local.iskayRValues);
        htFillYupanaDecimalValues('#yupana10', totals, 1, 'red_dot_right_up');
    });

    $("#traineeDown1").on("click", function() {
        $("#leftHandImg1").attr("src","images/HistoryTracers/2Left_Hand_Small.png");
        $("#rightHandImg1").attr("src","images/HistoryTracers/2Right_Hand_Small.png");
        htIskayMove(2, 2);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana10', local.iskayLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana10', local.iskayRValues);
    });

    $("#traineeUp2").on("click", function() {
        $("#leftHandImg2").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
        $("#rightHandImg2").attr("src","images/HistoryTracers/5Right_Hand_Small.png");
        htKimsaMove(5, 1);
        var totals = htSumYupanaVectors(local.iskayLValues, local.iskayRValues);
        htFillYupanaDecimalValues('#yupana20', totals, 1, 'red_dot_right_up');
    });

    $("#traineeDown2").on("click", function() {
        $("#leftHandImg2").attr("src","images/HistoryTracers/3Left_Hand_Small.png");
        $("#rightHandImg2").attr("src","images/HistoryTracers/3Right_Hand_Small.png");
        htKimsaMove(3, 3);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana20', local.iskayLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana20', local.iskayRValues);
    });

    $("#traineeUp3").on("click", function() {
        htPisqaMove(10, 0);
        var totals = htSumYupanaVectors(local.pisqaLValues, local.pisqaRValues);
        htFillYupanaDecimalValues('#yupana30', totals, 2, 'red_dot_right_up');
    });

    $("#traineeDown3").on("click", function() {
        htPisqaMove(5, 5);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana30', local.pisqaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana30', local.pisqaRValues);
    });

    $("#traineeUp4").on("click", function() {
        $("#leftHandImg4").attr("src","images/HistoryTracers/0Left_Hand_Small.png");
        $("#rightHandImg4").attr("src","images/HistoryTracers/3Right_Hand_Small.png");
        htPichanaMove(3, 0);
        var totals = htSumYupanaVectors(local.pichanaLValues, local.pichanaRValues);
        htFillYupanaDecimalValues('#yupana40', totals, 1, 'red_dot_right_up');
    });

    $("#traineeDown4").on("click", function() {
        $("#leftHandImg4").attr("src","images/HistoryTracers/2Left_Hand_Small.png");
        $("#rightHandImg4").attr("src","images/HistoryTracers/1Right_Hand_Small.png");
        htPichanaMove(2, 1);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana40', local.pichanaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana40', local.pichanaRValues);
    });

    $("#traineeUp5").on("click", function() {
        $("#leftHandImg5").attr("src","images/HistoryTracers/0Left_Hand_Small.png");
        $("#rightHandImg5").attr("src","images/HistoryTracers/2Right_Hand_Small.png");
        htKinkinMove(2, 0);
        var totals = htSumYupanaVectors(local.kinkinLValues, local.kinkinRValues);
        htFillYupanaDecimalValues('#yupana50', totals, 1, 'red_dot_right_up');
    });

    $("#traineeDown5").on("click", function() {
        $("#leftHandImg5").attr("src","images/HistoryTracers/1Left_Hand_Small.png");
        $("#rightHandImg5").attr("src","images/HistoryTracers/1Right_Hand_Small.png");
        htKinkinMove(1, 1);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana50', local.kinkinLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana50', local.kinkinRValues);
    });

    if (local.sumFirstTime) {
        $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
            $("input[name='yupanaradio']").prop("checked", false);
            var value = $(this).val();
            if (value < 0 || value > 99999) {
                $(this).val(0);
            }
        });

        $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
            $("input[name='yupanaradio']").prop("checked", false);
            var value = $(this).val();
            if (value < 0 || value > 99999) {
                $(this).val(0);
            }
        });
        htFillCurrentYupanaSum();
        htIskayMove(2, 2);
        htKimsaMove(3, 3);
        htPisqaMove(5, 5);
        htPichanaMove(2, 1);
        htKinkinMove(1, 1);
        local.sumFirstTime = false;
    }

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var value = $(this).val();
        htCleanYupanaDecimalValues('#yupana1', 5);

        htFillCurrentYupanaSum();
        if (value == "values") {
            htCleanYupanaAdditionalColumn('#yupana1', 5, '#tc6f');
            $('#tc7f1').html("");
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
        } else {
            var totals = htSumYupanaVectors(local.lvalues, local.rvalues);
            htCleanYupanaDecimalValues('#yupana1', 5);
            htFillYupanaDecimalValues('#yupana1', totals, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
            htWriteYupanaSumMovement(local.lvalues, local.rvalues, '#yupana1', 5, '#tc7f1');
        }
    });

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
