// SPDX-License-Identifier: GPL-3.0-or-later

// "Measuring Practice (Game)" (content bcdd8651-feb4-4852-b46d-49f454a68482).
// Practises the rules of the text b56ef907-93eb-45ee-ae22-ce4f364ffa4e: measure
// a string and a polygon side with one ruler, read the two rulers of a square
// and of a rectangle, and read the three rulers of a cube and of another solid.
// Localized texts live in the class JSON; this file only wires the behavior.

var localMeasureGame = {};

/**
 * Shuffles a copy of a vector of values.
 *
 * @param {Array} values Values to shuffle.
 * @returns {Array} Shuffled copy.
 */
function htMeasureGameShuffle(values) {
    var out = values.slice();

    for (var i = out.length - 1; i > 0; i--) {
        var j = htGetRandomArbitrary(0, i + 1);
        var tmp = out[i];

        out[i] = out[j];
        out[j] = tmp;
    }

    return out;
}

/**
 * Builds the key used to compare vectors of measures.
 *
 * @param {Array<number>} values Measures.
 * @returns {string} Comparison key.
 */
function htMeasureGameKey(values) {
    return values.join("|");
}

/**
 * Builds the answer choices: the correct vector plus distant distractors.
 *
 * @param {Array<number>} correct Correct vector of measures.
 * @param {Function} makeDistractor Function returning a candidate vector.
 * @returns {Array<Array<number>>} Shuffled choices.
 */
function htMeasureGameChoices(correct, makeDistractor) {
    var seen = {};
    var out = [];
    var guard = 0;

    seen[htMeasureGameKey(correct)] = true;
    out.push(correct.slice());

    while (out.length < 4 && guard < 500) {
        var candidate = makeDistractor();
        var key = htMeasureGameKey(candidate);

        if (!seen[key]) {
            seen[key] = true;
            out.push(candidate);
        }
        guard++;
    }

    return htMeasureGameShuffle(out);
}

/**
 * Builds one question of a level.
 *
 * Level 1 has the string and then a polygon side; level 2 has the square and
 * then the rectangle; level 3 has the cube and then another solid.
 *
 * @param {number} level Level number (1, 2 or 3).
 * @param {number} index Question index inside the level (0 or 1).
 * @returns {Object} Question data.
 */
