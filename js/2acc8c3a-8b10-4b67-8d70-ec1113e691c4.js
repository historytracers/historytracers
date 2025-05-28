// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector2acc8c3a = undefined;

var slideIndexae2acc8c3a = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndexae2acc8c3a += n;
    if (slideIndexae2acc8c3a == x.length) {
        slideIndexae2acc8c3a = 0;
    } else if (slideIndexae2acc8c3a < 0) {
        slideIndexae2acc8c3a = x.length - 1;
    }

    htShowSlideDivs(x, slideIndexae2acc8c3a);
}

function htLoadExercise() {
    htAddAlterQImages(".htSlides");
    htPlusDivs(0);

    if (localAnswerVector2acc8c3a == undefined) {
        localAnswerVector2acc8c3a = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector2acc8c3a);
    }

    htWriteNavigation("first_steps");

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

