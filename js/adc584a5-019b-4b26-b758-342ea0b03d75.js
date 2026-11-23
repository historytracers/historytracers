// SPDX-License-Identifier: GPL-3.0-or-later

// Setting numbers on the Soroban (算盤) and Suanpan (算盤) — a challenge game.
// The abacus board is the shared one (js/ht_abacus.js). This file adds the game
// logic on top of it: a random number is drawn and the user must represent it
// on the abacus. As soon as the whole number is correct the game congratulates
// the user. A "Help me?" button restarts the same number with the step-by-step
// tutor used in the previous practice (js/c0b42835-...).
//
// Like in the integer practices, the decimal point (⚫) starts at the rightmost
// column: the column where it sits is the units. At the decimal levels the
// user must move the point to the left one place for each decimal order of the
// number (two places for two decimals, three for three, and so on), exactly as
// taught in the previous practice.
//
// Levels (8), the same ones used by the previous game:
//   1) UNITS        -> "x.0"        (marker at the right; 1 integer column used)
//   2) TENS         -> "xx.0"       (marker at the right; 2 integer columns)
//   3) HUNDREDS     -> "xxx.0"      (marker at the right; 3 integer columns)
//   4) THOUSANDS    -> "xxxx.0"     (marker at the right; 4 integer columns)
//   5) THOUSANDS    -> "xxxx.dd"    (marker dragged left; 2 decimal columns)
//   6) THOUSANDS    -> "xxxx.ddd"   (marker dragged left; 3 decimal columns)
//   7) THOUSANDS    -> "xxxx.dddd"  (marker dragged left; 4 decimal columns)
//   8) THOUSANDS    -> "xxxx.ddddd" (all 9 columns of the abacus are used)

var localNumberSetterController = {
    "levelIdx": 0,
    "number": null,
    "targetDigits": [],
    "targetMarkerCol": 0,
    "steps": [],
    "currentStepIdx": 0,
    "stepCompleted": false,
    "helpMode": false,
    "solved": false,
    "completedLevels": [false, false, false, false, false, false, false, false],
    "TextManager": null
};

var HT_SETTER_LEVELS = [
    { "intDigits": 1, "decDigits": 1 },
    { "intDigits": 2, "decDigits": 1 },
    { "intDigits": 3, "decDigits": 1 },
    { "intDigits": 4, "decDigits": 1 },
    { "intDigits": 4, "decDigits": 2 },
    { "intDigits": 4, "decDigits": 3 },
    { "intDigits": 4, "decDigits": 4 },
    { "intDigits": 4, "decDigits": 5 }
];

var HT_SETTER_BADGE_COLORS = ["#ffb347", "#4caf50", "#ff7043", "#9c27b0", "#e91e63", "#00bcd4", "#ff9800", "#f44336"];

// Place-name keys by power of ten (10^p) and by decimal order (10^-(d+1)).
var HT_SETTER_INT_PLACE_KEYS = ["units", "tens", "hundreds", "thousands"];
var HT_SETTER_DEC_PLACE_KEYS = ["tenths", "hundredths", "thousandths", "tenthousandths", "hundredthousandths"];

// Number of integer families taught before the decimal levels begin.
var HT_SETTER_INTEGER_LEVELS = 4;

function htSetterLevel() {
    return HT_SETTER_LEVELS[localNumberSetterController.levelIdx];
}

// The decimal point always starts at the rightmost column, keeping the pattern
// used with integer numbers (the column of the point is the units).
function htSetterStartMarkerCol() {
    return localSorobanController.COLUMNS - 1;
}

// The column where the decimal point must sit for the level's number:
// at the integer levels it never moves (rightmost); at the decimal levels it
// moves one place to the left for each decimal order of the number.
function htSetterLevelMarkerCol() {
    const level = htSetterLevel();
    if (localNumberSetterController.levelIdx < HT_SETTER_INTEGER_LEVELS) {
        return htSetterStartMarkerCol();
    }
    return htSetterStartMarkerCol() - level.decDigits;
}

function htSetterGetAbacusDigits(raw) {
    const digits = [];
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        const col = localSorobanController.state[i];
        let value = (col.upper * 5) + col.lower;
        if (!raw && value > 9) value = 9;
        digits.push(value);
    }
    return digits;
}

