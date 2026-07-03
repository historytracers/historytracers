// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector376a5f3c = undefined;

function htLoadExercise() {
    if (localAnswerVector376a5f3c == undefined) {
        localAnswerVector376a5f3c = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector376a5f3c);
    }
}

function htLoadContent() {
    htAddReligionReflection("#htReligiousReflection");
    $("#SumerianKingListDesc").html(keywords[90]);

    htWriteNavigation();

    htSetImageSrc("imgEA", "images/Ashmolean/10015.jpg");
    htSetImageSrc("imgGilgamesh", "images/BritishMuseum/mid_00107404_001.jpg");
    htSetImageSrc("imgKL", "images/Ashmolean/KingList.jpg");
    htSetImageSrc("imgLugalbanda", "images/BritishMuseum/mid_00846714_001.jpg");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector376a5f3c != undefined) {
        for (let i = 0; i < localAnswerVector376a5f3c.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector376a5f3c[i], "#answer"+i, "#explanation"+i);
        }
    }
}

