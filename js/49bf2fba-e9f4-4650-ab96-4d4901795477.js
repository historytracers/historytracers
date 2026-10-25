// SPDX-License-Identifier: GPL-3.0-or-later

// Around the World (Addition)
// Practice addition with the first counting tools created by humanity.
// Each game asks the player to add two random numbers between 1 and 9. The
// result is always 10 or more, so every round practices the carry (advancing
// an order). The tools reuse the design of "Around the World (Counting)"
// (6c071696), ht_abacus.js, ht_yupana.js and the Roman abacus page (1aacf33a).

function awaWord(id, fallback) {
    var el = document.getElementById(id);
    if (el && el.textContent && el.textContent.trim().length > 0) {
        return el.textContent;
    }
    return fallback;
}

// Like awaWord, but keeps the HTML markup (e.g. <br>) of a hidden template.
function awaWordHTML(id, fallback) {
    var el = document.getElementById(id);
    if (el && el.innerHTML && el.innerHTML.trim().length > 0) {
        return el.innerHTML;
    }
    return fallback;
}

// Fills the {button} placeholder of a congratulations template with the
// localized label of the control the player uses to start another round.
function awaCongrats(template, buttonLabel) {
    if (!template) {
        return "";
    }
    if (!buttonLabel) {
        return template;
    }
    return template.split("{button}").join(buttonLabel);
}

// Reads a button label, dropping a leading decorative glyph (e.g. "⟳ Reset").
function awaControlLabel(el) {
    if (!el) {
        return "";
    }
    var parts = (el.textContent || "").trim().split(/\s+/);
    if (parts.length > 1 && !/[0-9A-Za-zÀ-ÿ]/.test(parts[0])) {
        parts.shift();
    }
    return parts.join(" ");
}

function awaRandom(min, max) {
    return htGetRandomArbitrary(min, max + 1);
}

// Two addends between 1 and 9 whose result is always 10 or more.
function awaAddition() {
    var a;
    var b;
    do {
        a = awaRandom(1, 9);
        b = awaRandom(1, 9);
    } while (a + b < 10);
    return { a: a, b: b, sum: a + b };
}

function awaProblemText(problem) {
    return problem.a + " + " + problem.b;
}

function awaWords() {
    return {
        represent: awaWord("atwaWordRepresent", "Add and represent the result:"),
        missing: awaWord("atwaWordMissing", "Add and choose the correct result:"),
        value: awaWord("atwaWordValue", "Value"),
        newRound: awaWord("atwaWordNewRound", "New practice"),
        add: awaWord("atwaWordAdd", "Add one"),
        remove: awaWord("atwaWordRemove", "Remove one"),
        correct: awaWord("atwaWordCorrect", "\u2713 Correct!"),
        congrats: awaWordHTML("atwaWordCongrats", "🎉🎉🎉 CONGRATULATIONS! 🎉🎉🎉<br>You represented the sum correctly!<br>Click '{button}' to practice more!"),
        congratsChoice: awaWordHTML("atwaWordCongratsChoice", "🎉🎉🎉 CONGRATULATIONS! 🎉🎉🎉<br>You found the correct sum!<br>Click '{button}' to practice more!")
    };
}

function awaElement(tag, cls) {
    var el = document.createElement(tag);
    if (cls) {
        el.className = cls;
    }
    return el;
}

function awaButton(label, cls) {
    var b = awaElement("button", cls || "reset-tutor-btn");
    b.type = "button";
    b.textContent = label;
    return b;
}

//
// Quipu / Meso canvas helpers
//

function awaCanvas(width, height) {
    var c = document.createElement("canvas");
    c.className = "atw-canvas";
    c.width = width;
    c.height = height;
    return c;
}

