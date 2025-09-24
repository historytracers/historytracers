// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector1ae03186 = undefined;
var localCounter1ae03186 = 0;

function htLoadExercise() {
    if (localAnswerVector1ae03186 == undefined) {
        localAnswerVector1ae03186 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector1ae03186);
    }
}

function htLoadContent() {
    $("#traineeUp0").on("click", function() {
        localCounter1ae03186++;
        localCounter1ae03186 = htModifyArrow('.htUpArrow', localCounter1ae03186);
        localCounter1ae03186 = htModifyArrow('.htDownArrow', localCounter1ae03186);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCounter1ae03186);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounter1ae03186, 1, 'red_dot_right_up');
    });

    $("#traineeDown0").on("click", function() {
        localCounter1ae03186--;
        localCounter1ae03186 = htModifyArrow('.htDownArrow', localCounter1ae03186);
        localCounter1ae03186 = htModifyArrow('.htUpArrow', localCounter1ae03186);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCounter1ae03186);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounter1ae03186, 1, 'red_dot_right_up');
    });

    htWriteNavigation();

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector1ae03186 != undefined) {
        for (let i = 0; i < localAnswerVector1ae03186.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector1ae03186[i], "#answer"+i, "#explanation"+i);
        }
    }
}

