// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation();

    var divRadius = parseInt($(".htCircle[name='fig1']").width());

    $(".htCircle").mouseenter(function(){
        var name = $(this).attr('name');;
        if (name == "fig1") {
            $(this).animate({ width: 4*divRadius, height: 4*divRadius }, 'slow');
        } else {
            $(this).animate({ width: divRadius, height: divRadius }, 'slow');
        }
    }).mouseleave(function(){
        var name = $(this).attr('name');;
        if (name == "fig1") {
            $(this).animate({ width: divRadius, height: divRadius }, 'slow');
        } else {
            $(this).animate({ width: 4*divRadius, height: 4*divRadius }, 'slow');
        }
    });

    $('table').each(function() {
        if (!$(this).hasClass('book_navigation')) {
            $(this).addClass('three_table_bg');
        }
    });

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

