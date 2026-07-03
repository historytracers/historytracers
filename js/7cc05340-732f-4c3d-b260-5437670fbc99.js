// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }
}

function htLoadContent() {
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



    htSetImageSrc("imgESA1", "images/ESA/Planck_s_view_of_the_cosmic_microwave_background.jpg");
    htSetImageSrc("imgESA2", "images/ESA/Planck_history_of_Universe.jpg");
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

