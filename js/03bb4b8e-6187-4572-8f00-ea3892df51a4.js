// SPDX-License-Identifier: GPL-3.0-or-later

// Practice: compare two rectangles by length and height, using one horizontal
// ruler and one vertical ruler per rectangle. The localized texts (labels and
// sentences) live in the class JSON, so this file only wires the behavior.

var localRects = {};

function htRectMax() {
    return 5;
}

function htRectBuildGrid(id, length, height) {
    var max = htRectMax();
    var cells = "";

    for (var row = 0; row < max; row++) {
        for (var col = 0; col < max; col++) {
            var filled = (col < length) && (row >= (max - height));
            cells += "<span class=\"htRectCell" + (filled ? " htRectFill" : "") + "\"></span>";
        }
    }

    $("#" + id).html(cells);
}

function htRectBuildVerticalRuler(id) {
    var cells = "";

    for (var i = htRectMax(); i >= 1; i--) {
        cells += "<span class=\"htRectVTick\">" + i + "</span>";
    }

    $("#" + id).html(cells);
}

function htRectBuildHorizontalRuler(id) {
    var cells = "";

    for (var i = 1; i <= htRectMax(); i++) {
        cells += "<span class=\"htRectHTick\">" + i + "</span>";
    }

    $("#" + id).html(cells);
}

function htRectFillTemplate(template, l1, l2, h1, h2) {
    return template
        .replace(/\{l1\}/g, l1)
        .replace(/\{l2\}/g, l2)
        .replace(/\{h1\}/g, h1)
        .replace(/\{h2\}/g, h2);
}

function htRectRender() {
    for (var i = 1; i <= 2; i++) {
        htRectBuildGrid("htRectGrid" + i, localRects[i].len, localRects[i].hei);
    }

    var l1 = localRects[1].len, l2 = localRects[2].len;
    var h1 = localRects[1].hei, h2 = localRects[2].hei;
    var equal = (l1 === l2) && (h1 === h2);
    var selector;

    if (equal) {
        selector = "#htRectMsgEqual";
    } else if (l1 === l2) {
        selector = "#htRectMsgSameLenDiffHei";
    } else if (h1 === h2) {
        selector = "#htRectMsgDiffLenSameHei";
    } else {
        selector = "#htRectMsgDiffLenDiffHei";
    }

    var feedback = $("#htRectFeedback");
    feedback.html("<p>" + htRectFillTemplate($(selector).html(), l1, l2, h1, h2) + "</p>");
    feedback.removeClass("htRectFeedbackEqual");
    if (equal) {
        feedback.addClass("htRectFeedbackEqual");
    }
}

function htRectChange(id, dim, delta) {
    var value = localRects[id][dim] + delta;

    if (value < 1) {
        value = 1;
    } else if (value > htRectMax()) {
        value = htRectMax();
    }

    localRects[id][dim] = value;
    htRectRender();
}

function htRectInit() {
    localRects = { "1": { "len": 2, "hei": 3 }, "2": { "len": 4, "hei": 1 } };

    htRectBuildVerticalRuler("htRectVRuler1");
    htRectBuildVerticalRuler("htRectVRuler2");
    htRectBuildHorizontalRuler("htRectHRulerTop");
    htRectBuildHorizontalRuler("htRectHRuler");
    htRectRender();

    $(".htRectPlus").on("click", function() {
        htRectChange(parseInt($(this).data("htrect")), $(this).data("dim"), 1);
    });

    $(".htRectMinus").on("click", function() {
        htRectChange(parseInt($(this).data("htrect")), $(this).data("dim"), -1);
    });
}

function htLoadContent() {
    htWriteNavigation();
    htRectInit();
    return false;
}
