// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation("first_steps");

    $(".sumexample1").hover(function(){
        var id = $(this).attr("id");
        if (id == undefined || id.length < 5) {
            return;
        }
        var idx = id[4];
        $("#cmtc"+idx).css("color", "red");
        $("#cmbc"+idx).css("color", "red");
        $("#cmrc"+idx).css("color", "red");
    }, function(){
        var id = $(this).attr("id");
        if (id == undefined || id.length < 5) {
            return;
        }
        var idx = id[4];
        $("#cmtc"+idx).css("color", "black");
        $("#cmbc"+idx).css("color", "black");
        $("#cmrc"+idx).css("color", "black");
    });

    $(".multexample1").hover(function(){
        var id = $(this).attr("id");
        if (id == undefined || id.length < 5) {
            return;
        }
        var idx = id[4];
        if (idx > 1) {
            $("#mmbc1").css("color", "red");
        } else {
            $("#mmbc"+idx).css("color", "red");
        }
        $("#mmtc"+idx).css("color", "red");
        $("#mmrc"+idx).css("color", "red");
    }, function(){
        var id = $(this).attr("id");
        if (id == undefined || id.length < 5) {
            return;
        }
        var idx = id[4];
        if (idx > 5) {
            $("#mmbc1").css("color", "black");
        } else {
            $("#mmbc"+idx).css("color", "black");
        }
        $("#mmtc"+idx).css("color", "black");
        $("#mmrc"+idx).css("color", "black");
    });

    htWriteMultiplicationTable("#mParent10", 10);
    htFillMultiplicationTable("chart1", 10, 10, false, true);

    return false;
}

function htCheckAnswers()
{

    if (localAnswerVector != undefined) {
        for (let i = 0; i < localAnswerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}

