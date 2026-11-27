// SPDX-License-Identifier: GPL-3.0-or-later

// Representing an integer number chosen by the user on the Schyoty (счёты).
// The board is the horizontal Schyoty used in 1aad8822-1ace-45fd-954e-833799836d1a:
// each row holds ten beads of value one, and the row r counts 10^r. Unlike the
// practice game, the number is not drawn: the user types any whole value from
// 0 to 99999999. "Represent" starts the free challenge; "Help me?" teaches the
// same chosen number row by row.
//
// The eight level badges (one per available row) are kept as a progress marker.

var localChosenSchyotyController = {
    "levelIdx": 0,
    "number": null,
    "targetDigits": [],
    "steps": [],
    "currentStepIdx": 0,
    "stepCompleted": false,
    "helpMode": false,
    "solved": false,
    "active": false,
    "completedLevels": [false, false, false, false, false, false, false, false],
    "TextManager": null
};

var HT_CHOSEN_SCHYOTY_LEVELS = [
    { "intDigits": 1 },
    { "intDigits": 2 },
    { "intDigits": 3 },
    { "intDigits": 4 },
    { "intDigits": 5 },
    { "intDigits": 6 },
    { "intDigits": 7 },
    { "intDigits": 8 }
];

var HT_CHOSEN_SCHYOTY_BADGE_COLORS = ["#ffb347", "#4caf50", "#ff7043", "#9c27b0", "#e91e63", "#00bcd4", "#ff9800", "#f44336"];

// Place-name keys by power of ten (10^p).
var HT_CHOSEN_SCHYOTY_INT_PLACE_KEYS = ["units", "tens", "hundreds", "thousands", "tenthousands", "hundredthousands", "millions", "tenmillions"];

var HT_CHOSEN_SCHYOTY_MIN = 0;
var HT_CHOSEN_SCHYOTY_MAX = 99999999;
var HT_CHOSEN_SCHYOTY_MIN_TEXT = "0";
var HT_CHOSEN_SCHYOTY_MAX_TEXT = "99999999";

function htChosenSchyotyLevel() {
    return HT_CHOSEN_SCHYOTY_LEVELS[localChosenSchyotyController.levelIdx];
}

function htChosenSchyotyParseNumber(raw) {
    const text = String(raw === undefined || raw === null ? '' : raw).trim();
    if (!/^\d+$/.test(text)) return { "error": "txt_invalidFormat" };
    let intStr = text.replace(/^0+(?=\d)/, '');
    if (intStr === '') intStr = '0';
    const value = Number(text);
    if (!(value >= HT_CHOSEN_SCHYOTY_MIN && value <= HT_CHOSEN_SCHYOTY_MAX)) return { "error": "txt_invalidRange" };
    if (intStr.length > localSchyotyController.ROWS) return { "error": "txt_invalidRows" };
    return {
        "intDigits": intStr.split('').map(Number),
        "text": intStr
    };
}

function htChosenSchyotyNumberString(number) {
    return number.text;
}

function htChosenSchyotyShowError(errorId) {
    const el = document.getElementById('chooseError');
    if (!el) return;
    const TM = localChosenSchyotyController.TextManager;
    if (!TM) return;
    el.innerHTML = TM.format(TM.get(errorId), {
        "min": HT_CHOSEN_SCHYOTY_MIN_TEXT,
        "max": HT_CHOSEN_SCHYOTY_MAX_TEXT,
        "rows": localSchyotyController.ROWS
    });
}

function htChosenSchyotyReadNumber() {
    const input = document.getElementById('chosenNumberInput');
    const parsed = htChosenSchyotyParseNumber(input ? input.value : '');
    const error = document.getElementById('chooseError');
    if (parsed.error) {
        htChosenSchyotyShowError(parsed.error);
        return null;
    }
    if (error) error.innerHTML = '';
    return parsed;
}

