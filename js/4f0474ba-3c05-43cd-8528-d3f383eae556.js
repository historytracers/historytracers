// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

var currentLevel = 0;
var first = 0;
var second = 0;
var total = 0;

var selector = 0;

var stopMe = false;

var chart = undefined;

var localGameVectorfb9dca2c = [];

function closeDiv() {
    $("#history").css("display","none").css("visibility","hidden");
}

function htFillImage() {
    var imgName = htSequenceGame[currentLevel];
    var obj = localGameVectorfb9dca2c[currentLevel];
    $("#imgSeqGame").attr("src", "images/"+imgName);
    $("#desc").html(obj.imageDesc);
    currentLevel++;
    if (currentLevel == htSequenceGame.length) {
        currentLevel = 0;
    }
}

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
        htFillImage();
        let current = $('#mtValues').val();
        result += "<br /><i class=\"fa-solid fa-chevron-right\" style=\"font-size:1.0em;\" onclick=\"htFillExercise("+current+");\"></i>";
        stopMe = true;
        $("#history").css("display","block").css("visibility","visible");
    }
    $("#finalResult").html(result);

}

function htFillExercise(test) {
    first = htGetRandomArbitrary(0, 9);
    second = (test == "-1") ? htGetRandomArbitrary(0, 9) : test;
    total = first * second;
    selector = 0;
    if (chart) {
        chart.destroy();
    }

    $("#exercise").html("<spam class=\"text_to_paint\">&nbsp;&nbsp;&nbsp;"+first+"</spam><br /><spam class=\"text_to_paint\">× "+second+"</spam>");
    chart = htFillMultiplicationTable("chart1", second, second, false, false);
    $("#finalResult").html("");
    $("#visual").html("");
    stopMe = false;
    closeDiv();
}

function htLoadContent() {
    htWriteNavigation();

    htFillExercise(-1);
    localGameVectorfb9dca2c = htLoadGameData();

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
