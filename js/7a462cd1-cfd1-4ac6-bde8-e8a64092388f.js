// SPDX-License-Identifier: GPL-3.0-or-later

var localCounter7a462cd1 = 0;

function htUpdateMembers() {
    if (localCounter7a462cd1 > 20) {
        localCounter7a462cd1 = 20;
    } else if (localCounter7a462cd1 < 0) {
        localCounter7a462cd1 = 0;
    }

    var hands;
    var feet;
    if (localCounter7a462cd1 == 10) {
        hands = 10;
        feet = 0;
    } else if (localCounter7a462cd1 > 10) {
        hands = 10;
        feet = localCounter7a462cd1 - 10;
    } else {
        hands = localCounter7a462cd1;
        feet = 0;
    }

 //   $("#yupana1 #tc6f1").html("<span class=\"text_to_paint\">"+unit+"</span>");
    $("#yupana1 #tc5f1").html("<span class=\"text_to_paint\">"+localCounter7a462cd1+"</span>");
    htSetImageForMembers('#leftHandImg1', 'Left_Hand_Small.png', '#rightHandImg1', 'Right_Hand_Small.png', hands);
    htSetImageForMembers('#leftFootImg1', 'LeftFoot.png', '#rightFootImg1', 'RightFoot.png', feet);
    htFillMesoamericanVigesimalValues(localCounter7a462cd1, 2, 6, undefined);
}

function htLoadContent() {
    $("#yupana1 #tc5f1").html("<span class=\"text_to_paint\">"+localCounter7a462cd1+"</span>");
    htSetImageForMembers('#leftHandImg1', 'Left_Hand_Small.png', '#rightHandImg1', 'Right_Hand_Small.png', 0);
    htSetImageForMembers('#leftFootImg1', 'LeftFoot.png', '#rightFootImg1', 'RightFoot.png', 0);
    htFillMesoamericanVigesimalValues(localCounter7a462cd1, 2, 6, undefined);

    $("#traineeUp1").on("click", function() {
        localCounter7a462cd1++;
        htUpdateMembers();
    });

    $("#traineeDown1").on("click", function() {
        localCounter7a462cd1--;
        htUpdateMembers();
    });
    htWriteNavigation();

    return false;
}