function htMeasureGameBuildQuestion(level, index) {
    var question = { "level": level, "index": index, "missed": false };

    if (level === 1) {
        if (index === 0) {
            question.kind = "string";
            question.value = htGetRandomArbitrary(2, 10);
            question.answer = [question.value];
            question.choices = htMeasureGameChoices(question.answer, function() {
                return [htGetRandomArbitrary(1, 11)];
            });
        } else {
            question.kind = "polygon";
            question.shape = htGetRandomArbitrary(0, 4);
            question.value = htGetRandomArbitrary(2, 7);
            question.answer = [question.value];
            question.choices = htMeasureGameChoices(question.answer, function() {
                return [htGetRandomArbitrary(1, 11)];
            });
        }
    } else if (level === 2) {
        var side = htGetRandomArbitrary(2, 6);

        if (index === 0) {
            question.kind = "square";
            question.len = side;
            question.hei = side;
        } else {
            question.kind = "rectangle";
            question.len = side;
            do {
                question.hei = htGetRandomArbitrary(2, 6);
            } while (question.hei === side);
        }

        question.answer = [question.len, question.hei];
        question.choices = htMeasureGameChoices(question.answer, function() {
            return [htGetRandomArbitrary(1, 6), htGetRandomArbitrary(1, 6)];
        });
    } else {
        if (index === 0) {
            question.kind = "cube";
            var cubeSide = htGetRandomArbitrary(2, 6);

            question.len = cubeSide;
            question.wid = cubeSide;
            question.hei = cubeSide;
        } else {
            question.kind = "box";
            question.len = htGetRandomArbitrary(2, 6);
            do {
                question.wid = htGetRandomArbitrary(2, 6);
            } while (question.wid === question.len);
            do {
                question.hei = htGetRandomArbitrary(2, 6);
            } while (question.hei === question.len || question.hei === question.wid);
        }

        question.answer = [question.len, question.wid, question.hei];
        question.choices = htMeasureGameChoices(question.answer, function() {
            return [htGetRandomArbitrary(1, 6), htGetRandomArbitrary(1, 6), htGetRandomArbitrary(1, 6)];
        });
    }

    return question;
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
function htMeasureGameSvgLine(from, to, color, width) {
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
function htMeasureGameSvgPoint(point) {
    return point[0].toFixed(1) + "," + point[1].toFixed(1);
}

/**
 * Returns an SVG polygon element.
 *
 * @param {Array<Array<number>>} points Polygon vertices.
 * @param {string} fill Fill color.
 * @returns {string} SVG markup.
 */
function htMeasureGameSvgPolygon(points, fill) {
    var value = [];

    for (var i = 0; i < points.length; i++) {
        value.push(htMeasureGameSvgPoint(points[i]));
    }

    return "<polygon points=\"" + value.join(" ") + "\" fill=\"" + fill +
        "\" stroke=\"#1f3f60\" stroke-width=\"1\"/>";
}

/**
 * Returns the vertices of a regular polygon resting on a horizontal baseline.
 *
 * @param {number} cx Horizontal center of the polygon.
 * @param {number} baseY Baseline where the bottom side lies.
 * @param {number} side Side length in pixels.
 * @param {number} n Number of sides.
 * @returns {Array<Array<number>>} Polygon vertices.
 */
function htMeasureGamePolygonPoints(cx, baseY, side, n) {
    var radius = side / (2 * Math.sin(Math.PI / n));
    var cy = baseY - radius * Math.cos(Math.PI / n);
    var points = [];

    for (var k = 0; k < n; k++) {
        var angle = Math.PI / 2 - Math.PI / n + (2 * Math.PI * k) / n;

        points.push([
            cx + radius * Math.cos(angle),
            cy + radius * Math.sin(angle)
        ]);
    }

    return points;
}

/**
 * Returns the SVG of the one-dimensional ruler with a string or a polygon.
 *
 * @param {Object} question Question data.
 * @returns {string} SVG markup.
 */
function htMeasureGameSvg1D(question) {
    var unit = 26;
    var x0 = 30;
    var count = (question.kind === "polygon") ? 6 : 10;
    var baseY = 150;
    var canvasWidth = 320;
    var body = "";
    var i;
    var x;

    if (question.kind === "polygon") {
        var side = question.value * unit;
        var rawPoints = htMeasureGamePolygonPoints(side / 2, 0, side, question.shape + 3);
        var minX = 0;
        var maxX = 0;
        var minY = 0;

        for (i = 0; i < rawPoints.length; i++) {
            minX = Math.min(minX, rawPoints[i][0]);
            maxX = Math.max(maxX, rawPoints[i][0]);
            minY = Math.min(minY, rawPoints[i][1]);
        }

        // Odd-sided polygons and hexagons are wider than the side that rests
        // on the ruler. Move the origin right so the left edge stays visible
        // and widen the canvas when the right edge needs it.
        x0 += Math.max(0, -minX);
        baseY = (-minY) + 30;
        canvasWidth = Math.ceil(Math.max(320, x0 + Math.max(maxX, count * unit) + 12));
    }

    var svg = "<svg viewBox=\"0 0 " + canvasWidth + " " + (baseY + 50) + "\" role=\"img\" " +
        "preserveAspectRatio=\"xMidYMid meet\">";

    for (i = 0; i <= count; i++) {
        x = x0 + i * unit;
        svg += htMeasureGameSvgLine([x, baseY], [x, baseY + 9], "#555", 1);
        svg += "<text x=\"" + x + "\" y=\"" + (baseY + 27) +
            "\" font-size=\"12\" text-anchor=\"middle\" fill=\"#333\">" + i + "</text>";
    }

    svg += htMeasureGameSvgLine([x0, baseY], [x0 + count * unit, baseY], "#555", 2);

    if (question.kind === "string") {
        var end = x0 + question.value * unit;
        var stringY = baseY - 34;

        body += "<line x1=\"" + x0 + "\" y1=\"" + stringY + "\" x2=\"" + end +
            "\" y2=\"" + stringY + "\" stroke=\"#2f6fb3\" stroke-width=\"10\" stroke-linecap=\"round\"/>";
        body += "<line x1=\"" + end + "\" y1=\"" + (stringY - 16) + "\" x2=\"" + end +
            "\" y2=\"" + baseY + "\" stroke=\"#2f6fb3\" stroke-width=\"1\" stroke-dasharray=\"4 3\"/>";
        body += "<circle cx=\"" + x0 + "\" cy=\"" + stringY + "\" r=\"5\" fill=\"#2f6fb3\"/>";
        body += "<circle cx=\"" + end + "\" cy=\"" + stringY + "\" r=\"5\" fill=\"#2f6fb3\"/>";
    } else {
        var points = [];

        for (i = 0; i < rawPoints.length; i++) {
            points.push([rawPoints[i][0] + x0, rawPoints[i][1] + baseY]);
        }

        body += htMeasureGameSvgPolygon(points, "#4c8fca");
    }

    return svg + body + "</svg>";
}

/**
 * Returns the SVG of the two-dimensional rulers with a square or rectangle.
 *
 * @param {Object} question Question data.
 * @returns {string} SVG markup.
 */
function htMeasureGameSvg2D(question) {
    var max = 5;
    var unit = 44;
    var x0 = 76;
    var baseY = 274;
    var topY = baseY - max * unit;
    var rightX = x0 + max * unit;
    var svg = "<svg viewBox=\"0 0 340 340\" role=\"img\" " +
        "preserveAspectRatio=\"xMidYMid meet\">";

    for (var i = 0; i <= max; i++) {
        var gx = x0 + i * unit;
        var gy = baseY - i * unit;

        svg += htMeasureGameSvgLine([gx, topY], [gx, baseY], "#d9e4ee", 1);
        svg += htMeasureGameSvgLine([x0, gy], [rightX, gy], "#d9e4ee", 1);
    }

    svg += "<rect x=\"" + x0 + "\" y=\"" + (baseY - question.hei * unit) +
        "\" width=\"" + (question.len * unit) + "\" height=\"" + (question.hei * unit) +
        "\" fill=\"#4c8fca\" stroke=\"#1f3f60\" stroke-width=\"2\"/>";

    // Horizontal ruler: length.
    svg += htMeasureGameSvgLine([x0, baseY + 12], [rightX, baseY + 12], "#555", 2);
    for (i = 0; i <= max; i++) {
        var hx = x0 + i * unit;

        svg += htMeasureGameSvgLine([hx, baseY + 12], [hx, baseY + 20], "#555", 1);
        svg += "<text x=\"" + hx + "\" y=\"" + (baseY + 38) +
            "\" font-size=\"12\" text-anchor=\"middle\" fill=\"#333\">" + i + "</text>";
    }

    // Vertical ruler: height.
    svg += htMeasureGameSvgLine([x0 - 14, topY], [x0 - 14, baseY], "#555", 2);
    for (i = 0; i <= max; i++) {
        var vy = baseY - i * unit;

        svg += htMeasureGameSvgLine([x0 - 14, vy], [x0 - 22, vy], "#555", 1);
        svg += "<text x=\"" + (x0 - 28) + "\" y=\"" + (vy + 4) +
            "\" font-size=\"12\" text-anchor=\"end\" fill=\"#333\">" + i + "</text>";
    }

    return svg + "</svg>";
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
function htMeasureGameSvgRuler(from, to, count, normal, color, axis, rotate) {
    var out = "";
    var offset = 13;
    var dx = (to[0] - from[0]) / count;
    var dy = (to[1] - from[1]) / count;
    var start = [from[0] + normal[0] * offset, from[1] + normal[1] * offset];
    var end = [to[0] + normal[0] * offset, to[1] + normal[1] * offset];

    out += htMeasureGameSvgLine(start, end, "#555", 1);

    for (var k = 0; k <= count; k++) {
        var px = start[0] + dx * k;
        var py = start[1] + dy * k;
        var tickStart = [px - normal[0] * 4, py - normal[1] * 4];
        var tickEnd = [px + normal[0] * 4, py + normal[1] * 4];

        out += htMeasureGameSvgLine(tickStart, tickEnd, "#555", 1);
        out += "<text x=\"" + (px + normal[0] * 11).toFixed(1) +
            "\" y=\"" + (py + normal[1] * 11 + 3).toFixed(1) +
            "\" font-size=\"9\" text-anchor=\"middle\" fill=\"#333\">" + k + "</text>";
    }

    var mx = (start[0] + end[0]) / 2 + normal[0] * 30;
    var my = (start[1] + end[1]) / 2 + normal[1] * 30;
    var transform = "";

    if (rotate) {
        transform = " transform=\"rotate(-90 " + mx.toFixed(1) + " " + my.toFixed(1) + ")\"";
    }

    out += "<text x=\"" + mx.toFixed(1) + "\" y=\"" + my.toFixed(1) +
        "\" class=\"htMeasureGameAxisLabel\" data-axis=\"" + axis + "\" font-size=\"11\"" +
        " font-weight=\"bold\" text-anchor=\"middle\" fill=\"" +
        color + "\"" + transform + "></text>";

    return out;
}

/**
 * Returns the SVG markup for a solid measured in the three directions.
 *
 * @param {Object} dims Dimensions (len, wid and hei).
 * @returns {string} SVG markup.
 */
function htMeasureGameSvg3D(dims) {
    var length = dims.len;
    var width = dims.wid;
    var height = dims.hei;
    var maxRuler = 5;
    var unit = 19;
    var canvasWidth = 300;
    var canvasHeight = 300;
    var padLeft = 52;
    var padTop = 44;
    var padRight = 30;
    var padBottom = 45;
    var cos30 = 0.8660254;
    var sin30 = 0.5;
    var layoutLength = Math.max(length, maxRuler);
    var layoutWidth = Math.max(width, maxRuler);
    var layoutHeight = Math.max(height, maxRuler);
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

    svg += htMeasureGameSvgPolygon(rightFace, "#2f6fb3");
    svg += htMeasureGameSvgPolygon(leftFace, "#4c8fca");
    svg += htMeasureGameSvgPolygon(top, "#7fb3e0");

    svg += htMeasureGameSvgRuler(
        project(length, 0, 0), project(length, 0, maxRuler), maxRuler,
        [1, 0], "#2e7d32", "hei", true);

    var lengthFrom = project(0, width, 0);
    var lengthTo = [
        lengthFrom[0] + cos30 * maxRuler * unit,
        lengthFrom[1] + sin30 * maxRuler * unit
    ];

    svg += htMeasureGameSvgRuler(
        lengthFrom, lengthTo, maxRuler,
        [-sin30, cos30], "#2f6fb3", "len", false);

    var widthFrom = project(0, width, height);
    var widthTo = [
        widthFrom[0] + cos30 * maxRuler * unit,
        widthFrom[1] - sin30 * maxRuler * unit
    ];

    svg += htMeasureGameSvgRuler(
        widthFrom, widthTo, maxRuler,
        [-sin30, -cos30], "#e07b39", "wid", false);

    return svg + "</svg>";
}

/**
 * Fills the axis labels of a rendered solid with the localized names.
 *
 * @param {string} target Selector of the canvas container.
 */
function htMeasureGameApplyAxisLabels(target) {
    $(target).find("text.htMeasureGameAxisLabel").each(function() {
        this.textContent = localMeasureGame.axisLabels[$(this).attr("data-axis")];
    });
}

/**
 * Replaces the placeholders of a template with the given values.
 *
 * @param {string} template Text containing {key} placeholders.
 * @param {Object} values Values indexed by placeholder name.
 * @returns {string} Filled text.
 */
function htMeasureGameFill(template, values) {
    var out = template;

    for (var key in values) {
        out = out.split("{" + key + "}").join(values[key]);
    }

    return out;
}

/**
 * Returns the localized description of a level.
 *
 * @param {number} level Level number.
 * @returns {string} Level description.
 */
function htMeasureGameLevelTitle(level) {
    var game = localMeasureGame;

    return htMeasureGameFill($("#htMeasureLevelTemplate").text(), {
        "n": level,
        "total": game.totalLevels,
        "desc": $("#htMeasureLevel" + level).text()
    });
}

/**
 * Returns the prompt of a question.
 *
 * @param {Object} question Question data.
 * @returns {string} Localized prompt.
 */
function htMeasureGamePrompt(question) {
    if (question.kind === "string") {
        return $("#htMeasurePromptString").text();
    }
    if (question.kind === "polygon") {
        return htMeasureGameFill($("#htMeasurePromptSide").text(), {
            "shape": $("#htMeasureShape" + question.shape).text()
        });
    }
    if (question.kind === "square" || question.kind === "rectangle") {
        return $("#htMeasurePromptPair").text();
    }

    return $("#htMeasurePromptTriple").text();
}

/**
 * Returns the explanation of the correct answer.
 *
 * @param {Object} question Question data.
 * @returns {string} Localized explanation.
 */
function htMeasureGameFact(question) {
    if (question.kind === "string") {
        return htMeasureGameFill($("#htMeasureFactString").text(), {
            "v": question.value
        });
    }
    if (question.kind === "polygon") {
        return htMeasureGameFill($("#htMeasureFactSide").text(), {
            "shape": $("#htMeasureShape" + question.shape).text(),
            "v": question.value
        });
    }
    if (question.kind === "square" || question.kind === "rectangle") {
        return htMeasureGameFill($("#htMeasureFactPair").text(), {
            "a": question.len,
            "b": question.hei
        });
    }

    return htMeasureGameFill($("#htMeasureFactTriple").text(), {
        "a": question.len,
        "b": question.wid,
        "c": question.hei
    });
}

/**
 * Shows a feedback message with the matching icon and color.
 *
 * @param {boolean} correct Whether the answer was correct.
 * @param {string} message Message to display.
 */
function htMeasureGameFeedback(correct, message) {
    var feedback = $("#htMeasureFeedback");

    feedback.removeClass("htMeasureCorrect htMeasureWrong");
    feedback.addClass(correct ? "htMeasureCorrect" : "htMeasureWrong");
    feedback.empty();
    feedback.append($("<i>").addClass(correct ? "fa-solid fa-check" : "fa-solid fa-xmark"));
    feedback.append(document.createTextNode(" "));
    feedback.append($("<span>").text(message));
}

/**
 * Updates the score line.
 */
function htMeasureGameShowScore() {
    var game = localMeasureGame;

    $("#htMeasureScore").text(htMeasureGameFill($("#htMeasureScoreTemplate").text(), {
        "score": game.score,
        "total": game.totalQuestions
    }));
}

/**
 * Renders the figure of a question.
 *
 * @param {Object} question Question data.
 */
function htMeasureGameRenderCanvas(question) {
    if (question.kind === "string" || question.kind === "polygon") {
        $("#htMeasureCanvas").html(htMeasureGameSvg1D(question));
    } else if (question.kind === "square" || question.kind === "rectangle") {
        $("#htMeasureCanvas").html(htMeasureGameSvg2D(question));
    } else {
        $("#htMeasureCanvas").html(htMeasureGameSvg3D(question));
        htMeasureGameApplyAxisLabels("#htMeasureCanvas");
    }
}

/**
 * Renders the answer choices of a question.
 *
 * @param {Object} question Question data.
 */
function htMeasureGameRenderChoices(question) {
    var html = "";

    for (var i = 0; i < question.choices.length; i++) {
        html += "<button type=\"button\" class=\"htMeasureChoice\" data-htmeasure=\"" +
            htMeasureGameKey(question.choices[i]) + "\">" +
            question.choices[i].join(" × ") + "</button>";
    }

    var choices = $("#htMeasureChoices");

    choices.html(html);
    choices.find(".htMeasureChoice").on("click", function() {
        htMeasureGameAnswer($(this).attr("data-htmeasure"), $(this));
    });
}

/**
 * Renders the current question of the game.
 */
function htMeasureGameShowQuestion() {
    var game = localMeasureGame;
    var question = game.questions[game.qIndex];

    game.question = question;
    game.answered = false;

    $("#htMeasureLevel").text(htMeasureGameLevelTitle(game.level));
    $("#htMeasurePrompt").text(htMeasureGamePrompt(question));
    $("#htMeasureQuestion").text(htMeasureGameFill($("#htMeasureQuestionTemplate").text(), {
        "q": game.qIndex + 1,
        "total": game.questionsPerLevel
    }));
    htMeasureGameShowScore();

    htMeasureGameRenderCanvas(question);
    htMeasureGameRenderChoices(question);

    $("#htMeasureFeedback").empty().removeClass("htMeasureCorrect htMeasureWrong");
    $("#htMeasureNext").addClass("htMeasureHidden").text("");
}

/**
 * Processes an answer.
 *
 * @param {string} key Key of the chosen vector.
 * @param {Object} button Chosen button element.
 */
function htMeasureGameAnswer(key, button) {
    var game = localMeasureGame;
    var question = game.question;

    if (game.answered || !question) {
        return;
    }

    if (key === htMeasureGameKey(question.answer)) {
        var lastOfLevel = (game.qIndex >= game.questionsPerLevel - 1);
        var lastOfGame = lastOfLevel && (game.level >= game.totalLevels);
        var message;

        game.answered = true;
        if (!question.missed) {
            game.score++;
        }
        htMeasureGameShowScore();

        $("#htMeasureChoices .htMeasureChoice").prop("disabled", true);
        button.addClass("htMeasureChoiceCorrect");

        message = $("#htMeasureCorrect").text() + " " + htMeasureGameFact(question);
        if (lastOfGame) {
            message += " " + $("#htMeasureGameComplete").text();
        } else if (lastOfLevel) {
            message += " " + $("#htMeasureLevelComplete").text();
        }
        htMeasureGameFeedback(true, message);

        var next = $("#htMeasureNext");

        next.removeClass("htMeasureHidden");
        if (lastOfGame) {
            next.text($("#htMeasureWordPlayAgain").text());
        } else if (lastOfLevel) {
            next.text($("#htMeasureWordNextLevel").text());
        } else {
            next.text($("#htMeasureWordNext").text());
        }
    } else {
        question.missed = true;
        button.addClass("htMeasureChoiceWrong").prop("disabled", true);
        htMeasureGameFeedback(false,
            $("#htMeasureWrong").text() + " " + $("#htMeasureHint").text());
    }
}

/**
 * Moves to the next question or to the next level.
 */
function htMeasureGameNext() {
    var game = localMeasureGame;

    if (!game.answered) {
        return;
    }

    if (game.qIndex < game.questionsPerLevel - 1) {
        game.qIndex++;
        htMeasureGameShowQuestion();
        return;
    }

    if (game.level >= game.totalLevels) {
        game.level = 1;
        game.score = 0;
    } else {
        game.level++;
    }

    htMeasureGameLoadLevel();
}

/**
 * Builds the questions of the current level and shows the first one.
 */
function htMeasureGameLoadLevel() {
    var game = localMeasureGame;

    game.questions = [
        htMeasureGameBuildQuestion(game.level, 0),
        htMeasureGameBuildQuestion(game.level, 1)
    ];
    game.qIndex = 0;
    htMeasureGameShowQuestion();
}

/**
 * Restarts the game from the first level.
 */
function htMeasureGameRestart() {
    localMeasureGame.level = 1;
    localMeasureGame.score = 0;
    htMeasureGameLoadLevel();
}

/**
 * Initializes the game.
 *
 * @returns {boolean} Always false.
 */
function htLoadContent() {
    htWriteNavigation();

    localMeasureGame = {
        "level": 1,
        "totalLevels": 3,
        "questionsPerLevel": 2,
        "totalQuestions": 6,
        "questions": [],
        "question": null,
        "qIndex": 0,
        "score": 0,
        "answered": false,
        "axisLabels": {}
    };

    localMeasureGame.axisLabels = {
        "len": $("#htMeasureWordLength").text(),
        "wid": $("#htMeasureWordWidth").text(),
        "hei": $("#htMeasureWordHeight").text()
    };

    $("#htMeasureRestart").text($("#htMeasureWordRestart").text());
    $("#htMeasureRestart").on("click", function() {
        htMeasureGameRestart();
    });
    $("#htMeasureNext").on("click", function() {
        htMeasureGameNext();
    });

    htMeasureGameLoadLevel();

    return false;
}