// Row 0 is the units row. Only the rows used by the number receive beads;
// every other row stays at zero.
function htChosenSchyotyBuildTarget(number) {
    const digits = [];
    for (let r = 0; r < localSchyotyController.ROWS; r++) digits.push(0);
    for (let i = 0; i < number.intDigits.length; i++) {
        digits[i] = number.intDigits[number.intDigits.length - 1 - i];
    }
    return digits;
}

function htChosenSchyotyBuildSteps() {
    const TM = localChosenSchyotyController.TextManager;
    const number = localChosenSchyotyController.number;
    const steps = [];
    const current = [];
    for (let r = 0; r < localSchyotyController.ROWS; r++) current.push(0);

    // From the units row upwards to the most significant row.
    for (let power = 0; power < number.intDigits.length; power++) {
        const digit = number.intDigits[number.intDigits.length - 1 - power];
        current[power] = digit;
        const placeName = TM.getPlace(HT_CHOSEN_SCHYOTY_INT_PLACE_KEYS[power]);
        steps.push({
            "type": "digit",
            "instruction": digit === 0
                ? TM.getMoveZeroInstruction(placeName)
                : TM.getMoveDigitInstruction(digit, placeName),
            "target": current.slice()
        });
    }

    steps.push({
        "type": "digit",
        "instruction": TM.getFinalInstruction(htChosenSchyotyNumberString(number)),
        "target": htChosenSchyotyBuildTarget(number)
    });
    return steps;
}

function htChosenSchyotyUpdateLevelBadge() {
    const label = localChosenSchyotyController.TextManager.get('txt_lvl' + localChosenSchyotyController.levelIdx);
    const color = HT_CHOSEN_SCHYOTY_BADGE_COLORS[localChosenSchyotyController.levelIdx];
    ['levelBadge', 'setupLevelBadge'].forEach(function(id) {
        const badge = document.getElementById(id);
        if (badge) {
            badge.innerHTML = label;
            badge.style.background = color;
        }
    });
}

function htChosenSchyotySetControlButtonsVisibility(show) {
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (!nextLevelBtn) return;
    if (show) nextLevelBtn.classList.remove('hidden');
    else nextLevelBtn.classList.add('hidden');
}

function htChosenSchyotySetStepVisibility(show) {
    const nextStepBtn = document.getElementById('nextStepBtn');
    if (!nextStepBtn) return;
    if (show) nextStepBtn.classList.remove('hidden');
    else nextStepBtn.classList.add('hidden');
}

// "Help me?" stays available while the chosen number is waiting on the board.
function htChosenSchyotySetHelpVisibility(show) {
    const helpBtn = document.getElementById('gameHelpBtn');
    if (!helpBtn) return;
    if (show) helpBtn.classList.remove('hidden');
    else helpBtn.classList.add('hidden');
}

function htChosenSchyotyHideHelpAfterInteraction() {
    const ctl = localChosenSchyotyController;
    if (ctl.helpMode || ctl.solved || !ctl.active) return;
    htChosenSchyotySetHelpVisibility(false);
}

function htChosenSchyotySetSuccessVisible(show) {
    const sv = document.getElementById('schyotySuccess');
    if (!sv) return;
    sv.style.display = show ? 'inline' : 'none';
    sv.style.visibility = show ? 'visible' : 'hidden';
}

// The number is chosen on its own screen: the schyoty is only revealed once a
// valid number has been submitted.
function htChosenSchyotyShowSetup() {
    const setup = document.getElementById('chooserSetup');
    const game = document.getElementById('chooserGame');
    if (setup) setup.classList.remove('htChooserHidden');
    if (game) game.classList.add('htChooserHidden');
}

function htChosenSchyotyShowGame() {
    const setup = document.getElementById('chooserSetup');
    const game = document.getElementById('chooserGame');
    if (setup) setup.classList.add('htChooserHidden');
    if (game) game.classList.remove('htChooserHidden');
    // The canvas uses its width attribute for layout; recomputing keeps the
    // mouse and touch hit regions accurate after the panel becomes visible.
    htSchyotyComputeLayout();
    htSchyotyRender();
}

