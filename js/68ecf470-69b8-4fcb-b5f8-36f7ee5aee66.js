// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector68ecf470 = undefined;
var rvalues = [];
var lvalues = [];
var left68ecf470 = 0;
var right68ecf470 = 0;
var yupanaSelected = "-1";

function htUpdateYupana68ecf470(lv, rv)
{
    htCleanYupanaDecimalValues('#yupana0', 2);
    rvalues = htFillYupanaDecimalValues('#yupana0', lv, 2, 'red_dot_right_up');
    lvalues = htFillYupanaDecimalValues('#yupana0', rv, 2, 'blue_dot_right_bottom');

    $("#rightHandImg3").attr("src", "images/HistoryTracers/"+lv+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", "images/HistoryTracers/"+rv+"Left_Hand_Small.png");
}

function htUpdateValues68ecf470(left, right) {
    left68ecf470 = left;
    right68ecf470 = right;

    if (left == 10 && right == 0) {
        left = 5;
        right = 5;
    }
    $("#rightHandImg3").attr("src", "images/HistoryTracers/"+right+"Right_Hand_Small.png");
    $("#leftHandImg3").attr("src", "images/HistoryTracers/"+left+"Left_Hand_Small.png");
}

function htSetValues68ecf470() {
    if (yupanaSelected == "-1") {
        return;
    }

    if (yupanaSelected == "0") {
        htUpdateValues68ecf470(3, 1);
    } else if (yupanaSelected == "1") {
        htUpdateValues68ecf470(5, 1);
    } else if (yupanaSelected == "2") {
        htUpdateValues68ecf470(10, 0);
    } else if (yupanaSelected == "3") {
        htUpdateValues68ecf470(3, 0);
    } else if (yupanaSelected == "4") {
        htUpdateValues68ecf470(2, 0);
    }
}

function htResetValues68ecf470() {
    if (yupanaSelected == "-1") {
        return;
    }

    if (yupanaSelected == "0") {
        htUpdateValues68ecf470(2, 2);
    } else if (yupanaSelected == "1") {
        htUpdateValues68ecf470(3, 3);
    } else if (yupanaSelected == "2") {
        htUpdateValues68ecf470(5, 5);
    } else if (yupanaSelected == "3") {
        htUpdateValues68ecf470(1, 2);
    } else if (yupanaSelected == "4") {
        htUpdateValues68ecf470(1, 1);
    }
}

function WriteOneOrder(name) {
    var left = parseInt($("#leftVL0").html());
    var right = parseInt($("#rightVR0").html());

    var side = 0;
    if (name == "traineeUpL") {
        side = 0;
        left++;
    } else if (name == "traineeUpR") {
        side = 1;
        right++;
    } else if (name == "traineeDownR") {
        side = 1;
        right--;
    } else {
        side = 0;
        left--;
    }

    if (right < 0) {
        right = 0;
    }
    if (left < 0) {
        left = 0;
    }
    if (right > 19) {
        right = 19;
    }
    if (left > 19) {
        left = 19;
    }

    var total = left + right;
    if (total > 19) {
        if (!side && right > 0) {
            right--;
        }
        if (side && left > 0) {
            left--;
        }

        total = 19;
    }

    $("#leftVL0").html(left);
    $("#rightVR0").html(right);
    $("#totalVE0").html(total);

    $("#imgml0").attr("src", "images/HistoryTracers/Maya_"+left+".png");
    $("#imgmr0").attr("src", "images/HistoryTracers/Maya_"+right+".png");
    $("#imgme0").attr("src", "images/HistoryTracers/Maya_"+total+".png");
}

function htLoadExercise() {
    if (localAnswerVector68ecf470 == undefined) {
        localAnswerVector68ecf470 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector68ecf470);
    }
}

function htLoadContent() {
    htWriteNavigation();

    $( "input[name='yupanaradio']" ).on( "change", function() {
        yupanaSelected = $(this).val();
        htResetValues68ecf470();

        htUpdateYupana68ecf470(left68ecf470, right68ecf470);
    });

    $("#traineeUp3").on("click", function() {
        htSetValues68ecf470();

        var totals = htSumYupanaVectors(rvalues, lvalues);
        htCleanYupanaDecimalValues('#yupana0', 2);
        htFillYupanaDecimalValues('#yupana0', totals, 2, 'red_dot_right_up');
    });

    $("#traineeDown3").on("click", function() {
        htResetValues68ecf470();
        htUpdateYupana68ecf470(left68ecf470, right68ecf470);
    });

    $(".upArrowWithFA").on("click", function() {
        var name = $(this).attr('name');
        WriteOneOrder(name);
    });

    $(".downArrowWithFA").on("click", function() {
        var name = $(this).attr('name');
        WriteOneOrder(name);
    });

    $(".sumexample1").hover(function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "black");
    });


    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector68ecf470 != undefined) {
        for (let i = 0; i < localAnswerVector68ecf470.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector68ecf470[i], "#answer"+i, "#explanation"+i);
        }
    }
}