function awaDrawQuipu(ctx, W, H, value) {
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

function awaDrawMeso(ctx, W, H, value) {
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

function awaCreateStepper(container, tool, words) {
    var draw = {
        quipu: awaDrawQuipu,
        meso: awaDrawMeso
    }[tool];

    var wrap = awaElement("div", "atw-game-inner");
    container.appendChild(wrap);

    var instruction = awaElement("p", "atw-instruction");
    wrap.appendChild(instruction);
    var targetSpan = awaElement("span", "atw-target");
    instruction.appendChild(document.createTextNode(words.represent + " "));
    instruction.appendChild(targetSpan);

    var canvas = awaCanvas(360, 200);
    wrap.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var controls = awaElement("p", "atw-controls");
    wrap.appendChild(controls);
    var decBtn = awaButton("\u2212", "atw-step");
    decBtn.setAttribute("aria-label", words.remove);
    var valueSpan = awaElement("span", "atw-value");
    var incBtn = awaButton("+", "atw-step");
    incBtn.setAttribute("aria-label", words.add);
    controls.appendChild(decBtn);
    controls.appendChild(valueSpan);
    controls.appendChild(incBtn);

    var correct = awaElement("p", "atw-correct");
    correct.style.display = "none";
    correct.innerHTML = awaCongrats(words.congrats, words.newRound);
    wrap.appendChild(correct);

    var buttons = awaElement("p", "atw-buttons");
    var newBtn = awaButton(words.newRound || "New practice");
    buttons.appendChild(newBtn);
    wrap.appendChild(buttons);

    var state = { problem: null, target: 10, value: 0 };

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(ctx, canvas.width, canvas.height, state.value);
        targetSpan.textContent = awaProblemText(state.problem);
        valueSpan.textContent = (words.value || "Value") + ": " + state.value;
        var reached = state.value === state.target;
        decBtn.disabled = reached || state.value <= 0;
        incBtn.disabled = reached || state.value >= state.target;
        correct.style.display = reached ? "block" : "none";
    }

    function newRound() {
        state.problem = awaAddition();
        state.target = state.problem.sum;
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
// Addition with choices (Hindu-Arabic numerals)
//

function awaCreateChoice(container, words) {
    var wrap = awaElement("div", "atw-game-inner");
    container.appendChild(wrap);

    var instruction = awaElement("p", "atw-instruction");
    instruction.textContent = words.missing;
    wrap.appendChild(instruction);

    var equation = awaElement("p", "atw-sequence");
    wrap.appendChild(equation);

    var choices = awaElement("div", "atw-choices");
    wrap.appendChild(choices);

    var correct = awaElement("p", "atw-correct");
    correct.style.display = "none";
    correct.innerHTML = awaCongrats(words.congratsChoice, words.newRound);
    wrap.appendChild(correct);

    var buttons = awaElement("p", "atw-buttons");
    var newBtn = awaButton(words.newRound);
    buttons.appendChild(newBtn);
    wrap.appendChild(buttons);

    var state = { problem: null, selected: null, won: false };

    function buildChoices() {
        var answer = state.problem.sum;
        var offsets = [0, -1, 1, -2, 2];
        var options = [];
        for (var o = 0; o < offsets.length; o++) {
            var candidate = answer + offsets[o];
            if (candidate >= 0 && candidate <= 20 && options.indexOf(candidate) === -1) {
                options.push(candidate);
            }
        }
        for (var s = options.length - 1; s > 0; s--) {
            var j = awaRandom(0, s);
            var tmp = options[s];
            options[s] = options[j];
            options[j] = tmp;
        }
        choices.innerHTML = "";
        for (var k = 0; k < options.length; k++) {
            (function (num) {
                var b = awaButton(String(num), "atw-choice");
                b.addEventListener("click", function () {
                    if (state.won) {
                        return;
                    }
                    state.selected = num;
                    render();
                });
                choices.appendChild(b);
            })(options[k]);
        }
    }

    function render() {
        equation.textContent = awaProblemText(state.problem) + " = ?";
        var buttonsList = choices.getElementsByTagName("button");
        for (var b = 0; b < buttonsList.length; b++) {
            var val = parseInt(buttonsList[b].textContent, 10);
            if (state.selected === val) {
                buttonsList[b].classList.add("atw-choice-selected");
            } else {
                buttonsList[b].classList.remove("atw-choice-selected");
            }
        }
        state.won = (state.selected === state.problem.sum);
        correct.style.display = state.won ? "block" : "none";
    }

    function newRound() {
        state.problem = awaAddition();
        state.selected = null;
        state.won = false;
        buildChoices();
        render();
    }

    newBtn.addEventListener("click", newRound);

    newRound();
}

//
// Bone game (addition with continuous marks)
//

var localBoneGame = {
    problem: null,
    target: 10,
    marks: 0,
    won: false
};

function awaBoneHandsOf(n) {
    // The hand pictures go from 0 to 5 raised fingers. Numbers above five
    // need a full hand (5) plus the remaining fingers on the other hand.
    if (n <= 5) {
        return [{ digit: n, side: "Left" }];
    }
    return [{ digit: 5, side: "Left" }, { digit: n - 5, side: "Right" }];
}

function awaBoneNewRound() {
    localBoneGame.problem = awaAddition();
    localBoneGame.target = localBoneGame.problem.sum;
    localBoneGame.marks = 0;
    localBoneGame.won = false;
    var eq = $("#atwaBoneEquation");
    if (eq.length) {
        eq.text(" " + awaProblemText(localBoneGame.problem) + " = ?");
    }
    awaBoneRenderHands();
    awaBoneRender();
}

function awaBoneRenderHands() {
    var hands = awaBoneHandsOf(localBoneGame.problem.a)
        .concat(awaBoneHandsOf(localBoneGame.problem.b));

    var prefix = htGetImgSrcPrefix();
    var altTpl = $("#atwaBoneHandAltTpl").text() || "Hand with {n} raised fingers";
    var html = "";
    for (var i = 0; i < hands.length; i++) {
        var alt = altTpl.split("{n}").join(hands[i].digit);
        html += "<img id=\"atwaBoneHandImg" + i + "\" class=\"htBoneHandImg\" alt=\"" + alt +
            "\" onclick=\"htImageZoom('atwaBoneHandImg" + i + "', '0%')\" src=\"" + prefix +
            "images/HistoryTracers/" + hands[i].digit + hands[i].side + "_Hand_Small.png\" />";
    }
    $("#htBoneHands").html(html);
}

function awaBoneRender() {
    var container = $("#htBoneMarks");
    container.empty();
    var total = localBoneGame.marks;
    for (var i = 0; i < total; i++) {
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

function awaBoneAddMark() {
    if (localBoneGame.won) {
        return false;
    }
    if (localBoneGame.marks < localBoneGame.target) {
        localBoneGame.marks++;
    }
    if (localBoneGame.marks === localBoneGame.target) {
        localBoneGame.won = true;
    }
    awaBoneRender();
    return false;
}

function awaBoneRemoveMark() {
    if (localBoneGame.won) {
        return false;
    }
    if (localBoneGame.marks > 0) {
        localBoneGame.marks--;
    }
    awaBoneRender();
    return false;
}

function awaInitBone() {
    $("#htBoneAdd").off("click").on("click", awaBoneAddMark);
    $("#htBoneRemove").off("click").on("click", awaBoneRemoveMark);
    $("#htBoneNewNumber").off("click").on("click", awaBoneNewRound);

    awaBoneNewRound();
}

//
// Roman abacus (calculi) -- same design as "Roman abacus" (1aacf33a)
//

var localRomanAbacusController = {};

localRomanAbacusController.HEADINGS = ["(((I)))", "((I))", "(I)", "C", "X", "I"];
localRomanAbacusController.PLACES = [100000, 10000, 1000, 100, 10, 1];
localRomanAbacusController.LEVELS = 6;

function awaRomanAbacusInitState() {
    localRomanAbacusController.state = [];
    localRomanAbacusController.won = false;
    localRomanAbacusController.problem = null;
    localRomanAbacusController.target = 0;
    for (var c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        localRomanAbacusController.state.push({ upper: 0, lower: 0 });
    }
}

function awaRomanAbacusColumnValue(c) {
    var col = localRomanAbacusController.state[c];
    return (col.upper * 5 + col.lower) * localRomanAbacusController.PLACES[c];
}

function awaRomanAbacusComputeValue() {
    var value = 0;
    for (var c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        value += awaRomanAbacusColumnValue(c);
    }
    return value;
}

function awaRomanAbacusRomanOf(n) {
    if (n <= 0) return "";
    var table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
                 [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
                 [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    var roman = "";
    var rest = n;
    for (var i = 0; i < table.length; i++) {
        while (rest >= table[i][0]) {
            roman += table[i][1];
            rest -= table[i][0];
        }
    }
    return roman;
}

function awaRomanAbacusRomanHTML(value) {
    if (value <= 0) return "";
    var upper = Math.floor(value / 1000);
    var lower = value % 1000;
    var html = "";
    if (upper > 0) {
        html += '<span class="roman-abacus-overline">' + awaRomanAbacusRomanOf(upper) + '</span>';
    }
    if (lower > 0) {
        html += awaRomanAbacusRomanOf(lower);
    }
    return html;
}

function awaRomanAbacusComputeLayout() {
    var cvs = localRomanAbacusController.canvas;
    localRomanAbacusController.canvasWidth = cvs.width;
    localRomanAbacusController.canvasHeight = cvs.height;

    var horizontalMargin = 24;
    var totalColSpace = localRomanAbacusController.canvasWidth - (horizontalMargin * 2);
    localRomanAbacusController.colWidth = totalColSpace / localRomanAbacusController.HEADINGS.length;
    localRomanAbacusController.startX = horizontalMargin + localRomanAbacusController.colWidth / 2;

    localRomanAbacusController.decimalTrackY = localRomanAbacusController.canvasHeight * 0.5;
    localRomanAbacusController.decimalTrackTop = localRomanAbacusController.decimalTrackY - 30;
    localRomanAbacusController.decimalTrackBottom = localRomanAbacusController.decimalTrackY + 30;
    localRomanAbacusController.barY = localRomanAbacusController.decimalTrackY;

    var upperMax = 1;
    var lowerMax = 4;
    var verticalStep = 26;

    var upperBaseActive = localRomanAbacusController.decimalTrackTop - 8;
    var upperStartInactive = localRomanAbacusController.decimalTrackTop - 52;
    localRomanAbacusController.upperPositions = [];
    for (var i = 0; i < upperMax; i++) {
        var activeY = upperBaseActive - (i * verticalStep);
        var inactiveY = upperStartInactive - (i * verticalStep * 0.8);
        if (inactiveY < 20) inactiveY = 20 + i * 5;
        localRomanAbacusController.upperPositions.push({ activeY: activeY, inactiveY: inactiveY });
    }

    var lowerBaseActive = localRomanAbacusController.decimalTrackBottom + 8;
    var lowerInactiveDrop = 30;
    localRomanAbacusController.lowerPositions = [];
    for (var j = 0; j < lowerMax; j++) {
        var lowerActiveY = lowerBaseActive + (j * verticalStep);
        var lowerInactiveY = lowerActiveY + lowerInactiveDrop;
        localRomanAbacusController.lowerPositions.push({ activeY: lowerActiveY, inactiveY: lowerInactiveY });
    }

    var maxRadiusByWidth = localRomanAbacusController.colWidth * 0.38;
    var maxRadiusByVertical = verticalStep * 0.45;
    localRomanAbacusController.ballRadius = Math.min(maxRadiusByWidth, maxRadiusByVertical, 13);
    localRomanAbacusController.ballRadius = Math.max(localRomanAbacusController.ballRadius, 9);
}

function awaRomanAbacusDrawTrack() {
    var ctx = localRomanAbacusController.ctx;
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

function awaRomanAbacusDrawColumn(idx) {
    var ctx = localRomanAbacusController.ctx;
    var x = localRomanAbacusController.startX + idx * localRomanAbacusController.colWidth;
    var col = localRomanAbacusController.state[idx];
    var lowerCount = col.lower;
    var upperCount = col.upper;

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

    for (var u = 0; u < 1; u++) {
        var isActive = (u < upperCount);
        var pos = localRomanAbacusController.upperPositions[u];
        if (!pos) continue;
        var beadY = isActive ? pos.activeY : pos.inactiveY;
        var gradUp = ctx.createRadialGradient(x - 4, beadY - 3, 3, x, beadY, localRomanAbacusController.ballRadius);
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

    for (var b = 0; b < 4; b++) {
        var lowerIsActive = (b < lowerCount);
        var lowerPos = localRomanAbacusController.lowerPositions[b];
        if (!lowerPos) continue;
        var lowerBeadY = lowerIsActive ? lowerPos.activeY : lowerPos.inactiveY;
        var gradLow = ctx.createLinearGradient(x - 5, lowerBeadY - 4, x + 5, lowerBeadY + 4);
        gradLow.addColorStop(0, '#7da0ae');
        gradLow.addColorStop(1, '#3a6068');
        ctx.beginPath();
        ctx.arc(x, lowerBeadY, localRomanAbacusController.ballRadius - 0.5, 0, Math.PI * 2);
        ctx.fillStyle = gradLow;
        ctx.fill();
        ctx.strokeStyle = '#1a3a3a';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 2.5, lowerBeadY - 2.5, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#c8e2ec';
        ctx.fill();
    }
}

function awaRomanAbacusDrawLabels() {
    var ctx = localRomanAbacusController.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        var x = localRomanAbacusController.startX + c * localRomanAbacusController.colWidth;
        ctx.font = 'bold 16px Georgia, "Times New Roman", serif';
        ctx.fillStyle = '#40280f';
        ctx.fillText(localRomanAbacusController.HEADINGS[c], x, 36);
        ctx.font = '10px Verdana, sans-serif';
        ctx.fillStyle = '#7a4a24';
        ctx.fillText(localRomanAbacusController.PLACES[c].toString(), x, 56);
    }
}

function awaRomanAbacusDrawFrame() {
    var ctx = localRomanAbacusController.ctx;
    ctx.strokeStyle = '#f9eec7';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(5, 5, localRomanAbacusController.canvasWidth - 10, localRomanAbacusController.canvasHeight - 10);
    ctx.strokeStyle = '#b48b5a';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(3, 3, localRomanAbacusController.canvasWidth - 6, localRomanAbacusController.canvasHeight - 6);
}

function awaRomanAbacusRender() {
    var ctx = localRomanAbacusController.ctx;
    if (!ctx) return;
    var W = localRomanAbacusController.canvasWidth;
    var H = localRomanAbacusController.canvasHeight;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fef5e0';
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.2;
    for (var i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 8);
        ctx.lineTo(W, i * 8 + 3);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#c8b280';
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    awaRomanAbacusDrawTrack();
    awaRomanAbacusDrawLabels();
    for (var c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        awaRomanAbacusDrawColumn(c);
    }
    awaRomanAbacusDrawFrame();
}

function awaRomanAbacusGetHitRegion(mouseX, mouseY) {
    var colIdx = -1;
    for (var c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        var centerX = localRomanAbacusController.startX + c * localRomanAbacusController.colWidth;
        if (Math.abs(mouseX - centerX) < localRomanAbacusController.colWidth * 0.45) {
            colIdx = c;
            break;
        }
    }
    if (colIdx === -1) return null;

    var col = localRomanAbacusController.state[colIdx];
    var center = localRomanAbacusController.startX + colIdx * localRomanAbacusController.colWidth;
    var radius = localRomanAbacusController.ballRadius;

    for (var u = 0; u < 1; u++) {
        var pos = localRomanAbacusController.upperPositions[u];
        if (!pos) continue;
        var beadY = (u < col.upper) ? pos.activeY : pos.inactiveY;
        if (Math.abs(mouseY - beadY) < radius + 8 && Math.hypot(mouseX - center, mouseY - beadY) < radius + 6) {
            if (mouseY < localRomanAbacusController.decimalTrackTop - 2) {
                return { type: 'upper', col: colIdx, beadIdx: u };
            }
        }
    }

    for (var b = 0; b < 4; b++) {
        var lowerPos = localRomanAbacusController.lowerPositions[b];
        if (!lowerPos) continue;
        var lowerBeadY = (b < col.lower) ? lowerPos.activeY : lowerPos.inactiveY;
        if (Math.abs(mouseY - lowerBeadY) < radius + 8 && Math.hypot(mouseX - center, mouseY - lowerBeadY) < radius + 6) {
            if (mouseY > localRomanAbacusController.decimalTrackBottom + 2) {
                return { type: 'lower', col: colIdx, beadIdx: b };
            }
        }
    }
    return null;
}

function awaRomanAbacusToggleUpper(col, beadIdx) {
    if (localRomanAbacusController.won) return;
    var colState = localRomanAbacusController.state[col];
    var currentUpper = colState.upper;
    if (beadIdx < currentUpper) {
        colState.upper = beadIdx;
    } else {
        colState.upper = beadIdx + 1;
    }
    if (colState.upper > 1) colState.upper = 1;
    if (colState.upper < 0) colState.upper = 0;
    awaRomanAbacusRender();
    awaRomanAbacusUpdateDisplay();
}

function awaRomanAbacusHandleLowerClick(col, beadIdx) {
    if (localRomanAbacusController.won) return;
    var colState = localRomanAbacusController.state[col];
    var currentLower = colState.lower;
    var isActive = (beadIdx < currentLower);
    if (isActive) {
        var newLower = beadIdx;
        if (newLower < 0) newLower = 0;
        colState.lower = newLower;
    } else {
        var nextLower = beadIdx + 1;
        if (nextLower > 4) nextLower = 4;
        colState.lower = nextLower;
    }
    awaRomanAbacusRender();
    awaRomanAbacusUpdateDisplay();
}

function awaRomanAbacusHideSuccess() {
    var sv = document.getElementById('romanAbacusSuccess');
    if (sv) {
        sv.style.display = 'none';
        sv.style.visibility = 'hidden';
    }
}

function awaRomanAbacusFillGame() {
    var cmp = document.getElementById('romanAbacusCMP');
    if (!cmp) return;

    awaRomanAbacusHideSuccess();

    var problem = awaAddition();
    localRomanAbacusController.problem = problem;
    localRomanAbacusController.target = problem.sum;
    cmp.innerText = awaProblemText(problem);
}

function awaRomanAbacusUpdateDisplay() {
    var val = awaRomanAbacusComputeValue();

    var vEl = document.getElementById('romanAbacusValue');
    if (vEl) vEl.innerText = val.toString();

    var rEl = document.getElementById('romanAbacusRoman');
    if (rEl) rEl.innerHTML = awaRomanAbacusRomanHTML(val);

    var sv = document.getElementById('romanAbacusSuccess');
    if (sv) {
        if (val === localRomanAbacusController.target) {
            localRomanAbacusController.won = true;
            sv.style.display = 'inline-block';
            sv.style.visibility = 'visible';
        } else {
            localRomanAbacusController.won = false;
            awaRomanAbacusHideSuccess();
        }
    } else {
        localRomanAbacusController.won = false;
    }
}

function awaRomanAbacusReset() {
    for (var c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        localRomanAbacusController.state[c].upper = 0;
        localRomanAbacusController.state[c].lower = 0;
    }
    var fb = document.getElementById('romanAbacusFeedback');
    if (fb) fb.innerHTML = '';
    awaRomanAbacusFillGame();
    awaRomanAbacusRender();
    awaRomanAbacusUpdateDisplay();
}

function awaRomanAbacusHandleCanvasStart(e) {
    if (localRomanAbacusController.won) {
        if (e.preventDefault) e.preventDefault();
        return;
    }
    var cvs = localRomanAbacusController.canvas;
    if (!cvs) return;
    var rect = cvs.getBoundingClientRect();
    var scaleX = cvs.width / rect.width;
    var scaleY = cvs.height / rect.height;
    var clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    var canvasX = (clientX - rect.left) * scaleX;
    var canvasY = (clientY - rect.top) * scaleY;
    var hit = awaRomanAbacusGetHitRegion(canvasX, canvasY);
    if (!hit) return;
    if (hit.type === 'upper') awaRomanAbacusToggleUpper(hit.col, hit.beadIdx);
    else if (hit.type === 'lower') awaRomanAbacusHandleLowerClick(hit.col, hit.beadIdx);
}

function awaRomanAbacusHandleKeydown(e) {
    var headings = localRomanAbacusController.HEADINGS;
    if (!localRomanAbacusController.focusedCol && localRomanAbacusController.focusedCol !== 0) {
        localRomanAbacusController.focusedCol = 0;
    }
    var col = localRomanAbacusController.focusedCol;
    if (e.key === 'ArrowLeft') {
        localRomanAbacusController.focusedCol = Math.max(0, col - 1);
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        localRomanAbacusController.focusedCol = Math.min(headings.length - 1, col + 1);
        e.preventDefault();
    } else if (localRomanAbacusController.won) {
        e.preventDefault();
        return;
    } else if (e.key === 'ArrowUp' || e.key === '5') {
        awaRomanAbacusToggleUpper(col, 0);
        e.preventDefault();
    } else if (e.key === 'ArrowDown' || e.key === '1') {
        var colState = localRomanAbacusController.state[col];
        var nextLower = colState.lower < 4 ? colState.lower : 3;
        awaRomanAbacusHandleLowerClick(col, nextLower);
        e.preventDefault();
    } else if (e.key === '0') {
        localRomanAbacusController.state[col].upper = 0;
        localRomanAbacusController.state[col].lower = 0;
        awaRomanAbacusRender();
        awaRomanAbacusUpdateDisplay();
        e.preventDefault();
    }
}

function awaRomanAbacusAttachEvents() {
    var cvs = localRomanAbacusController.canvas;
    if (!cvs) return;
    cvs.addEventListener('mousedown', awaRomanAbacusHandleCanvasStart);
    cvs.addEventListener('touchstart', awaRomanAbacusHandleCanvasStart, { passive: false });
    cvs.addEventListener('keydown', awaRomanAbacusHandleKeydown);

    var rb = document.getElementById('romanAbacusResetBtn');
    if (rb) rb.addEventListener('click', awaRomanAbacusReset);

    window.addEventListener('resize', function () {
        awaRomanAbacusComputeLayout();
        awaRomanAbacusRender();
    });
}

function awaRomanAbacusInit() {
    localRomanAbacusController.canvas = document.getElementById('romanAbacusCanvas');
    if (!localRomanAbacusController.canvas) return;
    localRomanAbacusController.ctx = localRomanAbacusController.canvas.getContext('2d');
    if (!localRomanAbacusController.ctx) return;

    awaRomanAbacusInitState();
    awaRomanAbacusComputeLayout();
    awaRomanAbacusAttachEvents();
    awaRomanAbacusRender();
    awaRomanAbacusFillGame();
    awaRomanAbacusUpdateDisplay();
}

function awaInitRoman(container, words) {
    var successEl = document.getElementById("romanAbacusSuccess");
    if (successEl) {
        successEl.style.whiteSpace = "normal";
        successEl.innerHTML = awaCongrats(words.congrats, awaControlLabel(document.getElementById("romanAbacusResetBtn")));
    }
    awaRomanAbacusInit();
}

//
// Abacus (Suanpan / Soroban / Schyoty) -- same design/code as ht_abacus.js.
// ht_abacus.js renders a single abacus through the global localSorobanController,
// so each section keeps its own controller and swaps it in while rendering.
//

function awaInitAbacus(container, words) {
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
        correctEl.innerHTML = awaCongrats(words.congrats, awaControlLabel(container.querySelector(".atw-abacus-reset")));
    }

    var ctrl = null;
    var state = { problem: null, target: 10, won: false };

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
        state.won = (val === state.target);
        if (valueEl) {
            valueEl.textContent = String(val);
        }
        if (correctEl) {
            correctEl.style.display = state.won ? "block" : "none";
        }
    }

    function newRound() {
        state.problem = awaAddition();
        state.target = state.problem.sum;
        state.won = false;
        if (targetEl) {
            targetEl.textContent = awaProblemText(state.problem);
        }
        reset();
        update();
    }

    function handlePointer(e) {
        if (state.won) {
            if (e.preventDefault) e.preventDefault();
            return;
        }
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

function awaSetYupanaHands(value) {
    if (value <= 10) {
        htSetImageForMembers("#leftHandImg", "Left_Hand_Small.png",
            "#rightHandImg", "Right_Hand_Small.png", value);
        return;
    }
    // The two hand pictures only show up to ten fingers. For sums above ten,
    // both hands are full and the yupana table records the whole result.
    var prefix = htGetImgSrcPrefix();
    $("#leftHandImg").attr("src", prefix + "images/HistoryTracers/5Left_Hand_Small.png").attr("alt", "Hand 5");
    $("#rightHandImg").attr("src", prefix + "images/HistoryTracers/5Right_Hand_Small.png").attr("alt", "Hand 5");
}

function awaInitYupana(container, words) {
    var value = 0;
    var target = 10;
    var won = false;
    var targetEl = container.querySelector(".atw-yupana-target");
    var correctEl = container.querySelector(".atw-yupana-correct");
    if (correctEl) {
        correctEl.innerHTML = awaCongrats(words.congrats, words.newRound);
    }

    var buttons = awaElement("p", "atw-buttons");
    var newBtn = awaButton(words.newRound || "New practice");
    buttons.appendChild(newBtn);
    container.appendChild(buttons);

    if ($("#leftHandImg").length) {
        htSetImageSrc("leftHandImg", "images/HistoryTracers/0Left_Hand_Small.png");
    }
    if ($("#rightHandImg").length) {
        htSetImageSrc("rightHandImg", "images/HistoryTracers/0Right_Hand_Small.png");
    }

    function render() {
        awaSetYupanaHands(value);
        htCleanYupanaDecimalValues("#yupana0", 2);
        if (value > 0) {
            htFillYupanaDecimalValues("#yupana0", value, 2, "red_dot_right_up");
        }
        if (correctEl) {
            won = (value === target);
            correctEl.style.display = won ? "block" : "none";
        }
    }

    function newRound() {
        var problem = awaAddition();
        target = problem.sum;
        value = 0;
        won = false;
        if (targetEl) {
            targetEl.textContent = awaProblemText(problem);
        }
        render();
    }

    $("#traineeUp0").off("click").on("click", function () {
        if (won) {
            return;
        }
        if (value < target) {
            value++;
            render();
        }
    });
    $("#traineeDown0").off("click").on("click", function () {
        if (won) {
            return;
        }
        if (value > 0) {
            value--;
            render();
        }
    });

    newBtn.addEventListener("click", newRound);

    newRound();
}

//
// Initialization
//

function awaInitGames() {
    var words = awaWords();
    $(".atw-game").each(function () {
        var tool = $(this).attr("data-atw");
        if (this.getAttribute("data-atwa-ready") === "1") {
            return;
        }
        this.setAttribute("data-atwa-ready", "1");
        if (tool === "quipu" || tool === "meso") {
            awaCreateStepper(this, tool, words);
        } else if (tool === "choice") {
            awaCreateChoice(this, words);
        } else if (tool === "bones") {
            awaInitBone(this);
        } else if (tool === "yupana") {
            awaInitYupana(this, words);
        } else if (tool === "calculi") {
            awaInitRoman(this, words);
        } else if (tool === "suanpan" || tool === "soroban" || tool === "schyoty") {
            awaInitAbacus(this, words);
        }
    });
}

function htLoadContent() {
    awaInitGames();
    htWriteNavigation();

    return false;
}