function htChosenSchyotyShowCongrats(html) {
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '<div class="congrats">' + html + '</div>';
    const message = document.getElementById('stepMessage');
    if (message) message.innerHTML = '';
}

function htChosenSchyotyClearCongrats() {
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    htChosenSchyotyShowChallengePrompt();
}

function htChosenSchyotyShowProblem() {
    const display = document.getElementById('problemDisplay');
    const TM = localChosenSchyotyController.TextManager;
    if (display) display.innerHTML = TM.get('txt_problemPrefix') + ' <strong>' + htChosenSchyotyNumberString(localChosenSchyotyController.number) + '</strong>';
}

function htChosenSchyotyShowChallengePrompt() {
    const TM = localChosenSchyotyController.TextManager;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    if (message) message.innerHTML = TM.get('txt_challengeMessage');
    if (status) status.innerHTML = TM.get('txt_challengeStatus');
}

function htChosenSchyotyStartChallenge() {
    const ctl = localChosenSchyotyController;
    if (!localSchyotyController.canvas || !ctl.TextManager) return;
    const number = htChosenSchyotyReadNumber();
    if (!number) return;
    htChosenSchyotyShowGame();
    ctl.number = number;
    ctl.active = true;
    ctl.helpMode = false;
    ctl.solved = false;
    ctl.targetDigits = htChosenSchyotyBuildTarget(number);
    // Set up the step state before clearing the board: clearing triggers a
    // board-change check, which must not see steps left over from a previous game.
    ctl.steps = htChosenSchyotyBuildSteps();
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    const cmp = document.getElementById('schyotyCMP');
    if (cmp) cmp.innerText = number.text;
    htChosenSchyotyShowProblem();
    htChosenSchyotyShowChallengePrompt();
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    htChosenSchyotyUpdateLevelBadge();
    htChosenSchyotySetControlButtonsVisibility(true);
    htChosenSchyotySetStepVisibility(false);
    htChosenSchyotySetHelpVisibility(true);
    // Clear the board last: clearing triggers the board-change check, so the
    // challenge UI must already be in place. This also shows congratulations
    // immediately when the chosen number is 0.
    htChosenSchyotyClearBoard();
}

function htChosenSchyotyMatchesTarget() {
    const ctl = localChosenSchyotyController;
    if (!ctl.targetDigits.length) return false;
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        if (localSchyotyController.state[r] !== ctl.targetDigits[r]) return false;
    }
    return true;
}

function htChosenSchyotyCheckChallenge() {
    const ctl = localChosenSchyotyController;
    if (!ctl.number || !ctl.active || ctl.helpMode) return;
    if (!htChosenSchyotyMatchesTarget()) {
        htChosenSchyotySetSuccessVisible(false);
        if (ctl.solved) {
            ctl.solved = false;
            htChosenSchyotyClearCongrats();
        }
        return;
    }
    if (ctl.solved) return;
    ctl.solved = true;
    htChosenSchyotyMarkLevelCompleted();
    htChosenSchyotySetSuccessVisible(true);
    htChosenSchyotyShowCongrats(ctl.TextManager.getCongratsMessage(htChosenSchyotyNumberString(ctl.number)));
    htChosenSchyotySetStepVisibility(false);
    htChosenSchyotySetHelpVisibility(false);
}

