// SPDX-License-Identifier: GPL-3.0-or-later

var mesoValue87b260d5 = 0;
var yupanaValue87b260d5 = 0;

function htSetValue87b260d5(val, n)
{
    val += n;
    if (val < 0) {
        val = 0;
    } else if (val >= 99) {
        val = 99;
    }

    return val;
}

function htUpdateMesoScreen87b260d5(n) {
    mesoValue87b260d5 = htSetValue87b260d5(mesoValue87b260d5, n);
    htCleanMesoamericanVigesimalValues(2, null);
    htFillMesoamericanVigesimalValues(mesoValue87b260d5, 2, 1, undefined);
    $("#mesoIndoArabic").html(mesoValue87b260d5);
}

function htUpdateYupanaScreen87b260d5(n) {
    yupanaValue87b260d5 = htSetValue87b260d5(yupanaValue87b260d5, n);
    htCleanYupanaDecimalValues('#yupana0', 2);
    htFillYupanaDecimalValues('#yupana0', yupanaValue87b260d5, 2, 'red_dot_right_up');
    $("#andesIndoArabic").html(yupanaValue87b260d5);
}

function htLoadContent() {
    $(".upArrowWithFA").on("click", function() {
        var name = $(this).attr('name');
        if (name == "mesoUp") {
            htUpdateMesoScreen87b260d5(1);
        } else if (name == "yupanaUp") {
            htUpdateYupanaScreen87b260d5(1);
        }
    });

    $(".downArrowWithFA").on("click", function() {
        var name = $(this).attr('name');
        if (name == "mesoDown") {
            htUpdateMesoScreen87b260d5(-1);
        } else if (name == "yupanaDown") {
            htUpdateYupanaScreen87b260d5(-1);
        }
    });

    htUpdateMesoScreen87b260d5(0);
    htUpdateYupanaScreen87b260d5(0);
    htWriteNavigation();

    return false;
}

