// SPDX-License-Identifier: GPL-3.0-or-later

// Writing integer numbers on the Soroban (算盤) and Suanpan (算盤) — a level-based tutor.
// The abacus board is the shared one (js/ht_abacus.js). This file adds the game
// logic on top of it: a random integer is drawn and the user has to represent it
// bead by bead, guided step by step, while learning how numbers are written.
//
// This is the integer-only version of the game in
// js/c0b42835-d501-4b36-b974-8c082c4750e0.js. The decimal point (⚫) always stays
// at the rightmost column: the column where it sits is the units, and the columns
// to its left are the other integer families. There are no fractional columns and
// the decimal point is never moved.
//
// Levels (4):
//   1) UNITS      -> "x"
//   2) TENS       -> "xx"
//   3) HUNDREDS   -> "xxx"
//   4) THOUSANDS  -> "xxxx"

var localIntegerWriterController = {
    "levelIdx": 0,
    "number": null,
    "steps": [],
    "currentStepIdx": 0,
    "stepCompleted": false,
    "finalCongratsShown": false,
    "exerciseStarted": false,
    "TextManager": null
};

var HT_INTEGER_WRITER_LEVELS = [
    { "intDigits": 1 },
    { "intDigits": 2 },
    { "intDigits": 3 },
    { "intDigits": 4 }
];

var HT_INTEGER_WRITER_BADGE_COLORS = ["#ffb347", "#4caf50", "#ff7043", "#9c27b0"];

// Place-name keys by power of ten (10^p).
var HT_INTEGER_WRITER_PLACE_KEYS = ["units", "tens", "hundreds", "thousands"];

function htIntegerWriterLevel() {
    return HT_INTEGER_WRITER_LEVELS[localIntegerWriterController.levelIdx];
}

// The decimal point always stays at the rightmost column, so the column where it
// sits is the units and every column to its left is an integer family.
function htIntegerWriterMarkerCol() {
    return localSorobanController.COLUMNS - 1;
}

function htIntegerWriterGetAbacusDigits(raw) {
    const digits = [];
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        const col = localSorobanController.state[i];
        let value = (col.upper * 5) + col.lower;
        if (!raw && value > 9) value = 9;
        digits.push(value);
    }
    return digits;
}

function htIntegerWriterDigitsMatch(target) {
    const digits = htIntegerWriterGetAbacusDigits(true);
    for (let i = 0; i < digits.length; i++) {
        if (digits[i] !== target[i]) return false;
    }
    return true;
}

function htIntegerWriterUpdateDisplay() {
    const numSpan = document.getElementById('numericValue');
    if (numSpan && localSorobanController.state && localSorobanController.state.length > 0) {
        const digits = htIntegerWriterGetAbacusDigits(false);
        const markerCol = localSorobanController.decimalMarkerCol;
        let intStr = digits.slice(0, markerCol + 1).join('');
        intStr = intStr.replace(/^0+/, '');
        if (intStr === '') intStr = '0';
        numSpan.innerText = intStr;
    }
    if (typeof htSorobanCheckOverflow === 'function') htSorobanCheckOverflow();
}

function htIntegerWriterClearAbacus() {
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    localSorobanController.isDraggingDecimal = false;
    if (typeof htSorobanRender === 'function') htSorobanRender();
    htIntegerWriterUpdateDisplay();
}

function htIntegerWriterGenerateNumber() {
    const level = htIntegerWriterLevel();
    const intDigits = [];
    if (level.intDigits === 1) {
        intDigits.push(Math.floor(Math.random() * 10));
    } else {
        // The leading digit is never zero: the written number always has exactly
        // intDigits digits (e.g. "5027", never "0502" or "527").
        intDigits.push(1 + Math.floor(Math.random() * 9));
        for (let i = 1; i < level.intDigits; i++) {
            intDigits.push(Math.floor(Math.random() * 10));
        }
    }
    return { "intDigits": intDigits };
}

function htIntegerWriterNumberString(number) {
    return number.intDigits.join('');
}

