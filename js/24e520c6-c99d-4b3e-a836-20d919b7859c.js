// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector24e520 = undefined;

var selectedYear = 0;
var gregorianMinYear24e520 = 0;
var gregorianMaxYear24e520 = 0;

var xVector1 = [];
var yVector1 = [];
var yVector2 = [];
var yVector2Max = 0;
var yearChart = undefined;

var chartOptions1 = {};
var chartOptions3 = {};

function htCalendarIsDayCount24e520(cal) {
    return cal == "julian" || cal == "mesoamerican" || cal == "emesoamerican";
}

function htCalendarYearNumber24e520(cal, gregYear) {
    var g = parseInt(gregYear, 10);
    if (isNaN(g)) {
        return NaN;
    }
    if (cal == undefined || cal == null || cal == "" || cal == "gregory") {
        return g;
    }
    if (cal == "hispanic") {
        return g + 38;
    }
    if (htCalendarIsDayCount24e520(cal)) {
        return parseInt(htConvertGregorianYearToJD(g), 10);
    }
    var jd = htConvertGregorianYearToJD(g);
    var arr = null;
    try {
        switch (cal) {
            case "hebrew":
                arr = jd_to_hebrew(jd);
                break;
            case "islamic":
                arr = jd_to_islamic(jd);
                break;
            case "persian":
                arr = jd_to_persian(jd);
                break;
            case "chinese":
                arr = jd_to_chinese(jd, -new Date().getTimezoneOffset() / 60);
                break;
            case "aymara":
                arr = jd_to_aymara(jd);
                break;
            case "mapuche":
                arr = jd_to_mapuche(jd);
                break;
            case "inca":
                arr = jd_to_inca(jd);
                break;
            case "javanese":
                arr = jd_to_javanese(jd);
                break;
            case "japanese":
                arr = jd_to_japanese(jd);
                break;
            case "french":
                arr = jd_to_french_revolutionary(jd);
                break;
            case "shaka":
                arr = jd_to_indian_civil(jd);
                break;
            default:
                return g;
        }
    } catch (e) {
        return g;
    }
    if (arr == undefined || arr == null || arr[0] == undefined) {
        return g;
    }
    return parseInt(arr[0], 10);
}

function htCalendarNumberToGregorian24e520(cal, calNumber, minG, maxG) {
    var target = parseInt(calNumber, 10);
    if (isNaN(target)) {
        return NaN;
    }
    if (cal == undefined || cal == null || cal == "" || cal == "gregory") {
        return target;
    }
    var lo = minG;
    var hi = maxG;
    if (lo == undefined || hi == undefined || isNaN(lo) || isNaN(hi)) {
        lo = target - 300;
        hi = target + 300;
    }
    var bestG = lo;
    var bestDiff = null;
    for (var g = lo; g <= hi; g++) {
        var c = htCalendarYearNumber24e520(cal, g);
        if (c == target) {
            return g;
        }
        var diff = Math.abs(c - target);
        if (bestDiff == null || diff < bestDiff) {
            bestDiff = diff;
            bestG = g;
        }
    }
    return bestG;
}

function htCalendarStep24e520() {
    if (yVector2.length >= 3 && yVector2[0] != null && yVector2[2] != null) {
        var step = yVector2[2] - yVector2[0];
        if (!isNaN(step) && step != 0) {
            return step;
        }
    }
    var cal = $("#site_calendar").val();
    var first = htCalendarYearNumber24e520(cal, selectedYear);
    var second = htCalendarYearNumber24e520(cal, selectedYear + 1);
    var fallback = second - first;
    if (!isNaN(fallback) && fallback != 0) {
        return fallback;
    }
    return 1;
}

function htUpdateYearDisplays24e520() {
    var cal = $("#site_calendar").val();
    var birthCal = htCalendarYearNumber24e520(cal, selectedYear);
    var birth30Cal = htCalendarYearNumber24e520(cal, selectedYear + 30);
    $("#birthYear").val(birthCal);
    $("#birthYear").attr("min", htCalendarYearNumber24e520(cal, gregorianMinYear24e520));
    $("#birthYear").attr("max", htCalendarYearNumber24e520(cal, gregorianMaxYear24e520));
    $("#yearQuestion").html(birthCal);
    $("#yearLable").html(birthCal);
    $("#yearBeforeChart").html(birthCal);
    $("#exercise0").html(birthCal);
    $("#exercise1").html(birth30Cal);
}

function htFillVectors() {
    xVector1 = [];
    yVector1 = [];
    yVector2 = [];

    var cal = $("#site_calendar").val();
    for (let i = 0, j = 0 ; i < 101; i++, j += 0.5) {
        xVector1.push(j);
        if ((i % 2) == 0) {
            var age = Math.round(j);
            yVector1.push(j);
            yVector2.push(htCalendarYearNumber24e520(cal, selectedYear + age));
        } else {
            yVector1.push(null);
            yVector2.push(null);
        }
    }
    var firstCal = yVector2[0];
    var lastCal = yVector2[yVector2.length - 1];
    if (lastCal == null) {
        lastCal = yVector2[yVector2.length - 2];
    }
    var step = htCalendarStep24e520();
    yVector2Max = lastCal + step;
}

