// SPDX-License-Identifier: GPL-3.0-or-later

var tzolkinColors = [ "#FFFFFF", "#FFDAB9", "#FFFAFA", "#F0FFF0", "#FFE4B5", "#F5FFFA", "#FFEFD5", "#F0FFFF", "#FAFAD2", "#F0F8FF", "#FFFACD", "#F8F8FF", "#FFF8DC", "#F5F5F5", "#FFFFE0", "#FFF5EE", "#FFFFF0", "#F5F5DC", "#FDF5E6", "#FFFAF0" ]; 
var localAnswerVector = undefined;
var TzolkinDays = [];
var TzolkinInfo = [];
var currentTzolkingDayIdx = 0;
var mapTzolkingToGregory = 0;
var currentMonth = 7;
var currentMonthString = "August";
var currentYear = 2025;

function htCalendarFillEmpty(begin, total) {
    var text = "";
    for (let i = begin; i < total; i++) {
        text += "<td>&nbsp;</td>";
    }

    return text;
}

function htTzolkinCell(cell, setStyle1) {
    return "<td style=\"background-color: "+cell.BGColor+"; \"><span "+setStyle1+">"+cell.Day+"</span></td>";
}

function htdaysSinceJanFirst(year, month, day) {
  const now = new Date(year, month, day);
  const janFirst = new Date(now.getFullYear(), 0, 1);
  const diffInMs = now - janFirst;
  const daysPassed = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  return daysPassed;
}

