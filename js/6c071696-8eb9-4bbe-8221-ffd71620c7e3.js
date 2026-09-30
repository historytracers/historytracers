// SPDX-License-Identifier: GPL-3.0-or-later

// Around the World (Counting)
// Interactive tour of the first counting tools created by humanity.
// The tool mirrors the Android "Around the World (Counting)" application:
// each region presents a counting instrument and a small practice game.

function atwWord(id, fallback) {
    var el = document.getElementById(id);
    if (el && el.textContent && el.textContent.trim().length > 0) {
        return el.textContent;
    }
    return fallback;
}

function atwRandom(min, max) {
    return htGetRandomArbitrary(min, max + 1);
}

function atwWords() {
    return {
        represent: atwWord("atwWordRepresent", "Represent the number:"),
        missing: atwWord("atwWordMissing", "Which number is missing in the sequence?"),
        value: atwWord("atwWordValue", "Value"),
        level: atwWord("atwWordLevel", "Level"),
        newRound: atwWord("atwWordNewRound", "New round"),
        nextLevel: atwWord("atwWordNextLevel", "Next level"),
        restart: atwWord("atwWordRestart", "Restart"),
        correct: atwWord("atwWordCorrect", "\u2713 Correct!"),
        add: atwWord("atwWordAdd", "Add one"),
        remove: atwWord("atwWordRemove", "Remove one")
    };
}

function atwElement(tag, cls) {
    var el = document.createElement(tag);
    if (cls) {
        el.className = cls;
    }
    return el;
}

function atwButton(label, cls) {
    var b = atwElement("button", cls || "reset-tutor-btn");
    b.type = "button";
    b.textContent = label;
    return b;
}

//
// Shared canvas helpers
//

function atwCanvas(width, height) {
    var c = document.createElement("canvas");
    c.className = "atw-canvas";
    c.width = width;
    c.height = height;
    return c;
}

