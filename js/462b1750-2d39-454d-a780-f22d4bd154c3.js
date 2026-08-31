// SPDX-License-Identifier: GPL-3.0-or-later

var localAxiom462b1750 = {
    level: 1,
    round: 0,
    totalRounds: 3,
    totalLevels: 3,
    a: 0,
    b: 0,
    left: [],
    right: [],
    values: [],
    targets: [],
    locked: [],
    solved: false,
    score: 0
};

function htAxiom462bRandom(min, max) {
    return htGetRandomArbitrary(min, max);
}

function htAxiom462bSetupRound() {
    var s = localAxiom462b1750;
    if (s.level == 1) {
        s.a = htAxiom462bRandom(1, 10);
        s.b = 0;
        s.left = [{ "t": "val", "v": s.a }, { "t": "op", "v": "+" }, { "t": "val", "v": 0 }];
        s.right = [{ "t": "edit", "idx": 0 }];
        s.targets = [s.a];
    } else {
        s.a = htAxiom462bRandom(0, 10);
        do {
            s.b = htAxiom462bRandom(0, 10);
        } while (s.a == s.b);
        s.left = [{ "t": "val", "v": s.a }, { "t": "op", "v": "+" }, { "t": "val", "v": s.b }];
        if (s.level == 2) {
            if (htAxiom462bRandom(0, 2) == 0) {
                s.right = [{ "t": "val", "v": s.b }, { "t": "op", "v": "+" }, { "t": "edit", "idx": 0 }];
                s.targets = [s.a];
            } else {
                s.right = [{ "t": "edit", "idx": 0 }, { "t": "op", "v": "+" }, { "t": "val", "v": s.a }];
                s.targets = [s.b];
            }
        } else {
            s.right = [{ "t": "edit", "idx": 0 }, { "t": "op", "v": "+" }, { "t": "edit", "idx": 1 }];
            s.targets = [s.b, s.a];
        }
    }
    s.values = [];
    s.locked = [];
    for (let i = 0; i < s.targets.length; i++) {
        s.values.push((s.targets[i] == 0) ? 1 : 0);
        s.locked.push(false);
    }
    s.solved = false;
    s.round++;
}

function htAxiom462bTokenCell(token) {
    var s = localAxiom462b1750;
    if (token.t == "edit") {
        var cls = (s.locked[token.idx]) ? "" : " class=\"htAxiomEditableCell\"";
        return "<td" + cls + "><span class=\"text_to_paint\" id=\"axVal" + token.idx + "\">" + s.values[token.idx] + "</span></td>";
    }
    return "<td><span class=\"text_to_paint\">" + token.v + "</span></td>";
}

function htAxiom462bRender() {
    var s = localAxiom462b1750;
    var html = "<table class=\"tawapukllay\"><tr>";
    var eqCols = s.left.length + 1 + s.right.length;
    html += "<th colspan=\"" + eqCols + "\"><i>" + $("#axWordEquation").text() + "</i></th>";
    html += "<th colspan=\"" + s.values.length + "\">" + $("#axWordArrows").text() + "</th>";
    html += "</tr><tr>";
    for (let i = 0; i < s.left.length; i++) {
        html += htAxiom462bTokenCell(s.left[i]);
    }
    html += "<td><span class=\"text_to_paint\">=</span></td>";
    for (let j = 0; j < s.right.length; j++) {
        html += htAxiom462bTokenCell(s.right[j]);
    }
    for (let k = 0; k < s.values.length; k++) {
        var arrowCls = (s.locked[k]) ? " htAxiomArrowStopped" : "";
        html += "<td><i class=\"fa-solid fa-caret-up upArrowWithFA" + arrowCls + "\" onclick=\"htAxiom462bChange(" + k + ", 1);\"></i><br /><i class=\"fa-solid fa-caret-down downArrowWithFA" + arrowCls + "\" onclick=\"htAxiom462bChange(" + k + ", -1);\"></i></td>";
    }
    html += "</tr></table>";
    $("#axTable").html(html);
    $("#axProgress").html($("#axWordExercise").text() + " " + s.round + " " + $("#axWordOf").text() + " " + s.totalRounds);
    $("#axScoreText").html($("#axWordScore").text() + ": " + s.score + "/" + s.totalRounds);
}

function htAxiom462bChange(idx, delta) {
    var s = localAxiom462b1750;
    if (s.solved || s.locked[idx]) {
        return false;
    }
    s.values[idx] += delta;
    if (s.values[idx] < 0) {
        s.values[idx] = 0;
    } else if (s.values[idx] > 9) {
        s.values[idx] = 9;
    }
    if (s.values[idx] == s.targets[idx]) {
        s.locked[idx] = true;
    }
    htAxiom462bRender();
    htAxiom462bCheck();
    return false;
}

function htAxiom462bCheck() {
    var s = localAxiom462b1750;
    for (let i = 0; i < s.targets.length; i++) {
        if (s.values[i] != s.targets[i]) {
            return;
        }
    }
    s.solved = true;
    s.score++;
    $("#axScoreText").html($("#axWordScore").text() + ": " + s.score + "/" + s.totalRounds);
    $("#axMsgCorrect").show();
    setTimeout(function() {
        if (s.round >= s.totalRounds) {
            htAxiom462bFinishLevel();
        } else {
            htAxiom462bLoadRound();
        }
    }, 1100);
}

function htAxiom462bFinishLevel() {
    var s = localAxiom462b1750;
    $("#axMsgCorrect").hide();
    $("#axTable").html("");
    $("#axProgress").html("");
    if (s.level >= s.totalLevels) {
        $("#axMsgGameComplete").show();
        $("#axNext").html($("#axWordPlayAgain").text());
    } else {
        $("#axMsgLevelComplete").show();
        $("#axNext").html($("#axWordNextLevel").text());
    }
    $("#axNext").show();
}

function htAxiom462bShowLevel() {
    var s = localAxiom462b1750;
    var desc = $("#axWordLevel" + s.level).text();
    $("#axLevelTitle").html($("#axWordLevel").text() + " " + s.level + ": " + desc);
    $("#axInstr").html($("#axWordInstr" + s.level).text());
    $("#axRestart").html($("#axWordRestart").text());
    $("#axMsgCorrect").hide();
    $("#axMsgLevelComplete").hide();
    $("#axMsgGameComplete").hide();
    $("#axNext").hide();
    $("#axNext").off("click");
    $("#axNext").on("click", function() {
        if (s.level >= s.totalLevels) {
            s.level = 1;
        } else {
            s.level++;
        }
        htAxiom462bLoadLevel();
    });
}

function htAxiom462bLoadLevel() {
    var s = localAxiom462b1750;
    s.round = 0;
    s.score = 0;
    htAxiom462bShowLevel();
    htAxiom462bLoadRound();
}

function htAxiom462bLoadRound() {
    $("#axMsgCorrect").hide();
    htAxiom462bSetupRound();
    htAxiom462bRender();
}

function htLoadContent() {
    $("#axRestart").on("click", function() {
        htAxiom462bLoadLevel();
    });

    htAxiom462bLoadLevel();

    htWriteNavigation();

    return false;
}
