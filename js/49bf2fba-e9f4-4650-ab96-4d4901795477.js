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
        tens: awaWord("atwaWordTens", "Tens"),
        units: awaWord("atwaWordUnits", "Units"),
        newRound: awaWord("atwaWordNewRound", "New practice"),
        add: awaWord("atwaWordAdd", "Add one"),
        remove: awaWord("atwaWordRemove", "Remove one"),
        correct: awaWord("atwaWordCorrect", "\u2713 Correct!"),
        congrats: awaWordHTML("atwaWordCongrats", "🎉🎉🎉 CONGRATULATIONS! 🎉🎉🎉<br>You represented the sum correctly!<br>Click '{button}' to practice more!"),
        congratsChoice: awaWordHTML("atwaWordCongratsChoice", "🎉🎉🎉 CONGRATULATIONS! 🎉🎉🎉<br>You found the correct sum!<br>Click '{button}' to practice more!"),
        nextStep: awaWord("atwaWordNextStep", "Next step"),
        stepStatus: awaWord("atwaWordStepStatus", "Step {current}/{total}"),
        stepCorrect: awaWordHTML("atwaWordStepCorrect", "Correct! Click 'Next step' to continue."),
        abacusStep1: awaWordHTML("atwaWordAbacusStep1", "Step 1: Write the first number <b>{a}</b> in the {units} place."),
        abacusStep2: awaWordHTML("atwaWordAbacusStep2", "Step 2: Add <b>{b}</b> in the {units} place. Since {a} + {b} = {sum} reaches 10, carry 1 to the {tens} place: remove the complement <b>{complement}</b> from the {units} place and add <b>1</b> to the {tens} place. The abacus should show <b>{sum}</b>."),
        abacusStep3: awaWordHTML("atwaWordAbacusStep3", "Final: {a} + {b} = <b>{sum}</b>. The abacus should show this sum!"),
        abacusPerfect: awaWordHTML("atwaWordAbacusPerfect", "🎉🎉🎉 PERFECT! 🎉🎉🎉<br>{a} + {b} = {sum}<br>Great job using the abacus!"),
        typedQuestion: awaWord("atwaWordTypedQuestion", "The {order} column already holds {base}. Add the bottom digit {added}: type the digit that stays in the column in the result row, and, if the sum reaches ten, type 1 in the carry box above the next order."),
        typedSquaresLabel: awaWord("atwaWordTypedSquaresLabel", "Addition in this column"),
        typedMsgCarry: awaWordHTML("atwaWordTypedMsgCarry", "{base} + {added} = {sum}. It reaches 10, so the {order} column keeps {result} and carries 1 to the next order."),
        typedWrongDigitTen: awaWordHTML("atwaWordTypedWrongDigitTen", "That digit is not correct. The column already holds {base} and the bottom digit is {added}. The complement of {base} to ten is {comp}. Since {added} is equal to or greater than {comp}, the ten is completed and 1 is carried to the next order: the squares outside the group of ten are the digit that stays in the {order} column."),
        typedWrongCarry: awaWordHTML("atwaWordTypedWrongCarry", "The carry is not correct. Check {base} + {added}: when the sum reaches ten, the carry must be 1."),
        typedPerfect: awaWordHTML("atwaWordTypedPerfect", "🎉🎉🎉 PERFECT! 🎉🎉🎉<br>{a} + {b} = {sum}<br>Great job!"),
        typedSquaresUsed: awaWord("atwaWordTypedSquaresUsed", "Squares used: {used}."),
        typedComplementPending: awaWord("atwaWordTypedComplementPending", "Complement of {base} to ten: {comp}. Squares still missing to complete the ten: {missing}."),
        typedComplementUsed: awaWord("atwaWordTypedComplementUsed", "Complement of {base} to ten: {comp}. Squares that completed the ten: {comp}; squares outside the ten: {outside}."),
        typedNewProblem: awaWord("atwaWordTypedNewProblem", "New problem"),
        typedDigitAria: awaWord("atwaWordTypedDigitAria", "Digit that the column keeps"),
        typedCarryAria: awaWord("atwaWordTypedCarryAria", "Carry to the next order")
    };
}

