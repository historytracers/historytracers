// SPDX-License-Identifier: GPL-3.0-or-later

var localCountercbf361bb = 0;

function htModifycbf361bb(value)
{
    if (value < 0)
        value = 0;
    else if (value > 5)
        value = 5;

    return value;
}

function htLoadExercise() {
    localCountercbf361bb = 0;
    localCountercbf361bb = htModifycbf361bb(localCountercbf361bb);

    $("#traineeUp0").on("click", function() {
        localCountercbf361bb++;
        localCountercbf361bb = htModifycbf361bb(localCountercbf361bb);

        $('#leftHandImg').attr('src', 'images/HistoryTracers/'+localCountercbf361bb+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', 'images/HistoryTracers/'+localCountercbf361bb+'Right_Hand_Small.png');

        $('#leftnum').html(localCountercbf361bb);
        $('#rightnum').html(localCountercbf361bb);
    });

    $("#traineeDown0").on("click", function() {
        localCountercbf361bb--;
        localCountercbf361bb = htModifycbf361bb(localCountercbf361bb);

        $('#leftHandImg').attr('src', 'images/HistoryTracers/'+localCountercbf361bb+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', 'images/HistoryTracers/'+localCountercbf361bb+'Right_Hand_Small.png');

        $('#leftnum').html(localCountercbf361bb);
        $('#rightnum').html(localCountercbf361bb);
    });
    htWriteNavigation("first_steps");

    return false;
}

