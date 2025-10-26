// SPDX-License-Identifier: GPL-3.0-or-later
var firstRereading = true;

function htFillRereadingDates()
{
    var gregoryYear = new Date().getFullYear() ;
    var localCalendar = $("#site_calendar").val();
    var yupanaYear = 0;
    var mesoamericaYear = 0;
    if (localCalendar == "gregory")  {
        yupanaYear = gregoryYear;
        mesoamericaYear = gregoryYear;
    } else {
        switch(localCalendar) {
            case "julian":
            case "mesoamerican":
                yupanaYear = 99999;
                mesoamericaYear = parseInt(htConvertGregorianYearToJD(gregoryYear));
                break;
            case "hebrew":
            case "islamic":
            case "persian":
            case "hispanic":
            case "shaka":
            case "french":
            default:
                yupanaYear = htConvertGregorianYear(localCalendar, gregoryYear);
                mesoamericaYear = yupanaYear;
                break;
        }
    }

    $("#ia2yupana").val(yupanaYear);
    $("#ia2mesoamerica").val(mesoamericaYear);
    htFillYupanaValues('#yupana0', yupanaYear, 5, '#tc6f', 'red_dot_right_up');
    htFillMesoamericanVigesimalValues(mesoamericaYear, 5, 1, 3);
}

var localAnswerVector26e6b9ec = undefined;

function htLoadExercise() {
    if (localAnswerVector26e6b9ec == undefined) {
        localAnswerVector26e6b9ec = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector26e6b9ec);
    }

    if (firstRereading) {
        htPlotConstantChart('chart2', 5, keywords[44], keywords[45]);
        htPlotConstantChart('chart3', 10, keywords[44], keywords[45]);
        htPlotConstantChart('chart4', [5, 10], keywords[44], keywords[45]);

        firstRereading = false;
        htFillRereadingDates();
    }

    $("#ia2yupana").on("keyup", function() {
        var value = $(this).val();
        if (value < 0 || value > 99999) {
            $(this).val(0);
        }
    });

    $("#ia2mesoamerica").on("keyup", function() {
        var value = $(this).val();
        if (value < 0 || value > 3199999) {
            $(this).val(0);
        }
    });

    var last = htGetRandomArbitrary(10000, 99999);
    $("#seq0").html(last);
    htSplitDecimalDigit("#seq", 5, last, 10);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector26e6b9ec != undefined) {
        for (let i = 0; i < localAnswerVector26e6b9ec.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector26e6b9ec[i], "#answer"+i, "#explanation"+i);
        }
    }
}

