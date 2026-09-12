// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htFillRomanAbyaYalaTable() {
    var current_time = Math.floor(Date.now()/1000);
    var local_lang = $("#site_language").val();

    $("#txtaymara").html(htConvertDate("aymara", local_lang, current_time, undefined, undefined));
    $("#txtgregory").html(htConvertDate("gregory", local_lang, current_time, undefined, undefined));
    $("#txtinca").html(htConvertDate("inca", local_lang, current_time, undefined, undefined));
    $("#txthispanic").html(htConvertDate("hispanic", local_lang, current_time, undefined, undefined));
    $("#txtjulian").html(htConvertDate("julian", local_lang, current_time, undefined, undefined));
    $("#txtmapuche").html(htConvertDate("mapuche", local_lang, current_time, undefined, undefined));
    $("#txtmesoamerican").html(htConvertDate("mesoamerican", local_lang, current_time, undefined, undefined));
    $("#txtemesoamerican").html(htConvertDate("emesoamerican", local_lang, current_time, undefined, undefined));
}

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
		htSetImageSrc("imgCompostela", "images/Archive/historiadelasant04lpez_0376.jpg");
		htFillRomanAbyaYalaTable();

    return false;
}
