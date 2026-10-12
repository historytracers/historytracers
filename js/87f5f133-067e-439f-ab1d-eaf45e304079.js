// SPDX-License-Identifier: GPL-3.0-or-later

var localCounter87f5f133 = undefined;

function htModify87f5f133(value)
{
    if (value < 1)
        value = 1;
    else if (value > 5)
        value = 5;

    return value;
}

//
// Practice: compare three strings by length and color.
//

var localStrings = {};

function htStringsMaxLength() {
    return 10;
}

function htStringsBuildTrack(trackId, length, colorClass) {
    var max = htStringsMaxLength();
    var cells = "";

    for (var i = 1; i <= max; i++) {
        cells += "<span class=\"htStringsUnit" + (i <= length ? " " + colorClass : "") + "\"></span>";
    }

    $("#" + trackId).html(cells);
}

function htStringsBuildRuler() {
    var max = htStringsMaxLength();
    var cells = "";

    for (var i = 1; i <= max; i++) {
        cells += "<span class=\"htStringsTick\">" + i + "</span>";
    }

    $("#htStringsRuler").html(cells);
}

function htStringsFillTemplate(template, a, b, la, lb) {
    return template
        .replace(/\{a\}/g, a)
        .replace(/\{b\}/g, b)
        .replace(/\{la\}/g, la)
        .replace(/\{lb\}/g, lb);
}

function htStringsComparison(a, b) {
    var la = localStrings.lengths[a];
    var lb = localStrings.lengths[b];
    var sameColor = (localStrings.colors[a] === localStrings.colors[b]);
    var sameLength = (la === lb);
    var selector;

    if (sameLength && sameColor) {
        selector = "#htStringsMsgEqual";
    } else if (sameColor) {
        selector = "#htStringsMsgSameColorDiffLength";
    } else if (sameLength) {
        selector = "#htStringsMsgDiffColorSameLength";
    } else {
        selector = "#htStringsMsgDiffColorDiffLength";
    }

    return htStringsFillTemplate($(selector).html(), a, b, la, lb);
}

function htStringsRender() {
    for (var i = 1; i <= 3; i++) {
        htStringsBuildTrack("htStringsTrack" + i, localStrings.lengths[i], localStrings.colors[i]);
    }

    var pairs = [[1, 2], [1, 3], [2, 3]];
    var html = "";

    for (var p = 0; p < pairs.length; p++) {
        var a = pairs[p][0];
        var b = pairs[p][1];
        var equal = (localStrings.lengths[a] === localStrings.lengths[b]) &&
                    (localStrings.colors[a] === localStrings.colors[b]);
        var cssClass = "htStringsComparison" + (equal ? " htStringsComparisonEqual" : "");
        html += "<p class=\"" + cssClass + "\">" + htStringsComparison(a, b) + "</p>";
    }

    $("#htStringsComparisons").html(html);
}

function htStringsChange(index, delta) {
    var value = localStrings.lengths[index] + delta;

    if (value < 1) {
        value = 1;
    } else if (value > htStringsMaxLength()) {
        value = htStringsMaxLength();
    }

    localStrings.lengths[index] = value;
    htStringsRender();
}

function htStringsInit() {
    localStrings = {
        "lengths": { "1": 4, "2": 4, "3": 5 },
        "colors": { "1": "htStringsColorBlue", "2": "htStringsColorOrange", "3": "htStringsColorOrange" }
    };

    htStringsBuildRuler();
    htStringsRender();

    $(".htStringsPlus").on("click", function() {
        htStringsChange(parseInt($(this).data("htstring")), 1);
    });

    $(".htStringsMinus").on("click", function() {
        htStringsChange(parseInt($(this).data("htstring")), -1);
    });
}

function htLoadContent() {
    localCounter87f5f133 = 1;
    localCounter87f5f133 = htModify87f5f133(localCounter87f5f133);

    $("#traineeUp0").on("click", function() {
        localCounter87f5f133++;
        localCounter87f5f133 = htModify87f5f133(localCounter87f5f133);

        $('#leftHandImg').attr('src', 'images/HistoryTracers/'+(localCounter87f5f133 - 1)+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', 'images/HistoryTracers/'+localCounter87f5f133+'Right_Hand_Small.png');

        $('#leftnum').html(localCounter87f5f133 - 1);
        $('#rightnum').html(localCounter87f5f133);
    });

    $("#traineeDown0").on("click", function() {
        localCounter87f5f133--;
        localCounter87f5f133 = htModify87f5f133(localCounter87f5f133);

        $('#leftHandImg').attr('src', 'images/HistoryTracers/'+(localCounter87f5f133 - 1)+'Left_Hand_Small.png');
        $('#rightHandImg').attr('src', 'images/HistoryTracers/'+localCounter87f5f133+'Right_Hand_Small.png');

        $('#leftnum').html(localCounter87f5f133 - 1);
        $('#rightnum').html(localCounter87f5f133);
    });
    htWriteNavigation();

    htSetImageSrc("rightHandImg", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("leftHandImg", "images/HistoryTracers/0Left_Hand_Small.png");
    htSetImageSrc("imgMeter", "images/HistoryTracers/Meter.jpg");

    htStringsInit();

    return false;
}
