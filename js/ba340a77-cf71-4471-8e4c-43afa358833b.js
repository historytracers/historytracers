// SPDX-License-Identifier: GPL-3.0-or-later

var localCounterba340a77 = 0;

function htLoadContent() {
    htWriteNavigation();

    localCounterba340a77 = 0;
    localCounterba340a77 = htModifyArrow('.htUpArrow', localCounterba340a77);
    localCounterba340a77 = htModifyArrow('.htDownArrow', localCounterba340a77);

    $("#traineeUp0").on("click", function() {
        localCounterba340a77++;
        localCounterba340a77 = htModifyArrow('.htUpArrow', localCounterba340a77);
        localCounterba340a77 = htModifyArrow('.htDownArrow', localCounterba340a77);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCounterba340a77);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounterba340a77, 1, 'red_dot_right_up');
    });

    $("#traineeDown0").on("click", function() {
        localCounterba340a77--;
        localCounterba340a77 = htModifyArrow('.htDownArrow', localCounterba340a77);
        localCounterba340a77 = htModifyArrow('.htUpArrow', localCounterba340a77);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCounterba340a77);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounterba340a77, 1, 'red_dot_right_up');
    });

    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);

    htSetImageSrc("imgSoroban", "images/Tohoku/Soroban.png");
    htSetImageSrc("imgSuanpan", "images/BritishMuseum/mid_01381495_001.jpg");

    htSetImageSrc("leftHandImg", "images/HistoryTracers/0Left_Hand_Small.png");
    htSetImageSrc("rightHandImg", "images/HistoryTracers/0Right_Hand_Small.png");

    return false;
}
