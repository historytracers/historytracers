// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

// Must exist on this page: the loader calls htLoadContent() before
// htLoadExercise(), and without this definition the function left behind by the
// previously visited text runs here, throws, and skips htLoadExercise().
function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png");
    return false;
}

function htLoadExercise() {
    // Set before anything that can throw, so the hands in Figure 1 always load.
    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png");

    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation();

    $(".sumexample1").hover(function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeSumUniqueDigitStyle(id, "black");
    });

    $(".multexample").hover(function(){
        var id = $(this).attr("id");
        htChangeMultUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeMultUniqueDigitStyle(id, "black");
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

