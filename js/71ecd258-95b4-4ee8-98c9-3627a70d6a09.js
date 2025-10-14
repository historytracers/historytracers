// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

var slideIndexae71ecd258 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    if (!x) {
        return;
    }

    slideIndexae71ecd258 += n;
    if (slideIndexae71ecd258 == x.length) {
        slideIndexae71ecd258 = 0;
    } else if (slideIndexae71ecd258 < 0) {
        slideIndexae71ecd258 = x.length - 1;
    }

    htShowSlideDivs(x, slideIndexae71ecd258);
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
    htAddAlterQImages(".htSlides");
    htPlusDivs(0);

    htWriteNavigation();

    return false;
}
