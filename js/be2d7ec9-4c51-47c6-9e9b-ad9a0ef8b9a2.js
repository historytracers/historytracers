// SPDX-License-Identifier: GPL-3.0-or-later

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

function htLoadExercise() {
    $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        lValues = htFillYupanaDecimalValues('#yupana0', value, 5, 'red_dot_right_up');
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        rValues = htFillYupanaDecimalValues('#yupana0', value, 5, 'blue_dot_right_bottom');
    });

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var sel = $(this).val();
        htCleanYupanaDecimalValues('#yupana0', 5);
        var value0 = $("#ia2yupana0").val();
        var value1 = $("#ia2yupana1").val();
        $("#tc7f1").html("");
        var errmsg = "";
        if (sel == "mult") {
            if (value0 < 0 || value0 > 9) {
                errmsg += mathKeywords[6]+ " "+value0+". ";
                value0 = 0;
            }

            if (value1 < 0 || value1 > 9) {
                errmsg += mathKeywords[6]+ " "+value1+". ";
                value1 = 0;
            }


            htFillYupanaMultYupana0(value0, value1);
            htCleanYupanaDecimalValues('#yupana0', 5);
            var result = value0 * value1;
            resultValues = htFillYupanaDecimalValues('#yupana0', result, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
            htMultMakeMultiplicationTableText(value0, value1, '#yupana0', '#tc7f1');
            htFillYupanaDecimalOperator('#yupana0', '#op', 5, 'x');
        } else if (sel == "sum") {
            if (value0 < 0 || value0 > 99999) {
                errmsg += mathKeywords[6]+ " "+value0+". ";
                value0 = 0;
            }

            if (value1 < 0 || value1 > 99999) {
                errmsg += mathKeywords[6]+ " "+value1+". ";
                value1 = 0;
            }

            htCleanYupanaDecimalValues('#yupana0', 5);
            lValues = htFillYupanaDecimalValues('#yupana0', value0, 5, 'red_dot_right_up');
            rValues = htFillYupanaDecimalValues('#yupana0', value1, 5, 'blue_dot_right_bottom');
            htCleanYupanaDecimalValues('#yupana0', 5);
            var totals = htSumYupanaVectors(lValues, rValues);
            htFillYupanaDecimalValues('#yupana0', totals, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', totals);
            htWriteYupanaSumMovement(lValues, rValues, '#yupana0', 5, '#tc7f1');
            htFillYupanaDecimalOperator('#yupana0', '#op', 5, '+');
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana0', lValues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana0', rValues);
        }
        $("#mathmessage").html(errmsg);
    });

    return false;
}

function htCheckExercise(val0, val1, answer) {
    return false;
}

function htCheckAnswers()
{
    return false;
}

