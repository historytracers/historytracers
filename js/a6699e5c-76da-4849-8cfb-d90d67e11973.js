// SPDX-License-Identifier: GPL-3.0-or-later

// Setting integer numbers on the Soroban (算盤) and Suanpan (算盤) — a challenge game.
// The abacus board is the shared one (js/ht_abacus.js). This file adds the game
// logic on top of it: a random integer is drawn and the user must represent it
// on the abacus. As soon as the whole number is correct the game congratulates
// the user. A "Help me?" button restarts the same number with the step-by-step
// tutor used in the previous practice (js/02b563cb-...).
//
// This is the integer-only version of the game in
// js/adc584a5-019b-4b26-b758-342ea0b03d75.js. The decimal point (⚫) always stays
// at the rightmost column: the column where it sits is the units, and the columns
// to its left are the other integer families. There are no fractional columns and
// the decimal point is never moved.
//
// Levels: one per available column, from the units (where the decimal point sits)
// up to the leftmost column of the board:
//   1) UNITS             -> "x"
//   2) TENS              -> "xx"
//   3) HUNDREDS          -> "xxx"
//   4) THOUSANDS         -> "xxxx"
//   5) TEN THOUSANDS     -> "xxxxx"
//   6) HUNDRED THOUSANDS -> "xxxxxx"
//   7) MILLIONS          -> "xxxxxxx"
//   8) TEN MILLIONS      -> "xxxxxxxx"
//   9) HUNDRED MILLIONS  -> "xxxxxxxxx"

var localIntegerSetterController = {
    "levelIdx": 0,
    "number": null,
    "targetDigits": [],
    "targetMarkerCol": 0,
    "steps": [],
    "currentStepIdx": 0,
    "stepCompleted": false,
    "helpMode": false,
    "solved": false,
    "completedLevels": [],
    "TextManager": null
};

var HT_INTEGER_SETTER_LEVELS = [];

var HT_INTEGER_SETTER_BADGE_COLORS = [
    "#ffb347", "#4caf50", "#ff7043", "#9c27b0", "#e91e63",
    "#00bcd4", "#ff9800", "#f44336", "#3f51b5"
];

// Place-name keys by power of ten (10^p).
var HT_INTEGER_SETTER_PLACE_KEYS = [
    "units", "tens", "hundreds", "thousands", "tenthousands",
    "hundredthousands", "million", "tenmillions", "hundredmillions"
];

// One level per column, from the units up to the leftmost column of the board.
// The board has a fixed number of columns, so the game goes all the way to the
// last available column instead of stopping at the thousands.
function htIntegerSetterBuildLevels() {
    const columns = (localSorobanController && localSorobanController.COLUMNS) || HT_INTEGER_SETTER_PLACE_KEYS.length;
    const maxDigits = Math.min(columns, HT_INTEGER_SETTER_PLACE_KEYS.length);
    HT_INTEGER_SETTER_LEVELS = [];
    for (let digits = 1; digits <= maxDigits; digits++) {
        HT_INTEGER_SETTER_LEVELS.push({ "intDigits": digits });
    }
}

function htIntegerSetterLevel() {
    return HT_INTEGER_SETTER_LEVELS[localIntegerSetterController.levelIdx];
}

// The decimal point always stays at the rightmost column, so the column where it
// sits is the units and every column to its left is an integer family.
function htIntegerSetterMarkerCol() {
    return localSorobanController.COLUMNS - 1;
}

function htIntegerSetterGetAbacusDigits(raw) {
    const digits = [];
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        const col = localSorobanController.state[i];
        let value = (col.upper * 5) + col.lower;
        if (!raw && value > 9) value = 9;
        digits.push(value);
    }
    return digits;
}

function htIntegerSetterUpdateDisplay() {
    const numSpan = document.getElementById('numericValue');
    if (numSpan && localSorobanController.state && localSorobanController.state.length > 0) {
        const digits = htIntegerSetterGetAbacusDigits(false);
        const markerCol = localSorobanController.decimalMarkerCol;
        let intStr = digits.slice(0, markerCol + 1).join('');
        intStr = intStr.replace(/^0+/, '');
        if (intStr === '') intStr = '0';
        numSpan.innerText = intStr;
    }
    if (typeof htSorobanCheckOverflow === 'function') htSorobanCheckOverflow();
}

