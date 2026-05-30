// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

var slideIndexdf59310b = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    if (!x) {
        return;
    }

    slideIndexdf59310b += n;
    if (slideIndexdf59310b == x.length) {
        slideIndexdf59310b = 0;
    } else if (slideIndexdf59310b < 0) {
        slideIndexdf59310b = x.length - 1;
    }

    htShowSlideDivs(x, slideIndexdf59310b);
}

function htLoadExercise() {
    htAddAlterQImages(".htSlides");
    htPlusDivs(0);
    htAddTreeReflection("#myFirstReflection", 55);

    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation();

    htSetImageSrc("CEast", "images/Copan/CopanStelaC.jpg");
    htSetImageSrc("CWest", "images/Copan/CopanStelaCBeard.jpg");
    htSetImageSrc("imgCopanStelaA", "images/Copan/StelaACopan.jpg");
    htSetImageSrc("imgCopanTemple", "images/Copan/Temple16Copan.png");
    htSetImageSrc("imgCopanTemple2", "images/Copan/RosalilaReconstruction.jpg");
    htSetImageSrc("imgCopanWholeTextSA", "images/Copan/CopanWholeTextStelaAltar.png");
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

