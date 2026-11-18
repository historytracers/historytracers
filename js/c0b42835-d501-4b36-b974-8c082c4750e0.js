// SPDX-License-Identifier: GPL-3.0-or-later

// Writing numbers on the Soroban (算盤) and Suanpan (算盤) — a level-based tutor.
// The abacus board is the shared one (js/ht_abacus.js). This file adds the game
// logic on top of it: a random number is drawn and the user has to represent it
// bead by bead, guided step by step, while learning how numbers are written.
//
// Like in the integer practices, the decimal point (⚫) starts at the rightmost
// column: the column where it sits is the units. When the game reaches the
// decimal levels, the first step asks the user to move the decimal point to
// the left one place for each decimal order of the number (two places for two
// decimals, three for three, and so on), so the decimal families come into play.
//
// Levels (8):
//   1) UNITS        -> "x.0"        (marker at the right; 1 integer column used)
//   2) TENS         -> "xx.0"       (marker at the right; 2 integer columns)
//   3) HUNDREDS     -> "xxx.0"      (marker at the right; 3 integer columns)
//   4) THOUSANDS    -> "xxxx.0"     (marker at the right; 4 integer columns)
//   5) THOUSANDS    -> "xxxx.dd"    (marker dragged left; 2 decimal columns)
//   6) THOUSANDS    -> "xxxx.ddd"   (marker dragged left; 3 decimal columns)
//   7) THOUSANDS    -> "xxxx.dddd"  (marker dragged left; 4 decimal columns)
//   8) THOUSANDS    -> "xxxx.ddddd" (all 9 columns of the abacus are used)

var localNumberWriterController = {
    "levelIdx": 0,
    "number": null,
    "steps": [],
    "currentStepIdx": 0,
    "stepCompleted": false,
    "finalCongratsShown": false,
    "exerciseStarted": false,
    "TextManager": null
};

var HT_WRITER_LEVELS = [
    { "intDigits": 1, "decDigits": 1 },
    { "intDigits": 2, "decDigits": 1 },
    { "intDigits": 3, "decDigits": 1 },
    { "intDigits": 4, "decDigits": 1 },
    { "intDigits": 4, "decDigits": 2 },
    { "intDigits": 4, "decDigits": 3 },
    { "intDigits": 4, "decDigits": 4 },
    { "intDigits": 4, "decDigits": 5 }
];

var HT_WRITER_BADGE_COLORS = ["#ffb347", "#4caf50", "#ff7043", "#9c27b0", "#e91e63", "#00bcd4", "#ff9800", "#f44336"];

// Place-name keys by power of ten (10^p) and by decimal order (10^-(d+1)).
var HT_WRITER_INT_PLACE_KEYS = ["units", "tens", "hundreds", "thousands"];
var HT_WRITER_DEC_PLACE_KEYS = ["tenths", "hundredths", "thousandths", "tenthousandths", "hundredthousandths"];

// Number of integer families taught before the decimal levels begin.
var HT_WRITER_INTEGER_LEVELS = 4;

function htWriterLevel() {
    return HT_WRITER_LEVELS[localNumberWriterController.levelIdx];
}

// The decimal point always starts at the rightmost column, keeping the pattern
// used with integer numbers (the column of the point is the units).
function htWriterStartMarkerCol() {
    return localSorobanController.COLUMNS - 1;
}

// The column where the decimal point must sit for the level's number:
// at the integer levels it never moves (rightmost); at the decimal levels it
// moves one place to the left for each decimal order of the number (e.g. two
// places for two decimals), leaving exactly one column per decimal on its right.
function htWriterLevelMarkerCol() {
    const level = htWriterLevel();
    if (localNumberWriterController.levelIdx < HT_WRITER_INTEGER_LEVELS) {
        return htWriterStartMarkerCol();
    }
    return htWriterStartMarkerCol() - level.decDigits;
}

function htWriterGetAbacusDigits(raw) {
    const digits = [];
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        const col = localSorobanController.state[i];
        let value = (col.upper * 5) + col.lower;
        if (!raw && value > 9) value = 9;
        digits.push(value);
    }
    return digits;
}

function htWriterDigitsMatch(target) {
    const digits = htWriterGetAbacusDigits(true);
    for (let i = 0; i < digits.length; i++) {
        if (digits[i] !== target[i]) return false;
    }
    return true;
}

