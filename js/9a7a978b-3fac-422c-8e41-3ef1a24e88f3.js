// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htFillYupanaMultYupana0(value, times)
{
    local.lValues = htFillYupanaDecimalValuesWithRepetition("#yupana0", value, times, 3, yupanaClasses);
    local.rValues = local.lValues.slice();
    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana0', local.lValues);
    local.rValues[0] = times;
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana0', local.rValues);
}

function htLoadExercise() {
    if (local.answerVector == undefined) {
        local.answerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(local.answerVector);
    }
}

function htLoadContent() {
    local = { "lValues": [], "rValues": [], "answerVector": undefined };

    htWriteNavigation();

    htSetImageSrc("imgTawantsuyu", "images/Mapswire/mapswire-continent_sa-printable-map-south-america-lambert-az-hemi-271_Tawantsuyu.jpg");

    var times = $("#ia2yupana1").val();
    var value = $("#ia2yupana0").val();

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
        htCleanYupanaDecimalValues('#yupana0', 3);
        value = $("#ia2yupana0").val();
        times = $("#ia2yupana1").val();
        htFillYupanaMultYupana0(value, times);
        if (sel == "values") {
            htCleanYupanaAdditionalColumn('#yupana0', 3, '#tc6f');
            $('#tc7f1').html("");
            htFillYupanaMultYupana0(value, times);
        } else {
            htCleanYupanaDecimalValues('#yupana0', 3);
            var result = value * times;
            var resultValues = htFillYupanaDecimalValues('#yupana0', result, 3, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
            htMultMakeMultiplicationTableText(value, times, '#yupana0', '#tc7f1');
        }
    });

    var rvalues = [];
    var lvalues = [];

    htCleanYupanaDecimalValues('#yupana1', 3);
    lvalues = htFillYupanaDecimalValues('#yupana1', "55555", 3, 'red_dot_right_up');
    rvalues = htFillYupanaDecimalValues('#yupana10', "55555", 3, 'blue_dot_right_bottom');
    var totals = htSumYupanaVectors(lvalues, rvalues);
    htFillYupanaDecimalValues('#yupana1', totals, 3, 'red_dot_right_up');
    htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
    htWriteYupanaSumMovement(lvalues, rvalues, '#yupana1', 3, '#tc7f1');

    htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', lvalues);
    htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', rvalues);

    return false;
}

function htCheckAnswers()
{
    if (local.answerVector != undefined) {
        for (let i = 0; i < local.answerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, local.answerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}
