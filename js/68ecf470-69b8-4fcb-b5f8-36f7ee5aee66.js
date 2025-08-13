// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector68ecf470 = undefined;
var rvalues = [];
var lvalues = [];
var left68ecf470 = 0;
var right68ecf470 = 0;
var yupanaSelected = "-1";

function htUpdateYupana68ecf470(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana0', 2);
    rvalues = htFillYupanaDecimalValues('#yupana0', lv, 2, 'red_dot_right_up');
    lvalues = htFillYupanaDecimalValues('#yupana0', rv, 2, 'blue_dot_right_bottom');

    $("#rightHandImg3").attr("src", "images/"+lv+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", "images/"+rv+"Left_Hand_Small.png");
}

function htUpdateValues68ecf470(left, hand) {
    left68ecf470 = left;
    right68ecf470 = hand;
}

function htSetValues68ecf470() {
    if (yupanaSelected == "-1") {
        return;
    }

    if (yupanaSelected == "0") {
        htUpdateValues68ecf470(3, 1);
    } else if (yupanaSelected == "1") {
        htUpdateValues68ecf470(5, 1);
    } else if (yupanaSelected == "2") {
        htUpdateValues68ecf470(10, 0);
    } else if (yupanaSelected == "3") {
        htUpdateValues68ecf470(3, 0);
    } else if (yupanaSelected == "4") {
        htUpdateValues68ecf470(2, 0);
    }
}

function htResetValues68ecf470() {
    if (yupanaSelected == "-1") {
        return;
    }

    if (yupanaSelected == "0") {
        htUpdateValues68ecf470(2, 2);
    } else if (yupanaSelected == "1") {
        htUpdateValues68ecf470(3, 3);
    } else if (yupanaSelected == "2") {
        htUpdateValues68ecf470(5, 5);
    } else if (yupanaSelected == "3") {
        htUpdateValues68ecf470(1, 2);
    } else if (yupanaSelected == "4") {
        htUpdateValues68ecf470(1, 1);
    }
}

function htLoadExercise() {
    if (localAnswerVector68ecf470 == undefined) {
        localAnswerVector68ecf470 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector68ecf470);
    }

    htWriteNavigation("first_steps");

    $( "input[name='yupanaradio']" ).on( "change", function() {
        yupanaSelected = $(this).val();
        htResetValues68ecf470();

        htUpdateYupana68ecf470(left68ecf470, right68ecf470);
    });

    $("#traineeUp3").on("click", function() {
        htSetValues68ecf470();

        var totals = htSumYupanaVectors(rvalues, lvalues);
        htCleanYupanaDecimalValues('#yupana0', 2);
        htFillYupanaDecimalValues('#yupana0', totals, 2, 'red_dot_right_up');
    });

    $("#traineeDown3").on("click", function() {
        htResetValues68ecf470();
        htUpdateYupana68ecf470(left68ecf470, right68ecf470);
    });

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector68ecf470 != undefined) {
        for (let i = 0; i < localAnswerVector68ecf470.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector68ecf470[i], "#answer"+i, "#explanation"+i);
        }
    }
}

