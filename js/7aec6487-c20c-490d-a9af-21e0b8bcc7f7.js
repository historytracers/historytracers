// SPDX-License-Identifier: GPL-3.0-or-later

var localQuipu = {};

var quipuLevels = [
    { strings: 1, positions: 1, min: 1, max: 9 },
    { strings: 2, positions: 2, min: 10, max: 99 },
    { strings: 3, positions: 3, min: 100, max: 999 }
];

function htQuipuDigits(value, positions) {
    var digits = [];
    for (var i = 0; i < positions; i++) {
        digits.push(value % 10);
        value = Math.floor(value / 10);
    }
    return digits;
}

function htQuipuOrderName(position) {
    var label = $("#quipuOrder" + position);
    return label.length ? label.text() : "";
}

function htQuipuSetMessage(code) {
    var message = "";
    if (code) {
        var label = $("#quipuMsg" + code);
        if (label.length) {
            message = label.text();
        }
    }
    $("#quipuMessage").text(message);
}

function htQuipuStartLevel(level) {
    var cfg = quipuLevels[level];
    if (!cfg) {
        return;
    }

    localQuipu.level = level;
    localQuipu.cfg = cfg;
    localQuipu.strings = [];

    for (var s = 0; s < cfg.strings; s++) {
        var value = htGetRandomArbitrary(cfg.min, cfg.max + 1);
        var state = {
            target: value,
            digits: htQuipuDigits(value, cfg.positions),
            knots: [],
            active: 0,
            done: false
        };
        for (var p = 0; p < cfg.positions; p++) {
            state.knots.push(0);
        }
        htQuipuUpdateActive(state);
        localQuipu.strings.push(state);
    }

    $("#quipuCongrats").hide();
    $("#quipuLevelBadge").text(htQuipuLevelLabel() + " " + (level + 1));
    htQuipuSetMessage("");
    htQuipuRender();
}

function htQuipuLevelLabel() {
    var label = $("#quipuLevelLabel");
    return label.length ? label.text() : "";
}

function htQuipuIsLastLevel() {
    return localQuipu.level >= quipuLevels.length - 1;
}

function htQuipuNextLevel() {
    if (htQuipuIsLastLevel()) {
        htQuipuStartLevel(0);
    } else {
        htQuipuStartLevel(localQuipu.level + 1);
    }
}

function htQuipuUpdateActive(state) {
    state.done = true;
    state.active = -1;
    for (var i = 0; i < state.digits.length; i++) {
        if (state.knots[i] < state.digits[i]) {
            state.active = i;
            state.done = false;
            return;
        }
    }
    if (state.done) {
        state.active = state.digits.length - 1;
    }
}

function htQuipuAllDone() {
    for (var s = 0; s < localQuipu.strings.length; s++) {
        if (!localQuipu.strings[s].done) {
            return false;
        }
    }
    return true;
}

function htQuipuRender() {
    var cfg = localQuipu.cfg;
    var targets = "";
    var strings = "";

    for (var s = 0; s < localQuipu.strings.length; s++) {
        var state = localQuipu.strings[s];
        targets += "<div class=\"quipuTarget" + (state.done ? " quipuTargetDone" : "") + "\">" + state.target + "</div>";
        strings += "<div class=\"quipuString" + (state.done ? " quipuStringDone" : "") + "\">";
        strings += "<div class=\"quipuCord\">";
        for (var p = cfg.positions - 1; p >= 0; p--) {
            var classes = "quipuOrder";
            if (p === state.active && !state.done) {
                classes += " quipuActive";
            }
            if (state.knots[p] === state.digits[p]) {
                classes += " quipuFilled";
            }
            strings += "<div class=\"" + classes + "\">";
            strings += "<div class=\"quipuKnots\">";
            for (var k = 0; k < state.knots[p]; k++) {
                strings += "<span class=\"quipuKnot\"></span>";
            }
            if (p === state.active && !state.done) {
                strings += "<span class=\"quipuKnot quipuKnotGhost\"></span>";
            }
            strings += "</div>";
            strings += "<span class=\"quipuOrderLabel\">" + htQuipuOrderName(p) + "</span>";
            strings += "</div>";
        }
        strings += "</div>";
        strings += "<div class=\"quipuControls\">";
        strings += "<button type=\"button\" class=\"quipuArrow quipuUp\" aria-label=\"+\" onclick=\"htQuipuAdd(" + s + ");\"><i class=\"fa-solid fa-caret-up\"></i></button>";
        strings += "<button type=\"button\" class=\"quipuArrow quipuDown\" aria-label=\"-\" onclick=\"htQuipuRemove(" + s + ");\"><i class=\"fa-solid fa-caret-down\"></i></button>";
        strings += "</div>";
        strings += "</div>";
    }

    var html = "";
    html += "<div class=\"quipuAssembly\">";
    html += "<div class=\"quipuTargetsRow\">" + targets + "</div>";
    html += "<div class=\"quipuMainCord\"></div>";
    html += "<div class=\"quipuStrings\">" + strings + "</div>";
    html += "</div>";

    $("#quipuBoard").html(html);
}

function htQuipuAdd(stringIndex) {
    var state = localQuipu.strings[stringIndex];
    if (!state || state.done) {
        return;
    }

    var position = state.active;
    if (state.knots[position] < state.digits[position]) {
        state.knots[position]++;
    }
    var filled = (state.knots[position] === state.digits[position]);
    var previousActive = state.active;
    htQuipuUpdateActive(state);
    htQuipuRender();

    if (htQuipuAllDone()) {
        htQuipuSetMessage("");
        if (htQuipuIsLastLevel()) {
            $("#quipuCongratsText").html($("#quipuMsgAllLevels").html());
        } else {
            $("#quipuCongratsText").html($("#quipuMsgLevel").html());
        }
        $("#quipuCongrats").show();
    } else if (state.done) {
        htQuipuSetMessage("String");
    } else if (filled && state.active > previousActive) {
        htQuipuSetMessage("Order");
    } else {
        htQuipuSetMessage("");
    }
}

function htQuipuRemove(stringIndex) {
    var state = localQuipu.strings[stringIndex];
    if (!state) {
        return;
    }

    for (var i = state.digits.length - 1; i >= 0; i--) {
        if (state.knots[i] > 0) {
            state.knots[i]--;
            break;
        }
    }

    htQuipuUpdateActive(state);
    $("#quipuCongrats").hide();
    htQuipuSetMessage("");
    htQuipuRender();
}

function htLoadContent() {
    localQuipu = { "level": 0, "cfg": quipuLevels[0], "strings": [] };

    $("#quipuNewBtn").on("click", function() {
        htQuipuStartLevel(localQuipu.level);
    });

    $("#quipuNextLevelBtn").on("click", function() {
        htQuipuNextLevel();
    });

    htSetImageSrc("imgQuipuPanel", "images/Caral/QuipuPanel.png");

    htQuipuStartLevel(0);
    htWriteNavigation();

    return false;
}
