// SPDX-License-Identifier: GPL-3.0-or-later

var rvalues = [];
var lvalues = []
var sumFirstTime = true;

function htFillCurrentYupanaSum()
{
    lvalues = htFillYupanaDecimalValues('#yupana0', $('#ia2yupana0').val(), 5, 'red_dot_right_up');
    rvalues = htFillYupanaDecimalValues('#yupana0', $('#ia2yupana1').val(), 5, 'blue_dot_right_bottom');
    if (sumFirstTime) {
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana0', lvalues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana0', rvalues);
    }
}

function htLoadExercise() {
    $("#btncheck").val(keywords[29]);
    $("#btnnew").val(keywords[30]);

    for (let i = 0; i < 10; i += 2) {
        $("#lblans"+i).text(keywords[31]);
        $("#lblans"+(i+1)).text(keywords[32]);
    }

    for (let i = 0; i < 5; i++) {
        $("#answer"+i).text("");
        $("input[name=exercise"+i+"]").prop("checked", false);
    }


    if (sumFirstTime) {
        $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
            $("input[name='yupanaradio']").prop("checked", false);
            var value = $(this).val();
            if (value < 0 || value > 99999) {
                $(this).val(0);
            }
        });

        $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
            $("input[name='yupanaradio']").prop("checked", false);
            var value = $(this).val();
            if (value < 0 || value > 99999) {
                $(this).val(0);
            }
        });
        htFillCurrentYupanaSum();
        sumFirstTime = false;
    }

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var value = $(this).val();
        htCleanYupanaDecimalValues('#yupana0', 5);

        htFillCurrentYupanaSum();
        if (value == "values") {
            htCleanYupanaAdditionalColumn('#yupana0', 5, '#tc6f');
            htCleanYupanaAdditionalColumn('#yupana0', 5, '#tc7f');
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana0', lvalues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana0', rvalues);
        } else {
            var totals = htSumYupanaVectors(lvalues, rvalues);
            htCleanYupanaDecimalValues('#yupana0', 5);
            htFillYupanaDecimalValues('#yupana0', totals, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', totals);
            htWriteYupanaMovement(lvalues, rvalues, '#yupana0', 5, '#tc7f');
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
    var vector = [ 1, 0, 1, 1, 1];
    for (let i = 0; i < vector.length; i++) {
        htCheckExercise("exercise"+i, vector[i], "#answer"+i);
    }
}
