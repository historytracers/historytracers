// SPDX-License-Identifier: GPL-3.0-or-later

//
// Practice 1: measure one blue string in one direction.
//
var localCubeStringLength = 4;

/**
 * Returns the maximum length of the string practice.
 *
 * @returns {number} Maximum number of unit cells.
 */
function htCubeStringMax() {
    return 10;
}

/**
 * Renders the numbered ruler used in the string practice.
 */
function htCubeStringBuildRuler() {
    var cells = "";

    for (var i = 1; i <= htCubeStringMax(); i++) {
        cells += "<span class=\"htStringsTick\">" + i + "</span>";
    }

    $("#htStringsRuler").html(cells);
}

/**
 * Renders the string track for the current length.
 */
function htCubeStringBuildTrack() {
    var cells = "";

    for (var i = 1; i <= htCubeStringMax(); i++) {
        cells += "<span class=\"htStringsUnit" +
            (i <= localCubeStringLength ? " htStringsColorBlue" : "") + "\"></span>";
    }

    $("#htStringsTrack1").html(cells);
}

/**
 * Replaces the {la} placeholder in a feedback template.
 *
 * @param {string} template Template containing the placeholder.
 * @param {number} value Value to insert.
 * @returns {string} Filled template.
 */
function htCubeStringFillTemplate(template, value) {
    return template.replace(/\{la\}/g, value);
}

/**
 * Enables or disables the string plus and minus buttons.
 */
function htCubeStringSyncButtons() {
    $("#htStringsApp .htStringsPlus").prop("disabled",
        localCubeStringLength >= htCubeStringMax());
    $("#htStringsApp .htStringsMinus").prop("disabled",
        localCubeStringLength <= 1);
}

/**
 * Re-renders the string practice for the current length.
 */
function htCubeStringRender() {
    htCubeStringBuildTrack();
    $("#htStringsComparisons").html("<p class=\"htStringsComparison\">" +
        htCubeStringFillTemplate($("#htStringsMsgLength").html(), localCubeStringLength) + "</p>");
    $("#htStringsApp .htStringsValue").text(localCubeStringLength);
    htCubeStringSyncButtons();
}

/**
 * Changes the string length, keeping it within the allowed range.
 *
 * @param {number} delta Amount to add to the length.
 */
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

/**
 * Initializes the string practice and binds its buttons.
 */
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

/**
 * Returns the maximum side length of the rectangle practice.
 *
 * @returns {number} Maximum number of cells per side.
 */
function htCubeRectMax() {
    return 5;
}

/**
 * Renders the rectangle grid used in the two-dimensional practice.
 *
 * @param {string} id Element id of the grid.
 * @param {number} length Number of filled columns.
 * @param {number} height Number of filled rows.
 */
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

/**
 * Renders the vertical ruler for the rectangle grid.
 *
 * @param {string} id Element id of the ruler.
 */
function htCubeRectBuildVerticalRuler(id) {
    var cells = "";

    for (var i = htCubeRectMax(); i >= 1; i--) {
        cells += "<span class=\"htRectVTick\">" + i + "</span>";
    }

    $("#" + id).html(cells);
}

/**
 * Renders the horizontal ruler for the rectangle grid.
 *
 * @param {string} id Element id of the ruler.
 */
function htCubeRectBuildHorizontalRuler(id) {
    var cells = "";

    for (var i = 1; i <= htCubeRectMax(); i++) {
        cells += "<span class=\"htRectHTick\">" + i + "</span>";
    }

    $("#" + id).html(cells);
}

/**
 * Replaces the {l1} and {h1} placeholders in a feedback template.
 *
 * @param {string} template Template containing the placeholders.
 * @param {number} l1 Length value.
 * @param {number} h1 Height value.
 * @returns {string} Filled template.
 */
function htCubeRectFillTemplate(template, l1, h1) {
    return template
        .replace(/\{l1\}/g, l1)
        .replace(/\{h1\}/g, h1);
}

/**
 * Enables or disables the rectangle plus and minus buttons.
 */
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

/**
 * Re-renders the rectangle practice and its feedback.
 */
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

/**
 * Changes one side of the rectangle, keeping it within the allowed range.
 *
 * @param {string} dim Dimension to change ('len' or 'hei').
 * @param {number} delta Amount to add.
 */
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

/**
 * Initializes the rectangle practice and binds its buttons.
 */
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

/**
 * Returns the maximum side length of the cube practice.
 *
 * @returns {number} Maximum number of units per side.
 */
function htCubeMax() {
    return 5;
}

/**
 * Returns an SVG line element.
 *
 * @param {Array<number>} from Start point.
 * @param {Array<number>} to End point.
 * @param {string} color Stroke color.
 * @param {number} width Stroke width.
 * @returns {string} SVG markup.
 */
function htCubeSvgLine(from, to, color, width) {
    return "<line x1=\"" + from[0].toFixed(1) + "\" y1=\"" + from[1].toFixed(1) +
        "\" x2=\"" + to[0].toFixed(1) + "\" y2=\"" + to[1].toFixed(1) +
        "\" stroke=\"" + color + "\" stroke-width=\"" + width + "\"/>";
}

/**
 * Returns an SVG point string.
 *
 * @param {Array<number>} point Coordinates.
 * @returns {string} Comma-separated coordinate pair.
 */
function htCubeSvgPoint(point) {
    return point[0].toFixed(1) + "," + point[1].toFixed(1);
}

/**
 * Returns an SVG polygon element.
 *
 * @param {Array<Array<number>>} points Polygon vertices.
 * @param {string} fill Fill color.
 * @returns {string} SVG markup.
 */
