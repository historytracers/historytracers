// SPDX-License-Identifier: GPL-3.0-or-later

var rvalues = [];
var lvalues = [];
var iskayRValues = [];
var iskayLValues = [];
var kimsaRValues = [];
var kimsaLValues = [];
var pisqaRValues = [];
var pisqaLValues = [];
var pichanaRValues = [];
var pichanaLValues = [];
var kinkinRValues = [];
var kinkinLValues = [];
var sumFirstTime = true;

var localCounterc742c649 = 0;

function htFillCurrentYupanaSum()
{
    lvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana1').val(), 5, 'red_dot_right_up');
    rvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana1').val(), 5, 'blue_dot_right_bottom');
    if (sumFirstTime) {
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', lvalues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', rvalues);
    }
}

function htIskayMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana10', 1);
    iskayLVvalues = htFillYupanaDecimalValues('#yupana10', lv, 1, 'red_dot_right_up');
    iskayRVvalues = htFillYupanaDecimalValues('#yupana10', rv, 1, 'blue_dot_right_bottom');
}

function htKimsaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana20', 1);
    kimsaLVvalues = htFillYupanaDecimalValues('#yupana20', lv, 1, 'red_dot_right_up');
    kimsaRVvalues = htFillYupanaDecimalValues('#yupana20', rv, 1, 'blue_dot_right_bottom');
}

function htPisqaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana30', 2);
    pisqaLVvalues = htFillYupanaDecimalValues('#yupana30', lv, 2, 'red_dot_right_up');
    pisqaRVvalues = htFillYupanaDecimalValues('#yupana30', rv, 2, 'blue_dot_right_bottom');
}

function htPichanaMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana40', 1);
    pichanaLVvalues = htFillYupanaDecimalValues('#yupana40', lv, 1, 'red_dot_right_up');
    pichanaRVvalues = htFillYupanaDecimalValues('#yupana40', rv, 1, 'blue_dot_right_bottom');
}

function htKinkinMove(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana50', 1);
    kinkinLVvalues = htFillYupanaDecimalValues('#yupana50', lv, 1, 'red_dot_right_up');
    kinkinRVvalues = htFillYupanaDecimalValues('#yupana50', rv, 1, 'blue_dot_right_bottom');
}

var localAnswerVectorc742c649 = undefined;

function htLoadExercise() {
    if (localAnswerVectorc742c649 == undefined) {
        localAnswerVectorc742c649 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorc742c649);
    }

    htWriteNavigation("first_steps");

    localCounterc742c649 = 0;
    localCounterc742c649 = htModifyArrow('.htUpArrow', localCounterc742c649);
    localCounterc742c649 = htModifyArrow('.htDownArrow', localCounterc742c649);

    $("#traineeUp0").on("click", function() {
        localCounterc742c649++;
        localCounterc742c649 = htModifyArrow('.htUpArrow', localCounterc742c649);
        localCounterc742c649 = htModifyArrow('.htDownArrow', localCounterc742c649);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCounterc742c649);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounterc742c649, 1, 'red_dot_right_up');
    });

    $("#traineeDown0").on("click", function() {
        localCounterc742c649--;
        localCounterc742c649 = htModifyArrow('.htDownArrow', localCounterc742c649);
        localCounterc742c649 = htModifyArrow('.htUpArrow', localCounterc742c649);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCounterc742c649);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounterc742c649, 1, 'red_dot_right_up');
    });

    $("#traineeUp1").on("click", function() {
        $("#leftHandImg1").attr("src","images/3Left_Hand_Small.png");
        $("#rightHandImg1").attr("src","images/1Right_Hand_Small.png");
        htIskayMove(1, 3);
        var totals = htSumYupanaVectors(iskayLValues, iskayRValues);
        htFillYupanaDecimalValues('#yupana10', totals, 1, 'red_dot_right_up');
    });

    $("#traineeDown1").on("click", function() {
        $("#leftHandImg1").attr("src","images/2Left_Hand_Small.png");
        $("#rightHandImg1").attr("src","images/2Right_Hand_Small.png");
        htIskayMove(2, 2);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana10', iskayLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana10', iskayRValues);
    });

    $("#traineeUp2").on("click", function() {
        $("#leftHandImg2").attr("src","images/5Left_Hand_Small.png");
        $("#rightHandImg2").attr("src","images/1Right_Hand_Small.png");
        htKimsaMove(5, 1);
        var totals = htSumYupanaVectors(iskayLValues, iskayRValues);
        htFillYupanaDecimalValues('#yupana20', totals, 1, 'red_dot_right_up');
    });

    $("#traineeDown2").on("click", function() {
        $("#leftHandImg2").attr("src","images/3Left_Hand_Small.png");
        $("#rightHandImg2").attr("src","images/3Right_Hand_Small.png");
        htKimsaMove(3, 3);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana20', iskayLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana20', iskayRValues);
    });

    $("#traineeUp3").on("click", function() {
        htPisqaMove(10, 0);
        var totals = htSumYupanaVectors(pisqaLValues, pisqaRValues);
        htFillYupanaDecimalValues('#yupana30', totals, 2, 'red_dot_right_up');
    });

    $("#traineeDown3").on("click", function() {
        htPisqaMove(5, 5);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana30', pisqaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana30', pisqaRValues);
    });

    $("#traineeUp4").on("click", function() {
        $("#leftHandImg4").attr("src","images/3Left_Hand_Small.png");
        $("#rightHandImg4").attr("src","images/0Right_Hand_Small.png");
        htPichanaMove(3, 0);
        var totals = htSumYupanaVectors(pichanaLValues, pichanaRValues);
        htFillYupanaDecimalValues('#yupana40', totals, 1, 'red_dot_right_up');
    });

    $("#traineeDown4").on("click", function() {
        $("#leftHandImg4").attr("src","images/2Left_Hand_Small.png");
        $("#rightHandImg4").attr("src","images/1Right_Hand_Small.png");
        htPichanaMove(2, 1);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana40', pichanaLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana40', pichanaRValues);
    });

    $("#traineeUp5").on("click", function() {
        $("#leftHandImg5").attr("src","images/2Left_Hand_Small.png");
        $("#rightHandImg5").attr("src","images/0Right_Hand_Small.png");
        htKinkinMove(2, 0);
        var totals = htSumYupanaVectors(kinkinLValues, kinkinRValues);
        htFillYupanaDecimalValues('#yupana50', totals, 1, 'red_dot_right_up');
    });

    $("#traineeDown5").on("click", function() {
        $("#leftHandImg5").attr("src","images/1Left_Hand_Small.png");
        $("#rightHandImg5").attr("src","images/1Right_Hand_Small.png");
        htKinkinMove(1, 1);
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana50', kinkinLValues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana50', kinkinRValues);
    });

    if (sumFirstTime) {
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
        sumFirstTime = false;
    }

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var value = $(this).val();
        htCleanYupanaDecimalValues('#yupana1', 5);

        htFillCurrentYupanaSum();
        if (value == "values") {
            htCleanYupanaAdditionalColumn('#yupana1', 5, '#tc6f');
            $('#tc7f1').html("");
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', lvalues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', rvalues);
        } else {
            var totals = htSumYupanaVectors(lvalues, rvalues);
            htCleanYupanaDecimalValues('#yupana1', 5);
            htFillYupanaDecimalValues('#yupana1', totals, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
            htWriteYupanaSumMovement(lvalues, rvalues, '#yupana1', 5, '#tc7f1');
        }
    });

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorc742c649 != undefined) {
        for (let i = 0; i < localAnswerVectorc742c649.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorc742c649[i], "#answer"+i, "#explanation"+i);
        }
    }
}

