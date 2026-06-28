// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htFillCurrentYupanaSum()
{
    local.lvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana0').val(), 4, 'red_dot_right_up');
    local.rvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana1').val(), 4, 'blue_dot_right_bottom');
    if (local.sumFirstTime) {
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
        local.sumFirstTime = false;
    }
}

function htLoadContent() {
    htWriteNavigation();

    local = { "lvalues": [], "rvalues": [], "sumFirstTime": true, "counter": 0, "answerVector": undefined }; 

    function htRebuildTc5fCells() {
        for (let i = 1; i <= 4; i++) {
            $('#yupana1 #tc5f' + i).html('<span id="vl' + i + '"></span> + <span id="vr' + i + '"></span>');
        }
    }

    function htResetSumOnInput() {
        window.htYupanaCalculationInProgress = false;
        window.htYupanaAnimationCancelled = true;
        window.htStepByStepState = null;
        $(".yupana-btn").removeClass("active");
        $(".yupana-btn[data-action='calcular'], .yupana-btn[data-action='stepbystep']").prop("disabled", true);
        htCleanYupanaDecimalValues('#yupana1');
        $('#yupana1').find('[id^="tc6f"]').html(' ');
        htRebuildTc5fCells();
        $('#tc7f1').html("");
        local.lvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana0').val(), 4, 'red_dot_right_up');
        local.rvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana1').val(), 4, 'blue_dot_right_bottom');
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
    }

    $( "#ia2yupana0" ).bind( "keyup mouseup", function() {
        var value = $(this).val();
        if (value < 0) {
            $(this).val(0);
        } else if (value > 4999) {
            $(this).val(4999);
        }
        htResetSumOnInput();
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        var value = $(this).val();
        if (value < 0) {
            $(this).val(0);
        } else if (value > 4999) {
            $(this).val(4999);
        }
        htResetSumOnInput();
    });
    htFillCurrentYupanaSum();

    $(".yupana-btn").on("click", function() {
        var value = $(this).data("action");

        if (window.htStepByStepState && value == "stepbystep") {
            var hasMore = htYupanaStepByStepClick(local.lvalues, local.rvalues, '#yupana1', 4, '#tc7f1');
            if (!hasMore) {
                window.htStepByStepState = null;
            }
            return;
        }

        $(".yupana-btn").removeClass("active");
        $(this).addClass("active");
        window.htStepByStepState = null;
        window.htYupanaAnimationCancelled = true;
        htCleanYupanaDecimalValues('#yupana1');

        htFillCurrentYupanaSum();
        $('#yupana1').find('[id^="tc6f"]').html(' ');
        htRebuildTc5fCells();
        $('#tc7f1').html("");
        if (value == "values") {
            $(".yupana-btn[data-action='calcular'], .yupana-btn[data-action='stepbystep']").prop("disabled", false);
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
        } else if (value == "stepbystep") {
            $(".yupana-btn[data-action='calcular'], .yupana-btn[data-action='stepbystep']").prop("disabled", false);
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
            var hasMore = htYupanaStepByStepClick(local.lvalues, local.rvalues, '#yupana1', 4, '#tc7f1');
            if (!hasMore) {
                window.htStepByStepState = null;
            }
        } else {
            var totals = htSumYupanaVectors(local.lvalues, local.rvalues);
            htCleanYupanaDecimalValues('#yupana1');
            htFillYupanaDecimalValues('#yupana1', totals, 4, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
            htWriteYupanaSumMovement(local.lvalues, local.rvalues, '#yupana1', 4, '#tc7f1');
        }
    });

    return false;
}
