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
    htFillMesoamericanVigesimalValues(mesoamericaYear, 5, 3);
}

function htLoadExercise() {
    $("#btncheck").val(keywords[29]);
    $("#btnnew").val(keywords[30]);

    for (let i = 0; i < 14; i += 2) {
        $("#lblans"+i).text(keywords[31]);
        $("#lblans"+(i+1)).text(keywords[32]);
    }

    for (let i = 0; i < 7; i++) {
        $("#answer"+i).text("");
        $("input[name=exercise"+i+"]").prop("checked", false);
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

    var last = getRandomArbitrary(10000, 99999);
    $("#seq0").html(last);
    htSplitDecimalDigit("#seq", 5, last, 10);

    return false;
}

function htCheckExercise(val0, val1, answer) {
    var ans = parseInt($("input[name="+val0+"]:checked").val());
    var text = "";
    var format = "";
    if (ans == val1) {
        text = keywords[27];
        format = "green";
    } else {
        text = keywords[28];
        format = "red";
    }
    $(answer).text(text);
    $(answer).css("color", format);

    return false;
}

function htCheckAnswers()
{
    var vector = [ 1, 1, 0, 0, 0, 1, 1];
    for (let i = 0; i < vector.length; i++) {
        htCheckExercise("exercise"+i, vector[i], "#answer"+i);
    }
}
