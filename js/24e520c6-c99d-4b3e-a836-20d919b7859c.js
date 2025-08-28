// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector24e520 = undefined;

var selectedYear = 0;

var xVector1 = [];
var yVector1 = [];
var yVector2 = [];

var chartOptions1 = {};
var chartOptions3 = {};

function htFillVectors() {
    xVector1 = [];
    yVector1 = [];
    yVector2 = [];

    var cYear = selectedYear;
    for (let i = 0, j = 0; i < 100; i++, j += 0.5) {
        xVector1.push(j);
        if ((i % 2) == 0) {
            yVector1.push(j);
            yVector2.push(cYear++);
        } else {
            yVector1.push(null);
            yVector2.push(null);
        }
    }
}

function htUpdateYearVector() {
    yVector2 = [];

    var cYear = selectedYear;
    for (let i = 0; i < 100; i++) {
        yVector2.push(((i % 2) == 0) ? cYear++: null);
    }
}

function htWriteYearTable() {
    var end = selectedYear + 4;
    for (let i = selectedYear, j=0; i < end; i++, j++) {
        $("#resultTable"+j).html(i);
        $("#constantTable"+j).html(selectedYear);
    }
}

function htPlotLocalChart(id, hAxis, vAxis) {
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
        "ymin": 0,
        "ymax": 50,
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

    htWriteNavigation("first_steps");

    $("#updateEnv").on("click", function() {
        var lyear = new Date().getFullYear() - 200;
        selectedYear = $("#birthYear").val();
        if (selectedYear < lyear) {
            selectedYear = lyear;
            $("#birthYear").val(selectedYear);
        }
        $("#yearQuestion").html(iyear);
        htUpdateYearVector();
        chartOptions3 = htPlotLocalChart("chart3", xVector1, yVector2);
        htPlotConstantContinuousChart(chartOptions3);
        htWriteYearTable();
    });

    var local_calendar = $("#site_calendar").val();
    var year = new Date().getFullYear();
    var fyear = year - 100;

    var strcYear = htConvertGregorianYear(local_calendar, year);
    $("#lastYear").html(strcYear);

    var strfYear = htConvertGregorianYear(local_calendar, fyear);
    $("#firstYear").html(strfYear);

    var iyear = getRandomArbitrary(fyear, year);
    selectedYear = iyear;
    $("#birthYear").val(iyear);
    $("#yearQuestion").html(iyear);
    $("#yearLable").html(iyear);
    $("#yearBeforeChart").html(iyear);

    htFillVectors();

    chartOptions1 = htPlotLocalChart("chart1", xVector1, yVector1);
    htPlotConstantContinuousChart(chartOptions1);

    htFillMultiplicationTable("chart2", 0, 9, false, true);
    htWriteMultiplicationTable("#mParent1", 1);

    htWriteYearTable();

    chartOptions3 = htPlotLocalChart("chart3", xVector1, yVector2);
    htPlotConstantContinuousChart(chartOptions3);

    $("#birthYear").on("keyup", function() {
        var year = new Date().getFullYear();
        var lyear = new Date().getFullYear() - 200;
        var val = $(this).val();
        if (val.length == 4 && val < lyear) {
            $(this).val(lyear);
        } else if (val > year) {
            $(this).val(year);
        }
    });

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