function htChosenSchyotyStartHelp() {
    const ctl = localChosenSchyotyController;
    if (!localSchyotyController.canvas || !ctl.TextManager) return;
    // The setup screen reads the input; the game panel reuses the chosen number.
    const number = ctl.number || htChosenSchyotyReadNumber();
    if (!number) return;
    htChosenSchyotyShowGame();
    ctl.number = number;
    ctl.active = true;
    ctl.helpMode = true;
    ctl.solved = false;
    ctl.stepCompleted = false;
    htChosenSchyotySetSuccessVisible(false);
    htChosenSchyotySetHelpVisibility(false);
    ctl.targetDigits = htChosenSchyotyBuildTarget(number);
    const cmp = document.getElementById('schyotyCMP');
    if (cmp) cmp.innerText = number.text;
    // Set up the step state before clearing the board: clearing triggers a
    // board-change check, which must not see steps left over from a previous game.
    ctl.steps = htChosenSchyotyBuildSteps();
    ctl.currentStepIdx = 0;
    ctl.stepCompleted = false;
    htChosenSchyotyClearBoard();
    htChosenSchyotyShowProblem();
    const TM = ctl.TextManager;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    const feedback = document.getElementById('feedbackArea');
    if (message) message.innerHTML = TM.get('txt_helpIntro') + ' ' + ctl.steps[0].instruction;
    if (status) status.innerHTML = TM.getStepStatus(1, ctl.steps.length);
    if (feedback) feedback.innerHTML = '';
    htChosenSchyotySetStepVisibility(true);
}

function htChosenSchyotyStepMatches(step) {
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        if (localSchyotyController.state[r] !== step.target[r]) return false;
    }
    return true;
}

function htChosenSchyotyMarkLevelCompleted() {
    const ctl = localChosenSchyotyController;
    if (ctl.levelIdx >= 0 && ctl.levelIdx < ctl.completedLevels.length) {
        ctl.completedLevels[ctl.levelIdx] = true;
    }
}

function htChosenSchyotyFinishHelp() {
    const ctl = localChosenSchyotyController;
    ctl.helpMode = false;
    ctl.solved = true;
    ctl.stepCompleted = false;
    htChosenSchyotyMarkLevelCompleted();
    htChosenSchyotySetSuccessVisible(true);
    htChosenSchyotyShowCongrats(ctl.TextManager.getHelpDoneMessage(htChosenSchyotyNumberString(ctl.number)));
    htChosenSchyotySetStepVisibility(false);
}

function htChosenSchyotyNextStep() {
    const ctl = localChosenSchyotyController;
    if (!ctl.helpMode || !ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    const step = ctl.steps[ctl.currentStepIdx];
    if (!htChosenSchyotyStepMatches(step)) return;
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
        setTimeout(function() { if (window.checkCurrentChosenSchyotyStepPositive) window.checkCurrentChosenSchyotyStepPositive(); }, 50);
    } else {
        htChosenSchyotyFinishHelp();
    }
}

function htChosenSchyotyNewNumber() {
    const ctl = localChosenSchyotyController;
    if (!localSchyotyController.canvas || !ctl.TextManager) return;
    const TM = ctl.TextManager;
    ctl.helpMode = false;
    ctl.solved = false;
    ctl.active = false;
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
    const cmp = document.getElementById('schyotyCMP');
    if (cmp) cmp.innerText = '0';
    htChosenSchyotySetSuccessVisible(false);
    const display = document.getElementById('problemDisplay');
    if (display) display.innerHTML = TM.get('txt_problemPrefix') + ' 🎯';
    htChosenSchyotyShowChallengePrompt();
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    htChosenSchyotyClearBoard();
    htChosenSchyotyUpdateLevelBadge();
    htChosenSchyotySetControlButtonsVisibility(true);
    htChosenSchyotySetStepVisibility(false);
    htChosenSchyotySetHelpVisibility(false);
    htChosenSchyotyShowSetup();
    if (input) input.focus();
}

function htChosenSchyotyNextLevel() {
    const ctl = localChosenSchyotyController;
    ctl.levelIdx++;
    let wrapped = false;
    if (ctl.levelIdx >= HT_CHOSEN_SCHYOTY_LEVELS.length) {
        ctl.levelIdx = 0;
        wrapped = true;
    }
    const allLevelsCompleted = ctl.completedLevels.every(Boolean);
    htChosenSchyotyNewNumber();
    if (wrapped && allLevelsCompleted) {
        const setupMessage = document.getElementById('setupMessage');
        if (setupMessage) setupMessage.innerHTML = '<div class="congrats">' + ctl.TextManager.get('txt_finalLevelMessage') + '</div>';
    }
}

