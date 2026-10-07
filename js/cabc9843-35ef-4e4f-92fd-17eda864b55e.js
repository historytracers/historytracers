// SPDX-License-Identifier: GPL-3.0-or-later

// Interactive vertical addition that repeats "Calculation 2" of the text
// "Advancing an Order and the Complement". The user changes the number added
// to 6 with two arrows and watches the result advance to the tens order
// exactly when the complement (4) is reached. The three status messages live
// in the class JSON, so this file only wires the behavior and updates the
// displayed digits.

var localAnswerVectorcabc9843 = undefined;
var localComplementCabc9843 = 0;

function htComplementUpdateCabc9843() {
    var addend = localComplementCabc9843;
    var sum = 6 + addend;

    $("#htComplementAddend").text(addend);
    $("#htComplementUnitsResult").text(sum % 10);

    var carry = sum >= 10 ? Math.floor(sum / 10) : 0;
    $("#htComplementTensResult").text(carry > 0 ? carry : "").toggleClass("htComplementCarry", carry > 0);
    // The carried value is also written above the operands, as on paper.
    $("#htComplementCarryValue").text(carry > 0 ? carry : "");

    var messageId = "#htComplementMsgBelow";
    if (addend === 4) {
        messageId = "#htComplementMsgAt";
    } else if (addend > 4) {
        messageId = "#htComplementMsgAbove";
    }
    $("#htComplementFeedback").html($(messageId).html());

    // Move the marker on the number axis to the current value: each of the
    // ten ticks is an equal flex cell, so the centre of value v sits at
    // (v + 0.5) / 10 of the track width, i.e. v * 10 + 5 percent.
    $("#htComplementAxisPointer").css("left", (addend * 10 + 5) + "%");

    $("#htComplementPrev").toggleClass("htComplementDisabled", addend <= 0).prop("disabled", addend <= 0);
    $("#htComplementNext").toggleClass("htComplementDisabled", addend >= 9).prop("disabled", addend >= 9);
}

function htComplementMoveCabc9843(delta) {
    var next = localComplementCabc9843 + delta;
    if (next < 0) {
        next = 0;
    } else if (next > 9) {
        next = 9;
    }
    localComplementCabc9843 = next;
    htComplementUpdateCabc9843();
}

function htLoadContent() {
    htWriteNavigation();

    localComplementCabc9843 = 0;

    $("#htComplementPrev").off("click").on("click", function() {
        htComplementMoveCabc9843(-1);
    });

    $("#htComplementNext").off("click").on("click", function() {
        htComplementMoveCabc9843(1);
    });

    htComplementUpdateCabc9843();

    return false;
}

function htLoadExercise() {
    if (localAnswerVectorcabc9843 == undefined) {
        localAnswerVectorcabc9843 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectorcabc9843);
    }
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectorcabc9843 != undefined) {
        for (let i = 0; i < localAnswerVectorcabc9843.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectorcabc9843[i], "#answer"+i, "#explanation"+i);
        }
    }
}
