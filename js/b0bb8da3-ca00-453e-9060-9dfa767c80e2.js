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

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value < 0) {
                $(this).val(0);
        } else if (value > 4999) {
            $(this).val(4999);
        }
    });

    $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
        $("input[name='yupanaradio']").prop("checked", false);
        var value = $(this).val();
        if (value < 0) {
            $(this).val(0);
        } else if (value > 4999) {
            $(this).val(4999);
        }
    });
    htFillCurrentYupanaSum();

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var value = $(this).val();
        htCleanYupanaDecimalValues('#yupana1', 4);

        htFillCurrentYupanaSum();
        if (value == "values") {
            htCleanYupanaAdditionalColumn('#yupana1', 4, '#tc6f');
            $('#tc7f1').html("");
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
        } else {
            var totals = htSumYupanaVectors(local.lvalues, local.rvalues);
            htCleanYupanaDecimalValues('#yupana1', 4);
            htFillYupanaDecimalValues('#yupana1', totals, 4, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
            htWriteYupanaSumMovement(local.lvalues, local.rvalues, '#yupana1', 4, '#tc7f1');
        }
    });

    return false;
}