function htWriterUpdateDisplay() {
    const numSpan = document.getElementById('numericValue');
    if (numSpan && localSorobanController.state && localSorobanController.state.length > 0) {
        const level = htWriterLevel();
        const digits = htWriterGetAbacusDigits(false);
        const markerCol = localSorobanController.decimalMarkerCol;
        let intStr = digits.slice(0, markerCol + 1).join('');
        intStr = intStr.replace(/^0+/, '');
        if (intStr === '') intStr = '0';
        let fracStr = digits.slice(markerCol + 1, markerCol + 1 + level.decDigits).join('');
        if (fracStr === '') fracStr = '0';
        numSpan.innerText = intStr + '.' + fracStr;
    }
    if (typeof htSorobanCheckOverflow === 'function') htSorobanCheckOverflow();
}

function htWriterClearAbacus() {
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    localSorobanController.isDraggingDecimal = false;
    if (typeof htSorobanRender === 'function') htSorobanRender();
    htWriterUpdateDisplay();
}

function htWriterGenerateNumber() {
    const level = htWriterLevel();
    const intDigits = [];
    if (level.intDigits === 1) {
        intDigits.push(Math.floor(Math.random() * 10));
    } else {
        // The leading digit is never zero: the written number always has exactly
        // intDigits digits (e.g. "5027.40", never "0502.40" or "527.40").
        intDigits.push(1 + Math.floor(Math.random() * 9));
        for (let i = 1; i < level.intDigits; i++) {
            intDigits.push(Math.floor(Math.random() * 10));
        }
    }
    const decDigits = [];
    for (let i = 0; i < level.decDigits; i++) {
        // Levels 1-4 teach the ".0" pattern: the tenths digit is always 0.
        // From level 5 on, every decimal order of the level is drawn at random.
        decDigits.push(localNumberWriterController.levelIdx < HT_WRITER_INTEGER_LEVELS ? 0 : Math.floor(Math.random() * 10));
    }
    return { "intDigits": intDigits, "decDigits": decDigits };
}

function htWriterNumberString(number) {
    return number.intDigits.join('') + '.' + number.decDigits.join('');
}

function htWriterBuildSteps() {
    const TM = localNumberWriterController.TextManager;
    const number = localNumberWriterController.number;
    const level = htWriterLevel();
    const columns = localSorobanController.COLUMNS;
    const steps = [];
    const current = [];
    for (let i = 0; i < columns; i++) current.push(0);
    const markerCol = htWriterLevelMarkerCol();

    // At the decimal levels, the first step is to move the decimal point (⚫)
    // to the left: one place for each decimal order of the number (two places
    // for two decimals, three for three, and so on).
    if (localNumberWriterController.levelIdx >= HT_WRITER_INTEGER_LEVELS) {
        steps.push({
            "type": "marker",
            "instruction": TM.getMoveMarkerInstruction(level.decDigits),
            "targetMarker": markerCol
        });
    }

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
        const placeName = TM.getPlace(HT_WRITER_INT_PLACE_KEYS[power]);
        const hint = power === 0 ? TM.get('txt_hintMarker') : TM.get('txt_hintLeft');
        steps.push({
            "type": "digit",
            "instruction": digit === 0
                ? TM.getWriteZeroInstruction(placeName, hint)
                : TM.getWriteDigitInstruction(digit, placeName, hint),
            "target": current.slice()
        });
    }

    // Decimal digits, from the tenths (first column to the right of the point)
    // up to the last decimal order of the level. The point only moves left at
    // the decimal levels: at the integer levels it sits on the rightmost
    // column, so there is no fractional column on the board and no target may
    // reference one. The ".0" readout is still produced by the value display.
    const fracColumns = Math.min(level.decDigits, columns - 1 - markerCol);
    for (let j = 0; j < fracColumns; j++) {
        const digit = number.decDigits[j];
        current[markerCol + 1 + j] = digit;
        const placeName = TM.getPlace(HT_WRITER_DEC_PLACE_KEYS[j]);
        steps.push({
            "type": "digit",
            "instruction": digit === 0
                ? TM.getWriteZeroInstruction(placeName, TM.get('txt_hintRight'))
                : TM.getWriteDigitInstruction(digit, placeName, TM.get('txt_hintRight')),
            "target": current.slice()
        });
    }

    // Final verification step.
    steps.push({
        "type": "digit",
        "instruction": TM.getFinalInstruction(htWriterNumberString(number)),
        "target": current.slice()
    });

    return steps;
}

