// SPDX-License-Identifier: GPL-3.0-or-later
var first = true;

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

    if (first) {
        htPlotPoemChart('chart2', 5);
        htPlotPoemChart('chart3', 10);
        htPlotPoemChart('chart4', [5, 10]);
        var year = new Date().getFullYear() ;
        htFillYupanaValues('#yupana0', year, 5, '#tc6f', 'red_dot_right_up');
        htFillMesoamericanVigesimalValues(year, 5, 3);
        first = false;
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
