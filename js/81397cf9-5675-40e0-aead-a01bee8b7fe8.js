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

function htFillLocalCutTable(id, min, max) {
    let i = min;
    while (i <= max) {
        let value = "<tr style=\"background-color: white;\">";
        for (let j =0 ; j < 10; j++, i++) {
            value += "<td>&nbsp;</td>";
        }
        $(id+" tr:last").after(value+"</tr>");
    }
}

function htLoadContent() {
    htWriteNavigation();
    htFillLocalCutTable("#cutTable", 0, 99);

    return false;
}
