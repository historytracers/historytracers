// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function closeDiv() {
    $("#history").css("display","none").css("visibility","hidden");
}

function htFillImage() {
    var obj = local.gameVector[local.currentLevel];
    var prefix = htGetImgSrcPrefix();

    // Keep the reward popup inside the game table: once the image is loaded,
    // its height is capped with "table height - popup chrome" (the Close link,
    // spacing and caption), so the whole popup fits inside the table without
    // growing the page scrollbar. The popup itself is also capped by CSS to
    // the table height, so long captions scroll inside it instead of the page.
    var img = document.getElementById("imgSeqGame");
    img.onload = function() {
        var popup = $("#history");
        var tableH = $("#yupana0").outerHeight();
        var chrome = Math.max(0, popup.outerHeight() - img.getBoundingClientRect().height);
        var maxH = Math.max(120, Math.round(Math.min(tableH - chrome, window.innerHeight * 0.4)));
        img.style.maxHeight = maxH.toString() + "px";
    };
    $("#imgSeqGame").attr("src", prefix+obj.imagePath);
    $("#desc").html(obj.imageDesc);
    local.currentLevel++;
    if (local.currentLevel == local.gameVector.length) {
        local.currentLevel = 0;
    }
}

function htSequenceUpdateValue(add) {
    if (local.stopMe) {
        return;
    }
    local.selector += add ;

    if (local.selector < 0) {
        local.selector = 0;
    } else if ( local.selector > 10) {
        local.selector = 10;
    }

    const test = (local.first == 0 || local.second == 0 ) ? 0 : local.selector * local.first;
    var result = "";
    if (test < 10) {
        result += "&nbsp;";
    }
    result += test;

    if (test) {
        htDrawMultiplicationTable("#visual", local.first, local.selector);
    }
    if (test == local.total) {
        htFillImage();
        let current = $('#mtValues').val();
        result += "<br /><i class=\"fa-solid fa-chevron-right\" style=\"font-size:1.0em;\" onclick=\"htFillExercise("+current+");\"></i>";
        local.stopMe = true;
        $("#history").css("display","block").css("visibility","visible");
    }
    $("#finalResult").html(result);

}

function htFillExercise(test) {
    local.first = htGetRandomArbitrary(0, 9);
    local.second = (test == "-1") ? htGetRandomArbitrary(0, 9) : test;
    local.total = local.first * local.second;
    local.selector = 0;

    // Chart.js requires the previous chart to be destroyed before its canvas
    // is reused. Look the chart up on the canvas instead of trusting
    // local.chart: local is re-created every time this script is loaded, so
    // the reference can be lost while the canvas still has a chart bound.
    var chartCanvas = document.getElementById("chart1");
    var existingChart = (chartCanvas) ? Chart.getChart(chartCanvas) : undefined;
    if (existingChart) {
        existingChart.destroy();
    }
    local.chart = undefined;

    $("#exercise").html("<spam class=\"text_to_paint\">&nbsp;&nbsp;&nbsp;"+local.first+"</spam><br /><spam class=\"text_to_paint\">× "+local.second+"</spam>");
    local.chart = htFillMultiplicationTable("chart1", local.second, local.second, false, false);
    $("#finalResult").html("");
    $("#visual").html("");
    local.stopMe = false;
    closeDiv();
}

function htLoadContent() {
    local = { "gameVector": [], "currentLevel": 0, "first": 0, "second": 0, "total": 0, "selector": 0, "stopMe": false, "chart": undefined, "answerVector": undefined }; 

    // Keep a fixed 3/2 ratio on every redraw. Without it Chart.js derives the
    // ratio from the current canvas size, so the ResizeObserver feedback can
    // shrink the chart until it disappears (notably in WebKit after Next).
    Chart.defaults.aspectRatio = 1.5;

    htWriteNavigation();

    htFillExercise(-1);
    local.gameVector = htLoadGameData();

    if ($("#mtValues").length > 0) {
        var data = [
            { text: '0', value: '0' },
            { text: '1', value: '1' },
            { text: '2', value: '2' },
            { text: '3', value: '3' },
            { text: '4', value: '4' },
            { text: '5', value: '5' },
            { text: '6', value: '7' },
            { text: '8', value: '8' },
            { text: '9', value: '9' }
        ];

        $.each(data, function(index, item) {
            $('#mtValues').append($('<option>', {
                value: item.value,
                text: item.text
            }));
        });

        $("#mtValues").on( "change", function() {
            var opt = $(this).val();
            htFillExercise(opt);
        });
    }
    return false;
}
