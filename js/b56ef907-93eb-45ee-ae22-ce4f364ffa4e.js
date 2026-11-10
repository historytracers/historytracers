// SPDX-License-Identifier: GPL-3.0-or-later

//
// Practice 1: measure one blue string in one direction.
//
var localCubeStringLength = 4;

function htCubeStringMax() {
    return 10;
}

function htCubeStringBuildRuler() {
    var cells = "";

    for (var i = 1; i <= htCubeStringMax(); i++) {
        cells += "<span class=\"htStringsTick\">" + i + "</span>";
    }

    $("#htStringsRuler").html(cells);
}

function htCubeStringBuildTrack() {
    var cells = "";

    for (var i = 1; i <= htCubeStringMax(); i++) {
        cells += "<span class=\"htStringsUnit" +
            (i <= localCubeStringLength ? " htStringsColorBlue" : "") + "\"></span>";
    }

    $("#htStringsTrack1").html(cells);
}

function htCubeStringFillTemplate(template, value) {
    return template.replace(/\{la\}/g, value);
}

function htCubeStringSyncButtons() {
    $("#htStringsApp .htStringsPlus").prop("disabled",
        localCubeStringLength >= htCubeStringMax());
    $("#htStringsApp .htStringsMinus").prop("disabled",
        localCubeStringLength <= 1);
}

function htCubeStringRender() {
    htCubeStringBuildTrack();
    $("#htStringsComparisons").html("<p class=\"htStringsComparison\">" +
        htCubeStringFillTemplate($("#htStringsMsgLength").html(), localCubeStringLength) + "</p>");
    $("#htStringsApp .htStringsValue").text(localCubeStringLength);
    htCubeStringSyncButtons();
}

function htCubeStringChange(delta) {
    var value = localCubeStringLength + delta;

    if (value < 1) {
        value = 1;
    } else if (value > htCubeStringMax()) {
        value = htCubeStringMax();
    }

    localCubeStringLength = value;
    htCubeStringRender();
}

function htCubeStringInit() {
    localCubeStringLength = 4;

    htCubeStringBuildRuler();
    htCubeStringRender();

    $("#htStringsApp .htStringsPlus").on("click", function() {
        htCubeStringChange(1);
    });

    $("#htStringsApp .htStringsMinus").on("click", function() {
        htCubeStringChange(-1);
    });
}

//
// Practice 2: measure one blue shape in two directions and make it a square.
//
var localCubeRect = {};

function htCubeRectMax() {
    return 5;
}

function htCubeRectBuildGrid(id, length, height) {
    var max = htCubeRectMax();
    var cells = "";

    for (var row = 0; row < max; row++) {
        for (var col = 0; col < max; col++) {
            var filled = (col < length) && (row >= (max - height));
            cells += "<span class=\"htRectCell" + (filled ? " htRectFill" : "") + "\"></span>";
        }
    }

    $("#" + id).html(cells);
}

function htCubeRectBuildVerticalRuler(id) {
    var cells = "";

    for (var i = htCubeRectMax(); i >= 1; i--) {
        cells += "<span class=\"htRectVTick\">" + i + "</span>";
    }

    $("#" + id).html(cells);
}

function htCubeRectBuildHorizontalRuler(id) {
    var cells = "";

    for (var i = 1; i <= htCubeRectMax(); i++) {
        cells += "<span class=\"htRectHTick\">" + i + "</span>";
    }

    $("#" + id).html(cells);
}

function htCubeRectFillTemplate(template, l1, h1) {
    return template
        .replace(/\{l1\}/g, l1)
        .replace(/\{h1\}/g, h1);
}

function htCubeRectSyncButtons() {
    $("#htRectApp .htRectPlus").each(function() {
        $(this).prop("disabled",
            localCubeRect[$(this).data("dim")] >= htCubeRectMax());
    });
    $("#htRectApp .htRectMinus").each(function() {
        $(this).prop("disabled",
            localCubeRect[$(this).data("dim")] <= 1);
    });
}