function awaFormat(template, data) {
    var result = template;
    for (var key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            result = result.split("{" + key + "}").join(data[key]);
        }
    }
    return result;
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
// Step-by-step addition tutor shared by the calculi and the three abacuses.
// It follows the same idea as "Practicing addition with Soroban, Suanpan and
// Schyoty" (f91d9720): set the first number, perform the carry, verify result.
//

function awaCreateAbacusTutor(mount, anchor, words, getValue) {
    var panel = awaElement("div", "tutor-panel atwa-tutor");
    var header = awaElement("div", "tutor-header");
    var problemBox = awaElement("div", "problem-box atwa-tutor-problem");
    var status = awaElement("span", "status-badge atwa-tutor-status");
    header.appendChild(problemBox);
    header.appendChild(status);

    var message = awaElement("div", "step-message atwa-tutor-message");
    var buttons = awaElement("div", "step-buttons");
    var nextBtn = awaButton(words.nextStep || "Next step", "step-btn primary atwa-tutor-next");
    buttons.appendChild(nextBtn);

    var feedback = awaElement("div", "atwa-tutor-feedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");

    panel.appendChild(header);
    panel.appendChild(message);
    panel.appendChild(buttons);
    panel.appendChild(feedback);
    if (anchor && anchor.parentNode === mount) {
        anchor.insertAdjacentElement("afterend", panel);
    } else {
        mount.appendChild(panel);
    }

    var state = { problem: null, steps: [], idx: 0, complete: false };

    function buildSteps(problem) {
        var complement = 10 - problem.b;
        return [
            {
                target: problem.a,
                text: awaFormat(words.abacusStep1, {
                    a: problem.a,
                    units: words.units
                })
            },
            {
                target: problem.sum,
                text: awaFormat(words.abacusStep2, {
                    a: problem.a,
                    b: problem.b,
                    sum: problem.sum,
                    complement: complement,
                    units: words.units,
                    tens: words.tens
                })
            },
            {
                target: problem.sum,
                text: awaFormat(words.abacusStep3, {
                    a: problem.a,
                    b: problem.b,
                    sum: problem.sum
                })
            }
        ];
    }

    function renderStep() {
        status.textContent = awaFormat(words.stepStatus, {
            current: state.idx + 1,
            total: state.steps.length
        });
        message.className = "step-message atwa-tutor-message";
        message.innerHTML = state.steps[state.idx].text;
    }

    function update() {
        if (!state.problem || state.complete) {
            return;
        }
        var step = state.steps[state.idx];
        var ok = (getValue() === step.target);
        nextBtn.disabled = !ok;
        if (ok) {
            feedback.className = "success-message";
            feedback.innerHTML = words.stepCorrect;
        } else {
            feedback.className = "atwa-tutor-feedback";
            feedback.innerHTML = "";
        }
    }

    function start(problem) {
        state.problem = problem;
        state.steps = buildSteps(problem);
        state.idx = 0;
        state.complete = false;
        problemBox.textContent = awaProblemText(problem);
        nextBtn.classList.remove("hidden");
        nextBtn.disabled = true;
        feedback.className = "atwa-tutor-feedback";
        feedback.innerHTML = "";
        renderStep();
        update();
    }

    nextBtn.addEventListener("click", function () {
        if (state.complete || !state.problem) {
            return;
        }
        if (getValue() !== state.steps[state.idx].target) {
            return;
        }
        if (state.idx < state.steps.length - 1) {
            state.idx++;
            renderStep();
            update();
            return;
        }
        state.complete = true;
        status.textContent = "";
        nextBtn.disabled = true;
        nextBtn.classList.add("hidden");
        message.className = "step-message congrats atwa-tutor-message";
        message.innerHTML = awaFormat(words.abacusPerfect, {
            a: state.problem.a,
            b: state.problem.b,
            sum: state.problem.sum
        });
        feedback.className = "atwa-tutor-feedback";
        feedback.innerHTML = "";
    });

    return {
        start: start,
        update: update,
        isComplete: function () {
            return state.complete;
        }
    };
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

function awaDrawQuipuPlaces(ctx, W, H, tens, units, labels) {
    var cord = "#a1887f";
    var knot = "#5d4037";
    var mainY = H * 0.10;
    var cordX = W * 0.38;
    var bottomY = H * 0.88;

    ctx.strokeStyle = cord;
    ctx.lineWidth = Math.max(3, H * 0.02);
    ctx.beginPath();
    ctx.moveTo(W * 0.08, mainY);
    ctx.lineTo(W * 0.92, mainY);
    ctx.stroke();

    // A quipu is read vertically: the units are at the bottom of the cord and
    // the higher orders are stacked above them.
    ctx.beginPath();
    ctx.moveTo(cordX, mainY);
    ctx.lineTo(cordX, bottomY);
    ctx.stroke();

    var sections = [
        { count: tens, label: labels.tens, fill: "#e3f2fd", color: "#1565c0",
          top: mainY + H * 0.07, bottom: mainY + H * 0.30 },
        { count: units, label: labels.units, fill: "#e8f5e9", color: "#2e7d32",
          top: mainY + H * 0.36, bottom: H * 0.86 }
    ];

    for (var s = 0; s < sections.length; s++) {
        var section = sections[s];
        var count = Math.max(0, Math.min(9, section.count));
        var gap = count > 1 ? (section.bottom - section.top) / (count - 1) : 0;
        var radius = Math.min(H * 0.03, count > 1 ? gap * 0.42 : H * 0.03);
        ctx.fillStyle = knot;
        for (var i = 0; i < count; i++) {
            var y = section.top + i * gap;
            ctx.beginPath();
            ctx.arc(cordX, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        var labelY = (section.top + section.bottom) / 2;
        var labelX = cordX + W * 0.10;
        ctx.font = 'bold 13px Verdana, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        var labelWidth = ctx.measureText(section.label).width + 16;
        var labelHeight = 22;
        ctx.fillStyle = section.fill;
        ctx.fillRect(labelX - 8, labelY - labelHeight / 2, labelWidth, labelHeight);
        ctx.strokeStyle = section.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(labelX - 8, labelY - labelHeight / 2, labelWidth, labelHeight);
        ctx.fillStyle = section.color;
        ctx.fillText(section.label, labelX, labelY);
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
    var isQuipu = (tool === "quipu");

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

    var state = { problem: null, target: 10, value: 0, tens: 0, units: 0 };

    function currentValue() {
        return isQuipu ? (state.tens * 10 + state.units) : state.value;
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isQuipu) {
            awaDrawQuipuPlaces(ctx, canvas.width, canvas.height, state.tens, state.units, {
                tens: words.tens,
                units: words.units
            });
            canvas.setAttribute("data-tens", String(state.tens));
            canvas.setAttribute("data-units", String(state.units));
            canvas.setAttribute("aria-label", words.tens + ": " + state.tens + ". " + words.units + ": " + state.units + ".");
        } else {
            awaDrawMeso(ctx, canvas.width, canvas.height, state.value);
        }
        targetSpan.textContent = awaProblemText(state.problem);
        var value = currentValue();
        valueSpan.textContent = (words.value || "Value") + ": " + value;
        var reached = value === state.target;
        decBtn.disabled = reached || value <= 0;
        incBtn.disabled = reached || value >= state.target;
        correct.style.display = reached ? "block" : "none";
    }

    function newRound() {
        state.problem = awaAddition();
        state.target = state.problem.sum;
        state.value = 0;
        state.tens = 0;
        state.units = 0;
        render();
    }

    decBtn.addEventListener("click", function () {
        if (currentValue() <= 0 || currentValue() >= state.target) {
            return;
        }
        if (isQuipu) {
            if (state.units > 0) {
                state.units--;
            } else if (state.tens > 0) {
                state.tens--;
                state.units = 9;
            }
        } else {
            state.value--;
        }
        render();
    });
    incBtn.addEventListener("click", function () {
        if (currentValue() >= state.target) {
            return;
        }
        if (isQuipu) {
            if (state.units < 9) {
                state.units++;
            } else {
                state.units = 0;
                state.tens++;
            }
        } else {
            state.value++;
        }
        render();
    });
    newBtn.addEventListener("click", newRound);

    newRound();
}

//
// Typed vertical addition (Hindu-Arabic numerals), based on the design of
// "Practicing addition with typed values" (18ca9e1f). The player types the
// digit that stays in the units column and the 1 carried to the tens column.
//

function awaInitTyped(container, words) {
    var wrap = awaElement("div", "htAddGame atwa-typed");
    container.appendChild(wrap);

    var orders = awaElement("div", "htAddOrders");
    var tensOrder = awaElement("span", "htAddOrder");
    tensOrder.textContent = words.tens;
    var unitsOrder = awaElement("span", "htAddOrder htAddOrderActive");
    unitsOrder.textContent = words.units;
    orders.appendChild(tensOrder);
    orders.appendChild(unitsOrder);
    wrap.appendChild(orders);

    var question = awaElement("span", "htAddQuestion");
    wrap.appendChild(question);

    var table = awaElement("table", "htAddTable");
    table.setAttribute("aria-live", "polite");
    wrap.appendChild(table);

    var squaresWrap = awaElement("div", "htAddSquaresWrap");
    var squaresLabel = awaElement("span", "htAddSquaresLabel");
    squaresLabel.textContent = words.typedSquaresLabel;
    var squares = awaElement("div", "htAddSquares");
    squares.setAttribute("aria-hidden", "true");
    var caption = awaElement("span", "htAddSquaresCaption");
    var note = awaElement("span", "htAddSquaresNote");
    squaresWrap.appendChild(squaresLabel);
    squaresWrap.appendChild(squares);
    squaresWrap.appendChild(caption);
    squaresWrap.appendChild(note);
    wrap.appendChild(squaresWrap);

    var inputHome = awaElement("span", "htAddHidden");
    var digitInput = document.createElement("input");
    digitInput.type = "text";
    digitInput.inputMode = "numeric";
    digitInput.maxLength = 1;
    digitInput.autocomplete = "off";
    digitInput.className = "htAddInput atwa-typed-digit";
    digitInput.setAttribute("aria-label", words.typedDigitAria);
    var carryInput = document.createElement("input");
    carryInput.type = "text";
    carryInput.inputMode = "numeric";
    carryInput.maxLength = 1;
    carryInput.autocomplete = "off";
    carryInput.className = "htAddInput atwa-typed-carry";
    carryInput.setAttribute("aria-label", words.typedCarryAria);
    inputHome.appendChild(digitInput);
    inputHome.appendChild(carryInput);
    wrap.appendChild(inputHome);

    var feedback = awaElement("div", "htAddFeedback");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    wrap.appendChild(feedback);

    var nextContainer = awaElement("div", "htAddNextContainer");
    var nextBtn = awaButton(words.typedNewProblem, "reset-tutor-btn hidden");
    nextContainer.appendChild(nextBtn);
    wrap.appendChild(nextContainer);

    var state = { problem: null, answered: false };

    function buildBoard() {
        inputHome.appendChild(digitInput);
        inputHome.appendChild(carryInput);
        var a = state.problem.a;
        var b = state.problem.b;
        var carrySlot = state.answered ? "1" : '<span class="atwa-typed-carry-slot"></span>';
        var digitSlot = state.answered ? String(state.problem.sum % 10) : '<span class="atwa-typed-digit-slot"></span>';
        table.innerHTML =
            '<tr class="htAddCarryRow"><td class="htAddOp"></td>' +
            '<td class="htAddCell">' + carrySlot + '</td>' +
            '<td class="htAddCell"></td></tr>' +
            '<tr><td class="htAddOp"></td><td class="htAddCell"></td>' +
            '<td class="htAddCell htAddCellActive">' + a + '</td></tr>' +
            '<tr><td class="htAddOp">+</td><td class="htAddCell"></td>' +
            '<td class="htAddCell htAddCellActive">' + b + '</td></tr>' +
            '<tr class="htAddLine"><td colspan="3"></td></tr>' +
            '<tr class="htAddResultRow"><td class="htAddOp"></td>' +
            '<td class="htAddCell">' + (state.answered ? "1" : "") + '</td>' +
            '<td class="htAddCell htAddCellActive">' + digitSlot + '</td></tr>';
        if (!state.answered) {
            table.querySelector(".atwa-typed-carry-slot").appendChild(carryInput);
            table.querySelector(".atwa-typed-digit-slot").appendChild(digitInput);
        }
    }

    function drawSquares(revealed) {
        var base = state.problem.a;
        var addend = state.problem.b;
        var total = state.problem.sum;
        var added = revealed ? addend : 0;
        var complement = 10 - base;
        var html = "";
        var i;

        function square(index) {
            var cls = "htAddSquare";
            if (index < base) {
                cls += " htAddSquareBase";
            } else if (index - base < added) {
                cls += " htAddSquareAdded";
            } else {
                cls += " htAddSquarePending";
            }
            if (index >= base && index < 10) {
                cls += " htAddSquareComplement";
                if (index - base < added) {
                    cls += " htAddSquareComplementUsed";
                }
            }
            return '<span class="' + cls + '"></span>';
        }

        if (total >= 10) {
            html += '<span class="htAddTenGroup">';
            for (i = 0; i < 10; i++) {
                html += square(i);
            }
            html += '</span>';
            for (i = 10; i < total; i++) {
                html += square(i);
            }
        } else {
            for (i = 0; i < total; i++) {
                html += square(i);
            }
        }

        squares.innerHTML = html;
        caption.textContent = base + " + " + addend + " = " + (revealed ? total : "?");
        var noteText = awaFormat(words.typedSquaresUsed, { used: added });
        if (complement > 0) {
            if (added < complement) {
                noteText += " " + awaFormat(words.typedComplementPending, {
                    base: base,
                    comp: complement,
                    missing: complement - added
                });
            } else {
                noteText += " " + awaFormat(words.typedComplementUsed, {
                    base: base,
                    comp: complement,
                    outside: added - complement
                });
            }
        }
        note.textContent = noteText;
    }

    function markWrittenSquares(writtenDigit) {
        var nodes = squares.querySelectorAll(".htAddSquare");
        for (var n = 0; n < nodes.length; n++) {
            nodes[n].classList.remove("htAddSquareWritten");
            nodes[n].classList.remove("htAddSquareBaseWritten");
        }
        if (writtenDigit === "") {
            return;
        }
        var written = parseInt(writtenDigit, 10);
        var start = state.problem.sum >= 10 ? 10 : 0;
        var outside = [];
        for (var k = start; k < nodes.length; k++) {
            outside.push(nodes[k]);
        }
        var limit = Math.max(0, Math.min(written, outside.length));
        for (var m = 0; m < limit; m++) {
            if (outside[m].classList.contains("htAddSquareBase")) {
                outside[m].classList.add("htAddSquareBaseWritten");
            } else {
                outside[m].classList.add("htAddSquareWritten");
            }
        }
    }

    function evaluate() {
        if (state.answered) {
            return;
        }
        var base = state.problem.a;
        var addend = state.problem.b;
        var sum = state.problem.sum;
        var correctDigit = sum % 10;
        var digitRaw = digitInput.value.replace(/[^0-9]/g, "");
        var carryRaw = carryInput.value.replace(/[^0-9]/g, "");
        digitInput.value = digitRaw;
        carryInput.value = carryRaw;
        var complement = 10 - base;
        var digitOk = digitRaw !== "" && parseInt(digitRaw, 10) === correctDigit;
        var carryOk = carryRaw !== "" && parseInt(carryRaw, 10) === 1;

        markWrittenSquares(digitRaw);

        if (digitRaw !== "" && !digitOk) {
            feedback.innerHTML = awaFormat(words.typedWrongDigitTen, {
                order: words.units,
                base: base,
                added: addend,
                comp: complement
            });
            return;
        }
        if (carryRaw !== "" && !carryOk) {
            feedback.innerHTML = awaFormat(words.typedWrongCarry, {
                order: words.units,
                base: base,
                added: addend
            });
            return;
        }
        if (digitOk && carryOk) {
            resolve();
            return;
        }
        feedback.innerHTML = "";
    }

    function resolve() {
        state.answered = true;
        buildBoard();
        drawSquares(true);
        digitInput.disabled = true;
        carryInput.disabled = true;
        feedback.innerHTML = awaFormat(words.typedPerfect, {
            a: state.problem.a,
            b: state.problem.b,
            sum: state.problem.sum
        }) + "<br />" + awaFormat(words.typedMsgCarry, {
            base: state.problem.a,
            added: state.problem.b,
            sum: state.problem.sum,
            result: state.problem.sum % 10,
            order: words.units
        }) + ' <i class="fa-solid fa-medal" style="font-size: 4em; color: gold;"></i>';
        nextBtn.classList.remove("hidden");
    }

    function newProblem() {
        state.problem = awaAddition();
        state.answered = false;
        digitInput.disabled = false;
        carryInput.disabled = false;
        digitInput.value = "";
        carryInput.value = "";
        feedback.innerHTML = "";
        nextBtn.classList.add("hidden");
        question.textContent = awaFormat(words.typedQuestion, {
            order: words.units,
            base: state.problem.a,
            added: state.problem.b
        });
        buildBoard();
        drawSquares(false);
    }

    digitInput.addEventListener("input", evaluate);
    carryInput.addEventListener("input", evaluate);
    nextBtn.addEventListener("click", newProblem);

    newProblem();
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
    awaRomanAbacusHideSuccess();

    var problem = awaAddition();
    localRomanAbacusController.problem = problem;
    localRomanAbacusController.target = problem.sum;
    var cmp = document.getElementById('romanAbacusCMP');
    if (cmp) {
        cmp.innerText = awaProblemText(problem);
    }
    if (localRomanAbacusController.tutor) {
        localRomanAbacusController.tutor.start(problem);
    }
}

function awaRomanAbacusUpdateDisplay() {
    var val = awaRomanAbacusComputeValue();

    var vEl = document.getElementById('romanAbacusValue');
    if (vEl) vEl.innerText = val.toString();

    var rEl = document.getElementById('romanAbacusRoman');
    if (rEl) rEl.innerHTML = awaRomanAbacusRomanHTML(val);

    localRomanAbacusController.won = (val === localRomanAbacusController.target);
    awaRomanAbacusHideSuccess();
    if (localRomanAbacusController.tutor) {
        localRomanAbacusController.tutor.update();
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
    var abacusContainer = container.querySelector(".roman-abacus-container") || container;
    var abacusPanel = abacusContainer.querySelector(".roman-abacus-panel");
    localRomanAbacusController.tutor = awaCreateAbacusTutor(
        abacusContainer, abacusPanel, words, awaRomanAbacusComputeValue);
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
    var tutor = null;
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
            correctEl.style.display = "none";
        }
        if (tutor) {
            tutor.update();
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
        if (tutor) {
            tutor.start(state.problem);
        }
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

    var abacusContainer = container.querySelector(".soroban-container") || container;
    var abacusPanel = abacusContainer.querySelector(".value-panel");
    tutor = awaCreateAbacusTutor(abacusContainer, abacusPanel, words, currentValue);
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
        } else if (tool === "typed") {
            awaInitTyped(this, words);
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
