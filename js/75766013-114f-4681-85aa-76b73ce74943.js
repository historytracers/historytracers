// SPDX-License-Identifier: GPL-3.0-or-later

// Representing a number chosen by the user on the Soroban (算盤) and Suanpan (算盤).
// The abacus board is the shared one (js/ht_abacus.js). Unlike the previous games,
// the number is not drawn at random: the user types any value from 0.00000001
// to 999999999, provided it fits in the nine columns of the abacus.
// "Represent" starts the free challenge; "Help me?" teaches the same chosen
// number step by step, in the style of the earlier practice game.
//
// The decimal point (⚫) starts at the rightmost column: the column where it
// sits is the units. For a number with d decimals the point must be moved d
// places to the left, so that d columns remain on its right.
//
// The eight level badges of the previous games are kept as a progress marker.

var localChosenNumberController = {
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

var HT_CHOOSER_LEVELS = [
    { "intDigits": 1, "decDigits": 1 },
    { "intDigits": 2, "decDigits": 1 },
    { "intDigits": 3, "decDigits": 1 },
    { "intDigits": 4, "decDigits": 1 },
    { "intDigits": 4, "decDigits": 2 },
    { "intDigits": 4, "decDigits": 3 },
    { "intDigits": 4, "decDigits": 4 },
    { "intDigits": 4, "decDigits": 5 }
];

var HT_CHOOSER_BADGE_COLORS = ["#ffb347", "#4caf50", "#ff7043", "#9c27b0", "#e91e63", "#00bcd4", "#ff9800", "#f44336"];

// Place-name keys by power of ten (10^p) and by decimal order (10^-(d+1)).
var HT_CHOOSER_INT_PLACE_KEYS = ["units", "tens", "hundreds", "thousands", "tenthousands", "hundredthousands", "millions", "tenmillions", "hundredmillions"];
var HT_CHOOSER_DEC_PLACE_KEYS = ["tenths", "hundredths", "thousandths", "tenthousandths", "hundredthousandths", "millionths", "tenmillionths", "hundredmillionths"];

var HT_CHOOSER_MIN = 0.00000001;
var HT_CHOOSER_MAX = 999999999;
// String(1e-8) renders as "1e-8", so keep plain decimal text for messages.
var HT_CHOOSER_MIN_TEXT = "0.00000001";
var HT_CHOOSER_MAX_TEXT = "999999999";

function htChooserLevel() {
    return HT_CHOOSER_LEVELS[localChosenNumberController.levelIdx];
}

function htChooserStartMarkerCol() {
    return localSorobanController.COLUMNS - 1;
}

function htChooserGetAbacusDigits(raw) {
    const digits = [];
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        const col = localSorobanController.state[i];
        let value = (col.upper * 5) + col.lower;
        if (!raw && value > 9) value = 9;
        digits.push(value);
    }
    return digits;
}

function htChooserUpdateDisplay() {
    const numSpan = document.getElementById('numericValue');
    if (numSpan && localSorobanController.state && localSorobanController.state.length > 0) {
        const digits = htChooserGetAbacusDigits(false);
        const markerCol = localSorobanController.decimalMarkerCol;
        let intStr = digits.slice(0, markerCol + 1).join('');
        intStr = intStr.replace(/^0+/, '');
        if (intStr === '') intStr = '0';
        let fracStr = digits.slice(markerCol + 1).join('');
        if (fracStr === '') fracStr = '0';
        numSpan.innerText = intStr + '.' + fracStr;
    }
    if (typeof htSorobanCheckOverflow === 'function') htSorobanCheckOverflow();
    // Every board interaction funnels through the display update. Checking here
    // as well as in the event wrappers guarantees that reaching the chosen
    // number always shows the congratulations, whichever way the beads were
    // moved (mouse, touch or keyboard).
    htChooserOnBoardChange();
}

function htChooserClearAbacus() {
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    localSorobanController.isDraggingDecimal = false;
    if (typeof htSorobanRender === 'function') htSorobanRender();
    htChooserUpdateDisplay();
}

