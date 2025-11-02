// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

var first = 0;
var second = 0;
var total = 0;

var selector = 0;

var stopMe = false;

var chart = undefined;

function htSequenceUpdateValue(add) {
    if (stopMe) {
        return;
    }
    selector += add ;

    if (selector < 0) {
        selector = 0;
    } else if ( selector > 10) {
        selector = 10;
    }

    const test = (first == 0 || second == 0 ) ? 0 : selector * first;
    var result = "";
    if (test < 10) {
        result += "&nbsp;";
    }
    result += test;

    if (test) {
        htDrawMultiplicationTable("#visual", first, selector);
    }
    if (test == total) {
        result += "<br /><i class=\"fa-solid fa-chevron-right\" style=\"font-size:1.0em;\" onclick=\"htFillExercise();\"></i>";
        stopMe = true;
    }
    $("#finalResult").html(result);

}

function htFillExercise() {
    first = htGetRandomArbitrary(0, 9);
    second = htGetRandomArbitrary(0, 9);
    total = first * second;
    selector = 0;

    if (chart) {
        chart.destroy();
    }

    $("#exercise").html("<spam class=\"text_to_paint\">&nbsp;&nbsp;&nbsp;"+first+"</spam><br /><spam class=\"text_to_paint\">× "+second+"</spam>");
    chart = htFillMultiplicationTable("chart1", first, first, false, false);
    $("#finalResult").html("");
    htResetMultiplicationTable("#visual");
    stopMe = false;
}

function htLoadContent() {
    htWriteNavigation();

    htFillExercise();

    return false;
}