function htRenderGregorianCalendar(tableId, month, year) {
    const $tableElement = $(tableId);

    if ($tableElement.length === 0 || month < 0 || year < 0) {
        return;
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    var dayOfTheYear = htdaysSinceJanFirst(year, month, firstDay.getDate());
    var startingDay = firstDay.getDay();

    var row = "<tr>";
    row += htCalendarFillEmpty(0, startingDay);

    let day = 1;
    var setStyle = "";
    var startFromTzolking = currentTzolkingDayIdx - (mapTzolkingToGregory - dayOfTheYear);
    for (let day = 1; day <= daysInMonth;) {
        for ( ; startingDay < 7 && day <= daysInMonth ; startingDay++, day++, dayOfTheYear++, startFromTzolking++) {
            if (mapTzolkingToGregory == dayOfTheYear) {
                $("#calendarDay"+startingDay).css("font-weight", "bold");
                setStyle =  "style=\"font-weight: bold;\"";
            } else {
                setStyle = "";
            }

            if (startFromTzolking > 0 &&  startFromTzolking < TzolkinDays.length) {
                var cell = TzolkinDays[startFromTzolking];
                row += "<td style=\"background-color: "+cell.BGColor+"; \"><span "+setStyle+">"+day+" ("+cell.Period+" "+cell.Day+")</span></td>";
            } else {
                row += "<td><span "+setStyle+">"+day+"</span></td>";
            }
        }

        if (startingDay < 7 ) {
            row += htCalendarFillEmpty(startingDay, 7);
        }

        row += "</tr>";
        $tableElement.append(row);

        startingDay = 0;
        row = "<tr>";
    }
}

function htGregorianCalendar(tableId) {
    const $tableElement = $(tableId);

    if ($tableElement.length === 0 || TzolkinDays.length == 0) {
        return;
    }

    $tableElement.empty();
    $tableElement.append("<tr><td colspan=\"7\"> "+currentMonthString+" / "+currentYear+" </td></tr><tr> <td><span id=\"calendarDay0\">"+keywords[113]+"</span></td> <td><span id=\"calendarDay1\">"+keywords[114]+"</span></td> <td><span id=\"calendarDay2\">"+keywords[115]+"</span></td> <td><span id=\"calendarDay3\">"+keywords[116]+"</span></td> <td><span id=\"calendarDay4\">"+keywords[117]+"</span></td> <td><span id=\"calendarDay5\">"+keywords[118]+"</span></td> <td><span id=\"calendarDay6\">"+keywords[119]+"</span></td> </tr>");

    htRenderGregorianCalendar(tableId, currentMonth, currentYear) ;
}

function htTzolkinCalendar(tableId, stringId) {
    const $tableElement = $(tableId);
    const $stringElement = $(stringId);

    if ($tableElement.length === 0 || !Array.isArray(MAYAN_TZOLKIN_MONTHS)) {
        return;
    }

    var selColor = 0;
    for (let i = 0, day = 1, period = 0; i < 260; i++, day++, period++) {
        if ((day % 14) == 0) {
            day = 1;
            selColor++;
        }

        if ((period % 20) == 0) {
            period = 0;
        }

        TzolkinDays.push({"Period": MAYAN_TZOLKIN_MONTHS[period], "Day" : day, "BGColor" : tzolkinColors[selColor]});
    }

    if ($stringElement.length !== 0) {
        var local_lang = $("#site_language").val();
        var local_calendar = "mesoamerican";

        var current_time = Math.floor(Date.now()/1000);
        var text = htConvertDate(local_calendar, local_lang, current_time, undefined, undefined);

        var splitCalendar = text.split(",");
        var TzolkinInfo = splitCalendar[1].split(" ");

        $(stringId).text(TzolkinInfo[3]+" "+TzolkinInfo[2]);
    }

    for (let i = 0; i < MAYAN_TZOLKIN_MONTHS.length; i++) {
        var setStyle = (MAYAN_TZOLKIN_MONTHS[i] == TzolkinInfo[3]) ? "style=\"font-weight: bold;\"" : "";
        var row = "<tr><td><span "+setStyle+">"+MAYAN_TZOLKIN_MONTHS[i]+"</span></td>";
        for (let j = 0; j < 13; j++) {
            var localIdx = i + j*20;
            var cell = TzolkinDays[localIdx];
            if (cell == undefined) {
                continue;
            }
            var setStyle1 = "";
            if (cell.Day == TzolkinInfo[2] && setStyle.length > 0) {
                setStyle1 = "style=\"font-weight: bold;\"";
                currentTzolkingDayIdx = localIdx;
            }
            row += htTzolkinCell(cell, setStyle1);
        }
        row += "</tr>";
        $tableElement.append(row);
    }
}

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htWriteNavigation("first_steps");

    $('.ordercheck').change(function(){
        var id = $(this).attr("id");
        if (id == undefined) {
            return;
        }

        if ($(this).is(':checked')) {
            htSetMultColors("multexample1", "red", id);
        } else {
            htSetMultColors("multexample1", "black", id);
        }
    });

    let currentDate = new Date();
    currentMonth = currentDate.getMonth();
    currentMonthString = currentDate.toLocaleString($("#site_language").val(), { month: 'long' });
    currentYear = currentDate.getFullYear();
    mapTzolkingToGregory = htdaysSinceJanFirst(currentYear, currentMonth, currentDate.getDate());
    htTzolkinCalendar("#tzolkin_calendar", "#tzolkin_day");
    htGregorianCalendar("#gregorian_calendar");

    var local_lang = $("#site_language").val();
    var local_calendar = $("#site_calendar").val();
    var current_time = Math.floor(Date.now()/1000);

    const $beginElement = $("#tzolkinBegin");
    const $endElement = $("#tzolkinEnd");

    var text = "";
    if ($beginElement.length !== 0) {
        var firstTzolkinDate = current_time - (86400 * currentTzolkingDayIdx);
        text = htConvertDate(local_calendar, local_lang, firstTzolkinDate, undefined, undefined);
        $beginElement.text(text);
    }

    if ($endElement.length !== 0) {
        var lastTzolkinDate = current_time + (86400 * currentTzolkingDayIdx);
        text = htConvertDate(local_calendar, local_lang, lastTzolkinDate, undefined, undefined);
        $endElement.text(text);
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

