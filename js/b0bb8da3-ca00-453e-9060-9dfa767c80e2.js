// SPDX-License-Identifier: GPL-3.0-or-later

var localYupanaController = {
    "ROWS": 4,
    "state": null,
    "currentLevel": "units",
    "currentExercise": { a: 0, b: 0, expected: 0 },
    "steps": [],
    "currentStepIdx": 0,
    "stepCompleted": false,
    "finalCongratsShown": false,
    "exerciseStarted": false,
    "TextManager": null
};

function generateRandomNumbersByLevel() {
    if (localYupanaController.currentLevel === "units") {
        return { a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) };
    } else if (localYupanaController.currentLevel === "tens") {
        return { a: Math.floor(Math.random() * 90) + 10, b: Math.floor(Math.random() * 90) + 10 };
    } else if (localYupanaController.currentLevel === "hundreds") {
        return { a: Math.floor(Math.random() * 900) + 100, b: Math.floor(Math.random() * 900) + 100 };
    } else {
        return { a: Math.floor(Math.random() * 9000) + 1000, b: Math.floor(Math.random() * 9000) + 1000 };
    }
}

function buildStepsForNumbers(a, b) {
    var tm = localYupanaController.TextManager;
    return [
        {
            instruction: tm.getStep1Instruction(tm.formatNumber(a)),
            targetValue: a,
            color: 'red'
        },
        {
            instruction: tm.getStep2Instruction(tm.formatNumber(b), tm.formatNumber(a + b)),
            targetValue: a + b,
            color: 'blue'
        }
    ];
}

function setControlButtonsVisibility(show) {
    var resetTutorBtn = document.getElementById('resetTutorBtn');
    var nextLevelBtn = document.getElementById('nextLevelBtn');
    if (show) {
        resetTutorBtn.classList.remove('hidden');
        nextLevelBtn.classList.remove('hidden');
    } else {
        resetTutorBtn.classList.add('hidden');
        nextLevelBtn.classList.add('hidden');
    }
}

function setControlStepVisibility(show) {
    var nextStepBtn = document.getElementById('nextStepBtn');
    if (show) {
        nextStepBtn.classList.remove('hidden');
    } else {
        nextStepBtn.classList.add('hidden');
    }
}

function startNewExercise() {
    localYupanaController.finalCongratsShown = false;
    localYupanaController.exerciseStarted = false;
    var nums = generateRandomNumbersByLevel();
    localYupanaController.currentExercise = { a: nums.a, b: nums.b, expected: nums.a + nums.b };
    document.getElementById('problemDisplay').innerHTML = localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.a) + " + " + localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.b);
    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateClear('#yupana1', localYupanaController.state);
    localYupanaController.steps = buildStepsForNumbers(localYupanaController.currentExercise.a, localYupanaController.currentExercise.b);
    localYupanaController.currentStepIdx = 0;
    localYupanaController.stepCompleted = false;
    document.getElementById('stepMessage').innerHTML = localYupanaController.TextManager.getStepPrefix() + " " + localYupanaController.steps[0].instruction;
    document.getElementById('stepStatus').innerHTML = localYupanaController.TextManager.getStepStatus(1, localYupanaController.steps.length);
    document.getElementById('feedbackArea').innerHTML = '';
    setControlButtonsVisibility(true);
    setControlStepVisibility(true);
}

function resetTutorToStepOne() {
    localYupanaController.finalCongratsShown = false;
    localYupanaController.exerciseStarted = false;
    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateClear('#yupana1', localYupanaController.state);
    localYupanaController.steps = buildStepsForNumbers(localYupanaController.currentExercise.a, localYupanaController.currentExercise.b);
    localYupanaController.currentStepIdx = 0;
    localYupanaController.stepCompleted = false;
    document.getElementById('stepMessage').innerHTML = localYupanaController.TextManager.getStepPrefix() + " " + localYupanaController.steps[0].instruction;
    document.getElementById('stepStatus').innerHTML = localYupanaController.TextManager.getStepStatus(1, localYupanaController.steps.length);
    document.getElementById('feedbackArea').innerHTML = '';
    setControlButtonsVisibility(true);
    setControlStepVisibility(true);
}

