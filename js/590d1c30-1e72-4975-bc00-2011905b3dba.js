// SPDX-License-Identifier: GPL-3.0-or-later

var localCounter590d1c30 = 0;
var localCounter590d1c30b = 0;

function htShowtrainee0() {
    if (localCounter590d1c30 > 9) {
        localCounter590d1c30 = 9;
    } else if (localCounter590d1c30 < 0) {
        localCounter590d1c30 = 0;
    }
    $("#tc7f1").html("<span class=\"text_to_paint\">"+localCounter590d1c30+"</span>");
    htSetImageForDigits('#leftHandImg0', '#rightHandImg0', localCounter590d1c30);
    htCleanYupanaDecimalValues('#yupana0', 5);
    htFillYupanaDecimalValues('#yupana0', localCounter590d1c30, 1, 'red_dot_right_up');
}

function htShowtrainee1() {
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
        htSetImageForDigits('#leftHandImg1', '#rightHandImg1', unit);
        htSetImageForDigits('#leftHandImg2', '#rightHandImg2', decene);
    } else {
        htSetImageForDigits('#leftHandImg1', '#rightHandImg1', 10);
        htSetImageForDigits('#leftHandImg2', '#rightHandImg2', unit);
    }
}

function htLoadExercise() {
    localCounter590d1c30 = 0;
    localCounter590d1c30b = 0;
    $("#tc7f1").html("<span class=\"text_to_paint\">"+localCounter590d1c30+"</span>");
    $("#yupana0 #tc1f1").html(htYupanaDrawFirstSquare());
    $("#yupana0 #tc2f1").html(htYupanaDrawSecondSquare());
    $("#yupana0 #tc3f1").html(htYupanaDrawThirdSquare());
    $("#yupana0 #tc4f1").html(htYupanaDrawFourthSquare());

    $("#yupana1 #tc5f1").html("<span class=\"text_to_paint\">"+localCounter590d1c30b+"</span>");
    $("#yupana1 #tc6f1").html("<span class=\"text_to_paint\">"+localCounter590d1c30b+"</span>");
    htSetImageForDigits('#leftHandImg1', '#rightHandImg1', 0);
    htSetImageForDigits('#leftHandImg2', '#rightHandImg2', 0);
    htFillTableHandsFeet("#yupana2");

    $("#traineeUp0").on("click", function() {
        localCounter590d1c30++;
        htShowtrainee0();
    });

    $("#traineeUp1").on("click", function() {
        localCounter590d1c30b++;
        htShowtrainee1();
    });

    $("#traineeDown0").on("click", function() {
        localCounter590d1c30--;
        htShowtrainee0();
    });

    $("#traineeDown1").on("click", function() {
        localCounter590d1c30b--;
        htShowtrainee1();
    });

    return false;
}

function htCheckAnswers()
{
    return false;
}