function htCubeRectRender() {
    htCubeRectBuildGrid("htRectGrid1", localCubeRect.len, localCubeRect.hei);

    var equal = (localCubeRect.len === localCubeRect.hei);
    var selector = equal ? "#htRectMsgSquare" : "#htRectMsgNotSquare";
    var feedback = $("#htRectFeedback");

    feedback.html("<p>" + htCubeRectFillTemplate(
        $(selector).html(), localCubeRect.len, localCubeRect.hei) + "</p>");
    feedback.removeClass("htRectFeedbackEqual");
    if (equal) {
        feedback.addClass("htRectFeedbackEqual");
    }
    $("#htRectApp .htRectVal").each(function() {
        $(this).text(localCubeRect[$(this).data("dim")]);
    });
    htCubeRectSyncButtons();
}

function htCubeRectChange(dim, delta) {
    var value = localCubeRect[dim] + delta;

    if (value < 1) {
        value = 1;
    } else if (value > htCubeRectMax()) {
        value = htCubeRectMax();
    }

    localCubeRect[dim] = value;
    htCubeRectRender();
}

function htCubeRectInit() {
    localCubeRect = { "len": 3, "hei": 4 };

    htCubeRectBuildVerticalRuler("htRectVRuler1");
    htCubeRectBuildHorizontalRuler("htRectHRulerTop");
    htCubeRectBuildHorizontalRuler("htRectHRuler");
    htCubeRectRender();

    $("#htRectApp .htRectPlus").on("click", function() {
        htCubeRectChange($(this).data("dim"), 1);
    });

    $("#htRectApp .htRectMinus").on("click", function() {
        htCubeRectChange($(this).data("dim"), -1);
    });
}

//
// Three-dimensional cubes: figure and practice.
//
var localCubes = {};
var localCubeAxisLabels = {};

function htCubeMax() {
    return 5;
}

function htCubeSvgLine(from, to, color, width) {
    return "<line x1=\"" + from[0].toFixed(1) + "\" y1=\"" + from[1].toFixed(1) +
        "\" x2=\"" + to[0].toFixed(1) + "\" y2=\"" + to[1].toFixed(1) +
        "\" stroke=\"" + color + "\" stroke-width=\"" + width + "\"/>";
}

function htCubeSvgPoint(point) {
    return point[0].toFixed(1) + "," + point[1].toFixed(1);
}

function htCubeSvgPolygon(points, fill) {
    var value = [];

    for (var i = 0; i < points.length; i++) {
        value.push(htCubeSvgPoint(points[i]));
    }

    return "<polygon points=\"" + value.join(" ") + "\" fill=\"" + fill +
        "\" stroke=\"#1f3f60\" stroke-width=\"1\"/>";
}

function htCubeSvgRuler(from, to, count, normal, color, label, rotate) {
    var out = "";
    var offset = 13;
    var dx = (to[0] - from[0]) / count;
    var dy = (to[1] - from[1]) / count;
    var start = [from[0] + normal[0] * offset, from[1] + normal[1] * offset];
    var end = [to[0] + normal[0] * offset, to[1] + normal[1] * offset];

    out += htCubeSvgLine(start, end, "#555", 1);

    for (var k = 0; k <= count; k++) {
        var px = start[0] + dx * k;
        var py = start[1] + dy * k;
        var tickStart = [px - normal[0] * 4, py - normal[1] * 4];
        var tickEnd = [px + normal[0] * 4, py + normal[1] * 4];

        out += htCubeSvgLine(tickStart, tickEnd, "#555", 1);
        out += "<text x=\"" + (px + normal[0] * 11).toFixed(1) +
            "\" y=\"" + (py + normal[1] * 11 + 3).toFixed(1) +
            "\" font-size=\"10\" text-anchor=\"middle\" fill=\"#333\">" + k + "</text>";
    }

    var mx = (start[0] + end[0]) / 2 + normal[0] * 30;
    var my = (start[1] + end[1]) / 2 + normal[1] * 30;
    var transform = "";

    if (rotate) {
        transform = " transform=\"rotate(-90 " + mx.toFixed(1) + " " + my.toFixed(1) + ")\"";
    }

    out += "<text x=\"" + mx.toFixed(1) + "\" y=\"" + my.toFixed(1) +
        "\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\" fill=\"" +
        color + "\"" + transform + ">" + label + "</text>";

    return out;
}

