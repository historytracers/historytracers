// SPDX-License-Identifier: GPL-3.0-or-later

var d7d99844FirstTime = true;
function htLoadExercise() {
    /*
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
    */
    var current_time = Math.floor(Date.now()/1000);
    var local_lang = $("#site_language").val();
    var local_calendar = $("#site_calendar").val();
    var todayText = htConvertDate(local_calendar, local_lang, current_time);
    if (d7d99844FirstTime) {
        var current_time = Math.floor(Date.now()/1000);
        var jd = calcUnixTime(current_time);
        var julianDays = gregorian_to_jd(jd[0], jd[1], jd[2]);
        var mesoamericanPeriod = jd_to_mayan_count(julianDays);

        htFillMesoamericanCalendar(mesoamericanPeriod, 1);

        d7d99844FirstTime = false;
    }
    $("#htdate2").html(todayText);

    return false;
}

/*
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
*/

function htCheckAnswers()
{
    /*
    var vector = [ 1, 0, 1, 0, 1, 1, 1, 1, 0];
    for (let i = 0; i < vector.length; i++) {
        htCheckExercise("exercise"+i, vector[i], "#answer"+i);
    }
    */
}