function htUpdateYearVector() {
    yVector2 = [];

    var cal = $("#site_calendar").val();
    for (let i = 0, age = 0; i < 101; i++) {
        if ((i % 2) == 0) {
            yVector2.push(htCalendarYearNumber24e520(cal, selectedYear + age));
            age++;
        } else {
            yVector2.push(null);
        }
    }
    var lastCal = yVector2[yVector2.length - 1];
    if (lastCal == null) {
        lastCal = yVector2[yVector2.length - 2];
    }
    yVector2Max = lastCal + htCalendarStep24e520();
}

function htWriteYearTable() {
    var cal = $("#site_calendar").val();
    var birthCal = htCalendarYearNumber24e520(cal, selectedYear);
    for (let j = 0; j < 4; j++) {
        $("#resultTable"+j).html(htCalendarYearNumber24e520(cal, selectedYear + j));
        $("#constantTable"+j).html(birthCal);
    }
}

function htPlotLocalChart(id, hAxis, vAxis, vMax) {
    var yMin = 0;
    if (vMax != 50) {
        var firstCal = (vAxis.length > 0) ? vAxis[0] : htCalendarYearNumber24e520($("#site_calendar").val(), selectedYear);
        var step = 1;
        if (vAxis.length >= 3 && vAxis[0] != null && vAxis[2] != null) {
            step = vAxis[2] - vAxis[0];
        } else {
            step = htCalendarStep24e520();
        }
        if (isNaN(step) || step == 0) {
            step = 1;
        }
        yMin = firstCal - 5 * step;
    }
    var chartOptions = {
        "datasets": [
                    {
                        data : vAxis,
                        label : mathKeywords[29],
                        fill : false
                    }],
        "chartId" : id,
        "yType" : "linear",
        "xVector" : hAxis,
        "xLable": mathKeywords[28],
        "xType" : "linear",
        "ymin": yMin,
        "ymax": vMax,
        "useCallBack": false
    };
    return chartOptions;
}

function htLoadExercise() {
    if (localAnswerVector24e520 == undefined) {
        localAnswerVector24e520 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector24e520);
    }
}

function htLoadContent() {
    htWriteNavigation();

    $("#updateEnv").on("click", function() {
        var localCal = $("#site_calendar").val();
        var minCal = htCalendarYearNumber24e520(localCal, gregorianMinYear24e520);
        var maxCal = htCalendarYearNumber24e520(localCal, gregorianMaxYear24e520);
        var rawVal = parseInt($("#birthYear").val(), 10);
        if (isNaN(rawVal)) {
            rawVal = htCalendarYearNumber24e520(localCal, selectedYear);
        }
        if (rawVal < minCal) {
            rawVal = minCal;
        }
        if (rawVal > maxCal) {
            rawVal = maxCal;
        }
        selectedYear = htCalendarNumberToGregorian24e520(localCal, rawVal, gregorianMinYear24e520, gregorianMaxYear24e520);
        if (isNaN(selectedYear)) {
            selectedYear = gregorianMaxYear24e520;
        }
        if (selectedYear < gregorianMinYear24e520) {
            selectedYear = gregorianMinYear24e520;
        }
        if (selectedYear > gregorianMaxYear24e520) {
            selectedYear = gregorianMaxYear24e520;
        }

        htUpdateYearDisplays24e520();
        htUpdateYearVector();
        if (yearChart != undefined) {
            yearChart.data.datasets[0].data = yVector2;
            yearChart.options.scales.y.min = yVector2[0] - 5 * htCalendarStep24e520();
            yearChart.options.scales.y.max = yVector2Max;
            yearChart.update();
        }
        htWriteYearTable();
        $("#statusUpdate").html("<b>"+keywords[120]+"</b>");
    });

    var local_calendar = $("#site_calendar").val();
    var year = new Date().getFullYear();
    var fyear = year - 100;
    gregorianMaxYear24e520 = year;
    gregorianMinYear24e520 = fyear;

    var strcYear = htConvertGregorianYear(local_calendar, year);
    $("#lastYear").html(strcYear);

    var strfYear = htConvertGregorianYear(local_calendar, fyear);
    $("#firstYear").html(strfYear);

    var iyear = htGetRandomArbitrary(fyear, year);
    selectedYear = iyear;
    if (isNaN(selectedYear)) {
        selectedYear = year;
    }
    if (selectedYear < fyear) {
        selectedYear = fyear;
    }
    if (selectedYear > year) {
        selectedYear = year;
    }
    htUpdateYearDisplays24e520();

    htFillVectors();

    chartOptions1 = htPlotLocalChart("chart1", xVector1, yVector1, 50);
    htPlotConstantContinuousChart(chartOptions1);

    htFillMultiplicationTable("chart2", 0, 9, false, true);
    htWriteMultiplicationTable("#mParent1", 1);

    htWriteYearTable();

    chartOptions3 = htPlotLocalChart("chart3", xVector1, yVector2, yVector2Max);
    yearChart = htPlotConstantContinuousChart(chartOptions3);

    $("#birthYear").on("keyup", function() {
        $("#statusUpdate").html("");
    });

    
    htSetImageSrc("imgCopanTemple2", "images/Copan/Templo16Inside.jpg")
    htSetImageSrc("miPueblito", "images/MiPueblito/MiPueblito.jpg")
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector24e520 != undefined) {
        for (let i = 0; i < localAnswerVector24e520.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector24e520[i], "#answer"+i, "#explanation"+i);
        }
    }
}

