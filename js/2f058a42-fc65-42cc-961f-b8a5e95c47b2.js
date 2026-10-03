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

// Calendars whose dates are divided into months. Any calendar not listed
// here has no internal divisions (or is not month based), so we fall back
// to the Gregorian calendar when rendering the table. Julian is presented
// as a Julian Day number by the rest of the site, so it has no divisions.
var htMonthCalendarDefs = {
    gregory:  { fromJd: jd_to_gregorian,            months: null },
    hebrew:   { fromJd: jd_to_hebrew,               months: null },
    islamic:  { fromJd: jd_to_islamic,              months: null },
    persian:  { fromJd: jd_to_persian,              months: null },
    shaka:    { fromJd: jd_to_indian_civil,         months: "indianMonths" },
    french:   { fromJd: jd_to_french_revolutionary, months: "frMonth" },
    chinese:  { fromJd: function(jd) { return jd_to_chinese(jd, -new Date().getTimezoneOffset() / 60); }, months: "chineseMonths" },
    aymara:   { fromJd: jd_to_aymara,               months: "aymaraMonths" },
    mapuche:  { fromJd: jd_to_mapuche,              months: "mapucheMonths" },
    inca:     { fromJd: jd_to_inca,                 months: "incaMonths" },
    javanese: { fromJd: jd_to_javanese,             months: "javaneseMonths" },
    japanese: { fromJd: jd_to_japanese,             months: "japaneseMonths" }
};

function htCalendarMonthKey(cal, date) {
    if (cal == "chinese") {
        return date[1] + "_" + date[3];
    }

    return "" + date[1];
}

function htCalendarDayOfMonth(cal, date) {
    if (cal == "french") {
        return (date[2] - 1) * 10 + date[3];
    }

    return date[2];
}

function htCalendarMonthName(cal, def, jd) {
    var months = def.months != null ? window[def.months] : null;

    if (Array.isArray(months)) {
        var date = def.fromJd(jd);
        // All month-name arrays are 1-based except the Indian (Shaka) one.
        var monthIdx = cal == "shaka" ? date[1] - 1 : date[1];
        var name = months[monthIdx] || "";
        // Chinese leap months reuse the regular month number, so mark them
        // with the same "bis" designation CLDR uses for these locales.
        if (cal == "chinese" && date[3] == 1) {
            name += "bis";
        }
        return name;
    }

    var local_lang = $("#site_language").val();
    // The app's jd_to_islamic uses the tabular (civil) Islamic calendar.
    var intlCalendar = cal == "islamic" ? "islamic-civil" : cal;

    try {
        return new Intl.DateTimeFormat(local_lang, { calendar: intlCalendar, month: "long", timeZone: "UTC" }).format(new Date((jd - 2440587.5) * 86400000));
    } catch (e) {
        return "";
    }
}

function htCalendarWeekdays(cal) {
    switch (cal) {
        case "gregory":
        case "julian":
            return keywords.slice(113, 120);
        case "islamic":
            return typeof ISLAMIC_WEEKDAYS != "undefined" ? ISLAMIC_WEEKDAYS : null;
        case "persian":
            return typeof PERSIAN_WEEKDAYS != "undefined" ? PERSIAN_WEEKDAYS : null;
        case "shaka":
            return typeof INDIAN_CIVIL_WEEKDAYS != "undefined" ? INDIAN_CIVIL_WEEKDAYS : null;
        default:
            return null;
    }
}

function htRenderCalendar(tableId, selectedCalendar) {
    const $tableElement = $(tableId);

    if ($tableElement.length === 0 || TzolkinDays.length == 0) {
        return;
    }

    // Fall back to the Gregorian calendar when the selected one has no months.
    var cal = htMonthCalendarDefs[selectedCalendar] != null ? selectedCalendar : "gregory";
    var def = htMonthCalendarDefs[cal];

    var now = new Date();
    var todayJd = gregorian_to_jd(now.getFullYear(), now.getMonth() + 1, now.getDate());
    var todayKey = htCalendarMonthKey(cal, def.fromJd(todayJd));

    // Walk to the first and last day of the selected calendar's current month.
    var firstJd = todayJd;
    var lastJd = todayJd;
    var guard = 0;
    while (guard++ < 400 && htCalendarMonthKey(cal, def.fromJd(firstJd - 1)) == todayKey) {
        firstJd--;
    }

    guard = 0;
    while (guard++ < 400 && htCalendarMonthKey(cal, def.fromJd(lastJd + 1)) == todayKey) {
        lastJd++;
    }

    var firstGregorian = jd_to_gregorian(firstJd);
    var startingDay = new Date(firstGregorian[0], firstGregorian[1] - 1, firstGregorian[2]).getDay();
    var year = def.fromJd(todayJd)[0];
    var weekdays = htCalendarWeekdays(cal);

    $tableElement.empty();
    $tableElement.append("<tr><td colspan=\"7\"> "+htCalendarMonthName(cal, def, firstJd)+" / "+year+" </td></tr>");

    // Only calendars with known weekday names get a weekday header row.
    if (weekdays != null) {
        var headerRow = "<tr>";
        for (var w = 0; w < 7; w++) {
            headerRow += "<td><span id=\"calendarDay"+w+"\">"+weekdays[w]+"</span></td>";
        }
        headerRow += "</tr>";
        $tableElement.append(headerRow);
    }

    var row = "<tr>";
    row += htCalendarFillEmpty(0, startingDay);

    for (var jd = firstJd; jd <= lastJd; jd++) {
        var date = def.fromJd(jd);
        var day = htCalendarDayOfMonth(cal, date);
        var tzolkinIdx = ((currentTzolkingDayIdx + (jd - todayJd)) % TzolkinDays.length + TzolkinDays.length) % TzolkinDays.length;
        var cell = TzolkinDays[tzolkinIdx];
        var setStyle = "";

        if (jd == todayJd) {
            if (weekdays != null) {
                $("#calendarDay"+startingDay).css("font-weight", "bold");
            }
            setStyle = "style=\"font-weight: bold;\"";
        }

        row += "<td style=\"background-color: "+cell.BGColor+"; \"><span "+setStyle+">"+day+" ("+cell.Period+" "+cell.Day+")</span></td>";

        startingDay++;
        if (startingDay == 7) {
            row += "</tr>";
            $tableElement.append(row);
            startingDay = 0;
            row = "<tr>";
        }
    }

    if (startingDay > 0) {
        row += htCalendarFillEmpty(startingDay, 7);
        row += "</tr>";
        $tableElement.append(row);
    }
}

function htGregorianCalendar(tableId) {
    htRenderCalendar(tableId, $("#site_calendar").val());
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
}

function htLoadContent() {
    htWriteNavigation();

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

    
    htSetImageSrc("imgd700", "images/MexicoCityMuseo/Cuauhxicalli.jpg")
    htSetImageSrc("imgMA", "images/Mapswire/mapswire-continent_na-printable-map-north-america-robinson-269_mesoamerica2.jpg")
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