function htIntegerWriterBuildSteps() {
    const TM = localIntegerWriterController.TextManager;
    const number = localIntegerWriterController.number;
    const level = htIntegerWriterLevel();
    const columns = localSorobanController.COLUMNS;
    const steps = [];
    const current = [];
    for (let i = 0; i < columns; i++) current.push(0);
    const markerCol = htIntegerWriterMarkerCol();

    // Integer digits, from the most significant column down to the units,
    // exactly in the order the number is written. The number is right-aligned
    // against the decimal point: its last digit always lands on the column
    // where the point sits.
    const firstIntCol = markerCol - level.intDigits + 1;
    for (let i = 0; i < level.intDigits; i++) {
        const digit = number.intDigits[i];
        const power = level.intDigits - 1 - i;
        const col = firstIntCol + i;
        current[col] = digit;
        const placeName = TM.getPlace(HT_INTEGER_WRITER_PLACE_KEYS[power]);
        const hint = power === 0 ? TM.get('txt_hintMarker') : TM.get('txt_hintLeft');
        steps.push({
            "type": "digit",
            "instruction": digit === 0
                ? TM.getWriteZeroInstruction(placeName, hint)
                : TM.getWriteDigitInstruction(digit, placeName, hint),
            "target": current.slice()
        });
    }

    // Final verification step.
    steps.push({
        "type": "digit",
        "instruction": TM.getFinalInstruction(htIntegerWriterNumberString(number)),
        "target": current.slice()
    });

    return steps;
}

function htIntegerWriterUpdateLevelBadge() {
    const badge = document.getElementById('levelBadge');
    if (badge) {
        badge.innerHTML = localIntegerWriterController.TextManager.get('txt_lvl' + localIntegerWriterController.levelIdx);
        badge.style.background = HT_INTEGER_WRITER_BADGE_COLORS[localIntegerWriterController.levelIdx];
    }
}

function htIntegerWriterSetControlButtonsVisibility(show) {
    const resetTutorBtn = document.getElementById('resetTutorBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (show) {
        resetTutorBtn.classList.remove('hidden');
        nextLevelBtn.classList.remove('hidden');
    } else {
        resetTutorBtn.classList.add('hidden');
        nextLevelBtn.classList.add('hidden');
    }
}

function htIntegerWriterSetStepVisibility(show) {
    const nextStepBtn = document.getElementById('nextStepBtn');
    if (show) {
        nextStepBtn.classList.remove('hidden');
    } else {
        nextStepBtn.classList.add('hidden');
    }
}

function htIntegerWriterStartNewExercise() {
    if (!localSorobanController.canvas || !localIntegerWriterController.TextManager) return;
    const ctl = localIntegerWriterController;
    ctl.finalCongratsShown = false;
    ctl.exerciseStarted = false;
    ctl.number = htIntegerWriterGenerateNumber();
    localSorobanController.decimalMarkerCol = htIntegerWriterMarkerCol();
    htIntegerWriterClearAbacus();
    ctl.steps = htIntegerWriterBuildSteps();
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    const TM = ctl.TextManager;
    document.getElementById('problemDisplay').innerHTML = TM.get('txt_problemPrefix') + ' <strong>' + htIntegerWriterNumberString(ctl.number) + '</strong>';
    document.getElementById('stepMessage').innerHTML = TM.getStepPrefix() + ' ' + ctl.steps[0].instruction;
    document.getElementById('stepStatus').innerHTML = TM.getStepStatus(1, ctl.steps.length);
    document.getElementById('feedbackArea').innerHTML = '';
    htIntegerWriterUpdateLevelBadge();
    htIntegerWriterSetControlButtonsVisibility(true);
    htIntegerWriterSetStepVisibility(true);
}

function htIntegerWriterStepMatches(step) {
    return htIntegerWriterDigitsMatch(step.target);
}

