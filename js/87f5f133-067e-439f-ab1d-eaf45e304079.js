// SPDX-License-Identifier: GPL-3.0-or-later

var localCounter87f5f133 = undefined;

function htModify87f5f133(value)
{
    if (value < 1)
        value = 1;
    else if (value > 5)
        value = 5;

    return value;
}

function htLoadContent() {
    localCounter87f5f133 = 1;
    localCounter87f5f133 = htModify87f5f133(localCounter87f5f133);

    $("#traineeUp0").on("click", function() {
        localCounter87f5f133++;
        localCounter87f5f133 = htModify87f5f133(localCounter87f5f133);

        $('#leftHandImg').attr('src', 'images/HistoryTracers/'+(localCounter87f5f133 - 1)+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', 'images/HistoryTracers/'+localCounter87f5f133+'Right_Hand_Small.png');

        $('#leftnum').html(localCounter87f5f133 - 1);
        $('#rightnum').html(localCounter87f5f133);
    });

    $("#traineeDown0").on("click", function() {
        localCounter87f5f133--;
        localCounter87f5f133 = htModify87f5f133(localCounter87f5f133);

        $('#leftHandImg').attr('src', 'images/HistoryTracers/'+(localCounter87f5f133 - 1)+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', 'images/HistoryTracers/'+localCounter87f5f133+'Right_Hand_Small.png');

        $('#leftnum').html(localCounter87f5f133 - 1);
        $('#rightnum').html(localCounter87f5f133);
    });
    htWriteNavigation();

    htSetImageSrc("rightHandImg", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("leftHandImg", "images/HistoryTracers/0Left_Hand_Small.png");
    htSetImageSrc("imgMeter", "images/HistoryTracers/Meter.jpg");

    return false;
}
