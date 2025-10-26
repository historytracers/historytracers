// SPDX-License-Identifier: GPL-3.0-or-later

var localCounter590d1c30 = 0;
var localCounter590d1c30b = 0;

function htShowTrainee0() {
    if (localCounter590d1c30 > 9) {
        localCounter590d1c30 = 9;
    } else if (localCounter590d1c30 < 0) {
        localCounter590d1c30 = 0;
    }
    $("#tc7f1").html("<span class=\"text_to_paint\">"+localCounter590d1c30+"</span>");
    htSetImageForMembers('#leftHandImg0', 'Left_Hand_Small.png', '#rightHandImg0', 'Right_Hand_Small.png', localCounter590d1c30);
    htCleanYupanaDecimalValues('#yupana0', 5);
    htFillYupanaDecimalValues('#yupana0', localCounter590d1c30, 1, 'red_dot_right_up');
}

function htShowTrainee1() {
    if (localCounter590d1c30b > 19) {
        localCounter590d1c30b = 19;
    } else if (localCounter590d1c30b < 0) {
        localCounter590d1c30b = 0;
    }
    var unit;
    var decene;
    if (localCounter590d1c30b == 10) {
        unit = 0;
        decene = 1;
    } else if (localCounter590d1c30b > 10) {
        unit = localCounter590d1c30b - 10;
        decene = 1;
    } else {
        unit = localCounter590d1c30b;
        decene = 0;
    }

    $("#yupana1 #tc6f1").html("<span class=\"text_to_paint\">"+unit+"</span>");
    $("#yupana1 #tc5f1").html("<span class=\"text_to_paint\">"+decene+"</span>");
    if (localCounter590d1c30b < 10 ) {
        htSetImageForMembers('#leftHandImg1', 'Left_Hand_Small.png', '#rightHandImg1', 'Right_Hand_Small.png', unit);
        htSetImageForMembers('#leftHandImg2', 'Left_Hand_Small.png', '#rightHandImg2', 'Right_Hand_Small.png', decene);
    } else {
        htSetImageForMembers('#leftHandImg1', 'Left_Hand_Small.png', '#rightHandImg1', 'Right_Hand_Small.png', 10);
        htSetImageForMembers('#leftHandImg2', 'Left_Hand_Small.png', '#rightHandImg2', 'Right_Hand_Small.png', unit);
    }
}

function htLoadContent() {
    localCounter590d1c30 = 0;
    localCounter590d1c30b = 0;
    $("#tc7f1").html("<span class=\"text_to_paint\">"+localCounter590d1c30+"</span>");
    $("#yupana0 #tc1f1").html(htYupanaDrawFirstSquare());
    $("#yupana0 #tc2f1").html(htYupanaDrawSecondSquare());
    $("#yupana0 #tc3f1").html(htYupanaDrawThirdSquare());
    $("#yupana0 #tc4f1").html(htYupanaDrawFourthSquare());

    $("#yupana1 #tc5f1").html("<span class=\"text_to_paint\">"+localCounter590d1c30b+"</span>");
    $("#yupana1 #tc6f1").html("<span class=\"text_to_paint\">"+localCounter590d1c30b+"</span>");
    htSetImageForMembers('#leftHandImg1', 'Left_Hand_Small.png', '#rightHandImg1', 'Right_Hand_Small.png', 0);
    htSetImageForMembers('#leftHandImg2', 'Left_Hand_Small.png', '#rightHandImg2', 'Right_Hand_Small.png', 0);
    htFillTableHandsFeet("#yupana2", 0, 20);

    $("#traineeUp0").on("click", function() {
        localCounter590d1c30++;
        htShowTrainee0();
    });

    $("#traineeUp1").on("click", function() {
        localCounter590d1c30b++;
        htShowTrainee1();
    });

    $("#traineeDown0").on("click", function() {
        localCounter590d1c30--;
        htShowTrainee0();
    });

    $("#traineeDown1").on("click", function() {
        localCounter590d1c30b--;
        htShowTrainee1();
    });
    htWriteNavigation();

    return false;
}

