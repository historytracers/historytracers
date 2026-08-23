// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

var htCompColors = ["#66cc90", "#87ceeb", "#ffb6c1", "#ffd700", "#dda0dd", "#ffa500", "#98fb98"];

var htCompEgyptImages = [
    "images/BritishMuseum/mid_00539475_001.jpg",
    "images/BritishMuseum/mid_EPF1915.jpg"
];

var htCompMesoImages = [
    "images/Xunantunich/WitzXunantunich.jpg"
];

var htCompPyramidImages = [
    "images/HistoryTracers/pyramid.jpg",
    "images/HistoryTracers/pentagonal_pyramid.jpg"
];

function htCompRandomColor() {
    return htCompColors[htGetRandomArbitrary(0, htCompColors.length)];
}

function htCompNumberItem(v) { return { "type": "number", "value": v }; }
function htCompMayaItem(v) { return { "type": "maya", "value": v }; }
function htCompCircleItem(c) { return { "type": "circle", "color": c }; }
function htCompSquareItem(c) { return { "type": "square", "color": c }; }
function htCompEgyptItem(p) { return { "type": "egypt", "path": p }; }
function htCompMesoItem(p) { return { "type": "meso", "path": p }; }
function htCompPyramidItem(p) { return { "type": "pyramid", "path": p }; }

function htCompRandomValue(level) {
    if (level <= 1) {
        return htGetRandomArbitrary(0, 10);
    }
    if (level == 2) {
        return htGetRandomArbitrary(10, 1000001);
    }
    return htGetRandomArbitrary(0, 20);
}

function htCompMakeItem(level, value) {
    if (level <= 2) {
        return htCompNumberItem(value);
    }
    return htCompMayaItem(value);
}

function htCompBuildPair(level, answer) {
    if (level <= 3) {
        if (answer == "equal") {
            var n = htCompRandomValue(level);
            return { "left": htCompMakeItem(level, n), "right": htCompMakeItem(level, n) };
        }
        var a = htCompRandomValue(level);
        var b;
        do {
            b = htCompRandomValue(level);
        } while (b === a);
        return { "left": htCompMakeItem(level, a), "right": htCompMakeItem(level, b) };
    }

    if (level <= 6) {
        return htCompBuildMixedPair(answer);
    }

    return htCompBuildPyramidPair(answer);
}

function htCompMakeMixedItem(t) {
    if (t == "number") {
        return htCompNumberItem(htGetRandomArbitrary(0, 10));
    }
    var c = htCompRandomColor();
    return (t == "circle") ? htCompCircleItem(c) : htCompSquareItem(c);
}

function htCompBuildMixedPair(answer) {
    var figures = ["circle", "square"];

    if (answer == "neither") {
        var fig = figures[htGetRandomArbitrary(0, figures.length)];
        return { "left": htCompMakeMixedItem("number"), "right": htCompMakeMixedItem(fig) };
    }

    if (answer == "group") {
        if (htGetRandomArbitrary(0, 3) == 2) {
            var homeColor = htCompRandomColor();
            return { "left": htCompCircleItem(homeColor), "right": htCompSquareItem(homeColor) };
        }
        var figure = figures[htGetRandomArbitrary(0, figures.length)];
        var lg = htCompMakeMixedItem(figure);
        var c;
        do {
            c = htCompRandomColor();
        } while (c === lg.color);
        return { "left": lg, "right": (figure == "circle") ? htCompCircleItem(c) : htCompSquareItem(c) };
    }

    var figure2 = figures[htGetRandomArbitrary(0, figures.length)];
    var le = htCompMakeMixedItem(figure2);
    return { "left": le, "right": JSON.parse(JSON.stringify(le)) };
}

function htCompBuildPyramidPair(answer) {
    if (answer == "group") {
        var e = htCompEgyptImages[htGetRandomArbitrary(0, htCompEgyptImages.length)];
        var p = htCompPyramidImages[htGetRandomArbitrary(0, htCompPyramidImages.length)];
        return { "left": htCompEgyptItem(e), "right": htCompPyramidItem(p) };
    }
    if (htGetRandomArbitrary(0, 2) == 0) {
        var m = htCompMesoImages[htGetRandomArbitrary(0, htCompMesoImages.length)];
        var p2 = htCompPyramidImages[htGetRandomArbitrary(0, htCompPyramidImages.length)];
        return { "left": htCompMesoItem(m), "right": htCompPyramidItem(p2) };
    }
    var m2 = htCompMesoImages[htGetRandomArbitrary(0, htCompMesoImages.length)];
    var e2 = htCompEgyptImages[htGetRandomArbitrary(0, htCompEgyptImages.length)];
    return { "left": htCompMesoItem(m2), "right": htCompEgyptItem(e2) };
}

