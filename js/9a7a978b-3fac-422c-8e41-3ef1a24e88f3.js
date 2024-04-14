// SPDX-License-Identifier: GPL-3.0-or-later

var multFirstTime = true;
var rValues = [];
var lValues = [];

function htFillYupanaMultYupana0(value, times)
{
    lValues = htFillYupanaDecimalValuesWithRepetition("#yupana0", value, times, 5, yupanaClasses);
    rValues = lValues.slice();
    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana0', lValues);
    rValues[0] = times;
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana0', rValues);
}

function htFillYupana1Sum()
{
    var LocalLeftValues = htFillYupanaDecimalValues('#yupana1', 5555, 5, 'red_dot_right_up');
    var LocalRightValues = htFillYupanaDecimalValues('#yupana1', 5555, 5, 'blue_dot_right_bottom');

    var totals = htSumYupanaVectors(LocalLeftValues, LocalRightValues);
    htCleanYupanaDecimalValues('#yupana1', 5);
    htFillYupanaDecimalValues('#yupana1', totals, 5, 'red_dot_right_up');
    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', LocalLeftValues);
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', LocalRightValues);
    htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
    htWriteYupanaMovement(LocalLeftValues, LocalRightValues, '#yupana1', 5, '#tc7f');
}

function htLoadExercise() {
    $("#btncheck").val(keywords[29]);
    $("#btnnew").val(keywords[30]);

    for (let i = 0; i < 17; i += 2) {
        $("#lblans"+i).text(keywords[31]);
        $("#lblans"+(i+1)).text(keywords[32]);
    }

    for (let i = 0; i < 9; i++) {
        $("#answer"+i).text("");
        $("input[name=exercise"+i+"]").prop("checked", false);
    }

    var times = $("#ia2yupana1").val();
    var value = $("#ia2yupana0").val();
    if (multFirstTime) {
        htFillYupana1Sum();
        multFirstTime = false;
    }

    $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
    });

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var sel = $(this).val();
        htCleanYupanaDecimalValues('#yupana0', 5);
        value = $("#ia2yupana0").val();
        times = $("#ia2yupana1").val();
        htFillYupanaMultYupana0(value, times);
        if (sel == "values") {
            htCleanYupanaAdditionalColumn('#yupana0', 5, '#tc6f');
            $('#tc7f1').html("");
            htFillYupanaMultYupana0(value, times);
        } else {
            htCleanYupanaDecimalValues('#yupana0', 5);
            var result = value * times;
            resultValues = htFillYupanaDecimalValues('#yupana0', result, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
            htMultMakeMultiplicationTableText(value, times, '#yupana0', '#tc7f1');
        }
    });

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
    var vector = [ 1, 1, 1, 1, 0];
    for (let i = 0; i < vector.length; i++) {
        htCheckExercise("exercise"+i, vector[i], "#answer"+i);
    }
}