function htSetterUpdateDisplay() {
    const numSpan = document.getElementById('numericValue');
    if (numSpan && localSorobanController.state && localSorobanController.state.length > 0) {
        const digits = htSetterGetAbacusDigits(false);
        const markerCol = localSorobanController.decimalMarkerCol;
        let intStr = digits.slice(0, markerCol + 1).join('');
        intStr = intStr.replace(/^0+/, '');
        if (intStr === '') intStr = '0';
        let fracStr = digits.slice(markerCol + 1).join('');
        if (fracStr === '') fracStr = '0';
        numSpan.innerText = intStr + '.' + fracStr;
    }
    if (typeof htSorobanCheckOverflow === 'function') htSorobanCheckOverflow();
}

function htSetterClearAbacus() {
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    localSorobanController.isDraggingDecimal = false;
    if (typeof htSorobanRender === 'function') htSorobanRender();
    htSetterUpdateDisplay();
}

function htSetterGenerateNumber() {
    const level = htSetterLevel();
    const intDigits = [];
    if (level.intDigits === 1) {
        // Skip zero: the empty board already represents 0, so it would be a
        // congratulations without any work.
        intDigits.push(1 + Math.floor(Math.random() * 9));
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
        decDigits.push(localNumberSetterController.levelIdx < HT_SETTER_INTEGER_LEVELS ? 0 : Math.floor(Math.random() * 10));
    }
    return { "intDigits": intDigits, "decDigits": decDigits };
}

function htSetterNumberString(number) {
    return number.intDigits.join('') + '.' + number.decDigits.join('');
}

// Build the complete bead picture the target number must produce: every
// column starts empty and only the columns of the number receive a digit.
function htSetterBuildTarget(number) {
    const level = htSetterLevel();
    const columns = localSorobanController.COLUMNS;
    const markerCol = htSetterLevelMarkerCol();
    const digits = [];
    for (let i = 0; i < columns; i++) digits.push(0);

    const firstIntCol = markerCol - level.intDigits + 1;
    for (let i = 0; i < level.intDigits; i++) {
        digits[firstIntCol + i] = number.intDigits[i];
    }

    const fracColumns = Math.min(level.decDigits, columns - 1 - markerCol);
    for (let j = 0; j < fracColumns; j++) {
        digits[markerCol + 1 + j] = number.decDigits[j];
    }
    return { "markerCol": markerCol, "digits": digits };
}

