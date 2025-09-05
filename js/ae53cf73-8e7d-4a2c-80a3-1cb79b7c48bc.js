// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

var slideIndexae53cf73 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndexae53cf73 += n;
    if (slideIndexae53cf73 == x.length) {
        slideIndexae53cf73 = 0;
    } else if (slideIndexae53cf73 < 0) {
        slideIndexae53cf73 = x.length - 1;
    }

    htShowSlideDivs(x, slideIndexae53cf73);
}

function htLoadExercise() {
    htAddAlterQImages(".htSlides");
    htPlusDivs(0);

    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation();

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