// Parse and validate the number typed by the user. It must be in the allowed
// range and its integer and decimal digits together must fit the nine columns.
function htChooserParseNumber(raw) {
    const text = String(raw === undefined || raw === null ? '' : raw).trim();
    if (!/^\d+(?:\.\d+)?$/.test(text)) return { "error": "txt_invalidFormat" };
    const parts = text.split('.');
    let intStr = parts[0].replace(/^0+(?=\d)/, '');
    if (intStr === '') intStr = '0';
    const fracStr = parts.length > 1 ? parts[1] : '';
    const value = Number(text);
    if (!(value >= HT_CHOOSER_MIN && value <= HT_CHOOSER_MAX)) return { "error": "txt_invalidRange" };
    if (intStr.length + fracStr.length > localSorobanController.COLUMNS) return { "error": "txt_invalidColumns" };
    return {
        "intDigits": intStr.split('').map(Number),
        "decDigits": fracStr === '' ? [] : fracStr.split('').map(Number),
        "text": intStr + (fracStr === '' ? '' : '.' + fracStr)
    };
}

function htChooserNumberString(number) {
    return number.text;
}

function htChooserShowError(errorId) {
    const el = document.getElementById('chooseError');
    if (!el) return;
    const TM = localChosenNumberController.TextManager;
    if (!TM) return;
    el.innerHTML = TM.format(TM.get(errorId), {
        "min": HT_CHOOSER_MIN_TEXT,
        "max": HT_CHOOSER_MAX_TEXT,
        "columns": localSorobanController.COLUMNS
    });
}

function htChooserReadNumber() {
    const input = document.getElementById('chosenNumberInput');
    const parsed = htChooserParseNumber(input ? input.value : '');
    const error = document.getElementById('chooseError');
    if (parsed.error) {
        htChooserShowError(parsed.error);
        return null;
    }
    if (error) error.innerHTML = '';
    return parsed;
}

// Build the complete bead picture of the chosen number: every column starts
// empty and only the columns used by the number receive digits.
function htChooserBuildTarget(number) {
    const columns = localSorobanController.COLUMNS;
    const markerCol = columns - 1 - number.decDigits.length;
    const digits = [];
    for (let i = 0; i < columns; i++) digits.push(0);
    const firstIntCol = markerCol - number.intDigits.length + 1;
    for (let i = 0; i < number.intDigits.length; i++) {
        digits[firstIntCol + i] = number.intDigits[i];
    }
    for (let j = 0; j < number.decDigits.length; j++) {
        digits[markerCol + 1 + j] = number.decDigits[j];
    }
    return { "markerCol": markerCol, "digits": digits };
}

