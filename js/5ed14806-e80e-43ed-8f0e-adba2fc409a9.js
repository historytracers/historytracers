// SPDX-License-Identifier: GPL-3.0-or-later
function htLoadExercise() {
    $("#btncheck").val(keywords[29]);
    $("#btnnew").val(keywords[30]);

    $("#answer0").text("");
    $("#answer1").text("");
    $("#answer2").text("");
    var useValue = 0;
    for (let i = 0; i < 9; i++) {
        switch (i) {
            case 1:
            case 8:
                useValue += 1;
                $("#seq"+i).val("");
                continue;
            case 0:
                useValue = getRandomArbitrary(0, 7);
                break;
            case 3:
                $("#seq"+i).val("");
                useValue = getRandomArbitrary(10, 999);
                continue;
            case 6:
                useValue = getRandomArbitrary(1000, 99999997);
                break;
            default:
                useValue += 1;
                break;
        }
        $("#seq"+i).val(useValue);
    }

    return false;
}

function htCheckExercise(val0, val1, answer) {
    var reference = parseInt($(val0).val()) + 1;
    var ans = parseInt($(val1).val());
    var text = "";
    var format = "";
    if (reference == ans) {
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
    htCheckExercise("#seq0", "#seq1", "#answer0");
    htCheckExercise("#seq3", "#seq4", "#answer1");
    htCheckExercise("#seq7", "#seq8", "#answer2");
}
