// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

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
    htWriteNavigation();

    htSetImageSrc("imgShona", "images/UniversityJohannesburg/ShonaJohannnesburg.jpg")
    htSetImageSrc("imgShona1", "images/Sadomba/ShonaHut.png")
    htSetImageSrc("img1", "images/Copan/Temple16Copan.png")
    return false;
}
