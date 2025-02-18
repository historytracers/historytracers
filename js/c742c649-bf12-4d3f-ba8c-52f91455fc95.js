// SPDX-License-Identifier: GPL-3.0-or-later

var rvalues = [];
var lvalues = []
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