function htCubeSvgPolygon(points, fill) {
    var value = [];

    for (var i = 0; i < points.length; i++) {
        value.push(htCubeSvgPoint(points[i]));
    }

    return "<polygon points=\"" + value.join(" ") + "\" fill=\"" + fill +
        "\" stroke=\"#1f3f60\" stroke-width=\"1\"/>";
}

/**
 * Returns an SVG ruler with ticks and an empty axis label.
 *
 * @param {Array<number>} from Start point.
 * @param {Array<number>} to End point.
 * @param {number} count Number of ruler divisions.
 * @param {Array<number>} normal Direction of the tick marks.
 * @param {string} color Color of the ruler label.
 * @param {string} axis Axis key used to fill the label later.
 * @param {boolean} rotate Whether to rotate the label.
 * @returns {string} SVG markup.
 */
function htCubeSvgRuler(from, to, count, normal, color, axis, rotate) {
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
        "\" class=\"htCubeAxisLabel\" data-axis=\"" + axis + "\" font-size=\"12\"" +
        " font-weight=\"bold\" text-anchor=\"middle\" fill=\"" +
        color + "\"" + transform + "></text>";

    return out;
}

/**
 * Returns the SVG markup for a three-dimensional cube.
 *
 * @param {Object} dims Cube dimensions (len, wid and hei).
 * @param {boolean} withRulers Whether to draw the axis rulers.
 * @param {number} [rulerMax] Ruler length; defaults to the cube side.
 * @returns {string} SVG markup.
 */
function htCubeSvg(dims, withRulers, rulerMax) {
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

        // Height: vertical ruler attached to the cube's right edge, with 0
        // at the bottom corner of the cube.
        svg += htCubeSvgRuler(
            project(length, 0, 0), project(length, 0, rulerHeight), rulerHeight,
            [1, 0], "#2e7d32", "hei", true);

        // Length: ruler along the front-left bottom edge of the cube, from
        // the left corner (0) towards the front, aligned with the cube.
        var lengthFrom = project(0, width, 0);
        var lengthTo = [
            lengthFrom[0] + cos30 * rulerLength * unit,
            lengthFrom[1] + sin30 * rulerLength * unit
        ];
        svg += htCubeSvgRuler(
            lengthFrom, lengthTo, rulerLength,
            [-sin30, cos30], "#2f6fb3", "len", false);

        // Width: ruler along the top face's left edge of the cube, from the
        // front edge (0) towards the back, aligned with the cube.
        var widthFrom = project(0, width, height);
        var widthTo = [
            widthFrom[0] + cos30 * rulerWidth * unit,
            widthFrom[1] - sin30 * rulerWidth * unit
        ];
        svg += htCubeSvgRuler(
            widthFrom, widthTo, rulerWidth,
            [-sin30, -cos30], "#e07b39", "wid", false);
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

/**
 * Fills the axis labels of a rendered cube SVG with the localized names.
 *
 * @param {string} target Selector of the cube container.
 */
function htCubeApplyAxisLabels(target) {
    $(target).find("text.htCubeAxisLabel").each(function() {
        this.textContent = localCubeAxisLabels[$(this).attr("data-axis")];
    });
}

/**
 * Replaces the dimension placeholders in a cube feedback template.
 *
 * @param {string} template Template containing the placeholders.
 * @param {number} l1 First length value.
 * @param {number} l2 Second length value.
 * @param {number} w1 First width value.
 * @param {number} w2 Second width value.
 * @param {number} h1 First height value.
 * @param {number} h2 Second height value.
 * @returns {string} Filled template.
 */
function htCubeFillTemplate(template, l1, l2, w1, w2, h1, h2) {
    return template
        .replace(/\{l1\}/g, l1)
        .replace(/\{l2\}/g, l2)
        .replace(/\{w1\}/g, w1)
        .replace(/\{w2\}/g, w2)
        .replace(/\{h1\}/g, h1)
        .replace(/\{h2\}/g, h2);
}

/**
 * Enables or disables the cube plus and minus buttons.
 */
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

/**
 * Re-renders both cubes and their feedback.
 */
function htCubeRender() {
    $("#htCubeCanvas1").html(htCubeSvg(
        localCubes["1"], true, htCubeMax()));
    htCubeApplyAxisLabels("#htCubeCanvas1");
    $("#htCubeCanvas2").html(htCubeSvg(
        localCubes["2"], true, htCubeMax()));
    htCubeApplyAxisLabels("#htCubeCanvas2");
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

/**
 * Changes one dimension of a cube, keeping it within the allowed range.
 *
 * @param {string} id Cube id ('1' or '2').
 * @param {string} dim Dimension to change.
 * @param {number} delta Amount to add.
 */
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

/**
 * Initializes the cube practice and binds its buttons.
 */
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
        { "len": 4, "wid": 4, "hei": 4 }, true));
    htCubeApplyAxisLabels("#htCubeFigure");

    htCubeRender();

    $("#htCubeApp .htCubePlus").on("click", function() {
        htCubeChange($(this).data("htcube"), $(this).data("dim"), 1);
    });

    $("#htCubeApp .htCubeMinus").on("click", function() {
        htCubeChange($(this).data("htcube"), $(this).data("dim"), -1);
    });
}

/**
 * Initializes the three measuring practices.
 *
 * @returns {boolean} Always false.
 */
function htLoadContent() {
    htWriteNavigation();

    htCubeStringInit();
    htCubeRectInit();
    htCubeInit();

    return false;
}
