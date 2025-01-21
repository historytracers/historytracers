// SPDX-License-Identifier: GPL-3.0-or-later

function htSetValue323c97e8(val, min, max)
{
    if (val < min) {
        val = min;
    } else if (val >= max) {
        val = max;
    }

    return val;
}

function htUpdateMesoScreen323c97e8(n) {
    n = htSetValue323c97e8(n, 0, 10239999999999);
    htCleanMesoamericanVigesimalValues(10, null);
    htFillMesoamericanVigesimalValues(n, 10, 1, undefined);
    var localLang = $("#site_language").val();
    var valueFormat = new Intl.NumberFormat(localLang).format(n);
    $("#mesoIndoArabic").html(valueFormat);
}

function htUpdateYupanaScreen323c97e8(n) {
    n = htSetValue323c97e8(n, 0, 999999999999);
    htCleanYupanaDecimalValues('#yupana1', 10);
    htFillYupanaDecimalValues('#yupana1', n, 10, 'red_dot_right_up');
    var localLang = $("#site_language").val();
    var valueFormat = new Intl.NumberFormat(localLang).format(n);
    $("#andesIndoArabic").html(valueFormat);
}

function htLoadExercise() {
    $(".fa-play").on("click", function() {
        var name = $(this).attr('name');
        var value = 0;
        if (name == "meso") {
            value = $("#mesoValue").val();
            if (htIsNumeric(value)) {
                htUpdateMesoScreen323c97e8(value);
            }
        } else if (name == "yupana") {
            value = $("#yupanaValue").val();
            if (htIsNumeric(value)) {
                htUpdateYupanaScreen323c97e8(value);
            }
        }
    });

    $("#mesoValue").on("keyup", function() {
        var val = $(this).val();
        if (val > 20**10) {
            $(this).val(20**10);
        } else if (val < 0) {
            $(this).val(0);
        }
    });
    htUpdateMesoScreen323c97e8(10135975700986);

    for (let i = 3; i < 11; i++) {
        $("#yupana1 tr:last").after(htYupanaAddRow(i));
    }
    $("#yupanaValue").on("keyup", function() {
        var val = $(this).val();
        if (val > 10**10) {
            $(this).val(10**10);
        } else if (val < 0) {
            $(this).val(0);
        }
    });
    htUpdateYupanaScreen323c97e8(9876543210);
    htWriteNavigation("first_steps");

    return false;
}

