// SPDX-License-Identifier: GPL-3.0-or-later

var localQuipuYupana = {
    "level": 0,
    "cfg": null,
    "targets": [],
    "done": [],
    "current": 0,
    "state": null,
    "ROWS": 4
};

var quipuYupanaLevels = [
    { strings: 1, positions: 1, min: 1, max: 9 },
    { strings: 1, positions: 2, min: 10, max: 99 },
    { strings: 1, positions: 3, min: 100, max: 999 }
];

function htQyDigits(value, positions) {
    var digits = [];
    for (var i = 0; i < positions; i++) {
        digits.push(value % 10);
        value = Math.floor(value / 10);
    }
    return digits;
}

function htQyText(id) {
    var el = $("#" + id);
    return el.length ? el.text() : "";
}

function htQyOrderName(position) {
    return htQyText("qyOrder" + position);
}

function htQySetMessage(text) {
    $("#qyMessage").text(text || "");
}

function htQyStartLevel(level) {
    var cfg = quipuYupanaLevels[level];
    if (!cfg) {
        return;
    }

    localQuipuYupana.level = level;
    localQuipuYupana.cfg = cfg;
    localQuipuYupana.targets = [];
    localQuipuYupana.done = [];
    localQuipuYupana.current = 0;

    for (var s = 0; s < cfg.strings; s++) {
        localQuipuYupana.targets.push(htGetRandomArbitrary(cfg.min, cfg.max + 1));
        localQuipuYupana.done.push(false);
    }

    if (!localQuipuYupana.state) {
        localQuipuYupana.state = htYupanaNewState(localQuipuYupana.ROWS);
    }
    htYupanaStateClear("#yupana1", localQuipuYupana.state);

    $("#qyCongrats").hide();
    $("#qyLevelBadge").text(htQyText("qyLevelLabel") + " " + (level + 1));
    htQySetMessage(htQyText("qyMsgStart"));
    htQyRender();
}

function htQyIsLastLevel() {
    return localQuipuYupana.level >= quipuYupanaLevels.length - 1;
}

function htQyNextLevel() {
    if (htQyIsLastLevel()) {
        htQyStartLevel(0);
    } else {
        htQyStartLevel(localQuipuYupana.level + 1);
    }
}

function htQyAllDone() {
    for (var s = 0; s < localQuipuYupana.done.length; s++) {
        if (!localQuipuYupana.done[s]) {
            return false;
        }
    }
    return true;
}

function htQyRender() {
    var cfg = localQuipuYupana.cfg;
    var strings = "";

    for (var s = 0; s < localQuipuYupana.targets.length; s++) {
        var digits = htQyDigits(localQuipuYupana.targets[s], cfg.positions);
        var isDone = localQuipuYupana.done[s];
        var isActive = (s === localQuipuYupana.current) && !isDone;
        var strClasses = "quipuString" + (isDone ? " quipuStringDone" : "") + (isActive ? " quipuStringActive" : "");

        strings += "<div class=\"" + strClasses + "\">";
        strings += "<div class=\"quipuCord\">";
        for (var p = cfg.positions - 1; p >= 0; p--) {
            var orderClasses = "quipuOrder" + (isDone ? " quipuFilled" : "");
            strings += "<div class=\"" + orderClasses + "\">";
            strings += "<div class=\"quipuKnots\">";
            for (var k = 0; k < digits[p]; k++) {
                strings += "<span class=\"quipuKnot\"></span>";
            }
            strings += "</div>";
            strings += "<span class=\"quipuOrderLabel\">" + htQyOrderName(p) + "</span>";
            strings += "</div>";
        }
        strings += "</div>";
        strings += "</div>";
    }

    var html = "";
    html += "<div class=\"quipuAssembly\">";
    html += "<div class=\"quipuMainCord\"></div>";
    html += "<div class=\"quipuStrings\">" + strings + "</div>";
    html += "</div>";
    $("#qyBoard").html(html);
}

function htQyCellClick(rowIdx, colIdx) {
    if (!localQuipuYupana.cfg || htQyAllDone()) {
        return;
    }

    var state = localQuipuYupana.state;
    var total = htYupanaStateToggleCell("#yupana1", state, rowIdx, colIdx, "red");

    var overflow = htYupanaStateRowOverflows(state);
    if (overflow) {
        htYupanaStateToggleCell("#yupana1", state, rowIdx, colIdx, "red");
        htQySetMessage(htQyText("qyMsgOverflow")
            .replace("{place}", htQyOrderName(overflow.row))
            .replace("{digit}", overflow.digit));
        return;
    }

    if (total === localQuipuYupana.targets[localQuipuYupana.current]) {
        htQyCompleteString();
    } else {
        htQySetMessage(htQyText("qyMsgReading"));
    }
}

function htQyCompleteString() {
    var idx = localQuipuYupana.current;
    localQuipuYupana.done[idx] = true;
    htQyRender();

    if (htQyAllDone()) {
        htQySetMessage("");
        if (htQyIsLastLevel()) {
            $("#qyCongratsText").html($("#qyMsgAllLevels").html());
        } else {
            $("#qyCongratsText").html($("#qyMsgLevel").html());
        }
        $("#qyCongrats").show();
        return;
    }

    var next = idx + 1;
    while (next < localQuipuYupana.done.length && localQuipuYupana.done[next]) {
        next++;
    }
    localQuipuYupana.current = next;
    htYupanaStateClear("#yupana1", localQuipuYupana.state);
    htQyRender();
    htQySetMessage(htQyText("qyMsgString"));
}

function htLoadContent() {
    localQuipuYupana.level = 0;
    localQuipuYupana.targets = [];
    localQuipuYupana.done = [];
    localQuipuYupana.state = htYupanaNewState(localQuipuYupana.ROWS);
    htYupanaStateClear("#yupana1", localQuipuYupana.state);

    for (var row = 1; row <= localQuipuYupana.ROWS; row++) {
        for (var col = 1; col <= 4; col++) {
            (function(r, c) {
                $("#yupana1 #tc" + c + "f" + r).on("click", function() {
                    htQyCellClick(localQuipuYupana.ROWS - r, c - 1);
                });
            })(row, col);
        }
    }

    $("#qyNewBtn").on("click", function() {
        htQyStartLevel(localQuipuYupana.level);
    });

    $("#qyNextLevelBtn").on("click", function() {
        htQyNextLevel();
    });

    htQyStartLevel(0);
    htWriteNavigation();

    return false;
}
