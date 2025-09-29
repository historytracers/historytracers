// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector != undefined) {
        for (let i = 0; i < localAnswerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}

function htLoadContent() {
    htWriteNavigation();

    const shape = document.getElementById('shape');
    const radiusSlider = document.getElementById('radiusSlider');
    
    // Update shape when slider moves
    radiusSlider.addEventListener('input', function() {
        const radius = this.value;
        shape.style.borderRadius = `${radius}%`;
    });
    
    function morphToCircle() {
        shape.style.borderRadius = '50%';
        radiusSlider.value = 50;
    }
    
    function morphToSquare() {
        shape.style.borderRadius = '0%';
        radiusSlider.value = 0;
    }
    
    function toggleShape() {
        const currentRadius = parseInt(radiusSlider.value);
        if (currentRadius === 0) {
            morphToCircle();
        } else {
            morphToSquare();
        }
    }

    return false;
}
