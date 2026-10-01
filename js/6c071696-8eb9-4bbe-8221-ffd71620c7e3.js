// SPDX-License-Identifier: GPL-3.0-or-later

// Around the World (Counting)
// Interactive tour of the first counting tools created by humanity.
// The abacus, yupana and bone practice games reuse the same design and code
// already present in the project: ht_abacus.js (Soroban/Suanpan/Schyoty),
// ht_yupana.js, the Roman abacus page (1aacf33a) and the bone page (7d2fd4de).

function atwWord(id, fallback) {
    var el = document.getElementById(id);
    if (el && el.textContent && el.textContent.trim().length > 0) {
        return el.textContent;
    }
    return fallback;
}

// Like atwWord, but keeps the HTML markup (e.g. <br>) of a hidden template.
function atwWordHTML(id, fallback) {
    var el = document.getElementById(id);
    if (el && el.innerHTML && el.innerHTML.trim().length > 0) {
        return el.innerHTML;
    }
    return fallback;
}

// Fills the {button} placeholder of a congratulations template with the
// localized label of the control the player uses to start another round.
function atwCongrats(template, buttonLabel) {
    if (!template) {
        return "";
    }
    if (!buttonLabel) {
        return template;
    }
    return template.split("{button}").join(buttonLabel);
}

