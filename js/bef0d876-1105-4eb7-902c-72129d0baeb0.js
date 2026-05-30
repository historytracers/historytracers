// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVectorbef0d876 = undefined;

function htLoadExercise() {
    if (localAnswerVectorbef0d876 == undefined) {
        localAnswerVectorbef0d876 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorbef0d876);
    }
}

function htLoadContent() {
    htAddTreeReflection("#myFirstReflection", 55);
    $("#bndPortugal").html(keywords[88]);
    $("#ANTTPortugal1").html(keywords[89]);
    $("#ANTTPortugal2").html(keywords[89]);
    $("#ANTTPortugal3").html(keywords[89]);

    htWriteNavigation();

    htSetImageSrc("ArmsAntonio", "images/ANTT/ANTTPT-TT-CR-D-A-1-19_m0236.jpg");
    htSetImageSrc("ArmsMaertin", "images/ANTT/ANTTPT-TT-CR-D-A-1-19_m0235.jpg");
    htSetImageSrc("bndPortugal6r", "images/BibliotecaNacionalDigital/BNDTordesillas_6r.jpg");
    htSetImageSrc("PDPFamilyTree", "images/ANTT/ANTT_PT-TT-TSO-CG-A-008-001-23165_m0062_derivada.jpg");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorbef0d876 != undefined) {
        for (let i = 0; i < localAnswerVectorbef0d876.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorbef0d876[i], "#answer"+i, "#explanation"+i);
        }
    }
}

