// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    
    htSetImageSrc("leftHandImg", "images/HistoryTracers/0Left_Hand_Small.png")
    htSetImageSrc("rightHandImg", "images/HistoryTracers/0Right_Hand_Small.png")
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

var localCounter4f5cb = 0;

function htModify4f5cb(value)
{
    if (value < 0)
        value = 0;
    else if (value > 5)
        value = 5;

    return value;
}

function htLoadContent() {
    localCounter4f5cb = 0;
    localCounter4f5cb = htModify4f5cb(localCounter4f5cb);

    $("#traineeUp0").on("click", function() {
        localCounter4f5cb++;
        localCounter4f5cb = htModify4f5cb(localCounter4f5cb);

        var prefix = htGetImgSrcPrefix();
        $('#leftHandImg').attr('src', prefix+'images/HistoryTracers/'+localCounter4f5cb+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', prefix+'images/HistoryTracers/'+localCounter4f5cb+'Right_Hand_Small.png');

        $('#leftnum').html(localCounter4f5cb);
        $('#rightnum').html(localCounter4f5cb);
    });

    $("#traineeDown0").on("click", function() {
        localCounter4f5cb--;
        localCounter4f5cb = htModify4f5cb(localCounter4f5cb);

        var prefix = htGetImgSrcPrefix();
        $('#leftHandImg').attr('src', prefix+'images/HistoryTracers/'+localCounter4f5cb+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', prefix+'images/HistoryTracers/'+localCounter4f5cb+'Right_Hand_Small.png');

        $('#leftnum').html(localCounter4f5cb);
        $('#rightnum').html(localCounter4f5cb);
    });
    htWriteNavigation();

    return false;
}
