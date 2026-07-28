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
    var stepsList = [];
    var maxDigits, placeNames, multipliers;
    var tm = localYupanaController.TextManager;

    if (localYupanaController.currentLevel === "units") {
        maxDigits = 1;
        placeNames = [tm.getUnitUnits()];
        multipliers = [1];
    } else if (localYupanaController.currentLevel === "tens") {
        maxDigits = 2;
        placeNames = [tm.getUnitUnits(), tm.getUnitTens()];
        multipliers = [1, 10];
    } else if (localYupanaController.currentLevel === "hundreds") {
        maxDigits = 3;
        placeNames = [tm.getUnitUnits(), tm.getUnitTens(), tm.getUnitHundreds()];
        multipliers = [1, 10, 100];
    } else {
        maxDigits = 4;
        placeNames = [tm.getUnitUnits(), tm.getUnitTens(), tm.getUnitHundreds(), tm.getUnitThousands()];
        multipliers = [1, 10, 100, 1000];
    }

    var placeDescription = placeNames.slice().reverse().join(', ');
    stepsList.push({
        instruction: tm.getStep1Instruction(tm.formatNumber(a), placeDescription),
        targetValue: a
    });

    var currentValue = a;

    for (var p = 0; p < maxDigits; p++) {
        var digitB = Math.floor(b / multipliers[p]) % 10;
        if (digitB === 0) continue;

        var digitA = Math.floor(currentValue / multipliers[p]) % 10;
        var total = digitA + digitB;

        if (total < 10) {
            currentValue += digitB * multipliers[p];
            stepsList.push({
                instruction: tm.getSimpleAddInstruction(placeNames[p], digitB, tm.formatNumber(currentValue)),
                targetValue: currentValue
            });
        } else {
            var complement = 10 - digitB;
            var newValue = currentValue + (multipliers[p] * 10) - (complement * multipliers[p]);
            var nextPlace = placeNames[p + 1] || tm.getNextText();

            stepsList.push({
                instruction: tm.getCarryInstruction(placeNames[p], digitB, digitA, total, nextPlace, complement, tm.formatNumber(newValue)),
                targetValue: newValue
            });
            currentValue = newValue;
        }
    }

    stepsList.push({
        instruction: tm.getFinalInstruction(tm.formatNumber(a), tm.formatNumber(b), tm.formatNumber(a + b)),
        targetValue: a + b
    });

    return stepsList;
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
    var nextLevelBtn = document.getElementById('nextStepBtn');
    if (show) {
        nextLevelBtn.classList.remove('hidden');
    } else {
        nextLevelBtn.classList.add('hidden');
    }
}

function startNewExercise() {
    localYupanaController.finalCongratsShown = false;
    localYupanaController.exerciseStarted = false;
    var nums = generateRandomNumbersByLevel();
    localYupanaController.currentExercise = { a: nums.a, b: nums.b, expected: nums.a + nums.b };
    document.getElementById('problemDisplay').innerHTML = localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.a) + " + " + localYupanaController.TextManager.formatNumber(localYupanaController.currentExercise.b);
    localYupanaController.state = htYupanaNewState(localYupanaController.ROWS);
    htYupanaStateSetValue('#yupana1', localYupanaController.state, 0, 'red_dot_right_up');
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
    htYupanaStateSetValue('#yupana1', localYupanaController.state, 0, 'red_dot_right_up');
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

window.checkCurrentStepPositive = function() {
    if (localYupanaController.currentStepIdx >= localYupanaController.steps.length) return;
    var currentVal = htYupanaStateGetValue(localYupanaController.state);
    var step = localYupanaController.steps[localYupanaController.currentStepIdx];

    if (currentVal === step.targetValue) {
        if (!localYupanaController.stepCompleted) {
            localYupanaController.stepCompleted = true;
            if (localYupanaController.currentStepIdx === localYupanaController.steps.length - 1) {
                if (!localYupanaController.finalCongratsShown) {
                    localYupanaController.finalCongratsShown = true;
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
    var currentVal = htYupanaStateGetValue(localYupanaController.state);
    var currentStepTarget = localYupanaController.steps[localYupanaController.currentStepIdx] ? localYupanaController.steps[localYupanaController.currentStepIdx].targetValue : undefined;

    if (currentVal !== currentStepTarget) {
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
        getStep1Instruction: function(a, columns) { return this.format(this.get('txt_step1Instruction'), { a: a, columns: columns }); },
        getSimpleAddInstruction: function(placeName, digit, result) { return this.format(this.get('txt_simpleAddInstruction'), { placeName: placeName, digit: digit, result: result }); },
        getCarryInstruction: function(placeName, digit, digitA, total, nextPlace, complement, result) { return this.format(this.get('txt_carryInstruction'), { placeName: placeName, digit: digit, digitA: digitA, total: total, nextPlace: nextPlace, complement: complement, result: result }); },
        getFinalInstruction: function(a, b, result) { return this.format(this.get('txt_finalInstruction'), { a: a, b: b, result: result }); },
        getStepStatus: function(current, total) { return this.format(this.get('txt_stepStatus'), { current: current, total: total }); },
        getReadyStatus: function() { return this.get('txt_readyStatus'); },
        getWelcomeMessage: function() { return this.get('txt_welcomeMessage'); },
        getUnitUnits: function() { return this.get('txt_units'); },
        getUnitTens: function() { return this.get('txt_tens'); },
        getUnitHundreds: function() { return this.get('txt_hundreds'); },
        getUnitThousands: function() { return this.get('txt_thousands'); },
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
    htYupanaStateSetValue('#yupana1', localYupanaController.state, 0, 'red_dot_right_up');

    for (var row = 1; row <= localYupanaController.ROWS; row++) {
        for (var col = 1; col <= 4; col++) {
            (function(r, c) {
                $('#yupana1 #tc' + c + 'f' + r).on("click", function() {
                    if (localYupanaController.finalCongratsShown) return;
                    var rowIdx = localYupanaController.ROWS - r;
                    var colIdx = c - 1;
                    htYupanaStateToggleCell('#yupana1', localYupanaController.state, rowIdx, colIdx, 'red_dot_right_up');
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