function htSetterBuildSteps() {
    const TM = localNumberSetterController.TextManager;
    const number = localNumberSetterController.number;
    const level = htSetterLevel();
    const columns = localSorobanController.COLUMNS;
    const steps = [];
    const current = [];
    for (let i = 0; i < columns; i++) current.push(0);
    const markerCol = htSetterLevelMarkerCol();

    // At the decimal levels, the first help step is to move the decimal point
    // (⚫) to the left: one place for each decimal order of the number.
    if (localNumberSetterController.levelIdx >= HT_SETTER_INTEGER_LEVELS) {
        steps.push({
            "type": "marker",
            "instruction": TM.getMoveMarkerInstruction(level.decDigits),
            "targetMarker": markerCol
        });
    }

    // Integer digits, from the most significant column down to the units.
    const firstIntCol = markerCol - level.intDigits + 1;
    for (let i = 0; i < level.intDigits; i++) {
        const digit = number.intDigits[i];
        const power = level.intDigits - 1 - i;
        const col = firstIntCol + i;
        current[col] = digit;
        const placeName = TM.getPlace(HT_SETTER_INT_PLACE_KEYS[power]);
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

    // Decimal digits, from the tenths up to the last decimal order of the level.
    const fracColumns = Math.min(level.decDigits, columns - 1 - markerCol);
    for (let j = 0; j < fracColumns; j++) {
        const digit = number.decDigits[j];
        current[markerCol + 1 + j] = digit;
        const placeName = TM.getPlace(HT_SETTER_DEC_PLACE_KEYS[j]);
        steps.push({
            "type": "digit",
            "instruction": digit === 0
                ? TM.getWriteZeroInstruction(placeName, TM.get('txt_hintRight'))
                : TM.getWriteDigitInstruction(digit, placeName, TM.get('txt_hintRight')),
            "target": current.slice(),
            "targetMarker": markerCol
        });
    }

    // Final verification step.
    steps.push({
        "type": "digit",
        "instruction": TM.getFinalInstruction(htSetterNumberString(number)),
        "target": htSetterBuildTarget(number).digits,
        "targetMarker": markerCol
    });

    return steps;
}

function htSetterUpdateLevelBadge() {
    const badge = document.getElementById('levelBadge');
    if (badge) {
        badge.innerHTML = localNumberSetterController.TextManager.get('txt_lvl' + localNumberSetterController.levelIdx);
        badge.style.background = HT_SETTER_BADGE_COLORS[localNumberSetterController.levelIdx];
    }
}

function htSetterSetControlButtonsVisibility(show) {
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

function htSetterSetStepVisibility(show) {
    const nextStepBtn = document.getElementById('nextStepBtn');
    if (!nextStepBtn) return;
    if (show) {
        nextStepBtn.classList.remove('hidden');
    } else {
        nextStepBtn.classList.add('hidden');
    }
}

function htSetterSetHelpVisibility(show) {
    const helpBtn = document.getElementById('helpMeBtn');
    if (!helpBtn) return;
    if (show) {
        helpBtn.classList.remove('hidden');
    } else {
        helpBtn.classList.add('hidden');
    }
}

function htSetterShowProblem() {
    const TM = localNumberSetterController.TextManager;
    const display = document.getElementById('problemDisplay');
    if (display) display.innerHTML = TM.get('txt_problemPrefix') + ' <strong>' + htSetterNumberString(localNumberSetterController.number) + '</strong>';
}

function htSetterShowChallengePrompt() {
    const TM = localNumberSetterController.TextManager;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    if (message) message.innerHTML = TM.get('txt_challengeMessage');
    if (status) status.innerHTML = TM.get('txt_challengeStatus');
}

function htSetterStartNewExercise() {
    if (!localSorobanController.canvas || !localNumberSetterController.TextManager) return;
    const ctl = localNumberSetterController;
    ctl.helpMode = false;
    ctl.solved = false;
    ctl.number = htSetterGenerateNumber();
    const target = htSetterBuildTarget(ctl.number);
    ctl.targetDigits = target.digits;
    ctl.targetMarkerCol = target.markerCol;
    localSorobanController.decimalMarkerCol = htSetterStartMarkerCol();
    htSetterClearAbacus();
    ctl.steps = htSetterBuildSteps();
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    htSetterShowProblem();
    htSetterShowChallengePrompt();
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    htSetterUpdateLevelBadge();
    htSetterSetControlButtonsVisibility(true);
    htSetterSetStepVisibility(false);
    htSetterSetHelpVisibility(true);
}

function htSetterMatchesTarget() {
    const ctl = localNumberSetterController;
    if (!localSorobanController.state || !ctl.targetDigits.length) return false;
    if (localSorobanController.decimalMarkerCol !== ctl.targetMarkerCol) return false;
    const digits = htSetterGetAbacusDigits(true);
    for (let i = 0; i < digits.length; i++) {
        if (digits[i] !== ctl.targetDigits[i]) return false;
    }
    return true;
}

function htSetterCheckChallenge() {
    const ctl = localNumberSetterController;
    if (!ctl.number || ctl.helpMode) return;
    const feedback = document.getElementById('feedbackArea');
    if (!htSetterMatchesTarget()) {
        if (ctl.solved) {
            // The correct number was changed after the congratulations: take
            // the congratulations away and let the user solve it again.
            ctl.solved = false;
            if (feedback) feedback.innerHTML = '';
            htSetterSetHelpVisibility(true);
        }
        return;
    }
    if (ctl.solved) return;
    ctl.solved = true;
    htSetterMarkLevelCompleted();
    if (feedback) feedback.innerHTML = '<div class="congrats">' + ctl.TextManager.getCongratsMessage(htSetterNumberString(ctl.number)) + '</div>';
    htSetterSetStepVisibility(false);
    htSetterSetHelpVisibility(false);
}

function htSetterStartHelp() {
    const ctl = localNumberSetterController;
    if (ctl.helpMode || ctl.solved || !ctl.number) return;
    ctl.helpMode = true;
    ctl.stepCompleted = false;
    localSorobanController.decimalMarkerCol = htSetterStartMarkerCol();
    htSetterClearAbacus();
    ctl.steps = htSetterBuildSteps();
    ctl.currentStepIdx = 0;
    htSetterShowProblem();
    const TM = ctl.TextManager;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    const feedback = document.getElementById('feedbackArea');
    if (message) message.innerHTML = TM.get('txt_helpIntro') + ' ' + ctl.steps[0].instruction;
    if (status) status.innerHTML = TM.getStepStatus(1, ctl.steps.length);
    if (feedback) feedback.innerHTML = '';
    htSetterSetHelpVisibility(false);
    htSetterSetStepVisibility(true);
}

function htSetterStepMarkerMatches(step) {
    const targetMarker = step.targetMarker !== undefined ? step.targetMarker : htSetterLevelMarkerCol();
    return localSorobanController.decimalMarkerCol === targetMarker;
}

function htSetterStepDigitsMatch(step) {
    if (step.type === 'marker') return true;
    const digits = htSetterGetAbacusDigits(true);
    for (let i = 0; i < digits.length; i++) {
        if (digits[i] !== step.target[i]) return false;
    }
    return true;
}

function htSetterStepMatches(step) {
    if (step.type === 'marker') {
        return localSorobanController.decimalMarkerCol === step.targetMarker;
    }
    return htSetterStepMarkerMatches(step) && htSetterStepDigitsMatch(step);
}

function htSetterShowRestoreMarker(step) {
    const TM = localNumberSetterController.TextManager;
    const targetMarker = step.targetMarker !== undefined ? step.targetMarker : htSetterLevelMarkerCol();
    const feedback = document.getElementById('feedbackArea');
    if (feedback) {
        feedback.innerHTML = '<div class="warning-message"><span class="warning-icon">⚠</span><span>' +
            TM.format(TM.get('txt_restoreMarker'), { "column": targetMarker + 1 }) + '</span></div>';
    }
}

function htSetterMarkLevelCompleted() {
    const ctl = localNumberSetterController;
    if (ctl.levelIdx >= 0 && ctl.levelIdx < ctl.completedLevels.length) {
        ctl.completedLevels[ctl.levelIdx] = true;
    }
}

function htSetterFinishHelp() {
    const ctl = localNumberSetterController;
    ctl.helpMode = false;
    ctl.solved = true;
    ctl.stepCompleted = false;
    htSetterMarkLevelCompleted();
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '<div class="congrats">' + ctl.TextManager.getHelpDoneMessage(htSetterNumberString(ctl.number)) + '</div>';
    htSetterSetStepVisibility(false);
    htSetterSetHelpVisibility(false);
    htSetterSetControlButtonsVisibility(true);
}

function htSetterNextStep() {
    const ctl = localNumberSetterController;
    if (!ctl.helpMode || !ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    const step = ctl.steps[ctl.currentStepIdx];
    if (!htSetterStepMatches(step)) {
        if (step.type !== 'marker' && !htSetterStepMarkerMatches(step) && htSetterStepDigitsMatch(step)) {
            htSetterShowRestoreMarker(step);
        }
        return;
    }

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
        setTimeout(function() { if (window.checkCurrentSetterStepPositive) window.checkCurrentSetterStepPositive(); }, 50);
    } else {
        htSetterFinishHelp();
    }
}

function htSetterNextLevel() {
    const ctl = localNumberSetterController;
    ctl.levelIdx++;
    let wrapped = false;
    if (ctl.levelIdx >= HT_SETTER_LEVELS.length) {
        ctl.levelIdx = 0;
        wrapped = true;
    }
    const allLevelsCompleted = ctl.completedLevels.every(Boolean);
    htSetterUpdateLevelBadge();
    htSetterStartNewExercise();
    if (wrapped && allLevelsCompleted) {
        const feedback = document.getElementById('feedbackArea');
        if (feedback) feedback.innerHTML = '<div class="congrats">' + ctl.TextManager.get('txt_finalLevelMessage') + '</div>';
    }
}

function htSetterOnBoardChange() {
    if (localNumberSetterController.helpMode) {
        if (window.checkCurrentSetterStepPositive) window.checkCurrentSetterStepPositive();
    } else {
        htSetterCheckChallenge();
    }
}

window.checkCurrentSetterStepPositive = function() {
    const ctl = localNumberSetterController;
    if (!ctl.helpMode || !ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    const step = ctl.steps[ctl.currentStepIdx];
    const feedback = document.getElementById('feedbackArea');
    if (!htSetterStepMatches(step)) {
        ctl.stepCompleted = false;
        if (step.type !== 'marker' && !htSetterStepMarkerMatches(step) && htSetterStepDigitsMatch(step)) {
            htSetterShowRestoreMarker(step);
        } else if (feedback && feedback.innerHTML && !feedback.innerHTML.includes('congrats')) {
            feedback.innerHTML = '';
        }
        return;
    }
    if (ctl.stepCompleted) return;
    ctl.stepCompleted = true;
    const TM = ctl.TextManager;
    if (ctl.currentStepIdx === ctl.steps.length - 1) {
        htSetterFinishHelp();
    } else if (feedback) {
        feedback.innerHTML = '<div class="success-message">' + TM.getCorrectMessage() + '</div>';
    }
};

function htLoadContent() {
    htWriteNavigation();

    localNumberSetterController.TextManager = {
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

        "getPlace": function(key) {
            return this.get('txt_' + key);
        }
    };

    // --- Board adjustments over the shared abacus (ht_abacus.js) ---

    // The "Value" readout shows the number exactly as it is written: the
    // integer families left of the decimal point and the decimal orders of the
    // level to its right.
    htSorobanUpdateDisplay = htSetterUpdateDisplay;

    // Every bead movement and every decimal-point movement is checked at once:
    // in challenge mode against the whole target number, in help mode against
    // the current step target.
    const htSetterOrigToggleUpper = htSorobanToggleUpper;
    htSorobanToggleUpper = function(col, beadIdx) {
        htSetterOrigToggleUpper(col, beadIdx);
        htSetterOnBoardChange();
    };
    const htSetterOrigHandleLowerClick = htSorobanHandleLowerClick;
    htSorobanHandleLowerClick = function(col, beadIdx) {
        htSetterOrigHandleLowerClick(col, beadIdx);
        htSetterOnBoardChange();
    };
    const htSetterOrigMoveDecimalMarker = htSorobanMoveDecimalMarkerToColumn;
    htSorobanMoveDecimalMarkerToColumn = function(targetCol) {
        htSetterOrigMoveDecimalMarker(targetCol);
        htSetterOnBoardChange();
    };

    // After switching between Soroban and Suanpan the beads are cleared, so
    // the target has to be checked again.
    const htSetterOrigSwitchMode = htSorobanSwitchMode;
    htSorobanSwitchMode = function(mode) {
        htSetterOrigSwitchMode(mode);
        htSetterOnBoardChange();
    };

    // "⟳ Reset abacus" clears every column and restores the decimal point to
    // its starting position. In challenge mode the same number stays, so the
    // user can try again; in help mode the step sequence restarts.
    htSorobanResetSoroban = function() {
        if (localSorobanController._multTimer) {
            clearInterval(localSorobanController._multTimer);
            localSorobanController._multTimer = null;
        }
        localSorobanController.decimalMarkerCol = htSetterStartMarkerCol();
        htSetterClearAbacus();
        const ctl = localNumberSetterController;
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
            htSetterSetHelpVisibility(false);
            htSetterSetStepVisibility(true);
        } else {
            ctl.solved = false;
            htSetterShowChallengePrompt();
            htSetterSetHelpVisibility(true);
            htSetterSetStepVisibility(false);
        }
        if (feedback) feedback.innerHTML = '';
        setTimeout(function() { htSetterOnBoardChange(); }, 0);
    };

    // --- Buttons ---

    const _ = id => document.getElementById(id);
    _('resetTutorBtn') && (_('resetTutorBtn').onclick = function() { htSetterStartNewExercise(); });
    _('nextLevelBtn') && (_('nextLevelBtn').onclick = function() { htSetterNextLevel(); });
    _('nextStepBtn') && (_('nextStepBtn').onclick = function() { htSetterNextStep(); });
    _('helpMeBtn') && (_('helpMeBtn').onclick = function() { htSetterStartHelp(); });
    _('stepMessage') && (_('stepMessage').innerHTML = localNumberSetterController.TextManager.get('txt_challengeMessage'));

    // Start the first exercise once the shared abacus (ht_abacus.js) has
    // initialized the board: its htSorobanLoadContent() runs right after this
    // function in the script loader, so a small defer is enough.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(htSetterStartNewExercise, 0);
        });
    } else {
        setTimeout(htSetterStartNewExercise, 0);
    }

    return false;
}