function htCompAnswerOptions(level) {
    if (level <= 3) {
        return ["equal", "neither"];
    }
    if (level <= 6) {
        return ["equal", "group", "neither"];
    }
    return ["group", "neither"];
}

function htCompIsValidSequence(seq) {
    for (let i = 2; i < seq.length; i++) {
        if (seq[i] === seq[i - 1] && seq[i] === seq[i - 2]) {
            return false;
        }
    }
    return true;
}

function htCompGenerateSequence(level) {
    var options = htCompAnswerOptions(level);
    var total = local.questionsPerLevel;
    var seq = [];
    var guard = 0;
    do {
        seq = [];
        var pool = options.slice();
        while (pool.length < total) {
            pool.push(options[htGetRandomArbitrary(0, options.length)]);
        }
        for (let i = pool.length - 1; i > 0; i--) {
            var j = htGetRandomArbitrary(0, i + 1);
            var tmp = pool[i];
            pool[i] = pool[j];
            pool[j] = tmp;
        }
        seq = pool;
        guard++;
    } while (!htCompIsValidSequence(seq) && guard < 200);

    if (!htCompIsValidSequence(seq)) {
        for (let k = 0; k < seq.length; k++) {
            seq[k] = options[k % options.length];
        }
    }

    return seq;
}

function htCompBuildPyramidScenario(scenario) {
    var pair, answer;
    if (scenario == "egypt_pyramid") {
        pair = {
            "left": htCompEgyptItem(htCompEgyptImages[htGetRandomArbitrary(0, htCompEgyptImages.length)]),
            "right": htCompPyramidItem(htCompPyramidImages[htGetRandomArbitrary(0, htCompPyramidImages.length)])
        };
        answer = "group";
    } else if (scenario == "meso_pyramid") {
        pair = {
            "left": htCompMesoItem(htCompMesoImages[htGetRandomArbitrary(0, htCompMesoImages.length)]),
            "right": htCompPyramidItem(htCompPyramidImages[htGetRandomArbitrary(0, htCompPyramidImages.length)])
        };
        answer = "neither";
    } else {
        pair = {
            "left": htCompMesoItem(htCompMesoImages[htGetRandomArbitrary(0, htCompMesoImages.length)]),
            "right": htCompEgyptItem(htCompEgyptImages[htGetRandomArbitrary(0, htCompEgyptImages.length)])
        };
        answer = "neither";
    }
    return { "left": pair.left, "right": pair.right, "answer": answer };
}

function htCompMaybeSwap(pair) {
    if (htGetRandomArbitrary(0, 2) == 0) {
        return { "left": pair.right, "right": pair.left, "answer": pair.answer };
    }
    return pair;
}

function htCompBuildLevelQuestions(level) {
    var questions = [];
    if (level >= 7) {
        var scenarios = ["egypt_pyramid", "meso_pyramid", "meso_egypt"];
        for (let i = scenarios.length - 1; i > 0; i--) {
            var j = htGetRandomArbitrary(0, i + 1);
            var tmp = scenarios[i];
            scenarios[i] = scenarios[j];
            scenarios[j] = tmp;
        }
        for (let s = 0; s < scenarios.length; s++) {
            questions.push(htCompMaybeSwap(htCompBuildPyramidScenario(scenarios[s])));
        }
        return questions;
    }

    var answers = htCompGenerateSequence(level);
    for (let i = 0; i < answers.length; i++) {
        var pair = htCompBuildPair(level, answers[i]);
        questions.push(htCompMaybeSwap({ "left": pair.left, "right": pair.right, "answer": answers[i] }));
    }
    return questions;
}

function htCompRenderItem(item, slot) {
    var prefix = htGetImgSrcPrefix();
    var html = "";
    switch (item.type) {
        case "number":
            html = "<div class=\"compFigure\"><span class=\"compNumber" + ((item.value >= 100000) ? " compNumberSmall" : "") + "\">" + item.value + "</span></div>";
            break;
        case "maya":
            html = "<img id=\"compImg" + slot + "\" class=\"compFigureImg\" onclick=\"htImageZoom('compImg" + slot + "', '0%')\" src=\"" + prefix + "images/HistoryTracers/Maya_" + item.value + ".png\" alt=\"Maya " + item.value + "\"/>";
            break;
        case "circle":
            html = "<div class=\"compFigure compShape\" style=\"background-color: " + item.color + "; border-radius: 50%;\"></div>";
            break;
        case "square":
            html = "<div class=\"compFigure compShape\" style=\"background-color: " + item.color + ";\"></div>";
            break;
        case "egypt":
        case "meso":
        case "pyramid":
            html = "<img id=\"compImg" + slot + "\" class=\"compFigureImg\" onclick=\"htImageZoom('compImg" + slot + "', '0%')\" src=\"" + prefix + item.path + "\"/>";
            break;
    }
    $("#compItem" + slot).html(html);
}

