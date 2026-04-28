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

function htSetMyLocalTable(val) {
    htWriteMultiplicationTable("#mParent1", val);
    htWriteMultiplicationTable("#mParent2", -1*val);
}

function htLoadContent() {
    htWriteNavigation();

    for (let i = 1; i < 10; i++) {
        $('#tableValue').append($('<option>', {
            value: i,
            text: i
        }));
    }

    $('#tableValue').val(2);
    htSetMyLocalTable(2);

    $('#tableValue').change(function() {
        var selectedValue = $(this).val();
        $("#mParent1").html("");
        $("#mParent2").html("");
        htSetMyLocalTable(selectedValue);
    });

    return false;
}