function toggleLevel() {
    if (localYupanaController.currentLevel === "units") {
        localYupanaController.currentLevel = "tens";
        document.getElementById('levelBadge').innerHTML = localYupanaController.TextManager.getLevelTens();
        document.getElementById('levelBadge').style.background = "#4caf50";
    } else if (localYupanaController.currentLevel === "tens") {
        localYupanaController.currentLevel = "hundreds";
        document.getElementById('levelBadge').innerHTML = localYupanaController.TextManager.getLevelHundreds();
        document.getElementById('levelBadge').style.background = "#ff7043";
    } else if (localYupanaController.currentLevel === "hundreds") {
        localYupanaController.currentLevel = "thousands";
        document.getElementById('levelBadge').innerHTML = localYupanaController.TextManager.getLevelThousands();
        document.getElementById('levelBadge').style.background = "#9c27b0";
    } else {
        localYupanaController.currentLevel = "units";
        document.getElementById('levelBadge').innerHTML = localYupanaController.TextManager.getLevelUnits();
        document.getElementById('levelBadge').style.background = "#ffb347";
        document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + localYupanaController.TextManager.getFinalLevelMessage() + '</div>';
    }
    startNewExercise();
}

function getCurrentStepTargetValue() {
    if (localYupanaController.currentStepIdx >= localYupanaController.steps.length) return undefined;
    return localYupanaController.steps[localYupanaController.currentStepIdx].targetValue;
}

function getCurrentStepColor() {
    if (localYupanaController.currentStepIdx >= localYupanaController.steps.length) return 'red';
    return localYupanaController.steps[localYupanaController.currentStepIdx].color;
}

window.checkCurrentStepPositive = function() {
    if (localYupanaController.currentStepIdx >= localYupanaController.steps.length) return;
    var currentVal;
    var step = localYupanaController.steps[localYupanaController.currentStepIdx];
    if (step.color === 'red') {
        currentVal = htYupanaStateGetRedValue(localYupanaController.state);
    } else {
        currentVal = htYupanaStateGetTotalValue(localYupanaController.state);
    }

    if (currentVal === step.targetValue) {
        if (!localYupanaController.stepCompleted) {
            localYupanaController.stepCompleted = true;
            if (localYupanaController.currentStepIdx === localYupanaController.steps.length - 1) {
                if (!localYupanaController.finalCongratsShown) {
                    localYupanaController.finalCongratsShown = true;
                    htYupanaStateDrawGreen('#yupana1', localYupanaController.state, localYupanaController.currentExercise.expected);
                    document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + localYupanaController.TextManager.getPerfectMessage(localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.a), localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.b), localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.expected)) + '</div>';
                    setControlButtonsVisibility(true);
                    setControlStepVisibility(false);
                }
            } else {
                document.getElementById('feedbackArea').innerHTML = '<div class="success-message">' + localYupanaController.TextManager.getCorrectMessage() + '</div>';
            }
        }
    } else {
        localYupanaController.stepCompleted = false;
        if (document.getElementById('feedbackArea').innerHTML &&
            !document.getElementById('feedbackArea').innerHTML.includes('PERFECT') &&
            !document.getElementById('feedbackArea').innerHTML.includes('Correct')) {
            document.getElementById('feedbackArea').innerHTML = '';
        }
    }
};

function nextStep() {
    var currentVal;
    var currentStep = localYupanaController.steps[localYupanaController.currentStepIdx];
    if (!currentStep) return;
    if (currentStep.color === 'red') {
        currentVal = htYupanaStateGetRedValue(localYupanaController.state);
    } else {
        currentVal = htYupanaStateGetTotalValue(localYupanaController.state);
    }

    if (currentVal !== currentStep.targetValue) {
        return;
    }

    if (!localYupanaController.exerciseStarted && localYupanaController.currentStepIdx === 0) {
        localYupanaController.exerciseStarted = true;
        setControlButtonsVisibility(false);
    }

    if (localYupanaController.currentStepIdx + 1 < localYupanaController.steps.length) {
        localYupanaController.currentStepIdx++;
        localYupanaController.stepCompleted = false;
        document.getElementById('stepMessage').innerHTML = localYupanaController.TextManager.getStepPrefix() + " " + localYupanaController.steps[localYupanaController.currentStepIdx].instruction;
        document.getElementById('stepStatus').innerHTML = localYupanaController.TextManager.getStepStatus(localYupanaController.currentStepIdx + 1, localYupanaController.steps.length);
        document.getElementById('feedbackArea').innerHTML = '';
        setTimeout(function() { window.checkCurrentStepPositive(); }, 50);
    } else {
        if (currentVal === localYupanaController.currentExercise.expected && !localYupanaController.finalCongratsShown) {
            localYupanaController.finalCongratsShown = true;
            document.getElementById('feedbackArea').innerHTML = '<div class="congrats">' + localYupanaController.TextManager.getCongratsMessage(localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.a), localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.b), localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.expected)) + '</div>';
            setControlButtonsVisibility(true);
        }
    }
}