function htChooserBuildSteps() {
    const TM = localChosenNumberController.TextManager;
    const number = localChosenNumberController.number;
    const columns = localSorobanController.COLUMNS;
    const steps = [];
    const current = [];
    for (let i = 0; i < columns; i++) current.push(0);
    const markerCol = columns - 1 - number.decDigits.length;

    // For a number with decimals the first step is moving the decimal point.
    if (number.decDigits.length > 0) {
        steps.push({
            "type": "marker",
            "instruction": TM.getMoveMarkerInstruction(number.decDigits.length),
            "targetMarker": markerCol
        });
    }

    // Integer digits, from the most significant to the units.
    const firstIntCol = markerCol - number.intDigits.length + 1;
    for (let i = 0; i < number.intDigits.length; i++) {
        const digit = number.intDigits[i];
        const power = number.intDigits.length - 1 - i;
        const col = firstIntCol + i;
        current[col] = digit;
        const placeName = TM.getPlace(HT_CHOOSER_INT_PLACE_KEYS[power]);
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

    // Decimal digits, from tenths to the last decimal order of the number.
    for (let j = 0; j < number.decDigits.length; j++) {
        const digit = number.decDigits[j];
        current[markerCol + 1 + j] = digit;
        const placeName = TM.getPlace(HT_CHOOSER_DEC_PLACE_KEYS[j]);
        steps.push({
            "type": "digit",
            "instruction": digit === 0
                ? TM.getWriteZeroInstruction(placeName, TM.get('txt_hintRight'))
                : TM.getWriteDigitInstruction(digit, placeName, TM.get('txt_hintRight')),
            "target": current.slice(),
            "targetMarker": markerCol
        });
    }

    steps.push({
        "type": "digit",
        "instruction": TM.getFinalInstruction(htChooserNumberString(number)),
        "target": htChooserBuildTarget(number).digits,
        "targetMarker": markerCol
    });
    return steps;
}

function htChooserUpdateLevelBadge() {
    const label = localChosenNumberController.TextManager.get('txt_lvl' + localChosenNumberController.levelIdx);
    const color = HT_CHOOSER_BADGE_COLORS[localChosenNumberController.levelIdx];
    ['levelBadge', 'setupLevelBadge'].forEach(function(id) {
        const badge = document.getElementById(id);
        if (badge) {
            badge.innerHTML = label;
            badge.style.background = color;
        }
    });
}

function htChooserSetControlButtonsVisibility(show) {
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (!nextLevelBtn) return;
    if (show) nextLevelBtn.classList.remove('hidden');
    else nextLevelBtn.classList.add('hidden');
}

function htChooserSetStepVisibility(show) {
    const nextStepBtn = document.getElementById('nextStepBtn');
    if (!nextStepBtn) return;
    if (show) nextStepBtn.classList.remove('hidden');
    else nextStepBtn.classList.add('hidden');
}

// "Help me?" is offered while the chosen number is waiting on the board. It
// stays available for the whole unsolved challenge and is only hidden when
// guided help starts or the challenge succeeds.
function htChooserSetHelpVisibility(show) {
    const helpBtn = document.getElementById('gameHelpBtn');
    if (!helpBtn) return;
    if (show) helpBtn.classList.remove('hidden');
    else helpBtn.classList.add('hidden');
}

function htChooserHideHelpAfterInteraction() {
    const ctl = localChosenNumberController;
    if (ctl.helpMode || ctl.solved || !ctl.number) htChooserSetHelpVisibility(false);
}

// The number is chosen on its own screen: the abacus is only revealed once a
// valid number has been submitted, the same pattern used by the other
// "chosen numbers" games.
function htChooserShowSetup() {
    const setup = document.getElementById('chooserSetup');
    const game = document.getElementById('chooserGame');
    if (setup) setup.classList.remove('htChooserHidden');
    if (game) game.classList.add('htChooserHidden');
}

function htChooserShowGame() {
    const setup = document.getElementById('chooserSetup');
    const game = document.getElementById('chooserGame');
    if (setup) setup.classList.add('htChooserHidden');
    if (game) game.classList.remove('htChooserHidden');
    // The canvas uses its width attribute for layout, but recomputing keeps
    // the mouse hit regions accurate after the container becomes visible.
    if (typeof htSorobanComputeLayout === 'function') htSorobanComputeLayout();
    if (typeof htSorobanRender === 'function') htSorobanRender();
}

// Congratulations are shown once, in the feedback area below the tutor panel.
function htChooserShowCongrats(html) {
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '<div class="congrats">' + html + '</div>';
    const message = document.getElementById('stepMessage');
    if (message) message.innerHTML = '';
}

function htChooserClearCongrats() {
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    htChooserShowChallengePrompt();
}

function htChooserShowProblem() {
    const display = document.getElementById('problemDisplay');
    const TM = localChosenNumberController.TextManager;
    if (display) display.innerHTML = TM.get('txt_problemPrefix') + ' <strong>' + htChooserNumberString(localChosenNumberController.number) + '</strong>';
}

function htChooserShowChallengePrompt() {
    const TM = localChosenNumberController.TextManager;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    if (message) message.innerHTML = TM.get('txt_challengeMessage');
    if (status) status.innerHTML = TM.get('txt_challengeStatus');
}

function htChooserStartChallenge() {
    const ctl = localChosenNumberController;
    if (!localSorobanController.canvas || !ctl.TextManager) return;
    const number = htChooserReadNumber();
    if (!number) return;
    htChooserShowGame();
    ctl.number = number;
    ctl.helpMode = false;
    ctl.solved = false;
    const target = htChooserBuildTarget(number);
    ctl.targetDigits = target.digits;
    ctl.targetMarkerCol = target.markerCol;
    localSorobanController.decimalMarkerCol = htChooserStartMarkerCol();
    // Set up the step state before clearing the board: clearing triggers a
    // board-change check, which must not see steps left over from a previous game.
    ctl.steps = htChooserBuildSteps();
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    htChooserClearAbacus();
    htChooserShowProblem();
    htChooserShowChallengePrompt();
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    htChooserUpdateLevelBadge();
    htChooserSetControlButtonsVisibility(true);
    htChooserSetStepVisibility(false);
    htChooserSetHelpVisibility(true);
}

function htChooserMatchesTarget() {
    const ctl = localChosenNumberController;
    if (!localSorobanController.state || !ctl.targetDigits.length) return false;
    if (localSorobanController.decimalMarkerCol !== ctl.targetMarkerCol) return false;
    const digits = htChooserGetAbacusDigits(true);
    for (let i = 0; i < digits.length; i++) {
        if (digits[i] !== ctl.targetDigits[i]) return false;
    }
    return true;
}

function htChooserCheckChallenge() {
    const ctl = localChosenNumberController;
    if (!ctl.number || ctl.helpMode) return;
    if (!htChooserMatchesTarget()) {
        if (ctl.solved) {
            ctl.solved = false;
            htChooserClearCongrats();
        }
        return;
    }
    if (ctl.solved) return;
    ctl.solved = true;
    htChooserMarkLevelCompleted();
    htChooserShowCongrats(ctl.TextManager.getCongratsMessage(htChooserNumberString(ctl.number)));
    htChooserSetStepVisibility(false);
    htChooserSetHelpVisibility(false);
}

function htChooserStartHelp() {
    const ctl = localChosenNumberController;
    if (!localSorobanController.canvas || !ctl.TextManager) return;
    // The setup screen reads the input; the game panel reuses the chosen number.
    const number = ctl.number || htChooserReadNumber();
    if (!number) return;
    htChooserShowGame();
    ctl.number = number;
    ctl.helpMode = true;
    ctl.solved = false;
    ctl.stepCompleted = false;
    htChooserSetHelpVisibility(false);
    const target = htChooserBuildTarget(number);
    ctl.targetDigits = target.digits;
    ctl.targetMarkerCol = target.markerCol;
    localSorobanController.decimalMarkerCol = htChooserStartMarkerCol();
    // Set up the step state before clearing the board: clearing triggers a
    // board-change check, which must not see steps left over from a previous game.
    ctl.steps = htChooserBuildSteps();
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    htChooserClearAbacus();
    htChooserShowProblem();
    const TM = ctl.TextManager;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    const feedback = document.getElementById('feedbackArea');
    if (message) message.innerHTML = TM.get('txt_helpIntro') + ' ' + ctl.steps[0].instruction;
    if (status) status.innerHTML = TM.getStepStatus(1, ctl.steps.length);
    if (feedback) feedback.innerHTML = '';
    htChooserSetStepVisibility(true);
}

function htChooserStepMarkerMatches(step) {
    const targetMarker = step.targetMarker !== undefined ? step.targetMarker : htChooserBuildTarget(localChosenNumberController.number).markerCol;
    return localSorobanController.decimalMarkerCol === targetMarker;
}

function htChooserStepDigitsMatch(step) {
    if (step.type === 'marker') return true;
    const digits = htChooserGetAbacusDigits(true);
    for (let i = 0; i < digits.length; i++) {
        if (digits[i] !== step.target[i]) return false;
    }
    return true;
}

function htChooserStepMatches(step) {
    if (step.type === 'marker') {
        return localSorobanController.decimalMarkerCol === step.targetMarker;
    }
    return htChooserStepMarkerMatches(step) && htChooserStepDigitsMatch(step);
}

function htChooserShowRestoreMarker(step) {
    const TM = localChosenNumberController.TextManager;
    const targetMarker = step.targetMarker !== undefined ? step.targetMarker : htChooserBuildTarget(localChosenNumberController.number).markerCol;
    const feedback = document.getElementById('feedbackArea');
    if (feedback) {
        feedback.innerHTML = '<div class="warning-message"><span class="warning-icon">⚠</span><span>' +
            TM.format(TM.get('txt_restoreMarker'), { "column": targetMarker + 1 }) + '</span></div>';
    }
}

function htChooserMarkLevelCompleted() {
    const ctl = localChosenNumberController;
    if (ctl.levelIdx >= 0 && ctl.levelIdx < ctl.completedLevels.length) {
        ctl.completedLevels[ctl.levelIdx] = true;
    }
}

function htChooserFinishHelp() {
    const ctl = localChosenNumberController;
    ctl.helpMode = false;
    ctl.solved = true;
    ctl.stepCompleted = false;
    htChooserMarkLevelCompleted();
    htChooserShowCongrats(ctl.TextManager.getHelpDoneMessage(htChooserNumberString(ctl.number)));
    htChooserSetStepVisibility(false);
}

function htChooserNextStep() {
    const ctl = localChosenNumberController;
    if (!ctl.helpMode || !ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    const step = ctl.steps[ctl.currentStepIdx];
    if (!htChooserStepMatches(step)) {
        if (step.type !== 'marker' && !htChooserStepMarkerMatches(step) && htChooserStepDigitsMatch(step)) {
            htChooserShowRestoreMarker(step);
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
        setTimeout(function() { if (window.checkCurrentChosenStepPositive) window.checkCurrentChosenStepPositive(); }, 50);
    } else {
        htChooserFinishHelp();
    }
}

function htChooserNewNumber() {
    const ctl = localChosenNumberController;
    if (!localSorobanController.canvas || !ctl.TextManager) return;
    const TM = ctl.TextManager;
    ctl.helpMode = false;
    ctl.solved = false;
    ctl.number = null;
    ctl.targetDigits = [];
    ctl.steps = [];
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    const input = document.getElementById('chosenNumberInput');
    if (input) input.value = '';
    const error = document.getElementById('chooseError');
    if (error) error.innerHTML = '';
    const setupMessage = document.getElementById('setupMessage');
    if (setupMessage) setupMessage.innerHTML = '';
    const display = document.getElementById('problemDisplay');
    if (display) display.innerHTML = TM.get('txt_problemPrefix') + ' 🎯';
    const message = document.getElementById('stepMessage');
    if (message) message.innerHTML = TM.get('txt_challengeMessage');
    const status = document.getElementById('stepStatus');
    if (status) status.innerHTML = TM.get('txt_challengeStatus');
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    localSorobanController.decimalMarkerCol = htChooserStartMarkerCol();
    htChooserClearAbacus();
    htChooserUpdateLevelBadge();
    htChooserSetControlButtonsVisibility(true);
    htChooserSetStepVisibility(false);
    htChooserSetHelpVisibility(false);
    htChooserShowSetup();
    if (input) input.focus();
}

function htChooserNextLevel() {
    const ctl = localChosenNumberController;
    ctl.levelIdx++;
    let wrapped = false;
    if (ctl.levelIdx >= HT_CHOOSER_LEVELS.length) {
        ctl.levelIdx = 0;
        wrapped = true;
    }
    const allLevelsCompleted = ctl.completedLevels.every(Boolean);
    htChooserNewNumber();
    if (wrapped && allLevelsCompleted) {
        const setupMessage = document.getElementById('setupMessage');
        if (setupMessage) setupMessage.innerHTML = '<div class="congrats">' + ctl.TextManager.get('txt_finalLevelMessage') + '</div>';
    }
}

function htChooserOnBoardChange() {
    if (localChosenNumberController.helpMode) {
        if (window.checkCurrentChosenStepPositive) window.checkCurrentChosenStepPositive();
    } else {
        htChooserCheckChallenge();
    }
}

window.checkCurrentChosenStepPositive = function() {
    const ctl = localChosenNumberController;
    if (!ctl.helpMode || !ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    const step = ctl.steps[ctl.currentStepIdx];
    const feedback = document.getElementById('feedbackArea');
    if (!htChooserStepMatches(step)) {
        ctl.stepCompleted = false;
        if (step.type !== 'marker' && !htChooserStepMarkerMatches(step) && htChooserStepDigitsMatch(step)) {
            htChooserShowRestoreMarker(step);
        } else if (feedback && feedback.innerHTML && !feedback.innerHTML.includes('congrats')) {
            feedback.innerHTML = '';
        }
        return;
    }
    if (ctl.stepCompleted) return;
    ctl.stepCompleted = true;
    const TM = ctl.TextManager;
    if (ctl.currentStepIdx === ctl.steps.length - 1) {
        htChooserFinishHelp();
    } else if (feedback) {
        feedback.innerHTML = '<div class="success-message">' + TM.getCorrectMessage() + '</div>';
    }
};

function htLoadContent() {
    htWriteNavigation();

    localChosenNumberController.TextManager = {
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

    htSorobanUpdateDisplay = htChooserUpdateDisplay;

    const htChooserOrigToggleUpper = htSorobanToggleUpper;
    htSorobanToggleUpper = function(col, beadIdx) {
        htChooserOrigToggleUpper(col, beadIdx);
        htChooserHideHelpAfterInteraction();
        htChooserOnBoardChange();
    };
    const htChooserOrigHandleLowerClick = htSorobanHandleLowerClick;
    htSorobanHandleLowerClick = function(col, beadIdx) {
        htChooserOrigHandleLowerClick(col, beadIdx);
        htChooserHideHelpAfterInteraction();
        htChooserOnBoardChange();
    };
    const htChooserOrigMoveDecimalMarker = htSorobanMoveDecimalMarkerToColumn;
    htSorobanMoveDecimalMarkerToColumn = function(targetCol) {
        htChooserOrigMoveDecimalMarker(targetCol);
        htChooserHideHelpAfterInteraction();
        htChooserOnBoardChange();
    };
    const htChooserOrigSwitchMode = htSorobanSwitchMode;
    htSorobanSwitchMode = function(mode) {
        htChooserOrigSwitchMode(mode);
        htChooserHideHelpAfterInteraction();
        htChooserOnBoardChange();
    };

    // "⟳ Reset abacus" keeps the chosen number: it only clears the board and,
    // in help mode, rewinds the step sequence.
    htSorobanResetSoroban = function() {
        if (localSorobanController._multTimer) {
            clearInterval(localSorobanController._multTimer);
            localSorobanController._multTimer = null;
        }
        localSorobanController.decimalMarkerCol = htChooserStartMarkerCol();
        htChooserClearAbacus();
        const ctl = localChosenNumberController;
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
            htChooserSetStepVisibility(true);
        } else {
            ctl.solved = false;
            htChooserShowChallengePrompt();
            htChooserSetStepVisibility(false);
        }
        if (feedback) feedback.innerHTML = '';
        setTimeout(function() { htChooserOnBoardChange(); }, 0);
    };

    // --- Buttons ---

    const _ = id => document.getElementById(id);
    _('representBtn') && (_('representBtn').onclick = function() { htChooserStartChallenge(); });
    _('helpMeBtn') && (_('helpMeBtn').onclick = function() { htChooserStartHelp(); });
    _('gameHelpBtn') && (_('gameHelpBtn').onclick = function() { htChooserStartHelp(); });
    _('resetTutorBtn') && (_('resetTutorBtn').onclick = function() { htChooserNewNumber(); });
    _('nextLevelBtn') && (_('nextLevelBtn').onclick = function() { htChooserNextLevel(); });
    _('nextStepBtn') && (_('nextStepBtn').onclick = function() { htChooserNextStep(); });
    _('chosenNumberInput') && (_('chosenNumberInput').onkeydown = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            htChooserStartChallenge();
        }
    });

    // htSorobanLoadContent() runs after this function in the script loader, so
    // the initial UI is set up after the board has been initialized.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(htChooserNewNumber, 0);
        });
    } else {
        setTimeout(htChooserNewNumber, 0);
    }

    return false;
}