function htIntegerWriterNextStep() {
    const ctl = localIntegerWriterController;
    if (!ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    if (!htIntegerWriterStepMatches(ctl.steps[ctl.currentStepIdx])) return;

    if (!ctl.exerciseStarted) {
        ctl.exerciseStarted = true;
        htIntegerWriterSetControlButtonsVisibility(false);
    }

    if (ctl.currentStepIdx + 1 < ctl.steps.length) {
        ctl.currentStepIdx++;
        ctl.stepCompleted = false;
        const TM = ctl.TextManager;
        document.getElementById('stepMessage').innerHTML = TM.getStepPrefix() + ' ' + ctl.steps[ctl.currentStepIdx].instruction;
        document.getElementById('stepStatus').innerHTML = TM.getStepStatus(ctl.currentStepIdx + 1, ctl.steps.length);
        document.getElementById('feedbackArea').innerHTML = '';
        setTimeout(function() { if (window.checkCurrentStepPositive) window.checkCurrentStepPositive(); }, 50);
    } else if (!ctl.finalCongratsShown) {
        ctl.finalCongratsShown = true;
        const TM = ctl.TextManager;
        document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + TM.getCongratsMessage(htIntegerWriterNumberString(ctl.number)) + '</div>';
        htIntegerWriterSetControlButtonsVisibility(true);
    }
}

function htIntegerWriterNextLevel() {
    const ctl = localIntegerWriterController;
    ctl.levelIdx++;
    let wrapped = false;
    if (ctl.levelIdx >= HT_INTEGER_WRITER_LEVELS.length) {
        ctl.levelIdx = 0;
        wrapped = true;
    }
    htIntegerWriterUpdateLevelBadge();
    htIntegerWriterStartNewExercise();
    if (wrapped) {
        const feedback = document.getElementById('feedbackArea');
        if (feedback) feedback.innerHTML = '<div class="congrats">' + ctl.TextManager.get('txt_finalLevelMessage') + '</div>';
    }
}

window.checkCurrentStepPositive = function() {
    const ctl = localIntegerWriterController;
    if (!ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    if (!htIntegerWriterStepMatches(ctl.steps[ctl.currentStepIdx])) {
        ctl.stepCompleted = false;
        const feedback = document.getElementById('feedbackArea');
        if (ctl.finalCongratsShown) {
            // The final target was changed after completion: undo the final
            // state so the number can be rebuilt and validated again.
            ctl.finalCongratsShown = false;
            if (feedback) feedback.innerHTML = '';
            htIntegerWriterSetStepVisibility(true);
        } else if (feedback && feedback.innerHTML && !feedback.innerHTML.includes('congrats')) {
            feedback.innerHTML = '';
        }
        return;
    }
    if (ctl.stepCompleted) return;
    ctl.stepCompleted = true;
    const TM = ctl.TextManager;
    const feedback = document.getElementById('feedbackArea');
    if (ctl.currentStepIdx === ctl.steps.length - 1) {
        if (!ctl.finalCongratsShown) {
            ctl.finalCongratsShown = true;
            feedback.innerHTML = '<div class="congrats">' + TM.getPerfectMessage(htIntegerWriterNumberString(ctl.number)) + '</div>';
            htIntegerWriterSetControlButtonsVisibility(true);
            htIntegerWriterSetStepVisibility(false);
        }
    } else {
        feedback.innerHTML = '<div class="success-message">' + TM.getCorrectMessage() + '</div>';
    }
};

function htLoadContent() {
    htWriteNavigation();

    localIntegerWriterController.TextManager = {
        "get": function(id) {
            const element = document.getElementById(id);
            return element ? element.innerHTML : id;
        },

        "format": function(template, data) {
            let result = template;
            for (const [key, value] of Object.entries(data)) {
                let displayValue = value;
                if (displayValue === undefined || displayValue === null) displayValue = '';
                result = result.split("{" + key + "}").join(displayValue);
            }
            return result;
        },

        "getStepPrefix": function() {
            return this.get('txt_stepPrefix');
        },

        "getCorrectMessage": function() {
            return this.get('txt_correctMessage');
        },

        "getPerfectMessage": function(number) {
            return this.format(this.get('txt_perfectMessage'), { "number": number });
        },

        "getCongratsMessage": function(number) {
            return this.format(this.get('txt_congratsMessage'), { "number": number });
        },

        "getWriteDigitInstruction": function(digit, placeName, hint) {
            return this.format(this.get('txt_writeDigit'), { "digit": digit, "placeName": placeName }) + ' ' + hint;
        },

        "getWriteZeroInstruction": function(placeName, hint) {
            return this.format(this.get('txt_writeZero'), { "placeName": placeName }) + ' ' + hint;
        },

        "getFinalInstruction": function(number) {
            return this.format(this.get('txt_finalInstruction'), { "number": number });
        },

        "getStepStatus": function(current, total) {
            return this.format(this.get('txt_stepStatus'), { "current": current, "total": total });
        },

        "getWelcomeMessage": function() {
            return this.get('txt_welcomeMessage');
        },

        "getPlace": function(key) {
            return this.get('txt_' + key);
        }
    };

    const TM = localIntegerWriterController.TextManager;

    // --- Board adjustments over the shared abacus (ht_abacus.js) ---

    // The "Value" readout shows the integer number written on the board.
    htSorobanUpdateDisplay = htIntegerWriterUpdateDisplay;

    // This game only works with integer numbers, so the decimal point (⚫) can
    // never be dragged: it always marks the units column at the right.
    const htIntegerWriterOrigGetHitRegion = htSorobanGetHitRegion;
    htSorobanGetHitRegion = function(mouseX, mouseY) {
        localSorobanController.trackClickAllowed = false;
        const hit = htIntegerWriterOrigGetHitRegion(mouseX, mouseY);
        if (hit && hit.type === 'decimal_marker') return null;
        return hit;
    };

    // Every bead movement is checked against the current step target.
    const htIntegerWriterOrigToggleUpper = htSorobanToggleUpper;
    htSorobanToggleUpper = function(col, beadIdx) {
        htIntegerWriterOrigToggleUpper(col, beadIdx);
        if (window.checkCurrentStepPositive) window.checkCurrentStepPositive();
    };
    const htIntegerWriterOrigHandleLowerClick = htSorobanHandleLowerClick;
    htSorobanHandleLowerClick = function(col, beadIdx) {
        htIntegerWriterOrigHandleLowerClick(col, beadIdx);
        if (window.checkCurrentStepPositive) window.checkCurrentStepPositive();
    };

    // The decimal point is locked on the rightmost column (integer numbers only).
    const htIntegerWriterOrigMoveDecimalMarker = htSorobanMoveDecimalMarkerToColumn;
    htSorobanMoveDecimalMarkerToColumn = function(targetCol) {
        if (targetCol !== htIntegerWriterMarkerCol()) return;
        htIntegerWriterOrigMoveDecimalMarker(targetCol);
        if (window.checkCurrentStepPositive) window.checkCurrentStepPositive();
    };

    // After switching between Soroban and Suanpan the beads are cleared, so
    // the current step has to be rechecked.
    const htIntegerWriterOrigSwitchMode = htSorobanSwitchMode;
    htSorobanSwitchMode = function(mode) {
        htIntegerWriterOrigSwitchMode(mode);
        if (window.checkCurrentStepPositive) window.checkCurrentStepPositive();
    };

    // "⟳ Reset abacus" clears every column and restores the decimal point to
    // its starting position. The step targets are cumulative, so after
    // clearing, the step sequence of the current number restarts from the
    // beginning and the feedback is reset for that number.
    htSorobanResetSoroban = function() {
        if (localSorobanController._multTimer) {
            clearInterval(localSorobanController._multTimer);
            localSorobanController._multTimer = null;
        }
        localSorobanController.decimalMarkerCol = htIntegerWriterMarkerCol();
        htIntegerWriterClearAbacus();
        const ctl = localIntegerWriterController;
        if (!ctl.steps.length) return;
        ctl.currentStepIdx = 0;
        ctl.stepCompleted = false;
        ctl.finalCongratsShown = false;
        const TM = ctl.TextManager;
        document.getElementById('stepMessage').innerHTML = TM.getStepPrefix() + ' ' + ctl.steps[0].instruction;
        document.getElementById('stepStatus').innerHTML = TM.getStepStatus(1, ctl.steps.length);
        document.getElementById('feedbackArea').innerHTML = '';
        htIntegerWriterSetStepVisibility(true);
    };

    // --- Buttons ---

    const _ = id => document.getElementById(id);
    _('resetTutorBtn') && (_('resetTutorBtn').onclick = function() { htIntegerWriterStartNewExercise(); });
    _('nextLevelBtn') && (_('nextLevelBtn').onclick = function() { htIntegerWriterNextLevel(); });
    _('nextStepBtn') && (_('nextStepBtn').onclick = function() { htIntegerWriterNextStep(); });
    _('stepMessage') && (_('stepMessage').innerHTML = TM.getStepPrefix() + ' ' + TM.getWelcomeMessage());

    // Start the first exercise once the shared abacus (ht_abacus.js) has
    // initialized the board: its htSorobanLoadContent() runs right after this
    // function in the script loader, so a small defer is enough.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(htIntegerWriterStartNewExercise, 0);
        });
    } else {
        setTimeout(htIntegerWriterStartNewExercise, 0);
    }

    return false;
}
