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

function htFillLocalTable() {
    var current_time = Math.floor(Date.now()/1000);
    var local_lang = $("#site_language").val();

    $("#txtaymara").html(htConvertDate("aymara", local_lang, current_time, undefined, undefined));
    $("#txtchinese").html(htConvertDate("chinese", local_lang, current_time, undefined, undefined));
    $("#txtgregory").html(htConvertDate("gregory", local_lang, current_time, undefined, undefined));
    $("#txthebrew").html(htConvertDate("hebrew", local_lang, current_time, undefined, undefined));
    $("#txthispanic").html(htConvertDate("hispanic", local_lang, current_time, undefined, undefined));
    $("#txtinca").html(htConvertDate("inca", local_lang, current_time, undefined, undefined));
    $("#txtislamic").html(htConvertDate("islamic", local_lang, current_time, undefined, undefined));
    $("#txtjapanese").html(htConvertDate("japanese", local_lang, current_time, undefined, undefined));
    $("#txtjavanese").html(htConvertDate("javanese", local_lang, current_time, undefined, undefined));
    $("#txtjulian").html(htConvertDate("julian", local_lang, current_time, undefined, undefined));
    $("#txtmapuche").html(htConvertDate("mapuche", local_lang, current_time, undefined, undefined));
    $("#txtmesoamerican").html(htConvertDate("mesoamerican", local_lang, current_time, undefined, undefined));
    $("#txtemesoamerican").html(htConvertDate("emesoamerican", local_lang, current_time, undefined, undefined));
    $("#txtpersian").html(htConvertDate("persian", local_lang, current_time, undefined, undefined));
    $("#txtfrench").html(htConvertDate("french", local_lang, current_time, undefined, undefined));
    $("#txtshaka").html(htConvertDate("shaka", local_lang, current_time, undefined, undefined));
}

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc('imgUniverseTimeBigBang', 'images/ESA/The_Universe_across_space_and_time.jpg');
    htSetImageSrc("imgFamilyInca", "images/Cuzco/PachacutiCuzco.jpg");

    htFillLocalTable();

    $('table').each(function() {
        if (!$(this).hasClass('localtable')) {
            $(this).addClass('three_table_bg');
        }
    });


    return false;
}