function htIntegerSetterClearAbacus() {
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    localSorobanController.isDraggingDecimal = false;
    if (typeof htSorobanRender === 'function') htSorobanRender();
    htIntegerSetterUpdateDisplay();
}

function htIntegerSetterGenerateNumber() {
    const level = htIntegerSetterLevel();
    const intDigits = [];
    if (level.intDigits === 1) {
        // Skip zero: the empty board already represents 0, so it would be a
        // congratulations without any work.
        intDigits.push(1 + Math.floor(Math.random() * 9));
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

function htIntegerSetterNumberString(number) {
    return number.intDigits.join('');
}

// Build the complete bead picture the target number must produce: every
// column starts empty and only the columns of the number receive a digit.
function htIntegerSetterBuildTarget(number) {
    const level = htIntegerSetterLevel();
    const columns = localSorobanController.COLUMNS;
    const markerCol = htIntegerSetterMarkerCol();
    const digits = [];
    for (let i = 0; i < columns; i++) digits.push(0);

    const firstIntCol = markerCol - level.intDigits + 1;
    for (let i = 0; i < level.intDigits; i++) {
        digits[firstIntCol + i] = number.intDigits[i];
    }
    return { "markerCol": markerCol, "digits": digits };
}

function htIntegerSetterBuildSteps() {
    const TM = localIntegerSetterController.TextManager;
    const number = localIntegerSetterController.number;
    const level = htIntegerSetterLevel();
    const columns = localSorobanController.COLUMNS;
    const steps = [];
    const current = [];
    for (let i = 0; i < columns; i++) current.push(0);
    const markerCol = htIntegerSetterMarkerCol();

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
        const placeName = TM.getPlace(HT_INTEGER_SETTER_PLACE_KEYS[power]);
        const hint = power === 0 ? TM.get('txt_hintMarker') : TM.get('txt_hintLeft');
        steps.push({
            "type": "digit",
            "instruction": digit === 0
                ? TM.getWriteZeroInstruction(placeName, hint)
                : TM.getWriteDigitInstruction(digit, placeName, hint),
            "target": current.slice(),
            "targetMarker": markerCol
        });
    }

    // Final verification step.
    steps.push({
        "type": "digit",
        "instruction": TM.getFinalInstruction(htIntegerSetterNumberString(number)),
        "target": htIntegerSetterBuildTarget(number).digits,
        "targetMarker": markerCol
    });

    return steps;
}

function htIntegerSetterUpdateLevelBadge() {
    const badge = document.getElementById('levelBadge');
    if (badge) {
        badge.innerHTML = localIntegerSetterController.TextManager.get('txt_lvl' + localIntegerSetterController.levelIdx);
        badge.style.background = HT_INTEGER_SETTER_BADGE_COLORS[localIntegerSetterController.levelIdx];
    }
}

function htIntegerSetterSetControlButtonsVisibility(show) {
    const resetTutorBtn = document.getElementById('resetTutorBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (!resetTutorBtn || !nextLevelBtn) return;
    if (show) {
        resetTutorBtn.classList.remove('hidden');
        nextLevelBtn.classList.remove('hidden');
    } else {
        resetTutorBtn.classList.add('hidden');
        nextLevelBtn.classList.add('hidden');
    }
}

function htIntegerSetterSetStepVisibility(show) {
    const nextStepBtn = document.getElementById('nextStepBtn');
    if (!nextStepBtn) return;
    if (show) {
        nextStepBtn.classList.remove('hidden');
    } else {
        nextStepBtn.classList.add('hidden');
    }
}

function htIntegerSetterSetHelpVisibility(show) {
    const helpBtn = document.getElementById('helpMeBtn');
    if (!helpBtn) return;
    if (show) {
        helpBtn.classList.remove('hidden');
    } else {
        helpBtn.classList.add('hidden');
    }
}

function htIntegerSetterShowProblem() {
    const TM = localIntegerSetterController.TextManager;
    const display = document.getElementById('problemDisplay');
    if (display) display.innerHTML = TM.get('txt_problemPrefix') + ' <strong>' + htIntegerSetterNumberString(localIntegerSetterController.number) + '</strong>';
}

function htIntegerSetterShowChallengePrompt() {
    const TM = localIntegerSetterController.TextManager;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    if (message) message.innerHTML = TM.get('txt_challengeMessage');
    if (status) status.innerHTML = TM.get('txt_challengeStatus');
}

function htIntegerSetterStartNewExercise() {
    if (!localSorobanController.canvas || !localIntegerSetterController.TextManager) return;
    const ctl = localIntegerSetterController;
    htIntegerSetterBuildLevels();
    if (ctl.levelIdx >= HT_INTEGER_SETTER_LEVELS.length) ctl.levelIdx = 0;
    if (ctl.completedLevels.length !== HT_INTEGER_SETTER_LEVELS.length) {
        ctl.completedLevels = HT_INTEGER_SETTER_LEVELS.map(function() { return false; });
    }
    ctl.helpMode = false;
    ctl.solved = false;
    ctl.number = htIntegerSetterGenerateNumber();
    const target = htIntegerSetterBuildTarget(ctl.number);
    ctl.targetDigits = target.digits;
    ctl.targetMarkerCol = target.markerCol;
    localSorobanController.decimalMarkerCol = htIntegerSetterMarkerCol();
    htIntegerSetterClearAbacus();
    ctl.steps = htIntegerSetterBuildSteps();
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    htIntegerSetterShowProblem();
    htIntegerSetterShowChallengePrompt();
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    htIntegerSetterUpdateLevelBadge();
    htIntegerSetterSetControlButtonsVisibility(true);
    htIntegerSetterSetStepVisibility(false);
    htIntegerSetterSetHelpVisibility(true);
}

function htIntegerSetterMatchesTarget() {
    const ctl = localIntegerSetterController;
    if (!localSorobanController.state || !ctl.targetDigits.length) return false;
    if (localSorobanController.decimalMarkerCol !== ctl.targetMarkerCol) return false;
    const digits = htIntegerSetterGetAbacusDigits(true);
    for (let i = 0; i < digits.length; i++) {
        if (digits[i] !== ctl.targetDigits[i]) return false;
    }
    return true;
}

function htIntegerSetterCheckChallenge() {
    const ctl = localIntegerSetterController;
    if (!ctl.number || ctl.helpMode) return;
    const feedback = document.getElementById('feedbackArea');
    if (!htIntegerSetterMatchesTarget()) {
        if (ctl.solved) {
            // The correct number was changed after the congratulations: take
            // the congratulations away and let the user solve it again.
            ctl.solved = false;
            if (feedback) feedback.innerHTML = '';
            htIntegerSetterSetHelpVisibility(true);
        }
        return;
    }
    if (ctl.solved) return;
    ctl.solved = true;
    htIntegerSetterMarkLevelCompleted();
    if (feedback) feedback.innerHTML = '<div class="congrats">' + ctl.TextManager.getCongratsMessage(htIntegerSetterNumberString(ctl.number)) + '</div>';
    htIntegerSetterSetStepVisibility(false);
    htIntegerSetterSetHelpVisibility(false);
}

function htIntegerSetterStartHelp() {
    const ctl = localIntegerSetterController;
    if (ctl.helpMode || ctl.solved || !ctl.number) return;
    ctl.helpMode = true;
    ctl.stepCompleted = false;
    localSorobanController.decimalMarkerCol = htIntegerSetterMarkerCol();
    htIntegerSetterClearAbacus();
    ctl.steps = htIntegerSetterBuildSteps();
    ctl.currentStepIdx = 0;
    htIntegerSetterShowProblem();
    const TM = ctl.TextManager;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    const feedback = document.getElementById('feedbackArea');
    if (message) message.innerHTML = TM.get('txt_helpIntro') + ' ' + ctl.steps[0].instruction;
    if (status) status.innerHTML = TM.getStepStatus(1, ctl.steps.length);
    if (feedback) feedback.innerHTML = '';
    htIntegerSetterSetHelpVisibility(false);
    htIntegerSetterSetStepVisibility(true);
}

function htIntegerSetterStepMarkerMatches(step) {
    const targetMarker = step.targetMarker !== undefined ? step.targetMarker : htIntegerSetterMarkerCol();
    return localSorobanController.decimalMarkerCol === targetMarker;
}

function htIntegerSetterStepDigitsMatch(step) {
    const digits = htIntegerSetterGetAbacusDigits(true);
    for (let i = 0; i < digits.length; i++) {
        if (digits[i] !== step.target[i]) return false;
    }
    return true;
}

function htIntegerSetterStepMatches(step) {
    return htIntegerSetterStepMarkerMatches(step) && htIntegerSetterStepDigitsMatch(step);
}

function htIntegerSetterMarkLevelCompleted() {
    const ctl = localIntegerSetterController;
    if (ctl.levelIdx >= 0 && ctl.levelIdx < ctl.completedLevels.length) {
        ctl.completedLevels[ctl.levelIdx] = true;
    }
}

function htIntegerSetterFinishHelp() {
    const ctl = localIntegerSetterController;
    ctl.helpMode = false;
    ctl.solved = true;
    ctl.stepCompleted = false;
    htIntegerSetterMarkLevelCompleted();
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '<div class="congrats">' + ctl.TextManager.getHelpDoneMessage(htIntegerSetterNumberString(ctl.number)) + '</div>';
    htIntegerSetterSetStepVisibility(false);
    htIntegerSetterSetHelpVisibility(false);
    htIntegerSetterSetControlButtonsVisibility(true);
}

function htIntegerSetterNextStep() {
    const ctl = localIntegerSetterController;
    if (!ctl.helpMode || !ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    const step = ctl.steps[ctl.currentStepIdx];
    if (!htIntegerSetterStepMatches(step)) return;

    if (ctl.currentStepIdx + 1 < ctl.steps.length) {
        ctl.currentStepIdx++;
        ctl.stepCompleted = false;
        const TM = ctl.TextManager;
        const message = document.getElementById('stepMessage');
        const status = document.getElementById('stepStatus');
        const feedback = document.getElementById('feedbackArea');
        if (message) message.innerHTML = TM.getStepPrefix() + ' ' + ctl.steps[ctl.currentStepIdx].instruction;
        if (status) status.innerHTML = TM.getStepStatus(ctl.currentStepIdx + 1, ctl.steps.length);
        if (feedback) feedback.innerHTML = '';
        setTimeout(function() { if (window.checkCurrentIntegerSetterStepPositive) window.checkCurrentIntegerSetterStepPositive(); }, 50);
    } else {
        htIntegerSetterFinishHelp();
    }
}

function htIntegerSetterNextLevel() {
    const ctl = localIntegerSetterController;
    htIntegerSetterBuildLevels();
    ctl.levelIdx++;
    let wrapped = false;
    if (ctl.levelIdx >= HT_INTEGER_SETTER_LEVELS.length) {
        ctl.levelIdx = 0;
        wrapped = true;
    }
    const allLevelsCompleted = ctl.completedLevels.length > 0 && ctl.completedLevels.every(Boolean);
    htIntegerSetterUpdateLevelBadge();
    htIntegerSetterStartNewExercise();
    if (wrapped && allLevelsCompleted) {
        const feedback = document.getElementById('feedbackArea');
        if (feedback) feedback.innerHTML = '<div class="congrats">' + ctl.TextManager.get('txt_finalLevelMessage') + '</div>';
    }
}

function htIntegerSetterOnBoardChange() {
    if (localIntegerSetterController.helpMode) {
        if (window.checkCurrentIntegerSetterStepPositive) window.checkCurrentIntegerSetterStepPositive();
    } else {
        htIntegerSetterCheckChallenge();
    }
}

window.checkCurrentIntegerSetterStepPositive = function() {
    const ctl = localIntegerSetterController;
    if (!ctl.helpMode || !ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    const step = ctl.steps[ctl.currentStepIdx];
    const feedback = document.getElementById('feedbackArea');
    if (!htIntegerSetterStepMatches(step)) {
        ctl.stepCompleted = false;
        if (feedback && feedback.innerHTML && !feedback.innerHTML.includes('congrats')) {
            feedback.innerHTML = '';
        }
        return;
    }
    if (ctl.stepCompleted) return;
    ctl.stepCompleted = true;
    const TM = ctl.TextManager;
    if (ctl.currentStepIdx === ctl.steps.length - 1) {
        htIntegerSetterFinishHelp();
    } else if (feedback) {
        feedback.innerHTML = '<div class="success-message">' + TM.getCorrectMessage() + '</div>';
    }
};

function htLoadContent() {
    htWriteNavigation();

    localIntegerSetterController.TextManager = {
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

        "getHelpDoneMessage": function(number) {
            return this.format(this.get('txt_helpDoneMessage'), { "number": number });
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

        "getPlace": function(key) {
            return this.get('txt_' + key);
        }
    };

    // --- Board adjustments over the shared abacus (ht_abacus.js) ---

    // The "Value" readout shows the integer number written on the board.
    htSorobanUpdateDisplay = htIntegerSetterUpdateDisplay;

    // This game only works with integer numbers, so the decimal point (⚫) can
    // never be dragged: it always marks the units column at the right.
    const htIntegerSetterOrigGetHitRegion = htSorobanGetHitRegion;
    htSorobanGetHitRegion = function(mouseX, mouseY) {
        localSorobanController.trackClickAllowed = false;
        const hit = htIntegerSetterOrigGetHitRegion(mouseX, mouseY);
        if (hit && hit.type === 'decimal_marker') return null;
        return hit;
    };

    // Every bead movement and every decimal-point movement is checked at once:
    // in challenge mode against the whole target number, in help mode against
    // the current step target.
    const htIntegerSetterOrigToggleUpper = htSorobanToggleUpper;
    htSorobanToggleUpper = function(col, beadIdx) {
        htIntegerSetterOrigToggleUpper(col, beadIdx);
        htIntegerSetterOnBoardChange();
    };
    const htIntegerSetterOrigHandleLowerClick = htSorobanHandleLowerClick;
    htSorobanHandleLowerClick = function(col, beadIdx) {
        htIntegerSetterOrigHandleLowerClick(col, beadIdx);
        htIntegerSetterOnBoardChange();
    };
    const htIntegerSetterOrigMoveDecimalMarker = htSorobanMoveDecimalMarkerToColumn;
    htSorobanMoveDecimalMarkerToColumn = function(targetCol) {
        if (targetCol !== htIntegerSetterMarkerCol()) return;
        htIntegerSetterOrigMoveDecimalMarker(targetCol);
        htIntegerSetterOnBoardChange();
    };

    // After switching between Soroban and Suanpan the beads are cleared, so
    // the target has to be checked again.
    const htIntegerSetterOrigSwitchMode = htSorobanSwitchMode;
    htSorobanSwitchMode = function(mode) {
        htIntegerSetterOrigSwitchMode(mode);
        htIntegerSetterOnBoardChange();
    };

    // "⟳ Reset abacus" clears every column and restores the decimal point to
    // its starting position. In challenge mode the same number stays, so the
    // user can try again; in help mode the step sequence restarts.
    htSorobanResetSoroban = function() {
        if (localSorobanController._multTimer) {
            clearInterval(localSorobanController._multTimer);
            localSorobanController._multTimer = null;
        }
        localSorobanController.decimalMarkerCol = htIntegerSetterMarkerCol();
        htIntegerSetterClearAbacus();
        const ctl = localIntegerSetterController;
        if (!ctl.number) return;
        const TM = ctl.TextManager;
        const message = document.getElementById('stepMessage');
        const status = document.getElementById('stepStatus');
        const feedback = document.getElementById('feedbackArea');
        if (ctl.helpMode) {
            ctl.currentStepIdx = 0;
            ctl.stepCompleted = false;
            if (message) message.innerHTML = TM.get('txt_helpIntro') + ' ' + ctl.steps[0].instruction;
            if (status) status.innerHTML = TM.getStepStatus(1, ctl.steps.length);
            htIntegerSetterSetHelpVisibility(false);
            htIntegerSetterSetStepVisibility(true);
        } else {
            ctl.solved = false;
            htIntegerSetterShowChallengePrompt();
            htIntegerSetterSetHelpVisibility(true);
            htIntegerSetterSetStepVisibility(false);
        }
        if (feedback) feedback.innerHTML = '';
        setTimeout(function() { htIntegerSetterOnBoardChange(); }, 0);
    };

    // --- Buttons ---

    const _ = id => document.getElementById(id);
    _('resetTutorBtn') && (_('resetTutorBtn').onclick = function() { htIntegerSetterStartNewExercise(); });
    _('nextLevelBtn') && (_('nextLevelBtn').onclick = function() { htIntegerSetterNextLevel(); });
    _('nextStepBtn') && (_('nextStepBtn').onclick = function() { htIntegerSetterNextStep(); });
    _('helpMeBtn') && (_('helpMeBtn').onclick = function() { htIntegerSetterStartHelp(); });
    _('stepMessage') && (_('stepMessage').innerHTML = localIntegerSetterController.TextManager.get('txt_challengeMessage'));

    // Start the first exercise once the shared abacus (ht_abacus.js) has
    // initialized the board: its htSorobanLoadContent() runs right after this
    // function in the script loader, so a small defer is enough.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(htIntegerSetterStartNewExercise, 0);
        });
    } else {
        setTimeout(htIntegerSetterStartNewExercise, 0);
    }

    return false;
}
