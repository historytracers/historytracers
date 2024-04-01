// SPDX-License-Identifier: GPL-3.0-or-later
function htLoadExercise() {
    $("#btncheck").val(keywords[29]);
    $("#btnnew").val(keywords[30]);

    for (let i = 0; i < 17; i += 2) {
        $("#lblans"+i).text(keywords[31]);
        $("#lblans"+(i+1)).text(keywords[32]);
    }

    for (let i = 0; i < 9; i++) {
        $("#answer"+i).text("");
        $("input[name=exercise"+i+"]").prop("checked", false);
    }

    var useValue = getRandomArbitrary(2, 8);
    $("#seq0").html(useValue);
    $("#seq1").html(useValue + 1);

    return false;
}

function htCheckExercise(val0, val1, answer) {
    var ans = parseInt($("input[name="+val0+"]:checked").val());
    var text = "";
    var format = "";
    if (ans == val1) {
        text = keywords[27];
        format = "green";
    } else {
        text = keywords[28];
        format = "red";
    }
    $(answer).text(text);
    $(answer).css("color", format);

    return false;
}

function htCheckAnswers()
{
    var vector = [ 1, 1, 0, 0, 0, 1, 0, 1, 1];
    for (let i = 0; i < vector.length; i++) {
        htCheckExercise("exercise"+i, vector[i], "#answer"+i);
    }
}