function htCompShowLevel() {
    var desc = $("#compWordLevel" + local.level).text();
    $("#compLevelTitle").html($("#compWordLevel").text() + " " + local.level + ": " + desc);

    if (local.level <= 3) {
        $("#compBtnGroup").hide();
        $("#compBtnEqual").show();
        $("#compBtnNeither").show();
    } else {
        $("#compBtnEqual").show();
        $("#compBtnGroup").show();
        $("#compBtnNeither").show();
    }

    $("#compMsgCorrect").hide();
    $("#compMsgWrong").hide();
    $("#compMsgLevelComplete").hide();
    $("#compMsgGameComplete").hide();

    var nextBtn = $("#compNextLevel");
    nextBtn.off("click");
    nextBtn.hide();
    if (local.level >= local.totalLevels) {
        nextBtn.html($("#compWordPlayAgain").text());
        nextBtn.on("click", function() {
            local.level = 1;
            htCompLoadLevel();
        });
    } else {
        nextBtn.html($("#compWordNextLevel").text());
        nextBtn.on("click", function() {
            local.level++;
            htCompLoadLevel();
        });
    }

    $("#compRestart").html($("#compWordRestart").text());
}

function htCompLoadLevel() {
    local.questions = htCompBuildLevelQuestions(local.level);
    local.qIndex = 0;
    local.score = 0;
    local.answering = false;

    htCompShowLevel();
    htCompShowQuestion();
}

function htCompShowQuestion() {
    var q = local.questions[local.qIndex];
    htCompRenderItem(q.left, 1);
    htCompRenderItem(q.right, 2);

    $("#compProgress").html($("#compWordQuestion").text() + " " + (local.qIndex + 1) + " " + $("#compWordOf").text() + " " + local.questions.length);
    $("#compScoreText").html($("#compWordScore").text() + ": " + local.score + "/" + local.questions.length);

    $("#compMsgCorrect").hide();
    $("#compMsgWrong").hide();
    $("#compBtnEqual").prop("disabled", false);
    $("#compBtnGroup").prop("disabled", false);
    $("#compBtnNeither").prop("disabled", false);
    local.answering = false;
}

function htCompAnswer(value) {
    if (local.answering) {
        return;
    }
    if (local.qIndex >= local.questions.length) {
        return;
    }

    var q = local.questions[local.qIndex];
    if (value === q.answer) {
        local.answering = true;
        local.score++;
        $("#compScoreText").html($("#compWordScore").text() + ": " + local.score + "/" + local.questions.length);
        $("#compBtnEqual").prop("disabled", true);
        $("#compBtnGroup").prop("disabled", true);
        $("#compBtnNeither").prop("disabled", true);
        $("#compMsgCorrect").show();
        setTimeout(function() {
            local.answering = false;
            htCompNextQuestion();
        }, 1200);
    } else {
        $("#compMsgWrong").show();
        setTimeout(function() {
            $("#compMsgWrong").hide();
        }, 1200);
    }
}

function htCompNextQuestion() {
    local.qIndex++;
    if (local.qIndex >= local.questions.length) {
        htCompFinishLevel();
        return;
    }
    htCompShowQuestion();
}

function htCompFinishLevel() {
    $("#compItem1").html("");
    $("#compItem2").html("");
    $("#compProgress").html("");
    $("#compBtnEqual").prop("disabled", true);
    $("#compBtnGroup").prop("disabled", true);
    $("#compBtnNeither").prop("disabled", true);
    if (local.level >= local.totalLevels) {
        $("#compMsgGameComplete").show();
    } else {
        $("#compMsgLevelComplete").show();
    }
    $("#compNextLevel").show();
}

function htLoadContent() {
    local = { "level": 1, "totalLevels": 7, "questionsPerLevel": 3, "questions": [], "qIndex": 0, "score": 0, "answering": false };

    $("#compBtnEqual").on("click", function() { htCompAnswer("equal"); });
    $("#compBtnGroup").on("click", function() { htCompAnswer("group"); });
    $("#compBtnNeither").on("click", function() { htCompAnswer("neither"); });

    $("#compRestart").on("click", function() {
        htCompLoadLevel();
    });

    htCompLoadLevel();

    htWriteNavigation();

    return false;
}
