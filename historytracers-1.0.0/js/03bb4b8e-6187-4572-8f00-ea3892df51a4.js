// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector03bb4b8e = undefined;

function htModify03bb4b8e(value)
{
    if (value < 1)
        value = 1;
    else if (value > 5)
        value = 5;

    return value;
}

function htLoadContent() {
    localCounter03bb4b8e = 1;
    localCounter03bb4b8e = htModify03bb4b8e(localCounter03bb4b8e);

    $("#traineeUp0").on("click", function() {
        localCounter03bb4b8e++;
        localCounter03bb4b8e = htModify03bb4b8e(localCounter03bb4b8e);

        $('#leftHandImg').attr('src', 'images/HistoryTracers/'+(localCounter03bb4b8e - 1)+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', 'images/HistoryTracers/'+localCounter03bb4b8e+'Right_Hand_Small.png');

        $('#leftnum').html(localCounter03bb4b8e - 1);
        $('#rightnum').html(localCounter03bb4b8e);
    });

    $("#traineeDown0").on("click", function() {
        localCounter03bb4b8e--;
        localCounter03bb4b8e = htModify03bb4b8e(localCounter03bb4b8e);

        $('#leftHandImg').attr('src', 'images/HistoryTracers/'+(localCounter03bb4b8e - 1)+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', 'images/HistoryTracers/'+localCounter03bb4b8e+'Right_Hand_Small.png');

        $('#leftnum').html(localCounter03bb4b8e - 1);
        $('#rightnum').html(localCounter03bb4b8e);
    });
    htWriteNavigation();

    return false;
}

