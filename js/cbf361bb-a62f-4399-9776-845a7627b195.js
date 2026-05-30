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

function htLoadContent() {
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
    htWriteNavigation();

    htSetImageSrc("rightHandImg", "images/HistoryTracers/0Right_Hand_Small.png");
    htSetImageSrc("img4", "images/Xunantunich/WitzXunantunich.jpg");
    htSetImageSrc("img1", "images/ElSalvadorMuseo/SanSalvadorESAntropologia.jpg");
    htSetImageSrc("img2", "images/HistoryTracers/pyramid.jpg");
    htSetImageSrc("img3", "images/HistoryTracers/pentagonal_pyramid.jpg");
    htSetImageSrc("leftHandImg", "images/HistoryTracers/0Left_Hand_Small.png");
    htSetImageSrc("img0", "images/SanJoseCRMuseo/SanJoseCRAntropologia.jpg");
    return false;
}