function htWriterUpdateLevelBadge() {
    const badge = document.getElementById('levelBadge');
    if (badge) {
        badge.innerHTML = localNumberWriterController.TextManager.get('txt_lvl' + localNumberWriterController.levelIdx);
        badge.style.background = HT_WRITER_BADGE_COLORS[localNumberWriterController.levelIdx];
    }
}

function htWriterSetControlButtonsVisibility(show) {
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

function htWriterSetStepVisibility(show) {
    const nextStepBtn = document.getElementById('nextStepBtn');
    if (show) {
        nextStepBtn.classList.remove('hidden');
    } else {
        nextStepBtn.classList.add('hidden');
    }
}

function htWriterStartNewExercise() {
    if (!localSorobanController.canvas || !localNumberWriterController.TextManager) return;
    const ctl = localNumberWriterController;
    ctl.finalCongratsShown = false;
    ctl.exerciseStarted = false;
    ctl.number = htWriterGenerateNumber();
    localSorobanController.decimalMarkerCol = htWriterStartMarkerCol();
    htWriterClearAbacus();
    ctl.steps = htWriterBuildSteps();
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    const TM = ctl.TextManager;
    document.getElementById('problemDisplay').innerHTML = TM.get('txt_problemPrefix') + ' <strong>' + htWriterNumberString(ctl.number) + '</strong>';
    document.getElementById('stepMessage').innerHTML = TM.getStepPrefix() + ' ' + ctl.steps[0].instruction;
    document.getElementById('stepStatus').innerHTML = TM.getStepStatus(1, ctl.steps.length);
    document.getElementById('feedbackArea').innerHTML = '';
    htWriterUpdateLevelBadge();
    htWriterSetControlButtonsVisibility(true);
    htWriterSetStepVisibility(true);
}

function htWriterStepMatches(step) {
    if (step.type === 'marker') {
        return localSorobanController.decimalMarkerCol === step.targetMarker;
    }
    return htWriterDigitsMatch(step.target);
}

function htWriterNextStep() {
    const ctl = localNumberWriterController;
    if (!ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    if (!htWriterStepMatches(ctl.steps[ctl.currentStepIdx])) return;

    if (!ctl.exerciseStarted) {
        ctl.exerciseStarted = true;
        htWriterSetControlButtonsVisibility(false);
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
        document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + TM.getCongratsMessage(htWriterNumberString(ctl.number)) + '</div>';
        htWriterSetControlButtonsVisibility(true);
    }
}

function htWriterNextLevel() {
    const ctl = localNumberWriterController;
    ctl.levelIdx++;
    let wrapped = false;
    if (ctl.levelIdx >= HT_WRITER_LEVELS.length) {
        ctl.levelIdx = 0;
        wrapped = true;
    }
    htWriterUpdateLevelBadge();
    htWriterStartNewExercise();
    if (wrapped) {
        const feedback = document.getElementById('feedbackArea');
        if (feedback) feedback.innerHTML = '<div class="congrats">' + ctl.TextManager.get('txt_finalLevelMessage') + '</div>';
    }
}

window.checkCurrentStepPositive = function() {
    const ctl = localNumberWriterController;
    if (!ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    if (!htWriterStepMatches(ctl.steps[ctl.currentStepIdx])) {
        ctl.stepCompleted = false;
        const feedback = document.getElementById('feedbackArea');
        if (ctl.finalCongratsShown) {
            // The final target was changed after completion: undo the final
            // state so the number can be rebuilt and validated again.
            ctl.finalCongratsShown = false;
            if (feedback) feedback.innerHTML = '';
            htWriterSetStepVisibility(true);
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
            feedback.innerHTML = '<div class="congrats">' + TM.getPerfectMessage(htWriterNumberString(ctl.number)) + '</div>';
            htWriterSetControlButtonsVisibility(true);
            htWriterSetStepVisibility(false);
        }
    } else {
        feedback.innerHTML = '<div class="success-message">' + TM.getCorrectMessage() + '</div>';
    }
};

function htLoadContent() {
    htWriteNavigation();

    localNumberWriterController.TextManager = {
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

        "getMoveMarkerInstruction": function(count) {
            if (count === 1) return this.get('txt_moveMarkerOne');
            return this.format(this.get('txt_moveMarker'), { "count": count });
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

    const TM = localNumberWriterController.TextManager;

    // --- Board adjustments over the shared abacus (ht_abacus.js) ---

    // The "Value" readout shows the number exactly as it is written: the
    // integer families left of the decimal point and the decimal orders of the
    // level to its right. With the point at the rightmost column the readout
    // keeps the integer pattern "N.0".
    htSorobanUpdateDisplay = htWriterUpdateDisplay;

    // The decimal point (⚫) can only be dragged while the game asks for it
    // (the first step of the decimal levels): dragging is enabled exactly on
    // the marker step and disabled everywhere else.
    const htWriterOrigGetHitRegion = htSorobanGetHitRegion;
    htSorobanGetHitRegion = function(mouseX, mouseY) {
        const step = localNumberWriterController.steps[localNumberWriterController.currentStepIdx];
        const hit = htWriterOrigGetHitRegion(mouseX, mouseY);
        if (hit && hit.type === 'decimal_marker' && !(step && step.type === 'marker')) return null;
        return hit;
    };

    // Every bead movement and every decimal-point movement is checked against
    // the current step target.
    const htWriterOrigToggleUpper = htSorobanToggleUpper;
    htSorobanToggleUpper = function(col, beadIdx) {
        htWriterOrigToggleUpper(col, beadIdx);
        if (window.checkCurrentStepPositive) window.checkCurrentStepPositive();
    };
    const htWriterOrigHandleLowerClick = htSorobanHandleLowerClick;
    htSorobanHandleLowerClick = function(col, beadIdx) {
        htWriterOrigHandleLowerClick(col, beadIdx);
        if (window.checkCurrentStepPositive) window.checkCurrentStepPositive();
    };
    const htWriterOrigMoveDecimalMarker = htSorobanMoveDecimalMarkerToColumn;
    htSorobanMoveDecimalMarkerToColumn = function(targetCol) {
        htWriterOrigMoveDecimalMarker(targetCol);
        if (window.checkCurrentStepPositive) window.checkCurrentStepPositive();
    };

    // After switching between Soroban and Suanpan the beads are cleared, so
    // the current step has to be rechecked.
    const htWriterOrigSwitchMode = htSorobanSwitchMode;
    htSorobanSwitchMode = function(mode) {
        htWriterOrigSwitchMode(mode);
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
        localSorobanController.decimalMarkerCol = htWriterStartMarkerCol();
        htWriterClearAbacus();
        const ctl = localNumberWriterController;
        if (!ctl.steps.length) return;
        ctl.currentStepIdx = 0;
        ctl.stepCompleted = false;
        ctl.finalCongratsShown = false;
        const TM = ctl.TextManager;
        document.getElementById('stepMessage').innerHTML = TM.getStepPrefix() + ' ' + ctl.steps[0].instruction;
        document.getElementById('stepStatus').innerHTML = TM.getStepStatus(1, ctl.steps.length);
        document.getElementById('feedbackArea').innerHTML = '';
        htWriterSetStepVisibility(true);
    };

    // --- Buttons ---

    const _ = id => document.getElementById(id);
    _('resetTutorBtn') && (_('resetTutorBtn').onclick = function() { htWriterStartNewExercise(); });
    _('nextLevelBtn') && (_('nextLevelBtn').onclick = function() { htWriterNextLevel(); });
    _('nextStepBtn') && (_('nextStepBtn').onclick = function() { htWriterNextStep(); });
    _('stepMessage') && (_('stepMessage').innerHTML = TM.getStepPrefix() + ' ' + TM.getWelcomeMessage());

    // Start the first exercise once the shared abacus (ht_abacus.js) has
    // initialized the board: its htSorobanLoadContent() runs right after this
    // function in the script loader, so a small defer is enough.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(htWriterStartNewExercise, 0);
        });
    } else {
        setTimeout(htWriterStartNewExercise, 0);
    }

    return false;
}