function htChosenSchyotyOnBoardChange() {
    const ctl = localChosenSchyotyController;
    if (!ctl.active) return;
    if (ctl.helpMode) {
        if (window.checkCurrentChosenSchyotyStepPositive) window.checkCurrentChosenSchyotyStepPositive();
    } else {
        htChosenSchyotyCheckChallenge();
    }
}

window.checkCurrentChosenSchyotyStepPositive = function() {
    const ctl = localChosenSchyotyController;
    if (!ctl.helpMode || !ctl.steps.length || ctl.currentStepIdx >= ctl.steps.length) return;
    const step = ctl.steps[ctl.currentStepIdx];
    const feedback = document.getElementById('feedbackArea');
    if (!htChosenSchyotyStepMatches(step)) {
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
        htChosenSchyotyFinishHelp();
    } else if (feedback) {
        feedback.innerHTML = '<div class="success-message">' + TM.getCorrectMessage() + '</div>';
    }
};

// ----- Horizontal Schyoty (счёты) board -----
var localSchyotyController = {};

localSchyotyController.ROWS = 8;
localSchyotyController.BEADS_PER_ROW = 10;

function htSchyotyInitState() {
    localSchyotyController.state = [];
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        localSchyotyController.state.push(0);
    }
}

function htSchyotyComputeLayout() {
    const cvs = localSchyotyController.canvas;
    if (!cvs) return;
    localSchyotyController.W = cvs.width;
    localSchyotyController.H = cvs.height;

    // Landscape board with compact rows, matching the Schyoty layout in
    // f91d9720-3085-4e71-ae5d-7e7cf6b7b7b2.
    const topMargin = 20;
    const bottomMargin = 30;
    const wireL = 14;
    const wireR = localSchyotyController.W - wireL;
    localSchyotyController.wireL = wireL;
    localSchyotyController.wireR = wireR;

    const rowSp = (localSchyotyController.H - topMargin - bottomMargin) / (localSchyotyController.ROWS - 1);
    localSchyotyController.rowSp = rowSp;
    localSchyotyController.rowY = [];
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        localSchyotyController.rowY.push(localSchyotyController.H - bottomMargin - r * rowSp);
    }

    const beadSpace = (wireR - wireL) / (localSchyotyController.BEADS_PER_ROW + 1);
    let rMax = Math.min(beadSpace * 0.4, rowSp * 0.4, 18);
    rMax = Math.max(rMax, 8);
    localSchyotyController.beadR = rMax;
    localSchyotyController.beadStep = rMax * 2;

    localSchyotyController.activeX0 = wireL + rMax + 2;
    localSchyotyController.inactiveX0 = wireR - rMax - 2;
}

function htSchyotyTotalValue() {
    let v = 0;
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        v += localSchyotyController.state[r] * Math.pow(10, r);
    }
    return v;
}

function htSchyotyUpdateDisplay() {
    const sp = document.getElementById('schyotyValue');
    if (sp) sp.innerText = htSchyotyTotalValue().toString();
    const cmp = document.getElementById('schyotyCMP');
    if (cmp && localChosenSchyotyController.active && htChosenSchyotyMatchesTarget()) {
        // The success badge is controlled by the challenge/help check below.
    } else if (!localChosenSchyotyController.helpMode || !localChosenSchyotyController.active) {
        htChosenSchyotySetSuccessVisible(false);
    }
    htChosenSchyotyOnBoardChange();
}

function htSchyotyRender() {
    const ctx = localSchyotyController.ctx;
    if (!ctx) return;
    const W = localSchyotyController.W;
    const H = localSchyotyController.H;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#fef5e0';
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 9);
        ctx.lineTo(W, i * 9 + 3);
        ctx.strokeStyle = '#c8b280';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = '#b48b5a';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.strokeStyle = '#f9eec7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 5, W - 10, H - 10);

    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        htSchyotyDrawRow(r, ctx);
    }
}

