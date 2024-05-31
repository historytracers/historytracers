// SPDX-License-Identifier: GPL-3.0-or-later

var FirstTimed7d99844 = true;
var localAnswerVectord7d99844 = undefined;

function htLoadExercise() {
    if (localAnswerVectord7d99844 == undefined) {
        localAnswerVectord7d99844 = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVectord7d99844);
    }

    var current_time = Math.floor(Date.now()/1000);
    var local_lang = $("#site_language").val();
    var local_calendar = $("#site_calendar").val();
    var todayText = htConvertUnixDate(local_calendar, local_lang, current_time);
    if (FirstTimed7d99844) {
        var current_time = Math.floor(Date.now()/1000);
        var jd = calcUnixTime(current_time);
        var julianDays = gregorian_to_jd(jd[0], jd[1], jd[2]);
        var mesoamericanPeriod = jd_to_mayan_count(julianDays);
        mesoamericanPeriod = htCompleteMesoamericanCalendar(mesoamericanPeriod);

        htFillMesoamericanCalendar(mesoamericanPeriod, 1);

        FirstTimed7d99844 = false;
    }
    $("#htexampledate0").html(todayText);

    return false;
}

function htCheckAnswers()
{
    if (localAnswerVectord7d99844 != undefined) {
        for (let i = 0; i < localAnswerVectord7d99844.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVectord7d99844[i], "#answer"+i, "#explanation"+i);
        }
    }
}

