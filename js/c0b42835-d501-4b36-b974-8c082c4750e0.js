// SPDX-License-Identifier: GPL-3.0-or-later

// Writing numbers on the Soroban (算盤) and Suanpan (算盤) — a level-based tutor.
// The abacus board is the shared one (js/ht_abacus.js). This file adds the game
// logic on top of it: a random number is drawn and the user has to represent it
// bead by bead, guided step by step, while learning how numbers are written.
//
// Levels (8, one decimal point position each):
//   1) UNITS        -> "x.0"        (1 integer column  + 1 decimal column)
//   2) TENS         -> "xx.0"       (2 integer columns + 1 decimal column)
//   3) HUNDREDS     -> "xxx.0"      (3 integer columns + 1 decimal column)
//   4) THOUSANDS    -> "xxxx.0"     (4 integer columns + 1 decimal column)
//   5) THOUSANDS    -> "xxxx.dd"    (4 integer columns + 2 decimal columns)
//   6) THOUSANDS    -> "xxxx.ddd"   (4 integer columns + 3 decimal columns)
//   7) THOUSANDS    -> "xxxx.dddd"  (4 integer columns + 4 decimal columns)
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

function htWriterLevel() {
    return HT_WRITER_LEVELS[localNumberWriterController.levelIdx];
}

function htWriterMarkerCol() {
    return htWriterLevel().intDigits - 1;
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
        const markerCol = htWriterMarkerCol();
        let intStr = digits.slice(0, markerCol + 1).join('');
        intStr = intStr.replace(/^0+/, '');
        if (intStr === '') intStr = '0';
        const fracStr = digits.slice(markerCol + 1, markerCol + 1 + level.decDigits).join('');
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
        decDigits.push(localNumberWriterController.levelIdx < 4 ? 0 : Math.floor(Math.random() * 10));
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
    const steps = [];
    const current = [];
    for (let i = 0; i < localSorobanController.COLUMNS; i++) current.push(0);

    // Integer digits, from the most significant column (left of the point)
    // down to the units column, exactly in the order the number is written.
    for (let i = 0; i < level.intDigits; i++) {
        const digit = number.intDigits[i];
        const power = level.intDigits - 1 - i;
        current[i] = digit;
        const placeName = TM.getPlace(HT_WRITER_INT_PLACE_KEYS[power]);
        steps.push({
            "instruction": digit === 0
                ? TM.getWriteZeroInstruction(placeName, TM.get('txt_hintLeft'))
                : TM.getWriteDigitInstruction(digit, placeName, TM.get('txt_hintLeft')),
            "target": current.slice()
        });
    }

    // Decimal digits, from the tenths (first column to the right of the point)
    // up to the last decimal order of the level.
    for (let j = 0; j < level.decDigits; j++) {
        const digit = number.decDigits[j];
        current[level.intDigits + j] = digit;
        const placeName = TM.getPlace(HT_WRITER_DEC_PLACE_KEYS[j]);
        steps.push({
            "instruction": digit === 0
                ? TM.getWriteZeroInstruction(placeName, TM.get('txt_hintRight'))
                : TM.getWriteDigitInstruction(digit, placeName, TM.get('txt_hintRight')),
            "target": current.slice()
        });
    }

    // Final verification step.
    steps.push({
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
    localSorobanController.decimalMarkerCol = htWriterMarkerCol();
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

function htWriterNextStep() {
    const ctl = localNumberWriterController;
    if (!ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    if (!htWriterDigitsMatch(ctl.steps[ctl.currentStepIdx].target)) return;

    if (!ctl.exerciseStarted && ctl.currentStepIdx === 0) {
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
    if (!htWriterDigitsMatch(ctl.steps[ctl.currentStepIdx].target)) {
        ctl.stepCompleted = false;
        const feedback = document.getElementById('feedbackArea');
        if (feedback && feedback.innerHTML && !feedback.innerHTML.includes('congrats')) {
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

    // The "Value" readout shows the number exactly as it is written at the
    // current level: the integer families left of the decimal point and only
    // the decimal orders of the level to its right.
    htSorobanUpdateDisplay = htWriterUpdateDisplay;

    // The decimal point (⚫) is fixed by level: it always marks the units
    // column, so dragging it along the track is disabled.
    const htWriterOrigGetHitRegion = htSorobanGetHitRegion;
    htSorobanGetHitRegion = function(mouseX, mouseY) {
        const hit = htWriterOrigGetHitRegion(mouseX, mouseY);
        if (hit && hit.type === 'decimal_marker') return null;
        return hit;
    };

    // Every bead movement is checked against the current step target.
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

    // After switching between Soroban and Suanpan the beads are cleared, so
    // the current step has to be rechecked.
    const htWriterOrigSwitchMode = htSorobanSwitchMode;
    htSorobanSwitchMode = function(mode) {
        htWriterOrigSwitchMode(mode);
        if (window.checkCurrentStepPositive) window.checkCurrentStepPositive();
    };

    // "⟳ Reset abacus" clears every column and restores the decimal point of
    // the current level (the user then repeats the current step).
    htSorobanResetSoroban = function() {
        if (localSorobanController._multTimer) {
            clearInterval(localSorobanController._multTimer);
            localSorobanController._multTimer = null;
        }
        localSorobanController.decimalMarkerCol = htWriterMarkerCol();
        htWriterClearAbacus();
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
