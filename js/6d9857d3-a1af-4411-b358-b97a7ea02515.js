// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htUpdateYupana6d9857d3(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana0', 2);
    local.rvalues = htFillYupanaDecimalValues('#yupana0', lv, 2, 'red_dot_right_up');
    local.lvalues = htFillYupanaDecimalValues('#yupana0', rv, 2, 'blue_dot_right_bottom');

    $("#rightHandImg3").attr("src", local.prefix+"images/HistoryTracers/"+lv+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", local.prefix+"images/HistoryTracers/"+rv+"Left_Hand_Small.png");
}

function htUpdateValues6d9857d3(left, right) {
    local.left6d9857d3 = left;
    local.right6d9857d3 = right;

    if (left == 10 && right == 0) {
        left = 5;
        right = 5;
    }

    $("#rightHandImg3").attr("src", local.prefix+"images/HistoryTracers/"+right+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", local.prefix+"images/HistoryTracers/"+left+"Left_Hand_Small.png");
}

function htSetValues6d9857d3() {
    if (local.yupanaSelected == "-1") {
        return;
    }

    if (local.yupanaSelected == "0") {
        htUpdateValues6d9857d3(3, 1);
    } else if (local.yupanaSelected == "1") {
        htUpdateValues6d9857d3(5, 1);
    } else if (local.yupanaSelected == "2") {
        htUpdateValues6d9857d3(10, 0);
    } else if (local.yupanaSelected == "3") {
        htUpdateValues6d9857d3(3, 0);
    } else if (local.yupanaSelected == "4") {
        htUpdateValues6d9857d3(2, 0);
    }
}

function htResetValues6d9857d3() {
    if (local.yupanaSelected == "-1") {
        return;
    }

    if (local.yupanaSelected == "0") {
        htUpdateValues6d9857d3(2, 2);
    } else if (local.yupanaSelected == "1") {
        htUpdateValues6d9857d3(3, 3);
    } else if (local.yupanaSelected == "2") {
        htUpdateValues6d9857d3(5, 5);
    } else if (local.yupanaSelected == "3") {
        htUpdateValues6d9857d3(1, 2);
    } else if (local.yupanaSelected == "4") {
        htUpdateValues6d9857d3(1, 1);
    }
}

function htSetComplement5(leftImgId, leftTxt, rightImgId, rightTxt) {
    var val = 5 - local.currentLeft;
    $(leftImgId).attr("src", local.prefix+"images/HistoryTracers/"+local.currentLeft+"Left_Hand_Small.png");
    $(leftTxt).html(local.currentLeft);
    $(rightImgId).attr("src", local.prefix+"images/HistoryTracers/"+val+"Left_Hand_Small.png");
    $(rightTxt).html(val);
}

function htSetComplement10(leftImgId, rightImgId, complementTxt) {
    let right = 10 - local.totalComplement;
    let left = 0;

    if (right > 5) {
        left = right - 5;
        right = 5;
    } 

    $(leftImgId).attr("src", local.prefix+"images/HistoryTracers/"+right+"Left_Hand_Small.png");
    $(rightImgId).attr("src", local.prefix+"images/HistoryTracers/"+left+"Left_Hand_Small.png");
    $(complementTxt).html(local.totalComplement);
}

function htLoadContent() {
    htWriteNavigation();
    local = {
        "yupanaSelected": "-1",
        "rvalues": [],
        "lvalues": [],
        "left6d9857d3": 0,
        "right6d9857d3": 0,
        "currentLeft": 5,
        "totalComplement": 0,
        "prefix": htGetImgSrcPrefix()
    };

    $("#rightHandImg").attr("src", local.prefix+"images/HistoryTracers/0Right_Hand_Small.png");
    $("#leftHandImg").attr("src", local.prefix+"images/HistoryTracers/5Left_Hand_Small.png");

    $("#rightHandImg2").attr("src", local.prefix+"images/HistoryTracers/5Right_Hand_Small.png");
    $("#leftHandImg2").attr("src", local.prefix+"images/HistoryTracers/5Left_Hand_Small.png");

    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);

    $( "input[name='yupanaradio']" ).on( "change", function() {
        local.yupanaSelected = $(this).val();
        htResetValues6d9857d3();

        htUpdateYupana6d9857d3(local.left6d9857d3, local.right6d9857d3);
    });

    $("#traineeUp3").on("click", function() {
        htSetValues6d9857d3();

        var totals = htSumYupanaVectors(local.rvalues, local.lvalues);
        htCleanYupanaDecimalValues('#yupana0', 2);
        htFillYupanaDecimalValues('#yupana0', totals, 2, 'red_dot_right_up');
    });

    $("#traineeDown3").on("click", function() {
        htResetValues6d9857d3();
        htUpdateYupana6d9857d3(local.left6d9857d3, local.right6d9857d3);
    });

    $("#traineeUp1").on("click", function() {
        if (local.currentLeft == 5) {
            return;
        }

        local.currentLeft++;
        htSetComplement5("#leftHandImg", "#txtValue0", "#rightHandImg", "#txtValue1");
    });

    $("#traineeDown1").on("click", function() {
        if (local.currentLeft == 0) {
            return;
        }

        local.currentLeft--;
        htSetComplement5("#leftHandImg", "#txtValue0", "#rightHandImg", "#txtValue1");
    });

    $("#traineeUp2").on("click", function() {
        if (local.totalComplement == 10) {
            return;
        }

        local.totalComplement++;
        htSetComplement10("#leftHandImg2", "#rightHandImg2", "#txtValue2");
    });

    $("#traineeDown2").on("click", function() {
        if (local.totalComplement == 0) {
            return;
        }

        local.totalComplement--;
        htSetComplement10("#leftHandImg2", "#rightHandImg2", "#txtValue2");
    });

    return false;
}
