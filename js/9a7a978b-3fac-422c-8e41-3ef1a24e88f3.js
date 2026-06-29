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

function htResetMultYupana0()
{
    window.htYupanaCalculationInProgress = false;
    window.htYupanaAnimationCancelled = true;
    window.htStepByStepState = null;
    $(".yupana-btn").removeClass("active");
    $(".yupana-btn[data-action='calcular'], .yupana-btn[data-action='stepbystep']").prop("disabled", true);
    htCleanYupanaDecimalValues('#yupana0', 3);
    htCleanYupanaAdditionalColumn('#yupana0', 3, '#tc6f');
    $('#tc7f1').html("");
    for (let i = 1; i <= 3; i++) {
        $('#yupana0 #tc5f' + i).html('<span id="vl' + i + '"></span> x <span id="vr' + i + '"></span>');
    }
}

function htStepByStepMultClick()
{
    if (!window.htStepByStepState) {
        var value = parseInt($("#ia2yupana0").val());
        var times = parseInt($("#ia2yupana1").val());
        if (value < 0 || value > 9) value = 0;
        if (times < 0 || times > 9) times = 0;
        if (value === 0 || times === 0) {
            htCleanYupanaDecimalValues('#yupana0', 3);
            htCleanYupanaAdditionalColumn('#yupana0', 3, '#tc6f');
            $('#tc7f1').html("0 x " + times + ":<br />" + mathKeywords[5] + "<br />");
            return;
        }

        window.htStepByStepState = {
            step: 0,
            value: value,
            times: times,
            currentTotal: 0
        };

        htCleanYupanaDecimalValues('#yupana0', 3);
        htCleanYupanaAdditionalColumn('#yupana0', 3, '#tc6f');
        $('#tc7f1').html("");
    }

    var state = window.htStepByStepState;

    if (state.step >= state.times) {
        window.htStepByStepState = null;
        var result = state.value * state.times;
        var resultValues = htFillYupanaDecimalValues('#yupana0', result, 3, 'red_dot_right_up');
        htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
        htMultMakeMultiplicationTableText(state.value, state.times, '#yupana0', '#tc7f1');
        $(".yupana-btn[data-action='calcular'], .yupana-btn[data-action='stepbystep']").prop("disabled", true);
        return;
    }

    state.step++;
    state.currentTotal += state.value;

    htCleanYupanaDecimalValues('#yupana0', 3);
    var currentValues = htFillYupanaDecimalValues('#yupana0', state.currentTotal, 3, 'red_dot_right_up');
    htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', currentValues);

    var stepResult = state.value * state.step;
    var stepText = state.step + ") " + (state.currentTotal - state.value) + " + " + state.value + " = " + state.currentTotal + ":<br />";
    stepText += htWriteSumOnYupana(state.currentTotal - state.value, state.value, state.currentTotal);
    if (state.step === state.times) {
        stepText += "<br /><b>" + state.value + " x " + state.times + " = " + (state.value * state.times) + "</b><br />";
    }
    $('#tc7f1').append(stepText);

    if (state.step >= state.times) {
        var result = state.value * state.times;
        htCleanYupanaDecimalValues('#yupana0', 3);
        var resultValues = htFillYupanaDecimalValues('#yupana0', result, 3, 'red_dot_right_up');
        htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
    }

    if (state.step >= state.times) {
        window.htStepByStepState = null;
        $(".yupana-btn[data-action='calcular'], .yupana-btn[data-action='stepbystep']").prop("disabled", true);
    }
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

    $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
        htResetMultYupana0();
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        var value = $(this).val();
        if (value < 0 || value > 9) {
            $(this).val(0);
        }
        htResetMultYupana0();
    });

    $(".yupana-btn").on("click", function() {
        var value = $(this).data("action");

        if (window.htStepByStepState && value == "stepbystep") {
            htStepByStepMultClick();
            return;
        }

        $(".yupana-btn").removeClass("active");
        $(this).addClass("active");
        window.htStepByStepState = null;
        window.htYupanaAnimationCancelled = true;
        htCleanYupanaDecimalValues('#yupana0', 3);

        $('#yupana0').find('[id^="tc6f"]').html(' ');
        $('#tc7f1').html("");
        for (let i = 1; i <= 3; i++) {
            $('#yupana0 #tc5f' + i).html('<span id="vl' + i + '"></span> x <span id="vr' + i + '"></span>');
        }

        var val = $("#ia2yupana0").val();
        var times = $("#ia2yupana1").val();

        if (value == "values") {
            $(".yupana-btn[data-action='calcular'], .yupana-btn[data-action='stepbystep']").prop("disabled", false);
            htFillYupanaMultYupana0(val, times);
        } else if (value == "stepbystep") {
            $(".yupana-btn[data-action='calcular'], .yupana-btn[data-action='stepbystep']").prop("disabled", false);
            htStepByStepMultClick();
        } else {
            var result = val * times;
            var resultValues = htFillYupanaDecimalValues('#yupana0', result, 3, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana0', resultValues);
            htMultMakeMultiplicationTableText(val, times, '#yupana0', '#tc7f1');
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
