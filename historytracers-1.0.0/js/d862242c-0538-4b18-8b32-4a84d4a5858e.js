// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

var slideIndexd862242c = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    if (!x) {
        return;
    }

    slideIndexd862242c += n;
    if (slideIndexd862242c == x.length) {
        slideIndexd862242c = 0;
    } else if (slideIndexd862242c < 0) {
        slideIndexd862242c = x.length - 1;
    }

    htShowSlideDivs(x, slideIndexd862242c);
}

function htLoadContent() {
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

