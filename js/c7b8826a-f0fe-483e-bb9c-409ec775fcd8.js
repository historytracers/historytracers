// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htSetMultColors(localClass, color, id)
{
    // Top line
    $("#mmtc2."+localClass).css("color", color);
    $("#mmtc1."+localClass).css("color", color);

    // Multiplicator
    $("#mmbc"+id+"."+localClass).css("color", color);

    var prefix = (id == 1) ? "mmptrc" : "mmpbrc";

    $("#"+prefix+"1."+localClass).css("color", color);
    $("#"+prefix+"2."+localClass).css("color", color);
    if (id == 1)
        return;
    $("#"+prefix+"3."+localClass).css("color", color);

}

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

    $(".multexample").hover(function(){
        var id = $(this).attr("id");
        if (id == undefined || id.length < 5) {
            return;
        }
        var idx = id[4];
        var localIdx = idx - 1;
        if ((idx % 2) == 0) {
            $("#mmbc"+localIdx).css("color", "red");
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
        var localIdx = idx - 1;
        if ((idx % 2) == 0) {
            $("#mmbc"+localIdx).css("color", "black");
        } else {
            $("#mmbc"+idx).css("color", "black");
        }
        $("#mmtc"+idx).css("color", "black");
        $("#mmrc"+idx).css("color", "black");
    });

    $('.ordercheck').change(function(){
        var id = $(this).attr("id");
        if (id == undefined) {
            return;
        }

        if ($(this).is(':checked')) {
            htSetMultColors("multexample1", "red", id);
        } else {
            htSetMultColors("multexample1", "black", id);
        }
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

