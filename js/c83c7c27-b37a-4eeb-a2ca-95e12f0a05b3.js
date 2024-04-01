// SPDX-License-Identifier: GPL-3.0-or-later
function htLoadExercise() {
    $("#btncheck").val(keywords[29]);
    $("#btnnew").val(keywords[30]);

    $("#lblans0").text(keywords[31]);
    $("#lblans1").text(keywords[32]);
    $("#lblans2").text(keywords[31]);
    $("#lblans3").text(keywords[32]);
    $("#lblans4").text(keywords[31]);
    $("#lblans5").text(keywords[32]);

    $("#answer0").text("");
    $("#answer1").text("");
    $("#answer2").text("");
    $("input[name=exercise0]").prop("checked", false);
    $("input[name=exercise1]").prop("checked", false);
    $("input[name=exercise2]").prop("checked", false);

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
    htCheckExercise("exercise0", 0, "#answer0");
    htCheckExercise("exercise1", 1, "#answer1");
    htCheckExercise("exercise2", 1, "#answer2");
}