function htCubeSvg(dims, withRulers, labels, rulerMax) {
    var length = dims.len;
    var width = dims.wid;
    var height = dims.hei;
    var maxRuler = rulerMax || 0;
    var layoutLength = Math.max(length, maxRuler);
    var layoutWidth = Math.max(width, maxRuler);
    var layoutHeight = Math.max(height, maxRuler);
    var unit = 19;
    var canvasWidth = 300;
    var canvasHeight = 300;
    var padLeft = 52;
    var padTop = 44;
    var padRight = 30;
    var padBottom = 45;
    var cos30 = 0.8660254;
    var sin30 = 0.5;
    var boxWidth = cos30 * (layoutLength + layoutWidth) * unit;
    var boxHeight = (layoutHeight + sin30 * (layoutLength + layoutWidth)) * unit;
    var extraX = Math.max(0, (canvasWidth - padLeft - padRight - boxWidth) / 2);
    var extraY = Math.max(0, (canvasHeight - padTop - padBottom - boxHeight) / 2);
    var originX = padLeft + cos30 * layoutWidth * unit + extraX;
    var originY = padTop + layoutHeight * unit + extraY;

    function project(x, y, z) {
        return [
            originX + cos30 * (x - y) * unit,
            originY + sin30 * (x + y) * unit - z * unit
        ];
    }

    var top = [
        project(0, 0, height),
        project(length, 0, height),
        project(length, width, height),
        project(0, width, height)
    ];
    var rightFace = [
        project(length, 0, 0),
        project(length, width, 0),
        project(length, width, height),
        project(length, 0, height)
    ];
    var leftFace = [
        project(0, width, 0),
        project(length, width, 0),
        project(length, width, height),
        project(0, width, height)
    ];

    var svg = "<svg viewBox=\"0 0 " + canvasWidth + " " + canvasHeight +
        "\" role=\"img\" preserveAspectRatio=\"xMidYMid meet\">";

    svg += htCubeSvgPolygon(rightFace, "#2f6fb3");
    svg += htCubeSvgPolygon(leftFace, "#4c8fca");
    svg += htCubeSvgPolygon(top, "#7fb3e0");

    if (withRulers) {
        var rulerLength = (maxRuler > 0) ? maxRuler : length;
        var rulerWidth = (maxRuler > 0) ? maxRuler : width;
        var rulerHeight = (maxRuler > 0) ? maxRuler : height;

        // Height: straight vertical ruler on the right side of the cube,
        // with 0 at the bottom edge of the cube.
        svg += htCubeSvgRuler(
            project(length, 0, 0), project(length, 0, rulerHeight), rulerHeight,
            [1, 0], "#2e7d32", labels.hei, true);

        // Length: straight horizontal ruler below the cube,
        // with 0 at the cube's left edge.
        var leftX = project(0, width, 0)[0];
        var bottomY = project(length, width, 0)[1];
        svg += htCubeSvgRuler(
            [leftX, bottomY], [leftX + rulerLength * unit, bottomY], rulerLength,
            [0, 1], "#2f6fb3", labels.len, false);

        // Width: ruler along the top face's left edge, from the front edge
        // (0) towards the back, aligned with the cube's width direction.
        var widthFrom = project(0, width, height);
        var widthTo = [
            widthFrom[0] + cos30 * rulerWidth * unit,
            widthFrom[1] - sin30 * rulerWidth * unit
        ];
        svg += htCubeSvgRuler(
            widthFrom, widthTo, rulerWidth,
            [-sin30, -cos30], "#e07b39", labels.wid, false);
    } else {
        var lengthMid = [
            (project(0, width, 0)[0] + project(length, width, 0)[0]) / 2 - 12,
            (project(0, width, 0)[1] + project(length, width, 0)[1]) / 2 + 21
        ];
        var widthMid = [
            (project(length, 0, 0)[0] + project(length, width, 0)[0]) / 2 + 12,
            (project(length, 0, 0)[1] + project(length, width, 0)[1]) / 2 + 21
        ];
        var heightMid = [
            project(0, width, 0)[0] - 20,
            (project(0, width, 0)[1] + project(0, width, height)[1]) / 2 + 4
        ];

        svg += "<text x=\"" + lengthMid[0].toFixed(1) + "\" y=\"" + lengthMid[1].toFixed(1) +
            "\" font-size=\"14\" font-weight=\"bold\" text-anchor=\"middle\" fill=\"#2f6fb3\">" +
            length + "</text>";
        svg += "<text x=\"" + widthMid[0].toFixed(1) + "\" y=\"" + widthMid[1].toFixed(1) +
            "\" font-size=\"14\" font-weight=\"bold\" text-anchor=\"middle\" fill=\"#e07b39\">" +
            width + "</text>";
        svg += "<text x=\"" + heightMid[0].toFixed(1) + "\" y=\"" + heightMid[1].toFixed(1) +
            "\" font-size=\"14\" font-weight=\"bold\" text-anchor=\"middle\" fill=\"#2e7d32\">" +
            height + "</text>";
    }

    svg += "</svg>";

    return svg;
}