function atwDrawBone(ctx, W, H, value) {
    var bone = "#efe4c8";
    var boneEdge = "#c9b489";
    var mark = "#5d4037";
    var cy = H * 0.55;
    var half = W * 0.32;
    var cx = W * 0.5;
    var thickness = H * 0.20;
    var knob = H * 0.13;

    ctx.fillStyle = bone;
    ctx.strokeStyle = boneEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - half, cy - thickness / 2);
    ctx.lineTo(cx + half, cy - thickness / 2);
    ctx.lineTo(cx + half, cy + thickness / 2);
    ctx.lineTo(cx - half, cy + thickness / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    [-1, 1].forEach(function (dir) {
        [-1, 1].forEach(function (v) {
            ctx.beginPath();
            ctx.arc(cx + dir * half, cy + v * thickness * 0.32, knob, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    });

    ctx.strokeStyle = mark;
    ctx.lineWidth = Math.max(2, W * 0.008);
    var count = Math.max(0, Math.min(20, value));
    for (var i = 0; i < count; i++) {
        var x = cx - half + (i + 0.5) * ((2 * half) / 20);
        ctx.beginPath();
        ctx.moveTo(x, cy - thickness * 0.33);
        ctx.lineTo(x, cy + thickness * 0.33);
        ctx.stroke();
    }
}

function atwDrawQuipu(ctx, W, H, value) {
    var cord = "#a1887f";
    var knot = "#5d4037";
    var mainY = H * 0.16;
    var cordX = W * 0.5;

    ctx.strokeStyle = cord;
    ctx.lineWidth = Math.max(3, H * 0.02);
    ctx.beginPath();
    ctx.moveTo(W * 0.10, mainY);
    ctx.lineTo(W * 0.90, mainY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cordX, mainY);
    ctx.lineTo(cordX, H * 0.94);
    ctx.stroke();

    var count = Math.max(0, Math.min(20, value));
    var top = mainY + H * 0.06;
    var bottom = H * 0.88;
    var gap = count > 1 ? (bottom - top) / (count - 1) : 0;
    var radius = Math.min(H * 0.04, count > 1 ? gap * 0.45 : H * 0.04);
    ctx.fillStyle = knot;
    for (var i = 0; i < count; i++) {
        var y = top + i * gap;
        ctx.beginPath();
        ctx.arc(cordX, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function atwDrawMeso(ctx, W, H, value) {
    var ink = "#5a3f2c";
    var bars = Math.floor(value / 5);
    var dots = value % 5;
    var dotRadius = Math.min(W, H) * 0.035;
    var gap = H * 0.05;
    var barWidth = (dotRadius * 2 * 5) + (gap * 4);
    var barHeight = H * 0.10;
    var barsHeight = bars > 0 ? bars * barHeight + (bars - 1) * gap : 0;
    var dotsHeight = dots > 0 ? dotRadius * 2 + gap : 0;
    var contentHeight = barsHeight + dotsHeight;
    var y = H * 0.94 - contentHeight;

    ctx.fillStyle = ink;
    if (dots > 0) {
        var totalWidth = dots * dotRadius * 2 + (dots - 1) * gap;
        var x = W * 0.5 - totalWidth / 2 + dotRadius;
        for (var i = 0; i < dots; i++) {
            ctx.beginPath();
            ctx.arc(x, y + dotRadius, dotRadius, 0, Math.PI * 2);
            ctx.fill();
            x += dotRadius * 2 + gap;
        }
        y += dotRadius * 2 + gap;
    }
    for (var b = 0; b < bars; b++) {
        ctx.beginPath();
        var r = barHeight / 2;
        var left = W * 0.5 - barWidth / 2;
        ctx.moveTo(left + r, y);
        ctx.lineTo(left + barWidth - r, y);
        ctx.arc(left + barWidth - r, y + r, r, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(left + r, y + barHeight);
        ctx.arc(left + r, y + r, r, Math.PI / 2, -Math.PI / 2);
        ctx.closePath();
        ctx.fill();
        y += barHeight + gap;
    }
}

function atwDrawYupana(ctx, W, H, value) {
    var frame = "#8d6e63";
    var seed = "#c62828";
    var margin = W * 0.08;
    var cols = 4;
    var rows = 2;
    var gridW = W - 2 * margin;
    var gridH = H * 0.78;
    var top = H * 0.10;
    var colW = gridW / cols;
    var rowH = gridH / rows;

    ctx.strokeStyle = frame;
    ctx.lineWidth = 2;
    for (var r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(margin, top + r * rowH);
        ctx.lineTo(margin + gridW, top + r * rowH);
        ctx.stroke();
    }
    for (var c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(margin + c * colW, top);
        ctx.lineTo(margin + c * colW, top + gridH);
        ctx.stroke();
    }

    var digits = [Math.floor(value / 10), value % 10];
    ctx.fillStyle = seed;
    for (var row = 0; row < rows; row++) {
        var digit = Math.min(9, digits[row]);
        var cy = top + row * rowH + rowH / 2;
        var radius = Math.min(colW, rowH) * 0.12;
        for (var i = 0; i < digit; i++) {
            var cx = margin + (i + 0.5) * (gridW / 10) + (i * colW * 0.02);
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

//
// "Represent the number" games (bones, quipu, meso, yupana)
//

function atwCreateStepper(container, tool, words) {
    var draw = {
        bones: atwDrawBone,
        quipu: atwDrawQuipu,
        meso: atwDrawMeso,
        yupana: atwDrawYupana
    }[tool];

    var wrap = atwElement("div", "atw-game-inner");
    container.appendChild(wrap);

    var instruction = atwElement("p", "atw-instruction");
    wrap.appendChild(instruction);
    var targetSpan = atwElement("span", "atw-target");
    instruction.appendChild(document.createTextNode(words.represent + " "));
    instruction.appendChild(targetSpan);

    var canvas = atwCanvas(360, 200);
    wrap.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var controls = atwElement("p", "atw-controls");
    wrap.appendChild(controls);
    var decBtn = atwButton("\u2212", "atw-step");
    decBtn.setAttribute("aria-label", words.remove);
    var valueSpan = atwElement("span", "atw-value");
    var incBtn = atwButton("+", "atw-step");
    incBtn.setAttribute("aria-label", words.add);
    controls.appendChild(decBtn);
    controls.appendChild(valueSpan);
    controls.appendChild(incBtn);

    var levelLine = atwElement("p", "atw-levelline");
    var levelBadge = atwElement("span", "level-badge");
    levelLine.appendChild(levelBadge);
    wrap.appendChild(levelLine);

    var correct = atwElement("p", "atw-correct");
    correct.style.display = "none";
    correct.textContent = words.correct;
    wrap.appendChild(correct);

    var buttons = atwElement("p", "atw-buttons");
    var newBtn = atwButton(words.newRound);
    var nextBtn = atwButton(words.nextLevel, "game-next-btn");
    buttons.appendChild(newBtn);
    buttons.appendChild(nextBtn);
    wrap.appendChild(buttons);

    var state = { level: 1, target: 1, value: 0 };

    function levelRange(level) {
        return [level * 5 - 4, level * 5];
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(ctx, canvas.width, canvas.height, state.value);
        targetSpan.textContent = state.target;
        valueSpan.textContent = words.value + ": " + state.value;
        levelBadge.textContent = words.level + " " + state.level + "/4";
        decBtn.disabled = state.value <= 0;
        incBtn.disabled = state.value >= 20;
        correct.style.display = state.value === state.target ? "block" : "none";
    }

    function newRound() {
        var range = levelRange(state.level);
        state.target = atwRandom(range[0], range[1]);
        state.value = 0;
        render();
    }

    function nextLevel() {
        state.level = state.level >= 4 ? 1 : state.level + 1;
        newRound();
    }

    decBtn.addEventListener("click", function () {
        if (state.value > 0) {
            state.value--;
            render();
        }
    });
    incBtn.addEventListener("click", function () {
        if (state.value < 20) {
            state.value++;
            render();
        }
    });
    newBtn.addEventListener("click", newRound);
    nextBtn.addEventListener("click", nextLevel);

    newRound();
}

//
// Abacus games (calculi, suanpan, soroban)
//

function atwAbacusConfig(tool) {
    if (tool === "calculi") {
        return {
            headings: ["(((I)))", "((I))", "(I)", "C", "X", "I"],
            places: [100000, 10000, 1000, 100, 10, 1],
            upper: 1,
            lower: 4,
            maxTarget: 999
        };
    }
    if (tool === "suanpan") {
        return {
            headings: ["", "", "", "", ""],
            places: [10000, 1000, 100, 10, 1],
            upper: 2,
            lower: 5,
            maxTarget: 999
        };
    }
    return {
        headings: ["", "", "", "", ""],
        places: [10000, 1000, 100, 10, 1],
        upper: 1,
        lower: 4,
        maxTarget: 999
    };
}

function atwCreateAbacus(container, tool, words) {
    var cfg = atwAbacusConfig(tool);
    var columns = cfg.places.length;

    var wrap = atwElement("div", "atw-game-inner");
    container.appendChild(wrap);

    var instruction = atwElement("p", "atw-instruction");
    wrap.appendChild(instruction);
    var targetSpan = atwElement("span", "atw-target");
    instruction.appendChild(document.createTextNode(words.represent + " "));
    instruction.appendChild(targetSpan);

    var canvas = atwCanvas(420, 300);
    wrap.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var readout = atwElement("p", "atw-readout");
    var valueSpan = atwElement("span", "atw-value");
    readout.appendChild(valueSpan);
    wrap.appendChild(readout);

    var levelLine = atwElement("p", "atw-levelline");
    var levelBadge = atwElement("span", "level-badge");
    levelLine.appendChild(levelBadge);
    wrap.appendChild(levelLine);

    var correct = atwElement("p", "atw-correct");
    correct.style.display = "none";
    correct.textContent = words.correct;
    wrap.appendChild(correct);

    var buttons = atwElement("p", "atw-buttons");
    var newBtn = atwButton(words.newRound);
    var nextBtn = atwButton(words.nextLevel, "game-next-btn");
    buttons.appendChild(newBtn);
    buttons.appendChild(nextBtn);
    wrap.appendChild(buttons);

    var state = {
        level: 1,
        target: 1,
        cols: []
    };
    for (var i = 0; i < columns; i++) {
        state.cols.push({ upper: 0, lower: 0 });
    }

    var layout = {};

    function computeLayout() {
        layout.W = canvas.width;
        layout.H = canvas.height;
        layout.margin = 26;
        layout.colW = (layout.W - 2 * layout.margin) / columns;
        layout.startX = layout.margin + layout.colW / 2;
        layout.trackY = layout.H * 0.5;
        layout.trackTop = layout.trackY - 22;
        layout.trackBottom = layout.trackY + 22;
        layout.step = 22;
        layout.radius = Math.max(6, Math.min(layout.colW * 0.30, 10));
        layout.upperPos = [];
        for (var u = 0; u < cfg.upper; u++) {
            layout.upperPos.push({
                active: layout.trackTop - 10 - u * layout.step,
                inactive: layout.trackTop - 48 - u * layout.step * 0.9
            });
        }
        layout.lowerPos = [];
        for (var l = 0; l < cfg.lower; l++) {
            layout.lowerPos.push({
                active: layout.trackBottom + 10 + l * layout.step,
                inactive: layout.trackBottom + 34 + l * layout.step
            });
        }
    }

    function columnValue(c) {
        return (state.cols[c].upper * 5 + state.cols[c].lower) * cfg.places[c];
    }

    function totalValue() {
        var total = 0;
        for (var c = 0; c < columns; c++) {
            total += columnValue(c);
        }
        return total;
    }

    function draw() {
        ctx.clearRect(0, 0, layout.W, layout.H);
        ctx.fillStyle = "#fef5e0";
        ctx.fillRect(0, 0, layout.W, layout.H);

        ctx.fillStyle = "#e5c28e";
        ctx.fillRect(0, layout.trackY - 5, layout.W, 10);

        ctx.textAlign = "center";
        for (var c = 0; c < columns; c++) {
            var x = layout.startX + c * layout.colW;
            ctx.strokeStyle = "#b08054";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 70);
            ctx.lineTo(x, layout.H - 24);
            ctx.stroke();

            ctx.font = "bold 13px Georgia, serif";
            ctx.fillStyle = "#40280f";
            ctx.fillText(cfg.headings[c], x, 26);
            ctx.font = "10px Verdana, sans-serif";
            ctx.fillStyle = "#7a4a24";
            ctx.fillText(String(cfg.places[c]), x, 44);

            var col = state.cols[c];
            for (var u = 0; u < cfg.upper; u++) {
                var pos = layout.upperPos[u];
                var y = u < col.upper ? pos.active : pos.inactive;
                ctx.beginPath();
                ctx.arc(x, y, layout.radius, 0, Math.PI * 2);
                ctx.fillStyle = "#c0392b";
                ctx.fill();
                ctx.strokeStyle = "#6b1f14";
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
            for (var l = 0; l < cfg.lower; l++) {
                var lpos = layout.lowerPos[l];
                var ly = l < col.lower ? lpos.active : lpos.inactive;
                ctx.beginPath();
                ctx.arc(x, ly, layout.radius, 0, Math.PI * 2);
                ctx.fillStyle = "#3a6068";
                ctx.fill();
                ctx.strokeStyle = "#1a3a3a";
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
        }
    }

    function hitTest(mx, my) {
        var colIdx = -1;
        for (var c = 0; c < columns; c++) {
            var centerX = layout.startX + c * layout.colW;
            if (Math.abs(mx - centerX) < layout.colW * 0.45) {
                colIdx = c;
                break;
            }
        }
        if (colIdx === -1) {
            return null;
        }
        var col = state.cols[colIdx];
        var centerX = layout.startX + colIdx * layout.colW;
        for (var u = 0; u < cfg.upper; u++) {
            var pos = layout.upperPos[u];
            var y = u < col.upper ? pos.active : pos.inactive;
            if (Math.abs(mx - centerX) < layout.radius + 8 && Math.abs(my - y) < layout.radius + 8) {
                return { type: "upper", col: colIdx, bead: u };
            }
        }
        for (var l = 0; l < cfg.lower; l++) {
            var lpos = layout.lowerPos[l];
            var ly = l < col.lower ? lpos.active : lpos.inactive;
            if (Math.abs(mx - centerX) < layout.radius + 8 && Math.abs(my - ly) < layout.radius + 8) {
                return { type: "lower", col: colIdx, bead: l };
            }
        }
        return null;
    }

    function update() {
        var val = totalValue();
        valueSpan.textContent = words.value + ": " + val;
        correct.style.display = val === state.target ? "block" : "none";
    }

    function handlePointer(clientX, clientY) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        var hit = hitTest((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY);
        if (!hit) {
            return;
        }
        var col = state.cols[hit.col];
        if (hit.type === "upper") {
            col.upper = hit.bead < col.upper ? hit.bead : hit.bead + 1;
            if (col.upper > cfg.upper) {
                col.upper = cfg.upper;
            }
        } else {
            col.lower = hit.bead < col.lower ? hit.bead : hit.bead + 1;
            if (col.lower > cfg.lower) {
                col.lower = cfg.lower;
            }
        }
        draw();
        update();
    }

    function levelRange(level) {
        if (level === 2) {
            return [10, 99];
        }
        if (level === 3) {
            return [100, Math.min(999, cfg.maxTarget)];
        }
        return [1, 9];
    }

    function newRound() {
        var range = levelRange(state.level);
        state.target = atwRandom(range[0], range[1]);
        for (var c = 0; c < columns; c++) {
            state.cols[c].upper = 0;
            state.cols[c].lower = 0;
        }
        targetSpan.textContent = state.target;
        levelBadge.textContent = words.level + " " + state.level + "/3";
        draw();
        update();
    }

    function nextLevel() {
        state.level = state.level >= 3 ? 1 : state.level + 1;
        newRound();
    }

    canvas.addEventListener("mousedown", function (e) {
        handlePointer(e.clientX, e.clientY);
    });
    canvas.addEventListener("touchstart", function (e) {
        if (e.touches.length > 0) {
            e.preventDefault();
            handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    newBtn.addEventListener("click", newRound);
    nextBtn.addEventListener("click", nextLevel);

    computeLayout();
    newRound();
}

//
// Schyoty (horizontal rods)
//

function atwCreateSchyoty(container, words) {
    var places = [10000, 1000, 100, 10, 1];
    var rods = places.length;
    var beadsPerRod = 10;

    var wrap = atwElement("div", "atw-game-inner");
    container.appendChild(wrap);

    var instruction = atwElement("p", "atw-instruction");
    wrap.appendChild(instruction);
    var targetSpan = atwElement("span", "atw-target");
    instruction.appendChild(document.createTextNode(words.represent + " "));
    instruction.appendChild(targetSpan);

    var canvas = atwCanvas(420, 300);
    wrap.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var readout = atwElement("p", "atw-readout");
    var valueSpan = atwElement("span", "atw-value");
    readout.appendChild(valueSpan);
    wrap.appendChild(readout);

    var levelLine = atwElement("p", "atw-levelline");
    var levelBadge = atwElement("span", "level-badge");
    levelLine.appendChild(levelBadge);
    wrap.appendChild(levelLine);

    var correct = atwElement("p", "atw-correct");
    correct.style.display = "none";
    correct.textContent = words.correct;
    wrap.appendChild(correct);

    var buttons = atwElement("p", "atw-buttons");
    var newBtn = atwButton(words.newRound);
    var nextBtn = atwButton(words.nextLevel, "game-next-btn");
    buttons.appendChild(newBtn);
    buttons.appendChild(nextBtn);
    wrap.appendChild(buttons);

    var state = { level: 1, target: 1, digits: [] };
    for (var i = 0; i < rods; i++) {
        state.digits.push(0);
    }

    var layout = {};

    function computeLayout() {
        layout.W = canvas.width;
        layout.H = canvas.height;
        layout.left = layout.W * 0.10;
        layout.right = layout.W * 0.90;
        layout.top = 60;
        layout.bottom = layout.H - 30;
        layout.rodGap = (layout.bottom - layout.top) / rods;
        layout.beadGap = (layout.right - layout.left) / (beadsPerRod - 1);
        layout.radius = Math.min(layout.rodGap * 0.28, layout.beadGap * 0.35);
    }

    function totalValue() {
        var total = 0;
        for (var i = 0; i < rods; i++) {
            total += state.digits[i] * places[i];
        }
        return total;
    }

    function draw() {
        ctx.clearRect(0, 0, layout.W, layout.H);
        ctx.fillStyle = "#f6efe2";
        ctx.fillRect(0, 0, layout.W, layout.H);
        ctx.textAlign = "center";

        for (var i = 0; i < rods; i++) {
            var y = layout.top + i * layout.rodGap + layout.rodGap * 0.5;
            ctx.strokeStyle = "#8d6e63";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(layout.left - layout.beadGap * 0.5, y);
            ctx.lineTo(layout.right + layout.beadGap * 0.5, y);
            ctx.stroke();

            ctx.font = "10px Verdana, sans-serif";
            ctx.fillStyle = "#7a4a24";
            ctx.fillText(String(places[i]), layout.W - 14, y + 3);

            for (var b = 0; b < beadsPerRod; b++) {
                var x = layout.left + b * layout.beadGap;
                ctx.beginPath();
                ctx.arc(x, y, layout.radius, 0, Math.PI * 2);
                ctx.fillStyle = b < state.digits[i] ? "#c0392b" : "#cfc3a8";
                ctx.fill();
                ctx.strokeStyle = "#6b5b3e";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    function pointerToBead(clientX, clientY) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        var mx = (clientX - rect.left) * scaleX;
        var my = (clientY - rect.top) * scaleY;
        for (var i = 0; i < rods; i++) {
            var y = layout.top + i * layout.rodGap + layout.rodGap * 0.5;
            if (Math.abs(my - y) > layout.rodGap * 0.5) {
                continue;
            }
            for (var b = 0; b < beadsPerRod; b++) {
                var x = layout.left + b * layout.beadGap;
                if (Math.abs(mx - x) < layout.beadGap * 0.5) {
                    return { rod: i, bead: b };
                }
            }
        }
        return null;
    }

    function update() {
        var val = totalValue();
        valueSpan.textContent = words.value + ": " + val;
        correct.style.display = val === state.target ? "block" : "none";
    }

    function handlePointer(clientX, clientY) {
        var hit = pointerToBead(clientX, clientY);
        if (!hit) {
            return;
        }
        var current = state.digits[hit.rod];
        if (hit.bead < current) {
            state.digits[hit.rod] = hit.bead;
        } else {
            state.digits[hit.rod] = hit.bead + 1;
        }
        draw();
        update();
    }

    function levelRange(level) {
        if (level === 2) {
            return [10, 99];
        }
        if (level === 3) {
            return [100, 999];
        }
        return [1, 9];
    }

    function newRound() {
        var range = levelRange(state.level);
        state.target = atwRandom(range[0], range[1]);
        for (var i = 0; i < rods; i++) {
            state.digits[i] = 0;
        }
        targetSpan.textContent = state.target;
        levelBadge.textContent = words.level + " " + state.level + "/3";
        draw();
        update();
    }

    function nextLevel() {
        state.level = state.level >= 3 ? 1 : state.level + 1;
        newRound();
    }

    canvas.addEventListener("mousedown", function (e) {
        handlePointer(e.clientX, e.clientY);
    });
    canvas.addEventListener("touchstart", function (e) {
        if (e.touches.length > 0) {
            e.preventDefault();
            handlePointer(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    newBtn.addEventListener("click", newRound);
    nextBtn.addEventListener("click", nextLevel);

    computeLayout();
    newRound();
}

//
// Sequence game (Hindu-Arabic numerals)
//

function atwCreateSequence(container, words) {
    var wrap = atwElement("div", "atw-game-inner");
    container.appendChild(wrap);

    var instruction = atwElement("p", "atw-instruction");
    instruction.textContent = words.missing;
    wrap.appendChild(instruction);

    var seqLine = atwElement("p", "atw-sequence");
    wrap.appendChild(seqLine);

    var choices = atwElement("div", "atw-choices");
    wrap.appendChild(choices);

    var correct = atwElement("p", "atw-correct");
    correct.style.display = "none";
    correct.textContent = words.correct;
    wrap.appendChild(correct);

    var buttons = atwElement("p", "atw-buttons");
    var newBtn = atwButton(words.newRound);
    buttons.appendChild(newBtn);
    wrap.appendChild(buttons);

    var state = { step: 1, values: [], missing: 0, selected: null };

    function buildChoices() {
        var correctValue = state.values[state.missing];
        var offsets = [0, -1, 1, -2, 2];
        var options = [];
        for (var o = 0; o < offsets.length; o++) {
            var candidate = correctValue + offsets[o];
            if (candidate >= 1 && options.indexOf(candidate) === -1) {
                options.push(candidate);
            }
        }
        for (var s = options.length - 1; s > 0; s--) {
            var j = atwRandom(0, s);
            var tmp = options[s];
            options[s] = options[j];
            options[j] = tmp;
        }
        choices.innerHTML = "";
        for (var k = 0; k < options.length; k++) {
            (function (num) {
                var b = atwButton(String(num), "atw-choice");
                b.addEventListener("click", function () {
                    state.selected = num;
                    render();
                });
                choices.appendChild(b);
            })(options[k]);
        }
    }

    function render() {
        var missing = state.values[state.missing];
        seqLine.innerHTML = "";
        for (var i = 0; i < state.values.length; i++) {
            var span = atwElement("span", "atw-seqitem");
            span.textContent = i === state.missing ? "?" : String(state.values[i]);
            seqLine.appendChild(span);
        }
        var buttonsList = choices.getElementsByTagName("button");
        for (var b = 0; b < buttonsList.length; b++) {
            var val = parseInt(buttonsList[b].textContent, 10);
            if (state.selected === val) {
                buttonsList[b].classList.add("atw-choice-selected");
            } else {
                buttonsList[b].classList.remove("atw-choice-selected");
            }
        }
        correct.style.display = state.selected === missing ? "block" : "none";
    }

    function newRound() {
        state.step = atwRandom(1, 5);
        var start = atwRandom(1, 6);
        state.values = [];
        for (var i = 0; i < 5; i++) {
            state.values.push(start + i * state.step);
        }
        state.missing = atwRandom(1, 4);
        state.selected = null;
        buildChoices();
        render();
    }

    newBtn.addEventListener("click", newRound);

    newRound();
}

//
// Initialization
//

function atwInitGames() {
    var words = atwWords();
    $(".atw-game").each(function () {
        var tool = $(this).attr("data-atw");
        if (this.getAttribute("data-atw-ready") === "1") {
            return;
        }
        this.setAttribute("data-atw-ready", "1");
        if (tool === "bones" || tool === "quipu" || tool === "meso" || tool === "yupana") {
            atwCreateStepper(this, tool, words);
        } else if (tool === "calculi" || tool === "suanpan" || tool === "soroban") {
            atwCreateAbacus(this, tool, words);
        } else if (tool === "schyoty") {
            atwCreateSchyoty(this, words);
        } else if (tool === "sequence") {
            atwCreateSequence(this, words);
        }
    });
}

function atwSetImages() {
    var prefix = "images/Mapswire/";
    var images = {
        atwImgJourney: prefix + "mapswire-world-political-white-equal_earth_journey.png",
        atwImgAfrica: prefix + "continent_af-where-is-africa.png",
        atwImgSouthAmerica: prefix + "continent_sa-where-is-south-america.png",
        atwImgMesoamerica: prefix + "mapswire-continent_na-printable-map-north-america-robinson-269_mesoamerica2.jpg",
        atwImgEurope: prefix + "continent_eu-where-is-europe.png",
        atwImgAsia1: prefix + "continent_as-where-is-asia.png",
        atwImgAsia2: prefix + "continent_as-where-is-asia.png",
        atwImgAsia3: prefix + "continent_as-where-is-asia.png",
        atwImgAsia4: prefix + "continent_as-where-is-asia.png",
        atwImgYupana: prefix + "mapswire-continent_sa-printable-map-south-america-lambert-az-hemi-271_Tawantsuyu.jpg"
    };
    for (var id in images) {
        if (Object.prototype.hasOwnProperty.call(images, id)) {
            htSetImageSrc(id, images[id]);
        }
    }
}

function htLoadContent() {
    atwSetImages();
    atwInitGames();
    htWriteNavigation();

    return false;
}