function htSchyotyDrawRow(r, ctx) {
    const y = localSchyotyController.rowY[r];

    ctx.beginPath();
    ctx.moveTo(localSchyotyController.wireL, y);
    ctx.lineTo(localSchyotyController.wireR, y);
    ctx.strokeStyle = '#b08054';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#e9c48b';
    ctx.lineWidth = 1;
    ctx.stroke();

    const cnt = localSchyotyController.state[r];

    for (let p = 0; p < cnt; p++) {
        const x = localSchyotyController.activeX0 + p * localSchyotyController.beadStep;
        htSchyotyDrawBead(ctx, x, y, true, p);
    }

    for (let p = 0; p < localSchyotyController.BEADS_PER_ROW - cnt; p++) {
        const x = localSchyotyController.inactiveX0 - p * localSchyotyController.beadStep;
        htSchyotyDrawBead(ctx, x, y, false, localSchyotyController.BEADS_PER_ROW - 1 - p);
    }

    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(cnt.toString(), localSchyotyController.wireL + 3, y - localSchyotyController.rowSp * 0.28);
}

function htSchyotyDrawBead(ctx, x, y, active, idx) {
    const r = localSchyotyController.beadR;
    const isSpecial = idx === 4 || idx === 5;
    ctx.shadowBlur = active ? 3 : 1;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';

    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    if (isSpecial) {
        grad.addColorStop(0, active ? '#d0d0d0' : '#a0a0a0');
        grad.addColorStop(1, active ? '#808080' : '#606060');
    } else if (active) {
        grad.addColorStop(0, '#f5c860');
        grad.addColorStop(1, '#b08030');
    } else {
        grad.addColorStop(0, '#d4bc98');
        grad.addColorStop(1, '#8a7050');
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isSpecial ? (active ? '#3a3a3a' : '#2a2a2a') : (active ? '#6a4a1a' : '#5a4030');
    ctx.lineWidth = active ? 1.5 : 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.25, 0, Math.PI * 2);
    if (isSpecial) {
        ctx.fillStyle = active ? 'rgba(230,230,230,0.6)' : 'rgba(180,180,180,0.35)';
    } else {
        ctx.fillStyle = active ? 'rgba(255,235,190,0.6)' : 'rgba(240,225,205,0.35)';
    }
    ctx.fill();
}

function htSchyotyHitTest(mx, my) {
    const r = localSchyotyController.beadR;
    for (let row = 0; row < localSchyotyController.ROWS; row++) {
        const y = localSchyotyController.rowY[row];
        if (Math.abs(my - y) > r + 10) continue;

        const cnt = localSchyotyController.state[row];

        for (let p = 0; p < cnt; p++) {
            const x = localSchyotyController.activeX0 + p * localSchyotyController.beadStep;
            if (Math.abs(mx - x) < r + 5) return { row, pos: p, side: 'active' };
        }

        for (let p = 0; p < localSchyotyController.BEADS_PER_ROW - cnt; p++) {
            const x = localSchyotyController.inactiveX0 - p * localSchyotyController.beadStep;
            if (Math.abs(mx - x) < r + 5) return { row, pos: p, side: 'inactive' };
        }
    }
    return null;
}

function htSchyotyToggle(hit) {
    const cnt = localSchyotyController.state[hit.row];
    if (hit.side === 'active') {
        localSchyotyController.state[hit.row] = hit.pos;
    } else {
        localSchyotyController.state[hit.row] = localSchyotyController.BEADS_PER_ROW - hit.pos;
    }
    htChosenSchyotyHideHelpAfterInteraction();
    htSchyotyRender();
    htSchyotyUpdateDisplay();
}

function htChosenSchyotyClearBoard() {
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        localSchyotyController.state[r] = 0;
    }
    htSchyotyRender();
    htSchyotyUpdateDisplay();
}