function htCubeFillTemplate(template, l1, l2, w1, w2, h1, h2) {
    return template
        .replace(/\{l1\}/g, l1)
        .replace(/\{l2\}/g, l2)
        .replace(/\{w1\}/g, w1)
        .replace(/\{w2\}/g, w2)
        .replace(/\{h1\}/g, h1)
        .replace(/\{h2\}/g, h2);
}

function htCubeSyncButtons() {
    $("#htCubeApp .htCubePlus").each(function() {
        $(this).prop("disabled",
            localCubes[$(this).data("htcube")][$(this).data("dim")] >= htCubeMax());
    });
    $("#htCubeApp .htCubeMinus").each(function() {
        $(this).prop("disabled",
            localCubes[$(this).data("htcube")][$(this).data("dim")] <= 1);
    });
}

function htCubeRender() {
    $("#htCubeCanvas1").html(htCubeSvg(
        localCubes["1"], true, localCubeAxisLabels, htCubeMax()));
    $("#htCubeCanvas2").html(htCubeSvg(
        localCubes["2"], true, localCubeAxisLabels, htCubeMax()));
    htCubeSyncButtons();
    $("#htCubeApp .htCubeVal").each(function() {
        $(this).text(localCubes[$(this).data("htcube")][$(this).data("dim")]);
    });

    var c1 = localCubes["1"];
    var c2 = localCubes["2"];
    var equal = (c1.len === c2.len) && (c1.wid === c2.wid) && (c1.hei === c2.hei);
    var selector = equal ? "#htCubeMsgEqual" : "#htCubeMsgDiff";
    var feedback = $("#htCubeFeedback");

    feedback.html("<p>" + htCubeFillTemplate(
        $(selector).html(), c1.len, c2.len, c1.wid, c2.wid, c1.hei, c2.hei) + "</p>");
    feedback.removeClass("htCubeFeedbackEqual");
    if (equal) {
        feedback.addClass("htCubeFeedbackEqual");
    }
}

function htCubeChange(id, dim, delta) {
    var value = localCubes[id][dim] + delta;

    if (value < 1) {
        value = 1;
    } else if (value > htCubeMax()) {
        value = htCubeMax();
    }

    localCubes[id][dim] = value;
    htCubeRender();
}

function htCubeInit() {
    localCubes = {
        "1": { "len": 2, "wid": 2, "hei": 2 },
        "2": { "len": 4, "wid": 4, "hei": 4 }
    };

    localCubeAxisLabels = {
        "len": $("#htCubeLabelLength").text(),
        "wid": $("#htCubeLabelWidth").text(),
        "hei": $("#htCubeLabelHeight").text()
    };

    $("#htCubeFigure").html(htCubeSvg(
        { "len": 4, "wid": 4, "hei": 4 }, true, localCubeAxisLabels));

    htCubeRender();

    $("#htCubeApp .htCubePlus").on("click", function() {
        htCubeChange($(this).data("htcube"), $(this).data("dim"), 1);
    });

    $("#htCubeApp .htCubeMinus").on("click", function() {
        htCubeChange($(this).data("htcube"), $(this).data("dim"), -1);
    });
}

function htLoadContent() {
    htWriteNavigation();

    htCubeStringInit();
    htCubeRectInit();
    htCubeInit();

    return false;
}
