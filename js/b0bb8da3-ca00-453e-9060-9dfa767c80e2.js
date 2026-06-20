// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htFillCurrentYupanaSum()
{
    local.lvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana0').val(), 5, 'red_dot_right_up');
    local.rvalues = htFillYupanaDecimalValues('#yupana1', $('#ia2yupana1').val(), 5, 'blue_dot_right_bottom');
    if (local.sumFirstTime) {
        htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
        htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
    }
}

function htLoadContent() {
    htWriteNavigation();

    local = { "lvalues": [], "rvalues": [], "sumFirstTime": true, "counter": 0, "answerVector": undefined }; 

    if (local.sumFirstTime) {
        $( "#ia2yupana1" ).bind( "keyup mouseup", function() {
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
        local.sumFirstTime = false;
    }

    $( "input[name='yupanaradio']" ).on( "change", function() {
        var value = $(this).val();
        htCleanYupanaDecimalValues('#yupana1', 5);

        htFillCurrentYupanaSum();
        if (value == "values") {
            htCleanYupanaAdditionalColumn('#yupana1', 5, '#tc6f');
            $('#tc7f1').html("");
            htWriteYupanaValuesOnHTMLTable('#vl', '#yupana1', local.lvalues);
            htWriteYupanaValuesOnHTMLTable('#vr', '#yupana1', local.rvalues);
        } else {
            var totals = htSumYupanaVectors(local.lvalues, local.rvalues);
            htCleanYupanaDecimalValues('#yupana1', 5);
            htFillYupanaDecimalValues('#yupana1', totals, 5, 'red_dot_right_up');
            htWriteYupanaValuesOnHTMLTable('#tc6f', '#yupana1', totals);
            htWriteYupanaSumMovement(local.lvalues, local.rvalues, '#yupana1', 5, '#tc7f1');
        }
    });

    return false;
}
