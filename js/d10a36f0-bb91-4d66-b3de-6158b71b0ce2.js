// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    $(".sumexample1").hover(function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "black");
    });

    htSetImageSrc("z0", "images/Sadomba/Gourd.png");
    htSetImageSrc("c1", "images/HistoryTracers/TortillaFinal2.png");
    htSetImageSrc("gc", "images/Tikal/TikalReservorio.jpg");
    htSetImageSrc("c0", "images/HistoryTracers/TortillaFinal1.png");
    htSetImageSrc("JC", "images/JoyaCeren/JoyaCerenCocina.jpg");
    htSetImageSrc("metate3", "images/Teotihuacan/MetateTeotihuacan.jpg");
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

    return false;
}