function htChosenSchyotyResetBoard() {
    const ctl = localChosenSchyotyController;
    const TM = ctl.TextManager;
    ctl.solved = false;
    htChosenSchyotySetSuccessVisible(false);
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';
    htChosenSchyotyClearBoard();
    if (!ctl.number) return;
    const message = document.getElementById('stepMessage');
    const status = document.getElementById('stepStatus');
    if (ctl.helpMode) {
        ctl.currentStepIdx = 0;
        ctl.stepCompleted = false;
        if (message) message.innerHTML = TM.get('txt_helpIntro') + ' ' + ctl.steps[0].instruction;
        if (status) status.innerHTML = TM.getStepStatus(1, ctl.steps.length);
        htChosenSchyotySetStepVisibility(true);
    } else {
        htChosenSchyotyShowChallengePrompt();
        htChosenSchyotySetStepVisibility(false);
    }
}

function htSchyotyHandleClick(e) {
    const cvs = localSchyotyController.canvas;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const sx = cvs.width / rect.width;
    const sy = cvs.height / rect.height;
    let cx, cy;
    if (e.touches) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
        e.preventDefault();
    } else {
        cx = e.clientX;
        cy = e.clientY;
    }
    const hit = htSchyotyHitTest((cx - rect.left) * sx, (cy - rect.top) * sy);
    if (hit) htSchyotyToggle(hit);
}

function htSchyotyBindEvents() {
    const cvs = localSchyotyController.canvas;
    if (!cvs) return;
    cvs.addEventListener('click', htSchyotyHandleClick);
    cvs.addEventListener('touchstart', htSchyotyHandleClick, { passive: false });

    const rb = document.getElementById('schyotyResetBtn');
    if (rb) rb.addEventListener('click', htChosenSchyotyResetBoard);

    window.addEventListener('resize', function () {
        htSchyotyComputeLayout();
        htSchyotyRender();
    });
}

function htChosenSchyotyInit() {
    localSchyotyController.canvas = document.getElementById('schyotyCanvas');
    if (!localSchyotyController.canvas) return;
    localSchyotyController.ctx = localSchyotyController.canvas.getContext('2d');
    if (!localSchyotyController.ctx) return;

    const cols = document.getElementById('schyotyCols');
    if (cols) {
        const v = parseInt(cols.innerText);
        if (!isNaN(v) && v > 0) localSchyotyController.ROWS = Math.min(v, 12);
    }

    htSchyotyInitState();
    htSchyotyComputeLayout();
    htSchyotyBindEvents();
    htSchyotyRender();
    htSchyotyUpdateDisplay();
    setTimeout(htChosenSchyotyNewNumber, 0);
}

function htSchyotyLoadContent() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', htChosenSchyotyInit);
    } else {
        htChosenSchyotyInit();
    }
}

function htLoadContent() {
    htWriteNavigation();

    localChosenSchyotyController.TextManager = {
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

        "getMoveDigitInstruction": function(digit, placeName) {
            return this.format(this.get('txt_moveDigit'), { "digit": digit, "placeName": placeName });
        },

        "getMoveZeroInstruction": function(placeName) {
            return this.format(this.get('txt_moveZero'), { "placeName": placeName });
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

    // --- Buttons ---

    const _ = id => document.getElementById(id);
    _('representBtn') && (_('representBtn').onclick = function() { htChosenSchyotyStartChallenge(); });
    _('helpMeBtn') && (_('helpMeBtn').onclick = function() { htChosenSchyotyStartHelp(); });
    _('gameHelpBtn') && (_('gameHelpBtn').onclick = function() { htChosenSchyotyStartHelp(); });
    _('resetTutorBtn') && (_('resetTutorBtn').onclick = function() { htChosenSchyotyNewNumber(); });
    _('nextLevelBtn') && (_('nextLevelBtn').onclick = function() { htChosenSchyotyNextLevel(); });
    _('nextStepBtn') && (_('nextStepBtn').onclick = function() { htChosenSchyotyNextStep(); });
    _('chosenNumberInput') && (_('chosenNumberInput').onkeydown = function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            htChosenSchyotyStartChallenge();
        }
    });

    // htSchyotyLoadContent() runs after the JSON markup has been inserted, so
    // the initial UI is set up after the board has been initialized.
    htSchyotyLoadContent();

    return false;
}