function htLoadContent() {
    htWriteNavigation();

    localYupanaController.TextManager = {
        get: function(id) {
            var element = document.getElementById(id);
            return element ? element.innerHTML : id;
        },
        format: function(template, data) {
            var result = template;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var value = data[key];
                    if (value === undefined || value === null) value = '';
                    result = result.replace(new RegExp('\\{' + key + '\\}', 'g'), value);
                }
            }
            return result;
        },
        getStepPrefix: function() { return this.get('txt_stepPrefix'); },
        getCorrectMessage: function() { return this.get('txt_correctMessage'); },
        getPerfectMessage: function(a, b, result) { return this.format(this.get('txt_perfectMessage'), { a: a, b: b, result: result }); },
        getCongratsMessage: function(a, b, result) { return this.format(this.get('txt_congratsMessage'), { a: a, b: b, result: result }); },
        getFinalLevelMessage: function() { return this.get('txt_finalLevelMessage'); },
        getStep1Instruction: function(a) { return this.format(this.get('txt_step1Instruction'), { a: a }); },
        getStep2Instruction: function(b, result) { return this.format(this.get('txt_step2Instruction'), { b: b, result: result }); },
        getStepStatus: function(current, total) { return this.format(this.get('txt_stepStatus'), { current: current, total: total }); },
        getReadyStatus: function() { return this.get('txt_readyStatus'); },
        getWelcomeMessage: function() { return this.get('txt_welcomeMessage'); },
        getLevelUnits: function() { return this.get('txt_levelUnits'); },
        getLevelTens: function() { return this.get('txt_levelTens'); },
        getLevelHundreds: function() { return this.get('txt_levelHundreds'); },
        getLevelThousands: function() { return this.get('txt_levelThousands'); },
        getNextText: function() { return this.get('txt_next'); },
        formatNumber: function(num) {
            if (typeof num !== 'number' || isNaN(num)) return '0';
            var locale = $("#site_language").val();
            try { return new Intl.NumberFormat(locale).format(num); }
            catch(e) { return num.toString(); }
        }
    };

    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateClear('#yupana1', localYupanaController.state);

    for (var row = 1; row <= localYupanaController.ROWS; row++) {
        for (var col = 1; col <= 4; col++) {
            (function(r, c) {
                $('#yupana1 #tc' + c + 'f' + r).on("click", function() {
                    if (localYupanaController.finalCongratsShown) return;
                    var rowIdx = localYupanaController.ROWS - r;
                    var colIdx = c - 1;
                    var color = getCurrentStepColor();
                    htYupanaStateToggleCell('#yupana1', localYupanaController.state, rowIdx, colIdx, color);
                    if (!localYupanaController.finalCongratsShown) setControlButtonsVisibility(false);
                    window.checkCurrentStepPositive();
                });
            })(row, col);
        }
    }

    var _ = function(id) { return document.getElementById(id); };
    _('nextStepBtn') && (_('nextStepBtn').onclick = nextStep);
    _('resetTutorBtn') && (_('resetTutorBtn').onclick = function() { startNewExercise(); });
    _('resetButton') && (_('resetButton').onclick = function() { resetTutorToStepOne(); });
    _('nextLevelBtn') && (_('nextLevelBtn').onclick = function() { toggleLevel(); });

    _('stepMessage') && (_('stepMessage').innerHTML = localYupanaController.TextManager.getStepPrefix() + " " + localYupanaController.TextManager.getWelcomeMessage());

    startNewExercise();

    window.htSorobanLoadContent = undefined;
    window.htTriangleLoadContent = undefined;
    window.htLoadExercise = undefined;
    return false;
}
