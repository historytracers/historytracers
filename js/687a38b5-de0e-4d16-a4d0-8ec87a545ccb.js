// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector687a38b5 = undefined;

function htLoadContent() {
    htWriteNavigation();

    $(".sumexample1").hover(function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "black");
    });
}

function htLoadExercise() {
    if (localAnswerVector687a38b5 == undefined) {
        localAnswerVector687a38b5 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector687a38b5);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector687a38b5 != undefined) {
        for (let i = 0; i < localAnswerVector687a38b5.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector687a38b5[i], "#answer"+i, "#explanation"+i);
        }
    }
}