// Reads a button label, dropping a leading decorative glyph (e.g. "⟳ Reset").
function atwControlLabel(el) {
    if (!el) {
        return "";
    }
    var parts = (el.textContent || "").trim().split(/\s+/);
    if (parts.length > 1 && !/[0-9A-Za-zÀ-ÿ]/.test(parts[0])) {
        parts.shift();
    }
    return parts.join(" ");
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
        remove: atwWord("atwWordRemove", "Remove one"),
        congrats: atwWordHTML("atwWordCongrats", "🎉🎉🎉 CONGRATULATIONS! 🎉🎉🎉<br>You represented the number correctly!<br>Click '{button}' to practice more!"),
        congratsSequence: atwWordHTML("atwWordCongratsSequence", "🎉🎉🎉 CONGRATULATIONS! 🎉🎉🎉<br>You completed the sequence!<br>Click '{button}' to practice more!"),
        congratsNoAction: atwWordHTML("atwWordCongratsNoAction", "🎉🎉🎉 CONGRATULATIONS! 🎉🎉🎉<br>You represented the number correctly!")
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
// Quipu / Meso canvas helpers ("represent the number" steppers kept as canvas)
//

function atwCanvas(width, height) {
    var c = document.createElement("canvas");
    c.className = "atw-canvas";
    c.width = width;
    c.height = height;
    return c;
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

function atwCreateStepper(container, tool, words) {
    var draw = {
        quipu: atwDrawQuipu,
        meso: atwDrawMeso
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

    var correct = atwElement("p", "atw-correct");
    correct.style.display = "none";
    correct.innerHTML = atwCongrats(words.congrats, words.newRound);
    wrap.appendChild(correct);

    var buttons = atwElement("p", "atw-buttons");
    var newBtn = atwButton(words.newRound || "New round");
    buttons.appendChild(newBtn);
    wrap.appendChild(buttons);

    var state = { target: 1, value: 0 };

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(ctx, canvas.width, canvas.height, state.value);
        targetSpan.textContent = state.target;
        valueSpan.textContent = (words.value || "Value") + ": " + state.value;
        var reached = state.value === state.target;
        decBtn.disabled = reached || state.value <= 0;
        incBtn.disabled = reached || state.value >= 10;
        correct.style.display = reached ? "block" : "none";
    }

    function newRound() {
        state.target = atwRandom(1, 10);
        state.value = 0;
        render();
    }

    decBtn.addEventListener("click", function () {
        if (state.value > 0 && state.value < state.target) {
            state.value--;
            render();
        }
    });
    incBtn.addEventListener("click", function () {
        if (state.value < state.target) {
            state.value++;
            render();
        }
    });
    newBtn.addEventListener("click", newRound);

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
    correct.innerHTML = atwCongrats(words.congratsSequence, words.newRound);
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
            if (candidate >= 0 && candidate <= 10 && options.indexOf(candidate) === -1) {
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
        state.step = 1;
        var start = atwRandom(0, 6);
        state.values = [];
        for (var i = 0; i < 5; i++) {
            state.values.push(start + i);
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
// Bone game -- same design/code as "Counting with the bone" (7d2fd4de)
//

var localBoneGame = {
    level: 1,
    target: 0,
    marks: 0,
    won: false
};

function htBoneHandSides(level) {
    var sides = [];
    for (let i = 0; i < level; i++) {
        sides.push((i % 2 === 0) ? "Left" : "Right");
    }
    return sides;
}

function atwBoneNewRound() {
    localBoneGame.target = atwRandom(1, 10);
    localBoneGame.marks = 0;
    localBoneGame.won = false;
    localBoneGame.level = localBoneGame.target <= 5 ? 1 : 2;
    htBoneRenderHands();
    htBoneRender();
}

function htBoneRenderHands() {
    var level = localBoneGame.level;
    var digits = [];
    var sides = htBoneHandSides(level);
    var i;
    for (i = 0; i < level; i++) {
        digits.push(5);
    }
    digits[level - 1] = localBoneGame.target - 5 * (level - 1);

    var prefix = htGetImgSrcPrefix();
    var altTpl = $("#htBoneHandAltTpl").text() || "Hand with {n} raised fingers";
    var html = "";
    for (i = 0; i < level; i++) {
        var alt = altTpl.split("{n}").join(digits[i]);
        html += "<img id=\"htBoneHandImg" + i + "\" class=\"htBoneHandImg\" alt=\"" + alt +
            "\" onclick=\"htImageZoom('htBoneHandImg" + i + "', '0%')\" src=\"" + prefix +
            "images/HistoryTracers/" + digits[i] + sides[i] + "_Hand_Small.png\" />";
    }
    $("#htBoneHands").html(html);
}

function htBoneRender() {
    var container = $("#htBoneMarks");
    container.empty();
    var total = localBoneGame.marks;
    for (let i = 0; i < total; i++) {
        var left = 5 + i * (90 / 19);
        container.append("<span class=\"htBoneMark\" style=\"left:" + left + "%\"></span>");
    }

    var up = $("#htBoneAdd");
    var down = $("#htBoneRemove");
    up.removeClass("htBoneArrowDisabled");
    down.removeClass("htBoneArrowDisabled");
    if (localBoneGame.won || total >= localBoneGame.target) {
        up.addClass("htBoneArrowDisabled");
    }
    if (localBoneGame.won || total <= 0) {
        down.addClass("htBoneArrowDisabled");
    }

    if (localBoneGame.won) {
        $("#htBoneCongrats").show();
    } else {
        $("#htBoneCongrats").hide();
    }
}

function htBoneAddMark() {
    if (localBoneGame.won) {
        return false;
    }
    if (localBoneGame.marks < localBoneGame.target) {
        localBoneGame.marks++;
    }
    if (localBoneGame.marks === localBoneGame.target) {
        localBoneGame.won = true;
    }
    htBoneRender();
    return false;
}

function htBoneRemoveMark() {
    if (localBoneGame.won) {
        return false;
    }
    if (localBoneGame.marks > 0) {
        localBoneGame.marks--;
    }
    htBoneRender();
    return false;
}

function atwInitBone() {
    $("#htBoneAdd").on("click", htBoneAddMark);
    $("#htBoneRemove").on("click", htBoneRemoveMark);
    $("#htBoneNewNumber").on("click", atwBoneNewRound);

    atwBoneNewRound();
}

//
// Roman abacus (calculi) -- same design/code as "Roman abacus" (1aacf33a)
//

var localRomanAbacusController = {};

localRomanAbacusController.HEADINGS = ["(((I)))", "((I))", "(I)", "C", "X", "I"];
localRomanAbacusController.PLACES = [100000, 10000, 1000, 100, 10, 1];
localRomanAbacusController.LEVELS = 6;

function htRomanAbacusInitState() {
    localRomanAbacusController.state = [];
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        localRomanAbacusController.state.push({ upper: 0, lower: 0 });
    }
}

function htRomanAbacusColumnValue(c) {
    const col = localRomanAbacusController.state[c];
    return (col.upper * 5 + col.lower) * localRomanAbacusController.PLACES[c];
}

function htRomanAbacusComputeValue() {
    let value = 0;
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        value += htRomanAbacusColumnValue(c);
    }
    return value;
}

function htRomanAbacusRomanOf(n) {
    if (n <= 0) return "";
    const table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
                   [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
                   [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let roman = "";
    let rest = n;
    for (let i = 0; i < table.length; i++) {
        while (rest >= table[i][0]) {
            roman += table[i][1];
            rest -= table[i][0];
        }
    }
    return roman;
}

function htRomanAbacusRomanHTML(value) {
    if (value <= 0) return "";
    const upper = Math.floor(value / 1000);
    const lower = value % 1000;
    let html = "";
    if (upper > 0) {
        html += '<span class="roman-abacus-overline">' + htRomanAbacusRomanOf(upper) + '</span>';
    }
    if (lower > 0) {
        html += htRomanAbacusRomanOf(lower);
    }
    return html;
}

function htRomanAbacusComputeLayout() {
    const cvs = localRomanAbacusController.canvas;
    localRomanAbacusController.canvasWidth = cvs.width;
    localRomanAbacusController.canvasHeight = cvs.height;

    const horizontalMargin = 24;
    const totalColSpace = localRomanAbacusController.canvasWidth - (horizontalMargin * 2);
    localRomanAbacusController.colWidth = totalColSpace / localRomanAbacusController.HEADINGS.length;
    localRomanAbacusController.startX = horizontalMargin + localRomanAbacusController.colWidth / 2;

    localRomanAbacusController.decimalTrackY = localRomanAbacusController.canvasHeight * 0.5;
    localRomanAbacusController.decimalTrackTop = localRomanAbacusController.decimalTrackY - 30;
    localRomanAbacusController.decimalTrackBottom = localRomanAbacusController.decimalTrackY + 30;
    localRomanAbacusController.barY = localRomanAbacusController.decimalTrackY;

    const upperMax = 1;
    const lowerMax = 4;
    const verticalStep = 26;

    const upperBaseActive = localRomanAbacusController.decimalTrackTop - 8;
    const upperStartInactive = localRomanAbacusController.decimalTrackTop - 52;
    localRomanAbacusController.upperPositions = [];
    for (let i = 0; i < upperMax; i++) {
        let activeY = upperBaseActive - (i * verticalStep);
        let inactiveY = upperStartInactive - (i * verticalStep * 0.8);
        if (inactiveY < 20) inactiveY = 20 + i * 5;
        localRomanAbacusController.upperPositions.push({ activeY: activeY, inactiveY: inactiveY });
    }

    const lowerBaseActive = localRomanAbacusController.decimalTrackBottom + 8;
    const lowerInactiveDrop = 30;
    localRomanAbacusController.lowerPositions = [];
    for (let i = 0; i < lowerMax; i++) {
        let activeY = lowerBaseActive + (i * verticalStep);
        let inactiveY = activeY + lowerInactiveDrop;
        localRomanAbacusController.lowerPositions.push({ activeY: activeY, inactiveY: inactiveY });
    }

    let maxRadiusByWidth = localRomanAbacusController.colWidth * 0.38;
    let maxRadiusByVertical = verticalStep * 0.45;
    localRomanAbacusController.ballRadius = Math.min(maxRadiusByWidth, maxRadiusByVertical, 13);
    localRomanAbacusController.ballRadius = Math.max(localRomanAbacusController.ballRadius, 9);
}

function htRomanAbacusDrawTrack() {
    const ctx = localRomanAbacusController.ctx;
    ctx.fillStyle = "#dac894";
    ctx.globalAlpha = 0.4;
    ctx.fillRect(6, localRomanAbacusController.decimalTrackTop,
                 localRomanAbacusController.canvasWidth - 12,
                 localRomanAbacusController.decimalTrackBottom - localRomanAbacusController.decimalTrackTop);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#b59762";
    ctx.lineWidth = 2;
    ctx.strokeRect(7, localRomanAbacusController.decimalTrackTop + 2,
                   localRomanAbacusController.canvasWidth - 14,
                   (localRomanAbacusController.decimalTrackBottom - localRomanAbacusController.decimalTrackTop) - 4);

    ctx.fillStyle = '#c9a86b';
    ctx.fillRect(5, localRomanAbacusController.barY - 6, localRomanAbacusController.canvasWidth - 10, 12);
    ctx.fillStyle = '#e5c28e';
    ctx.fillRect(5, localRomanAbacusController.barY - 4, localRomanAbacusController.canvasWidth - 10, 8);
    ctx.fillStyle = '#f5e2b0';
    ctx.fillRect(5, localRomanAbacusController.barY - 2, localRomanAbacusController.canvasWidth - 10, 4);
}

function htRomanAbacusDrawColumn(idx) {
    const ctx = localRomanAbacusController.ctx;
    const x = localRomanAbacusController.startX + idx * localRomanAbacusController.colWidth;
    const col = localRomanAbacusController.state[idx];
    const lowerCount = col.lower;
    const upperCount = col.upper;

    ctx.beginPath();
    ctx.moveTo(x, 78);
    ctx.lineTo(x, localRomanAbacusController.canvasHeight - 28);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#b08054';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 1, 76);
    ctx.lineTo(x - 1, localRomanAbacusController.canvasHeight - 26);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#e9c48b';
    ctx.stroke();

    for (let u = 0; u < 1; u++) {
        const isActive = (u < upperCount);
        const pos = localRomanAbacusController.upperPositions[u];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        let gradUp = ctx.createRadialGradient(x - 4, beadY - 3, 3, x, beadY, localRomanAbacusController.ballRadius);
        gradUp.addColorStop(0, '#f06a50');
        gradUp.addColorStop(1, '#c03a28');
        ctx.beginPath();
        ctx.arc(x, beadY, localRomanAbacusController.ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradUp;
        ctx.fill();
        ctx.strokeStyle = '#4a2018';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 3, beadY - 3, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffead4';
        ctx.fill();
    }

    for (let b = 0; b < 4; b++) {
        const isActive = (b < lowerCount);
        const pos = localRomanAbacusController.lowerPositions[b];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        let gradLow = ctx.createLinearGradient(x - 5, beadY - 4, x + 5, beadY + 4);
        gradLow.addColorStop(0, '#7da0ae');
        gradLow.addColorStop(1, '#3a6068');
        ctx.beginPath();
        ctx.arc(x, beadY, localRomanAbacusController.ballRadius - 0.5, 0, Math.PI * 2);
        ctx.fillStyle = gradLow;
        ctx.fill();
        ctx.strokeStyle = '#1a3a3a';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 2.5, beadY - 2.5, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#c8e2ec';
        ctx.fill();
    }
}

function htRomanAbacusDrawLabels() {
    const ctx = localRomanAbacusController.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        const x = localRomanAbacusController.startX + c * localRomanAbacusController.colWidth;
        ctx.font = 'bold 16px Georgia, "Times New Roman", serif';
        ctx.fillStyle = '#40280f';
        ctx.fillText(localRomanAbacusController.HEADINGS[c], x, 36);
        ctx.font = '10px Verdana, sans-serif';
        ctx.fillStyle = '#7a4a24';
        ctx.fillText(localRomanAbacusController.PLACES[c].toString(), x, 56);
    }
}

function htRomanAbacusDrawFrame() {
    const ctx = localRomanAbacusController.ctx;
    ctx.strokeStyle = '#f9eec7';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(5, 5, localRomanAbacusController.canvasWidth - 10, localRomanAbacusController.canvasHeight - 10);
    ctx.strokeStyle = '#b48b5a';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(3, 3, localRomanAbacusController.canvasWidth - 6, localRomanAbacusController.canvasHeight - 6);
}

function htRomanAbacusRender() {
    const ctx = localRomanAbacusController.ctx;
    if (!ctx) return;
    const W = localRomanAbacusController.canvasWidth;
    const H = localRomanAbacusController.canvasHeight;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fef5e0';
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 8);
        ctx.lineTo(W, i * 8 + 3);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#c8b280';
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    htRomanAbacusDrawTrack();
    htRomanAbacusDrawLabels();
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        htRomanAbacusDrawColumn(c);
    }
    htRomanAbacusDrawFrame();
}

function htRomanAbacusGetHitRegion(mouseX, mouseY) {
    let colIdx = -1;
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        const centerX = localRomanAbacusController.startX + c * localRomanAbacusController.colWidth;
        if (Math.abs(mouseX - centerX) < localRomanAbacusController.colWidth * 0.45) {
            colIdx = c;
            break;
        }
    }
    if (colIdx === -1) return null;

    const col = localRomanAbacusController.state[colIdx];
    const centerX = localRomanAbacusController.startX + colIdx * localRomanAbacusController.colWidth;
    const radius = localRomanAbacusController.ballRadius;

    for (let u = 0; u < 1; u++) {
        const pos = localRomanAbacusController.upperPositions[u];
        if (!pos) continue;
        const beadY = (u < col.upper) ? pos.activeY : pos.inactiveY;
        if (Math.abs(mouseY - beadY) < radius + 8 && Math.hypot(mouseX - centerX, mouseY - beadY) < radius + 6) {
            if (mouseY < localRomanAbacusController.decimalTrackTop - 2) {
                return { type: 'upper', col: colIdx, beadIdx: u };
            }
        }
    }

    for (let b = 0; b < 4; b++) {
        const pos = localRomanAbacusController.lowerPositions[b];
        if (!pos) continue;
        const beadY = (b < col.lower) ? pos.activeY : pos.inactiveY;
        if (Math.abs(mouseY - beadY) < radius + 8 && Math.hypot(mouseX - centerX, mouseY - beadY) < radius + 6) {
            if (mouseY > localRomanAbacusController.decimalTrackBottom + 2) {
                return { type: 'lower', col: colIdx, beadIdx: b };
            }
        }
    }
    return null;
}

function htRomanAbacusToggleUpper(col, beadIdx) {
    const colState = localRomanAbacusController.state[col];
    const currentUpper = colState.upper;
    if (beadIdx < currentUpper) {
        colState.upper = beadIdx;
    } else {
        colState.upper = beadIdx + 1;
    }
    if (colState.upper > 1) colState.upper = 1;
    if (colState.upper < 0) colState.upper = 0;
    htRomanAbacusRender();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusHandleLowerClick(col, beadIdx) {
    const colState = localRomanAbacusController.state[col];
    const currentLower = colState.lower;
    const isActive = (beadIdx < currentLower);
    if (isActive) {
        let newLower = beadIdx;
        if (newLower < 0) newLower = 0;
        colState.lower = newLower;
    } else {
        let newLower = beadIdx + 1;
        if (newLower > 4) newLower = 4;
        colState.lower = newLower;
    }
    htRomanAbacusRender();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusHideSuccess() {
    const sv = document.getElementById('romanAbacusSuccess');
    if (sv) {
        sv.style.display = 'none';
        sv.style.visibility = 'hidden';
    }
}

function htRomanAbacusFillGame() {
    const cmp = document.getElementById('romanAbacusCMP');
    if (!cmp) return;

    htRomanAbacusHideSuccess();

    cmp.innerText = String(atwRandom(1, 10));
}

function htRomanAbacusUpdateDisplay() {
    const val = htRomanAbacusComputeValue();

    const vEl = document.getElementById('romanAbacusValue');
    if (vEl) vEl.innerText = val.toString();

    const rEl = document.getElementById('romanAbacusRoman');
    if (rEl) rEl.innerHTML = htRomanAbacusRomanHTML(val);

    const cmp = document.getElementById('romanAbacusCMP');
    const sv = document.getElementById('romanAbacusSuccess');
    if (cmp && sv) {
        if (cmp.innerText.trim() === val.toString()) {
            sv.style.display = 'inline-block';
            sv.style.visibility = 'visible';
        } else {
            htRomanAbacusHideSuccess();
        }
    }
}

function htRomanAbacusReset() {
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        localRomanAbacusController.state[c].upper = 0;
        localRomanAbacusController.state[c].lower = 0;
    }
    const fb = document.getElementById('romanAbacusFeedback');
    if (fb) fb.innerHTML = '';
    htRomanAbacusFillGame();
    htRomanAbacusRender();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusHandleCanvasStart(e) {
    const cvs = localRomanAbacusController.canvas;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    const hit = htRomanAbacusGetHitRegion(canvasX, canvasY);
    if (!hit) return;
    if (hit.type === 'upper') htRomanAbacusToggleUpper(hit.col, hit.beadIdx);
    else if (hit.type === 'lower') htRomanAbacusHandleLowerClick(hit.col, hit.beadIdx);
}

function htRomanAbacusHandleKeydown(e) {
    const headings = localRomanAbacusController.HEADINGS;
    if (!localRomanAbacusController.focusedCol && localRomanAbacusController.focusedCol !== 0) {
        localRomanAbacusController.focusedCol = 0;
    }
    let col = localRomanAbacusController.focusedCol;
    if (e.key === 'ArrowLeft') {
        localRomanAbacusController.focusedCol = Math.max(0, col - 1);
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        localRomanAbacusController.focusedCol = Math.min(headings.length - 1, col + 1);
        e.preventDefault();
    } else if (e.key === 'ArrowUp' || e.key === '5') {
        htRomanAbacusToggleUpper(col, 0);
        e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === '1') {
        const colState = localRomanAbacusController.state[col];
        const nextLower = colState.lower < 4 ? colState.lower : 3;
        htRomanAbacusHandleLowerClick(col, nextLower);
        e.preventDefault();
    } else if (e.key === '0') {
        localRomanAbacusController.state[col].upper = 0;
        localRomanAbacusController.state[col].lower = 0;
        htRomanAbacusRender();
        htRomanAbacusUpdateDisplay();
        e.preventDefault();
    }
}

function htRomanAbacusAttachEvents() {
    const cvs = localRomanAbacusController.canvas;
    if (!cvs) return;
    cvs.addEventListener('mousedown', htRomanAbacusHandleCanvasStart);
    cvs.addEventListener('touchstart', htRomanAbacusHandleCanvasStart, { passive: false });
    cvs.addEventListener('keydown', htRomanAbacusHandleKeydown);

    const rb = document.getElementById('romanAbacusResetBtn');
    if (rb) rb.addEventListener('click', htRomanAbacusReset);

    window.addEventListener('resize', function () {
        htRomanAbacusComputeLayout();
        htRomanAbacusRender();
    });
}

function htRomanAbacusInit() {
    localRomanAbacusController.canvas = document.getElementById('romanAbacusCanvas');
    if (!localRomanAbacusController.canvas) return;
    localRomanAbacusController.ctx = localRomanAbacusController.canvas.getContext('2d');
    if (!localRomanAbacusController.ctx) return;

    htRomanAbacusInitState();
    htRomanAbacusComputeLayout();
    htRomanAbacusAttachEvents();
    htRomanAbacusRender();
    htRomanAbacusFillGame();
    htRomanAbacusUpdateDisplay();
}

function atwInitRoman(container, words) {
    var successEl = document.getElementById("romanAbacusSuccess");
    if (successEl) {
        successEl.style.whiteSpace = "normal";
        successEl.innerHTML = atwCongrats(words.congrats, atwControlLabel(document.getElementById("romanAbacusResetBtn")));
    }
    htRomanAbacusInit();
}

//
// Abacus (Suanpan / Soroban / Schyoty) -- same design/code as ht_abacus.js.
// ht_abacus.js renders a single abacus through the global localSorobanController,
// so each section keeps its own controller and swaps it in while rendering.
//

function atwInitAbacus(container, words) {
    var mode = $(container).attr("data-atw") || "suanpan";
    var canvas = container.querySelector("canvas");
    if (!canvas) {
        return;
    }
    var ctx = canvas.getContext("2d");
    if (!ctx) {
        return;
    }
    var columns = parseInt($(container).attr("data-columns") || "9", 10);
    var decimalCol = parseInt($(container).attr("data-decimal") || String(columns - 1), 10);
    var valueEl = container.querySelector(".atw-abacus-value");
    var targetEl = container.querySelector(".atw-abacus-target");
    var correctEl = container.querySelector(".atw-abacus-correct");
    if (correctEl) {
        correctEl.innerHTML = atwCongrats(words.congrats, atwControlLabel(container.querySelector(".atw-abacus-reset")));
    }

    var ctrl = null;
    var state = { target: 0 };

    function buildController() {
        if (mode === "schyoty") {
            ctrl = {
                abacusMode: "schyoty",
                canvas: canvas,
                ctx: ctx,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                schyotyWireL: 14
            };
        } else {
            ctrl = {
                abacusMode: mode,
                COLUMNS: columns,
                state: [],
                decimalMarkerCol: decimalCol,
                canvas: canvas,
                ctx: ctx,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height,
                margin: { top: 48, bottom: 48 },
                verticalStep: 22
            };
        }
    }

    function withCtrl(fn) {
        var saved = window.localSorobanController;
        window.localSorobanController = ctrl;
        try {
            return fn();
        } finally {
            window.localSorobanController = saved;
        }
    }

    function reset() {
        buildController();
        withCtrl(function () {
            if (mode === "schyoty") {
                htSchyotyInitState();
                htSchyotyComputeLayout();
                htSchyotyRender();
            } else {
                htSorobanInitState();
                htSorobanComputeLayout();
                htSorobanRender();
            }
        });
    }

    function currentValue() {
        return withCtrl(function () {
            if (mode === "schyoty") {
                return htSchyotyGetNumericValue();
            }
            var digits = [];
            for (var i = 0; i < ctrl.COLUMNS; i++) {
                var v = ctrl.state[i].upper * 5 + ctrl.state[i].lower;
                if (v > 9) v = 9;
                digits.push(v);
            }
            var val = 0;
            for (var j = 0; j <= ctrl.decimalMarkerCol; j++) {
                val = val * 10 + digits[j];
            }
            return val;
        });
    }

    function update() {
        var val = currentValue();
        if (valueEl) {
            valueEl.textContent = String(val);
        }
        if (correctEl) {
            correctEl.style.display = (String(val) === String(state.target)) ? "block" : "none";
        }
    }

    function newRound() {
        state.target = atwRandom(1, 10);
        if (targetEl) {
            targetEl.textContent = String(state.target);
        }
        reset();
        update();
    }

    function handlePointer(e) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        var clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        var x = (clientX - rect.left) * scaleX;
        var y = (clientY - rect.top) * scaleY;

        withCtrl(function () {
            if (mode === "schyoty") {
                var hit = htSchyotyGetHitRegion(x, y);
                if (!hit) {
                    return;
                }
                var current = ctrl.schyotyState[hit.row];
                if (hit.isActive) {
                    ctrl.schyotyState[hit.row] = hit.position;
                } else {
                    var inactiveCount = 10 - current;
                    ctrl.schyotyState[hit.row] = current + (inactiveCount - hit.position);
                }
                htSchyotyRender();
            } else {
                var bead = htSorobanGetHitRegion(x, y);
                if (!bead) {
                    return;
                }
                var col = ctrl.state[bead.col];
                if (bead.type === "upper") {
                    col.upper = (bead.beadIdx < col.upper) ? bead.beadIdx : bead.beadIdx + 1;
                    if (col.upper > col.upperMax) col.upper = col.upperMax;
                } else if (bead.type === "lower") {
                    col.lower = (bead.beadIdx < col.lower) ? bead.beadIdx : bead.beadIdx + 1;
                    if (col.lower > col.lowerMax) col.lower = col.lowerMax;
                }
                htSorobanRender();
            }
        });
        update();
    }

    canvas.addEventListener("mousedown", handlePointer);
    canvas.addEventListener("touchstart", function (e) {
        e.preventDefault();
        handlePointer(e);
    }, { passive: false });

    $(container).find(".atw-abacus-reset").on("click", newRound);
    $(container).find("[data-atw-mode]").on("click", function () {
        var selected = $(this).attr("data-atw-mode");
        if (selected === mode) {
            return;
        }
        mode = selected;
        $(container).find("[data-atw-mode]").removeClass("active");
        $(this).addClass("active");
        newRound();
    });

    newRound();
}

//
// Yupana -- same design as ht_yupana.js (arrows + hands + tawapukllay table)
//

function atwInitYupana(container, words) {
    var value = 0;
    var target = 1;
    var targetEl = container.querySelector(".atw-yupana-target");
    var correctEl = container.querySelector(".atw-yupana-correct");
    if (correctEl) {
        correctEl.innerHTML = words.congratsNoAction;
    }

    if ($("#leftHandImg").length) {
        htSetImageSrc("leftHandImg", "images/HistoryTracers/0Left_Hand_Small.png");
    }
    if ($("#rightHandImg").length) {
        htSetImageSrc("rightHandImg", "images/HistoryTracers/0Right_Hand_Small.png");
    }

    function render() {
        htSetImageForMembers("#leftHandImg", "Left_Hand_Small.png",
            "#rightHandImg", "Right_Hand_Small.png", value);
        htCleanYupanaDecimalValues("#yupana0", 2);
        if (value > 0) {
            htFillYupanaDecimalValues("#yupana0", value, 2, "red_dot_right_up");
        }
        if (correctEl) {
            correctEl.style.display = (value === target) ? "block" : "none";
        }
    }

    function newRound() {
        target = atwRandom(1, 10);
        value = 0;
        if (targetEl) {
            targetEl.textContent = String(target);
        }
        render();
    }

    $("#traineeUp0").off("click").on("click", function () {
        if (value < 10) {
            value++;
            render();
        }
    });
    $("#traineeDown0").off("click").on("click", function () {
        if (value > 0) {
            value--;
            render();
        }
    });

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
        if (tool === "quipu" || tool === "meso") {
            atwCreateStepper(this, tool, words);
        } else if (tool === "sequence") {
            atwCreateSequence(this, words);
        } else if (tool === "bones") {
            atwInitBone(this);
        } else if (tool === "yupana") {
            atwInitYupana(this, words);
        } else if (tool === "calculi") {
            atwInitRoman(this, words);
        } else if (tool === "suanpan" || tool === "soroban" || tool === "schyoty") {
            atwInitAbacus(this, words);
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
    htSetImageSrc("imgBone", "images/GonzalesRedondo/Figura-9-Hueso-de-Lebombo.png");
}

function htLoadContent() {
    atwSetImages();
    atwInitGames();
    htWriteNavigation();

    return false;
}
