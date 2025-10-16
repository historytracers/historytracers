// SPDX-License-Identifier: GPL-3.0-or-later

// https://stackoverflow.com/questions/11182924/how-to-check-if-javascript-object-is-json
var stringConstructor = "HT".constructor;
var vectorConstructor = [].constructor;
var objectConstructor = ({}).constructor;
let keywords = [ ];
let mathKeywords = [ ];
var lastTreeLoaded = { "page" : null, "arg" : '' };

var personNameMap = new Map();
var familyMap = new Map();

var contentMap = new Map();

var primarySourceMap = new Map();
var refSourceMap = new Map();
var holyRefSourceMap = new Map();
var smSourceMap = new Map();

var genealogicalStats = {};

var smGame = [];
var smGameTimeoutID = 0;

var htAtlas = new Map();

var loadedIdx = [];
var htHistoryIdx = new Map();
var htLiteratureIdx = new Map();
var htHistoryIdx = new Map();
var htFirstStepsIdx = new Map();
var htMathGamesIdx = new Map();
var htIndigenousWhoIdx = new Map();
var htMythsBelievesIdx = new Map();
var htHistoricalEventsIdx = new Map();
var htBiologyIdx = new Map();
var htChemicalIdx = new Map();
var htPhysicsIdx = new Map();
var htFamilyIdx = new Map();

var extLatexIdx = 0;

var htGameImages = [ "MachuPicchu/MachuPicchu.jpg", "Xunantunich/WitzXunantunich.jpg", "Teotihuacan/TeotihuacanGeneral.jpg", "Teotihuacan/TeotihuacanMountains.jpg", "Caral/CaralPiramideH1.jpg", "Cuzco/PachacutiCuzco.jpg", "CahalPech/CahalPechPyramid.jpg", "Caracol/CaracolWitz.jpg", "JoyaCeren/JoyaCeren.jpg", "SanAndres/SanAndresPyramid.jpg", "Tikal/NecropoleTikal.jpg", "Tula/CiudadTula.jpg", "PeruPucllana/Huaca.jpg", "MiPueblito/MiPueblito.jpg", "Copan/CopanAltarGenealogy0.jpg", "Copan/CopanAltarGenealogy1.jpg", "Copan/CopanAltarGenealogy2.jpg", "Copan/CopanAltarGenealogy3.jpg", "Copan/StelaACopan.jpg", "Copan/CopanWholeTextStelaAltar.png", "GuatemalaKaminaljuyu/Kaminaljuyu.jpg" ];
var htGameImagesLocation = [ "Machu Picchu, Perú", "Xunantunich, Belieze", "Teotihuacan, México", "Caral, Perú", "Cusco, Perú", "Cahal Pech, Belieze", "Caracol, Belieze", "Joya de Ceren, El Salvador", "San Andres, El Salvador", "Tikal, Guatemala", "Ciudad de Tula, México", "Huaca Puclana, Perú", "Mi Pueblito, Panamá", "Copan, Honduras", "Copan, Honduras", "Copan, Honduras", "Copan, Honduras", "Teotihuacan, México", "Copan, Honduras", "Copan, Honduras", "Kaminaljuyu, Guatemala" ];

var htSequenceGame = [ "AntopologyPeru/CeramicaAntropologiaPeru.jpg", "CahalPech/ChocolatPot.jpg", "GuatemalaAntropologia/EstelaAntropologiaGuatemala.jpg", "GuatemalaKaminaljuyu/Kaminaljuyu.jpg", "CostaRicaJade/MayaCRJade.jpg", "Teotihuacan/MetateTeotihuacan.jpg", "SanJoseCRMuseo/SanJoseCRAntropologia.jpg", "ElSalvadorMuseo/SanSalvadorESAntropologia.jpg", "Copan/StelaACopan.jpg", "SanJoseCRMuseo/MusicCR.jpg" ];
var htSequenceGameLocation = [ "Lima, Peru", "Cahal Pech, Belize", "Ciudad de Guatemala, Guatemala", "Kaminaljuyu - Ciudad de Guatemala, Guatemala", "San Jose, Costa Rica", "Teotihuacan, Mexico", "San Jose, Costa Rica", "San Salvador, El Salvador", "Copan, Honduras", "San Jose, Costa Rica" ];

var htEditable = undefined;

function htEnableEdition(data) {
    if (htEditable) {
        $(".htEditor").each(function() {
            $(this).css('visibility', 'visible');
        });
    }
}


//
//    Navigation Section
//

function htScroolToID(id) {
    $('html, body').scrollTop($(id).offset().top);
}

function htScroolTree(id)
{
    var destination = $(id).val();
    if (destination != undefined) {
        $('html, body').scrollTop($(id).offset().top);
    }
}

function htImageZoom(id, translate) {
    var $element = $("#" + id);
    var isZoomed = $element.hasClass("zoomed");

    if (!isZoomed) {
        var scale = (window.innerWidth < 800) ? 1.5 : 2.0;
        $element.css("transform", "scale(" + scale + ") translate(" + translate + ")");
    } else {
        $element.css("transform", "scale(1) translate(0, 0)");
    }

    $element.toggleClass("zoomed");
}

//
//    Reset Section
//

function htCleanSources()
{
    $("#tree-source").html("");
    $("#tree-ref").html("");
    $("#tree-holy-ref").html("");
    $("#tree-sm-ref").html("");
}

function htResetGenealogicalStats() {
    return { "primary_src" : 0, "reference_src" : 0, "holy_src": 0, "social_media_src": 0, "families": 0, "people": 0, "marriages": 0, "children": 0 };
}

function htResetAllIndexes()
{
    loadedIdx = [];
    const indexMaps = [
        htHistoryIdx,
        htLiteratureIdx,
        htHistoryIdx,
        htFirstStepsIdx,
        htMathGamesIdx,
        htFamilyIdx,
        htIndigenousWhoIdx,
        htMythsBelievesIdx,
        htHistoricalEventsIdx,
        htBiologyIdx,
        htChemicalIdx,
        htPhysicsIdx
    ];

    indexMaps.forEach(map => {
        if (map && typeof map.clear === 'function') {
            map.clear();
        }
    });
}

function htResetAnswers(vector)
{
    if (!Array.isArray(vector)) {
        return;
    }

    const exerciseCount = vector.length;

    for (let i = 0; i < exerciseCount; i++) {
        const exerciseId = i;

        $(`#answer${exerciseId}`).text('');
        $(`input[name="exercise${exerciseId}"]`).prop('checked', false);

        $(`#explanation${exerciseId}`).css({
            display: 'none',
            visibility: 'hidden'
        });
    }
}

//
//    Reflection Section
//

function htAddTreeReflection(elementId, keywordIndex)
{
    const $element = $(elementId);

    if ($element.length === 0 || !Array.isArray(keywords)) {
        return;
    }

    if (keywordIndex >= 0 && keywordIndex < keywords.length) {
        $element.html(keywords[keywordIndex]);
    }
}

function htAddReligionReflection(elementSelector)
{
    const RELIGION_KEYWORD_INDEX = 69;
    if (!elementSelector || typeof elementSelector !== 'string') {
        return;
    }

    const $element = $(elementSelector);

    if ($element.length === 0 || !Array.isArray(keywords)) {
        return;
    } else if (keywords.length <= RELIGION_KEYWORD_INDEX) {
        return;
    }

    try {
        $element.html(keywords[RELIGION_KEYWORD_INDEX]);
    } catch (error) {
        console.error('Failed to set reflection content:', error);
    }
}

function htAddPaperDivs(generalID, id, text, before, later, i)
{
    var div = before + "<div id=\"paper-";
    div += (id != undefined) ? id : i;
    div += "\">";

    div += text;

    div += "</div>" + later;
    $(generalID).append(div);
}

//
//    Print Section
//

function htFillSourceContentToPrint(text, map, id)
{
    if (map.size == 0 || text.size == 0) {
        return text;
    }

    var mention = "";
    map.forEach((value, key) => {
        var textDate = "";
        if (value.date != undefined && value.date != null && value.date.length > 0) {
            var dateVector = value.date.split("-");
            textDate = htFillHTDate(dateVector);
        } else if (value.date_time != undefined && value.date_time != null && value.date_time.length > 0) {
            var dateVector = value.date_time.split("-");
            textDate = htFillHTDate(dateVector);
        }
        var urlValue = (value.url != undefined && value.url != null && value.url.length > 0) ? urlValue = keywords[23]+"  "+value.url : "";
        var dateValue = ". [ "+keywords[22]+" "+textDate+" ].";
        mention += "<p>"+value.citation+" "+dateValue +" "+urlValue+"</p>";
    });

    const replacement = `<div id="${id}" class="cited-text">${mention}</div>`;
    return text.replace(`<div id="${id}" class="cited-text"></div>`, replacement);
}

function htPrintContent(header, body)
{
    try {
        if (!header || !body) {
            throw new Error('Header and body selectors are required');
        }

        const $header = $(header);
        const $body = $(body);
        const $sources = $(".right-sources");

        if (!$header.length || !$body.length || !$sources.length) {
            throw new Error('Required elements not found in the DOM');
        }

        const pageHeader = $header.html();
        const pageBody = $body.html();
        let pageCitation = $sources.html();

        // Process all source maps
        const sourceMaps = [
            { map: primarySourceMap, id: 'tree-source' },
            { map: refSourceMap, id: 'tree-ref' },
            { map: holyRefSourceMap, id: 'tree-holy-ref' },
            { map: smSourceMap, id: 'tree-sm-ref' }
        ];

        sourceMaps.forEach(({ map, id }) => {
            pageCitation = htFillSourceContentToPrint(pageCitation, map, id);
        });

        // Create print document with proper HTML structure
        const printDocument = `
<!DOCTYPE html>
<html>
<head>
    <title>Print Document</title>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 20px;
        }
        h1 {
            text-align: center;
            margin-bottom: 20px;
        }
        .cited-text {
            margin-top: 30px;
            border-top: 1px solid #ccc;
            padding-top: 15px;
        }
        @media print {
            body { margin: 0; }
        }
    </style>
</head>
<body>
    <h1>${pageHeader}</h1>
    <div>${pageBody}</div>
    <div class="cited-text">${pageCitation}</div>
</body>
</html>`;

        // Open print window
        const printWindow = window.open('', 'PRINT', 'height=600,width=800');

        if (!printWindow) {
            throw new Error('Popup blocked. Please allow popups for this site.');
        }

        printWindow.document.write(printDocument);
        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = function() {
            printWindow.focus();

            // Add slight delay to ensure content is rendered
            setTimeout(() => {
                printWindow.print();
            }, 250);
        };

    } catch (error) {
        console.error('Printing failed:', error);
        alert('Printing failed: ' + error.message);
    }
}

//
//    Date Section
//

function htShowDateRef()
{
    var src = "John Walker - Fourmilab . [ Accessed on Apr 26, 2024 ]. Retrieved from <a href=\"https://www.fourmilab.ch/documents/calendar/\" target=\"_blank\">https://www.fourmilab.ch/documents/calendar/</a>"
    $("#tree-ref").html(src);
}

function htUpdateCurrentDateOnIndex()
{
    var current_time = Math.floor(Date.now()/1000);
    var local_lang = $("#site_language").val();
    var local_calendar = $("#site_calendar").val();
    var text = htConvertDate(local_calendar, local_lang, current_time, undefined, undefined);
    $("#current_day").html(keywords[42]+" "+text+" <sup><a href=\"#\" onclick=\"htCleanSources(); htShowDateRef();  return false;\">Walker, J.</a></sup>");
}

function htAdjustGregorianZeroYear(text)
{
    if (typeof text !== 'string' || !text.trim()) {
        return text || '';
    }

    const parts = text.trim().split(/\s+/);
    if (parts.length <= 1) {
        return '0';
    }

    parts[parts.length - 1] = '0';
    return parts.join(' ');
}

function htConvertDate(calendarType, locale, unixEpoch, julianEpoch, gregorianDate)
{
    if (!calendarType || !locale) {
        console.error('Missing required parameters: calendarType and locale');
        return '';
    }

    var ct = undefined;
    var intEpoch = undefined;
    var jd = undefined;
    if (unixEpoch != undefined) {
        intEpoch = parseInt(unixEpoch);
        ct = new Date(0);
        jd = calcUnixTime(intEpoch);
    } else if (julianEpoch != undefined) {
        intEpoch = parseInt(julianEpoch);
        jd = calcJulian(julianEpoch);
        ct = new Date(jd[0], jd[1], jd[2]);
    } else if (gregorianDate != undefined) {
        intEpoch = gregorian_to_jd(gregorianDate[0], gregorianDate[1], gregorianDate[2]);
        jd = calcJulian(intEpoch);
        // Pass month index instead index
        ct = new Date(gregorianDate[0], gregorianDate[1] - 1, gregorianDate[2], 0, 0, 0);
        // reset to avoid wrong values
        ct.setFullYear(gregorianDate[0], gregorianDate[1] - 1, gregorianDate[2]);
    } else {
        return;
    }

    ct.toLocaleString(locale, { timeZone: 'UTC' })
    var julianDays = gregorian_to_jd(jd[0], jd[1], jd[2]);

    var text = "";
    var year = " "+keywords[43];
    var mesoamericanPeriod = 0;
    switch(calendarType) {
        case "gregory":
        case "hebrew":
        case "islamic":
        case "persian":
            break;
        case "julian":
            text = julianDays + " " + keywords[41];
            return text;
        case "emesoamerican":
            mesoamericanPeriod = jd_to_extended_mayan_count(julianDays);
        case "mesoamerican":
            if (mesoamericanPeriod == 0) {
                mesoamericanPeriod = jd_to_mayan_count(julianDays);
            }
            var haab = jd_to_mayan_haab(julianDays);
            var tzolkin = jd_to_mayan_tzolkin(julianDays);
            text = mesoamericanPeriod[0] + "." + mesoamericanPeriod[1]+ "." + mesoamericanPeriod[2]+ "." + mesoamericanPeriod[3]+ "." + mesoamericanPeriod[4]+ "." + mesoamericanPeriod[5]+ "." + mesoamericanPeriod[6]+ "." + mesoamericanPeriod[7] + " ( Haab: " +haab[1]+ " "+MAYAN_HAAB_MONTHS[haab[0] - 1] + ", Tzolkin: "+tzolkin[1] + " " + MAYAN_TZOLKIN_MONTHS[tzolkin[0] - 1]+ " )";
            return text;
        case "french":
            var frCals = jd_to_french_revolutionary(julianDays);
            year = (frCals[0] < 0 ) ? Math.abs(frCals[0]) + " "+ keywords[43] : frCals[0]; 

            text = "Année " + year + " Mois "+frMonth[frCals[1] - 1]+ " Décade "+frDecade[frCals[2] - 1]+" Jour "+ frDay[((frCals[1] <= 12) ? frCals[3] : (frCals[3] + 11))];
            return text;
        case "shaka":
            var indianCal = jd_to_indian_civil(julianDays);
            year = (indianCal[0] < 0 ) ? Math.abs(indianCal[0]) + " "+ keywords[43]  : indianCal[0]; 

            text = indianCal[2] + "."+indianMonths[indianCal[1] - 1]+ "."+year;
            return text;
        case "hispanic":
            intEpoch += 1199188800;
        default:
            calendarType = "gregory";
            break;
    }

    if (unixEpoch != undefined) {
        ct.setUTCSeconds(intEpoch);
    }

    text = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', calendar: calendarType }).format(ct);

    if (calendarType == "gregory") { 
        var yearValue = ct.getFullYear();
        if (yearValue < 0) {
            text += " "+keywords[43];
        } else if (yearValue == 0) {
            text = htAdjustGregorianZeroYear(text);
        }
    }

    return text;
}

function htConvertGregorianYearToJD(gregoryYear)
{
    var ct = new Date();
    if (gregoryYear != "now") {
        var year = parseInt(gregoryYear);
        ct.setYear(year);
    }
    // gregorian to jd will subtract an year before to convert
    return gregorian_to_jd(gregoryYear, ct.getMonth(), ct.getDate());
}

function htConvertGregorianYear(test, gregoryYear)
{
    var year = 0;
    if (gregoryYear != "now") {
        year = parseInt(gregoryYear);
    } else {
        var ct = new Date();
        year = ct.getFullYear();
    }
    var jd = htConvertGregorianYearToJD(year);
    var text = "";
    if (test == "gregory")  {
        if (year >= 0) {
            text += year;
        } else {
            text += Math.abs(year)+" "+keywords[43];
        }
    } else {
        var coverted = undefined;
        var mesoamericanPeriod = 0;
        switch(test) {
            case "hebrew":
                converted = jd_to_hebrew(jd);
                break;
            case "islamic":
                converted = jd_to_islamic(jd);
                break;
            case "persian":
                converted = jd_to_persian(jd);
                break;
            case "julian":
                text = jd + " " + keywords[41];
                return text;
            case "emesoamerican":
                mesoamericanPeriod = jd_to_extended_mayan_count(jd);
            case "mesoamerican":
                if (mesoamericanPeriod == 0) {
                    var mesoamericanPeriod = jd_to_mayan_count(jd);
                }

                var haab = jd_to_mayan_haab(jd);
                var tzolkin = jd_to_mayan_tzolkin(jd);
                text = mesoamericanPeriod[0] + "." + mesoamericanPeriod[1]+ "." + mesoamericanPeriod[2]+ "." + mesoamericanPeriod[3]+ "." + mesoamericanPeriod[4]+ "." + mesoamericanPeriod[5]+ "." + mesoamericanPeriod[6]+ "." + mesoamericanPeriod[7] + " ( Haab: " +haab[1]+ " "+MAYAN_HAAB_MONTHS[haab[0] - 1] + ", Tzolkin: "+tzolkin[1] + " " + MAYAN_TZOLKIN_MONTHS[tzolkin[0] - 1]+ " )";
                return text;
            case "french":
                var frCals = jd_to_french_revolutionary(jd);
                year = (frCals[0] < 0 ) ? Math.abs(frCals[0]) + " "+ keywords[43] : frCals[0]; 
    
                text = "" + year;
                return text;
            case "shaka":
                var indianCal = jd_to_indian_civil(jd);
                year = (indianCal[0] < 0 ) ? Math.abs(indianCal[0]) + " "+  keywords[43] : indianCal[0]; 
    
                text = ""+year;
                return text;
            case "hispanic":
                converted = new Array(""+(parseInt(year) + 38));
                break;
            default:
                return undefined;
        }
        if (converted[0] >= 0) {
            text += converted[0];
        } else {
            text += Math.abs(converted[0])+" "+keywords[43];
        }
    }
    return text;
}

function htConvertGregorianDate(test, locale, year, month, day)
{
    var useYear = "";
    if (year != "now") {
        useYear = parseInt(year);
    } else {
        var ct = new Date();
        useYear = ct.getFullYear();
    }
    var dateArr = new Array(useYear, month, day);
    return htConvertDate(test, locale, undefined, undefined, dateArr);
}

function htConvertUnixDate(test, locale, unixEpoch)
{
    return htConvertDate(test, locale, unixEpoch, undefined, undefined);
}

function htConvertJulianDate(test, locale, julianEpoch)
{
    return htConvertDate(test, locale, undefined, julianEpoch, undefined);
}


//
//    Link Section
//

function htMountCurrentLinkBasis(familyID, id)
{
    const url = window.location.href;
    var remove = url.search("#");
    if (remove < 0) {
        remove = url.search("\\?");
    }

    var userURL = (remove > 0 )? url.substring(0, remove) : url;

    userURL += "?page=tree&arg="+familyID;

    if (id) {
        var myTree = url.search("page=tree");
        if (myTree >= 0) {
            userURL += "&person_id=" + id;
        }
    }

    return userURL;
}

function htSetCurrentLinkBasis(familyID, id, finalURL)
{
    const myURL = (finalURL == undefined) ? htMountCurrentLinkBasis(familyID, id) : finalURL;
    window.history.replaceState(null, null, myURL);

    return false;
}

function htCopyLink(familyID, id, changeTextId)
{
    var userURL = htMountCurrentLinkBasis(familyID, id);
    htSetCurrentLinkBasis(familyID, id, userURL);

    userURL += "&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val();

    var temp = $("<input>");
    $("body").append(temp);
    temp.val(userURL).select();
    document.execCommand("copy");
    temp.remove();

    const $link = $("#"+changeTextId);
    const originalText = $link.text();

    $link.text(keywords[133]);
    setTimeout(() => {
        $link.text(originalText);
    }, 3000);

    return false;
}

//
//    Source Section
//

function htLoadSources(data, arg, page)
{
    if (data.sources) {
        data.sources.forEach(source => {
            htLoadPage(source, 'json', 'source', false);
        });
        return;
    }

    if (arg !== 'source') {
        return;
    }

    if (!data) {
        console.warn('Invalid data structure provided to htLoadSources');
        return;
    }

    const sourceMappings = [
        { map: primarySourceMap, sources: data.primary_sources },
        { map: refSourceMap, sources: data.reference_sources },
        { map: holyRefSourceMap, sources: data.religious_sources },
        { map: smSourceMap, sources: data.social_media_sources }
    ];

    sourceMappings.forEach(({ map, sources }) => {
        htFillMapSource(map, sources || []);
    });

    if (page && page.length === 36) {
        genealogicalStats.primary_src = data.primary_sources?.length || 0;
        genealogicalStats.reference_src = data.reference_sources?.length || 0;
        genealogicalStats.holy_src = data.religious_sources?.length || 0;
        genealogicalStats.social_media_src = data.social_media_sources?.length || 0;
    }
}

function htFillHistorySources(divId, histID, history, useClass, personID)
{
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();
    if (history) {
        for (const i in history) {
            var localObj = history[i];
            var text = (localObj.text != undefined && localObj.format != undefined) ? htParagraphFromObject(localObj, localLang, localCalendar) : "<p>"+localObj+"</p>";
            $(histID).append("<p class=\""+useClass+"\" onclick=\"htFillTree('"+personID+"'); \">"+text+"</p>");
        }
    }
}

function htFillMapSource(myMap, data)
{
    if (!data) {
        return;
    }

    const currentLanguage = $("#site_language").val();
    const currentCalendar = $("#site_calendar").val();
    for (const i in data) {
        var ids = myMap.has(data[i].id);
        if (ids == false) {
            var finalDate = "";
            if (data[i].date != undefined ) {
                var dateVector = data[i].date.split('-');
                if (dateVector.length == 3) {
                    finalDate = htConvertGregorianDate(currentCalendar, currentLanguage, dateVector[0], dateVector[1], dateVector[2]);
                }
            } else if  (data[i].date_time != undefined ){
                var dateVector = data[i].date_time.split('-');
                if (dateVector.length == 3) {
                    finalDate = htConvertGregorianDate(currentCalendar, currentLanguage, dateVector[0], dateVector[1], dateVector[2]);
                }
            }
            myMap.set(data[i].id, {"citation" : data[i].citation, "date" : finalDate, "url" : data[i].url});
        }
    }
}

function htLoadSource(divID, sourceMap, listMap, theID)
{
    $(divID).html("");
    var ps = listMap.has(theID);
    if (ps) {
        var localMap = listMap.get(theID);
        var arr = localMap.split(';');
        if (arr.length > 0 ) {
            for (let i = 0 ; i < arr.length; i++) {
                htFillSource(divID, sourceMap, arr[i]);
            }
        }
    }
}

function htFillSource(divID, sourceMap, id)
{
    const src = sourceMap.get(id);
    if (src) {
        var dateValue = "";
        if (src.date_time && src.date_time.length > 0) {
            dateValue = ". [ "+keywords[22]+" "+src.date_time+" ].";
        }
        var urlValue = "";
        if (src.url && src.url.length > 0) {
            urlValue = keywords[23]+" <a target=\"_blank\" href=\""+src.url+"\"> "+src.url+"</a>";
        }
        $(divID).append("<p>"+src.citation+" "+dateValue +" "+urlValue+"</p>");
    }
}

//
//    Mount Family Page Section
//

function htAppendFamilyParentsData(prefix, id, familyID, table, page) {
    var parents = table.parents;
    for (const i in parents) {
        var couple = parents[i];
        var parents_id = prefix+"-parents-"+id;
        var father = couple.father_id;
        var mother = couple.mother_id;
        if (!father && !mother) {
            $("#"+prefix+"-"+id).append("<div id=\""+parents_id+"\" class=\"tree-real-family-text\"><p><b>"+keywords[0] + "</b>: " + keywords[10]+"</p></div>");

            familyMap.set(id, "null&null&t");
        } else {
            var parentsLink = "";
            var name = "";
            if (father && couple.father_family.length > 0) {
                parents_id += father + "-";
                name = personNameMap.get(father);
                if (name) {
                    if (couple.father_family != undefined && couple.father_family.length > 0) {
                        if (couple.father_family == familyID || (couple.father_external_family_file != undefined && couple.father_external_family_file == false)) {
                            parentsLink += "<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+father+"'); htFillTree('"+father+"'); htSetCurrentLinkBasis('"+page+"', '"+father+"',"+undefined+");\">" +name+"</a>";
                        } else {
                            parentsLink += "<a target=\"_blank\" href=\"index.html?page=tree&arg="+couple.father_family+"&person_id="+father+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.father_family+"&person_id="+father+"', false); return false;\">"+name+"</a>";
                        }
                    } else {
                        parentsLink += couple.father_name;
                    }
                } else if (couple.father_name && couple.father_family && couple.father_family != familyID && couple.father_family > 0) {
                    parentsLink += "<a target=\"_blank\" href=\"index.html?page=tree&arg="+couple.father_family+"&person_id="+father+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.father_family+"&person_id="+father+"', false); return false;\">"+couple.father_name+"</a>";
                } else {
                    parentsLink += couple.father_name;
                }
            } else {
            parentsLink += couple.father_name;
            }
            parents_id += "-";

            if (mother) {
                parents_id += mother + "-";
                name = personNameMap.get(mother);
                if (name) {
                    if (couple.mother_family != undefined && couple.mother_family.length > 0) {
                        if (couple.mother_family == familyID || (couple.mother_external_family_file != undefined && couple.mother_external_family_file == false)) {
                            parentsLink += " & <a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+mother+"'); htFillTree('"+mother+"'); htSetCurrentLinkBasis('"+page+"', '"+mother+"',"+undefined+");\">" +name+"</a>";
                        } else {
                            parentsLink += " & <a target=\"_blank\" href=\"index.html?page=tree&arg="+couple.mother_family+"&person_id="+mother+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.mother_family+"&person_id="+mother+"', false); return false;\">"+name+"</a>";
                        }
                    } else {
                        parentsLink += " & " +name;
                    }
                } else if (couple.mother_name && couple.mother_family && couple.mother_family != familyID && couple.mother_family > 0) {
                    parentsLink += " & <a target=\"_blank\" href=\"index.html?page=tree&arg="+couple.mother_family+"&person_id="+mother+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.mother_family+"&person_id="+mother+"', false); return false;\">"+couple.mother_name+"</a>";
                } else {
                    parentsLink += " & " +couple.mother_name;
                }
            }

            var use_keyword;
            var use_class;
            if (couple.type == "theory") {
                use_keyword = keywords[0];
                use_class = "tree-real-family-text";
            } else {
                use_keyword = keywords[1];
                use_class = "tree-hipothetical-family-text";
            }

            if (parentsLink.length == 0) {
                parentsLink += couple.father_name+" & "+couple.mother_name;
            }
            $("#"+prefix+"-"+id).append("<div id=\""+parents_id+"\" class=\""+use_class+"\"><p><b>"+use_keyword + "</b>: " +parentsLink+"</p></div>");
        }
    }
}

function htAppendFamilyMarriagesData(prefix, id, familyID, table, page) {
    var marriages = table.marriages;
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();

    genealogicalStats.marriages += marriages.length;
    for (const i in marriages) {
        var marriage = marriages[i];
        var rel_id = prefix+"-relationship-"+marriage.id;

        var marriage_class;
        var type = marriage.type; 
        var official = marriage.official; 
        var marriage_keyword;

        if (marriage.id == undefined) {
            $("#"+prefix+"-"+id).append("<div id=\""+rel_id+"\" class=\"tree-real-family-text\"><p><b>"+keywords[17]+"</b>: "+keywords[19]+"</p></div>");
        } else {
            var msg = "";
            if (type == "theory") {
                marriage_class = "tree-real-family-text";
                marriage_keyword = keywords[17];
            } else {
                marriage_class = "tree-hipothetical-family-text";
                marriage_keyword = keywords[18];
                msg = "<div class=\"no_personal_events_class\"><p>"+keywords[102]+keywords[96]+keywords[98]+"</p></div>";
            }

            if (official != undefined && official == false) {
                marriage_keyword = keywords[86];
            }
            var marriageLink = "";
            var datetime = "";
            if (marriage.date_time != undefined && marriage.date_time.sources != null) {
                datetime = htMountPersonEvent(" ", marriage.date_time, localLang, localCalendar);
            }

            if (marriage.family_id == undefined || marriage.family_id.length == 0 || familyID == undefined) {
                marriageLink = marriage.name;
            } else if ((familyID == marriage.family_id) || (marriage.external_family_file != undefined && marriage.external_family_file == false)) {
                marriageLink = "<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+marriage.id+"'); htFillTree('"+marriage.id+"'); htSetCurrentLinkBasis('"+page+"', '"+marriage.id+"',"+undefined+");\">"+marriage.name+"</a>"+datetime;
            } else {
                marriageLink = "<a href=\"index.html?page=tree&arg="+marriage.family_id+"&person_id="+marriage.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+marriage.family_id+"&person_id="+marriage.id+"', false); return false;\">"+marriage.name+"</a>"+datetime;
            }

            $("#"+prefix+"-"+id).append("<div id=\""+rel_id+"\" class=\""+marriage_class+"\"><p><b>"+marriage_keyword+"</b> "+marriageLink+".</p>"+msg+"</div>");
           htFillHistorySources(marriage.id, "#"+rel_id, marriage.history, "tree-default-align", marriage.id);

            var showTree = personNameMap.has(marriage.id);
            if (showTree == false) {
                personNameMap.set(marriage.id, marriage.name);
            }
        }
    }
}

function htAppendFamilyChildrenData(prefix, id, familyID, table, page) {
    var children = table.children;
    genealogicalStats.children += children.length;
    for (const i in children) {
        var child = children[i];
        var child_id = prefix+"-children-"+child.id;
        var relationship_id = prefix+"-relationship-";
        if (child.marriage_id != undefined) {
            relationship_id += child.marriage_id;
        }

        var child_class;
        var type = child.type; 
        var child_keyword;
        var msg = "";
        if (type == "theory") {
            child_class = "tree-real-child-text";
            child_keyword = keywords[20];
        } else {
            child_class = "tree-hipothetical-child-text";
            child_keyword = keywords[21];
            msg = "<div class=\"no_personal_events_class\"><p>"+keywords[102]+keywords[96]+keywords[98]+"</p></div>";
        }

        var childLink = "";
        if (child.family_id == undefined || child.family_id.length == 0 || ((child.external_family_file != undefined && child.external_family_file == false) && child.add_link == false)) {
            childLink = child_keyword+" "+child.name;
        } else if (familyID == child.family_id || (child.external_family_file != undefined && child.external_family_file == false)) {
            childLink = "<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+child.id+"'); htFillTree('"+child.id+"'); htSetCurrentLinkBasis('"+page+"', '"+child.id+"',"+undefined+");\">"+child_keyword+" "+child.name+"</a>";
        } else { 
            childLink = "<a href=\"index.html?page=tree&arg="+child.family_id+"&person_id="+child.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+child.family_id+"&person_id="+child.id+"', false);\">"+child_keyword+" "+child.name+"</a>";
        }

        $("#"+relationship_id).append("<div id=\""+child_id+"\" class=\""+child_class+"\"><p><b>"+childLink+"</b>: </p>"+msg+"</div>");
        $("#"+child_id).append("<div id=\"with-parent-"+child.id+"\" class=\""+child_class+"\"></div>");
        htFillHistorySources("parent-"+child.id, "#with-parent-"+child.id, child.history, "", child.id);
        htSetMapFamily(child.id, id, child.marriage_id, child.type);
        personNameMap.set(child.id, child.name);
    }
}

function htAppendFamilyData(prefix, id, familyID, name, table, page) {
    var history = table.history;
    var parents = table.parents;
    var marriages = table.marriages;

    if (history != undefined) {
        var title;
        var goToTop;
        if ((parents == undefined || marriages == undefined) && (prefix != "tree")) {
            title = keywords[8];
            goToTop ="<a href=\"javascript:void(0);\" onclick=\"htScroolToID('#index_list');\">"+keywords[78]+"</a>";
        } else {
            title = keywords[9];
            goToTop ="";
        }
        var personalEvents = htMountPersonEvents(table);
        $("#"+prefix+"-"+id).append("<h3 id=\"name-"+id+"\" onclick=\"htFillTree('"+id+"'); htSetCurrentLinkBasis('"+page+"', '"+id+"',"+undefined+");\">"+title + " : " +name+" (<a id=\""+prefix+"_"+id+"link\" href=\"javascript:void(0);\" onclick=\"htCopyLink('"+page+"', '"+id+"', '"+prefix+"_"+id+"link'); return false;\" >"+keywords[26]+"</a>). "+goToTop+"</h3><p>"+personalEvents+"</p>");
    }

    var primary_source = table.primary_source;
    var references = table.references;
    var holy_references = table.holy_references;
    htFillHistorySources(id, "#"+prefix+"-"+id, history, "tree-default-align", id);

    if (parents) {
        htAppendFamilyParentsData(prefix, id, familyID, table, page);
    }

    if (table.marriages) {
        htAppendFamilyMarriagesData(prefix, id, familyID, table, page);
    }

    if (table.children) {
        htAppendFamilyChildrenData(prefix, id, familyID, table, page);
    }
}

function htHideTree(level, grandpaLevel) {
    if (level > 1 ) {
        $("#child").hide();
    }

    if (level > 0) {
        $("#father").hide();
        $("#mother").hide();
    }

    if (level > -1) {
        if (level > 1 ) {
            $("#grandfather01").hide();
            $("#grandmother01").hide();
        }

        if (level > 0 ) {
            $("#grandfather02").hide();
            $("#grandmother02").hide();
        }
    }
}

function htFillTree(personID)
{
    htHideTree(2, 2);
    if (personID == undefined) {
        return;
    }
    
    var type = "theory";
    var parents = htFillDivTree("#child", personID, type);
    if (parents == undefined) {
        htHideTree(1, 2);
        return;
    }

    var parentsId = parents.split('&');
    if (parentsId.length == 0) {
        htHideTree(1, 2);
        return;
    }

    type = (parentsId[2] == 't') ? 'theory' : 'hypothetical';
    var grandparents0 = htFillDivTree("#father", parentsId[0], type);
    if (grandparents0 == undefined) {
        htHideTree(0, 1);
    } else {
        var grandParentsId0 = grandparents0.split('&');
        if (grandParentsId0.length != 3) {
            htHideTree(0, 1);
        } else {
            var grandpatype = (grandParentsId0[2] == 't') ? 'theory' : 'hypothetical';
            var secgrandparents0 = htFillDivTree("#grandfather01", grandParentsId0[0], grandpatype);
            var secgrandparents1 = htFillDivTree("#grandmother01", grandParentsId0[1], grandpatype);
        }
    }

    var grandparents1 = htFillDivTree("#mother", parentsId[1], type);
    if (grandparents1 == undefined) {
        htHideTree(0, 2);
    } else {
        var grandParentsId1 = grandparents1.split('&');
        if (grandParentsId1.length != 3) {
            htHideTree(0, 2);
        } else {

            type = (grandParentsId1[2] == 't') ? 'theory' : 'hypothetical';
            var secgrandparents2 = htFillDivTree("#grandmother02", grandParentsId1[0], type);
            var secgrandparents3 = htFillDivTree("#grandfather02", grandParentsId1[1], type);
        }
    }
}

function htFillDivTree(divID, personID, type)
{
    if (personID == undefined || personID == "null") {
        $(divID).hide();
        return undefined;
    }

    var name = personNameMap.get(personID);
    if (name == undefined) {
        return undefined;
    }

    $(divID).html("");
    var value = name;
    var idx = name.search("\\(");
    
    $(divID).append(value.substring(0, (idx != -1)? idx : 32));
    if (type == "theory") {
        $(divID).css('border-style', 'solid');
        $(divID).css('font-style', 'normal');
    } else {
        $(divID).css('border-style', 'dashed');
        $(divID).css('font-style', 'italic');
    }
    $(divID).show();

    return familyMap.get(personID);
}

function htMountPersonEvent(name, data, localLang, localCalendar) {
    var ret = "<b>"+name+"</b> ";
    for (const i in data) {
        var ptr = data[i];
        if (!ptr.date_time) {
            continue;
        }

        if (i) {
            ret += " "+keywords[91]+" ";
        }
        const selDate = (ptr.date != undefined) ? ptr.date : ptr.date_time;
        ret += htMountSpecificDate(selDate[0], localLang, localCalendar)+" (";
        var sources = ptr.sources;
        for (const i in sources) { 
            let source = sources[i];
            if (i != 0) {
                ret += " ; ";
            }
            const fcnt = htFillHistorySourcesSelectFunction(source.type);
            const selLocalDate = source.date_time;
            let dateText = (source.date != undefined) ? ", "+htMountSpecificDate(selLocalDate, localLang, localCalendar) : "";
            ret += "<a href=\"#\" onclick=\"htCleanSources(); "+fcnt+"('"+source.uuid+"'); return false;\"><i>"+source.text+" "+dateText+"</i></a>";
        }

        ret += ")";
    }
    return ret;
}

function htMountPersonEvents(table) {
    var ret = "";
    if (!table.is_real) {
        return "<div class=\"no_personal_events_class\">"+keywords[95]+keywords[96]+keywords[97]+"</div>";
    }

    var localLang = $("#site_language").val();
    var localCalendar = $("#site_calendar").val();

    ret = "<div class=\"personal_events_class\">"+keywords[95];
    var begin = ret;

    var sex_gender = "";

    if (table.haplogroup != undefined && table.haplogroup.length > 0) {
        ret += "<b>"+keywords[103]+"</b>: ";
        for (const i in table.haplogroup) {
            var haplogroup = table.haplogroup[i]
            if (i != 0) {
                ret += ", ";
            }

            var sources = haplogroup.sources;
            var lnk = "";
            for (const i in sources) { 
                let source = sources[i];
                if (i != 0) {
                    text += " ; ";
                }
                var fcnt = htFillHistorySourcesSelectFunction(source.type);
                var dateText = "";
                if  (source.date_time) {
                    dateText =  ", "+htMountSpecificDate(source.date_time, localLang, localCalendar);
                }

                lnk += "<a href=\"#\" onclick=\"htCleanSources(); "+fcnt+"('"+source.uuid+"'); return false;\"><i>"+source.text+" "+dateText+"</i></a>";
            }
            ret += haplogroup.haplogroup+" ("+haplogroup.type+") ("+lnk+")" ;
        }
        ret += "<br />" ;
    }

    if (table.sex && table.sex.length > 0) {
        sex_gender = table.sex;
    }

    if (table.gender && table.gender.length > 0) {
        sex_gender += " / "+table.gender;
    }

    if (sex_gender.length > 0) {
        ret += "<b>"+keywords[100]+"/"+keywords[101]+"</b>: "+sex_gender+"<br />";
    }

    if (table.birth) {
        ret += htMountPersonEvent(keywords[92], table.birth, localLang, localCalendar)+"<br />";
    }

    if (table.baptism) {
        ret += htMountPersonEvent(keywords[93], table.baptism, localLang, localCalendar)+"<br />";
    }

    if (table.surname) {
        ret += "<b>"+keywords[104]+"</b>: "+table.surname+"<br />";
    }

    if (table.patronymic) {
        ret += "<b>"+keywords[105]+"</b>: "+table.patronymic+"<br />";
    }

    if (table.death) {
        ret += htMountPersonEvent(keywords[94], table.death, localLang, localCalendar)+"<br />";
    }

    if (begin.length == ret.length) {
        ret += keywords[99];
    }
    ret += "</div>";

    return ret;
}

function htSetMapFamily(id, father, mother, type)
{
    if (!father && !mother) {
        familyMap.set(id, "null&null&t");
        return;
    }

    var parent_idx = (father) ? father : "null";
    parent_idx += (mother) ? "&"+mother : "null";
    parent_idx += (type == "theory") ? "&t" : "&h";

    familyMap.set(id, parent_idx);
}

function htFillFamilies(page, table) {
    if (table.title) {
        $(document).prop('title', table.title);
    }

    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();
    if (table.documentsInfo && $("#overallInfo").length > 0) {
        var dIText = "<p><h3>"+keywords[53]+"</h3>"+keywords[59]+"</p>";
        if (table.documentsInfo.length == 4) {
            dIText += table.documentsInfo[3];
        }

        $("#overallInfo").html(dIText);

        if ($("#documentsInfoLang").length > 0) { $("#documentsInfoLang").html(table.documentsInfo[0]); }
        if ($("#documentsInfoCalendarName").length > 0) { $("#documentsInfoCalendarName").html(table.documentsInfo[1]); }
        if ($("#documentsInfoCalendarVisibleOption").length > 0) { $("#documentsInfoCalendarVisibleOption").html(table.documentsInfo[2]); }
    }

    if (table.periodOfTime && $("#periodOfTime").length > 0) {
        if (table.periodOfTime.length == 2) {
            var pOTText = "<p><h3>"+keywords[76]+"</h3>"+keywords[77]+"</p>";

            $("#periodOfTime").html(pOTText);

            if ($("#documentsPeriodOrigin").length > 0) { $("#documentsPeriodOrigin").html(table.periodOfTime[0]); }
            if ($("#documentsPeriodTime").length > 0) { $("#documentsPeriodTime").html(table.periodOfTime[1]); }
        }
    }

    if ($("#files").length > 0) {
        var csvgedtxt = keywords[108]+"<p><ul>";
        const csvgedLength = csvgedtxt.length;
        if (table.csv) {
            csvgedtxt += "<li><a href=\""+table.csv+"\" target=\"_blank\">CSV</a>: "+keywords[109]+"</li>";
        }

        if (table.gedcom) {
            csvgedtxt += "<li><a href=\""+table.gedcom+"\" target=\"_blank\">GEDCOM</a>: "+keywords[110]+"</li>";
        }
        if (csvgedLength != csvgedtxt.length) {
            csvgedtxt += "</ul></p>"+keywords[111];
            $("#files").html(csvgedtxt);
        }
    }

    if (table.maps && $("#maps").length > 0) {
        var textMap = "<p><h3>"+keywords[79]+"</h3>"+keywords[80]+"</p>";

        for (const i in table.maps) {
            var currMap = table.maps[i];
            if (currMap.text == undefined || currMap.img == undefined) {
                continue;
            }

            var map_desc = htOverwriteHTDateWithText(currMap.text, currMap.date_time, localLang, localCalendar);
            textMap += "<p class=\"desc\"><img src=\""+currMap.img+"\" id=\"imgFamilyMap"+currMap.order+"\" onclick=\"htImageZoom('imgFamilyMap"+currMap.order+"', '0%')\" class=\"imgcenter\"/>"+keywords[81]+" "+currMap.order+": "+map_desc+" "+keywords[82]+" "+keywords[83]+"</p>";
        }

        $("#maps").html(textMap);
    }

    if (table.prerequisites && $("#pre_requisites").length > 0) {
        var preRequisites = "";
        for (const i in table.prerequisites) {
            let pr = table.prerequisites[i];
            preRequisites += "<p>"+ pr + "</p>";
        }
        preRequisites += "</ul></p>";
        $("#pre_requisites").html(preRequisites);
    }

    if ($("#contribution").length > 0) {
        $("#contribution").html(keywords[54]);
    }

    $("#sources-lbl").html(keywords[5]);
    $("#tree-sources-lbl").html(keywords[5]);
    $("#tree-references-lbl").html(keywords[6]);
    $("#references-lbl").html(keywords[6]);
    $("#tree-holy_references-lbl").html(keywords[7]);
    $("#holy_references-lbl").html(keywords[7]);
    $("#tree-sm-references-lbl").html(keywords[75]);
    $("#tree-sm-lbl").html(keywords[75]);

    $("#child").html(keywords[9]);
    $("#father").html(keywords[2]);
    $("#mother").html(keywords[3]);
    $("#grandfather01").html(keywords[11]);
    $("#grandmother01").html(keywords[12]);
    $("#grandfather02").html(keywords[13]);
    $("#grandmother02").html(keywords[14]);

    genealogicalStats.families = (table.families != undefined) ? table.families.length : 0;
    var totalPeople = 0;
    for (const i in table.families) {
        let family = table.families[i];
        if (family.id == undefined ||
            family.name == undefined) {
            continue;
        }

        var family_id = family.id;
        $("#index_list").append("<li id=\"lnk-"+family_id+"\"><a href=\"javascript:void(0);\" onclick=\"htScroolTree('#hist-"+family_id+"');\">"+keywords[8] + " : " +family.name+"</a></li>");

        $("#trees").append("<div id=\"hist-"+family_id+"\"></div>");

        htAppendFamilyData("hist",
                   family_id,
                   undefined,
                   family.name,
                   family,
                   page);

        if (family.people == undefined) {
            continue;
        }

        var people = family.people;
        totalPeople += people.length;
        for (const j in people) {
            if (people[j].id == undefined ||
                people[j].name == undefined) {
                continue;
            }

            var person_id = people[j].id;
            $("#hist-"+family_id).append("<div id=\"tree-"+person_id+"\" class=\"tree-person-text\"></div>");

            personNameMap.set(people[j].id, people[j].fullname);
            htAppendFamilyData("tree",
                       person_id,
                       family_id,
                       people[j].fullname,
                       people[j],
                       page);
        }
    }
    genealogicalStats.people = totalPeople;


    var destination = $("#selector").val();
    if (destination != undefined && destination != null && destination.length > 1) {
        var localObject = $("#name-"+destination).val();
        if (localObject != undefined) {
            htScroolToID("#name-"+destination);
            htFillTree(destination);
        }
    }
    htLoadPage('tree','json', '', false);
 
    if (table.exercise_v2 != undefined && table.exercise_v2.constructor === vectorConstructor) {
        htWriteQuestions(table.exercise_v2, "", 0);
    }

    if (table.date_time != undefined && table.date_time.constructor === vectorConstructor) {
        htFillHTDate(table.date_time);
    } else if (table.fill_dates != undefined && table.fill_dates.constructor === vectorConstructor) {
        htFillHTDate(table.fill_dates);
    }

    $("#loading_msg").hide();
}

//
//    Mount Overall Page Section
//

function htFillPrimarySource(id)
{
    htFillSource("#tree-source", primarySourceMap, id);
}

function htFillReferenceSource(id)
{
    htFillSource("#tree-ref", refSourceMap, id);
}

function htFillHolySource(id)
{
    htFillSource("#tree-holy-ref", holyRefSourceMap, id);
}

function htFillSMSource(id)
{
    htFillSource("#tree-sm-ref", smSourceMap, id);
}

function htFillClassContentV2(table, last_update, page_authors, page_reviewers, index) {
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();

    if ($("#htaudio").length > 0 && table.audio) {
        htAddAudio(table.audio);
    }
    htFillDivAuthorsContent("#paper", last_update, page_authors, page_reviewers);

    var idx = 0;
    var navigationPage = "";
    if (index) {
        navigationPage = "<p class=\"dynamicNavigation\"></p>";
        htAddPaperDivs("#paper", "indexTop", navigationPage, "", "<hr class=\"limit\" />", idx);
        idx++;
    }

    for (const i in table.content) {
        let content = table.content[i];

        for (const j in content.text) {
            var localObj = content.text[j];
            var text = (localObj.text != undefined) ? htParagraphFromObject(localObj, localLang, localCalendar) : localObj;
            if ($("#"+content.id).length > 0) {
                $("#"+content.id).html(text);
            } else {
                htAddPaperDivs("#paper", content.id + "_"+j, text, "", "", idx);
            }
        }
        idx++;
    }

    if (table.exercise_v2) {
        htWriteQuestions(table.exercise_v2, "", idx);
    }

    if (table.game_v2) {
        htWriteGame(table.game_v2, "", 1);
    }

    if (table.date_time) {
        htFillHTDate(table.date_time);
    }

    htAddPaperDivs("#paper", "repeat-index", navigationPage, "<hr class=\"limit\" />", "", idx);
}

function htAddAudio(data) {
    var audioText = keywords[106];
    var counter = 0;
    for (const i in data) {
        var audio = data[i];
        if (audio.url == undefined || audio.length == 0) {
            continue;
        }

        if (i % 2 == 0) {
            counter++;
        }

        if (audio.spotify != undefined && audio.spotify == true) {
            audioText +=  ": <a href=\""+audio.url+"\" target=\"_blank\"> <i class=\"fa-brands fa-spotify\" target=\"_blank\" style=\"font-size: 1.0em;\"></i> "+keywords[107]+" "+counter+"</a>";
        } else {
            var audioURL = (audio.external != undefined && audio.external == false) ? "audio/"+audio.url : audio.url;
            audioText += " <audio controls preload=\"none\"><source src=\""+audioURL+"\" type=\"audio/ogg\"></audio>";
        }
    }
    $("#htaudio").html(audioText);
}

function htFillMixedMapList(table, target, time_vector) {
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();
    for (const i in table) {
        let item = table[i];
        var text = (item.date_time != undefined) ? htOverwriteHTDateWithText(item.desc, item.date_time, localLang, localCalendar) : item.desc;
        if (item.family_id != undefined && item.family_id.length > 0) {
            var person =  (item.person_id != undefined && item.person_id.length > 0 )? item.family_id+"&person_id="+item.person_id : item.family_id ;
            $("#"+target).append("<li id=\""+i+"\"><a href=\"index.html?page=tree&arg="+person+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+person+"', false); return false;\" >"+item.name+"</a>: "+text+"</li>");
        } else if (item.id != undefined && item.name != undefined && item.desc != undefined) {
            $("#"+target).append("<li id=\""+i+"\"><a href=\"index.html?page=class_content&arg="+item.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('class_content', 'html', '"+item.id+"', false); return false;\" >"+item.name+"</a>: "+text+"</li>"); 
        }
    }
}


function htFillGroupList(table, target, page, date_time) {
    const $target = $("#" + target);
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();
    for (const i in table) {
        const item = table[i];
        var additional = "";
        if (item.id != "date_time") {
            const links = [];
            if (item.csv) {
                links.push(`<a href="${item.csv}" target="_blank">CSV</a>`);
            }
            if (item.gedcom) {
                links.push(`<a href="${item.gedcom}" target="_blank">GEDCOM</a>`);
            }
            const additional = links.length ? ` (${links.join(", ")})` : "";

            const modifiedText = (date_time == undefined) ? item.name : htOverwriteHTDateWithText(item.name, date_time, localLang, localCalendar);

            $target.append("<li id=\""+item.id+"\"><a href=\"index.html?page="+page+"&arg="+item.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('"+page+"', 'html', '"+item.id+"', false); return false;\" >"+modifiedText+"</a>: "+item.desc+" "+additional+"</li>");
        } else {
            if (item.text.constructor === vectorConstructor) {
                htFillHTDate(item.text);
            }
        }
    }
}

function htFillSubMapList(table, target) {
    for (const i in table) {
        const item = table[i];
        switch(item.page) {
            case "class_content":
                if (item.id != undefined && item.name != undefined && item.desc != undefined) {
                    $("#"+target).append("<li id=\""+i+"\"><a href=\"index.html?page=class_content&arg="+item.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('class_content', 'html', '"+item.id+"', false); return false;\" >"+item.name+"</a>: "+item.desc+"</li>"); 
                }
                break;
            case "tree":
            default:
                if (item.person_id != undefined && item.family_id != undefined && item.family_id.length > 0 && item.fullname != undefined && item.desc != undefined) {
                    $("#"+target).append("<li id=\""+i+"\"><a href=\"index.html?page=tree&arg="+item.family_id+"&person_id="+item.person_id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+item.family_id+"&person_id="+item.person_id+"', false); return false;\" >"+item.fullname+"</a>: "+item.desc+"</li>");
                }
        }
    }
}

function htUpdateIndexSelector(table, targetId) {
    if (!Array.isArray(table)) return;

    for (const i in table) {
        let item = table[i];
        if ($(targetId+' option[value="'+item.dir+'"]').length > 0) {
            $(targetId+' option[value="'+item.dir+'"]').text(item.text);
        }
    }

    const $target = $(targetId);
    const currentValue = $target.val();

    $(targetId).val(currentValue);
}

function htUpdateAvailableLanguages(table) {
    if (!Array.isArray(table)) return;

    for (const i in table) {
        let item = table[i];
        if ($('#site_language option[value="'+item.dir+'"]').length > 0 && !item.available) {
            $('#site_language option[value="'+item.dir+'"]').remove();
        }
    }
}

function htFillKeywords(table) {
    if (!Array.isArray(table)) { return; }

    const MIN_LENGTH = 75;
    if (table.length < MIN_LENGTH) {
        console.warn(`Insufficient keywords: need ${MIN_LENGTH}, got ${table.length}`);
        return;
    }

    keywords = [];
    for (const i in table) {
        keywords.push(table[i]);
    }

    $("#index_lang").html(keywords[39]);
    $("#index_calendar").html(keywords[40]);
    $("#index_theme").html(keywords[74]);
    htUpdateCurrentDateOnIndex();
}

function htFillMathKeywords(table) {
    if (!Array.isArray(table)) { return; }

    mathKeywords = [];
    for (const i in table) {
        mathKeywords.push(table[i]);
    }
}

function htFillHistorySourcesSelectFunction(id)
{
    const map = {
        0: "htFillPrimarySource",
        1: "htFillReferenceSource",
        2: "htFillHolySource",
        3: "htFillSMSource"
    };

    return map[id] || map[3];
}

function htSelectIndexMap(index)
{
    const map = {
        history: htHistoryIdx,
        literature: htLiteratureIdx,
        first_steps: htFirstStepsIdx,
        math_games: htMathGamesIdx,
        families: htFamilyIdx,
        indigenous_who: htIndigenousWhoIdx,
        myths_believes: htMythsBelievesIdx,
        historical_events: htHistoricalEventsIdx,
        physics: htPhysicsIdx,
        chemistry: htChemicalIdx,
        biology: htBiologyIdx
    };

    return map[index];
}

function htSelectIndexName(index) {
    const map = {
        families: keywords[8],
        first_steps: keywords[121],
        atlas: "Atlas",
        literature: keywords[122],
        indigenous_who: keywords[123],
        myths_believes: keywords[124],
        history: keywords[125],
        math_games: keywords[126],
        physics: keywords[127],
        chemistry: keywords[128],
        biology: keywords[129],
        historical_events: keywords[130]
    };

    return map[index] || "Undefined";
}

function htUpdateNavigationTitle(currentIdx, title, indexName)
{
    var pageHeader = $("#header").html();

    if (currentIdx == 0) {
        $("#header").removeClass();
        $("#header").removeAttr("style");
        $("#header").addClass("top-bar-inside-left");
        pageHeader = title+" ("+indexName+")";
    } else {
        const ww = window.innerWidth;
        var fontSize = 0;
        if (ww < 992) {
            fontSize = 0.8;
        } else if (ww < 1200) {
            fontSize = 1.0;
        } else {
            fontSize = 1.2;
        }

        $("#header").css("font-size", fontSize+"em");
        $("#header").css("font-weight", "bold");
        pageHeader += "; "+title+" ("+indexName+")";
    }

    $(header).html(pageHeader);
}

function htBuildNavigationSteps(ptr, idx, index, idxName, bgColor)
{
    var prev = "";
    var pageName = "";
    var selector = "";
    if (ptr.prev == index) {
        prev = "<a href=\"index.html?page="+index+"\" onclick=\"htLoadPage('"+index+"','html', '', false); return false;\"><span>"+keywords[60]+" ("+idxName+")</span></a>";
    } else {
        var prevPtr = idx.get(ptr.prev);
        selector = ptr.prev.split(":");
        pageName = (index == "families" || prevPtr.additional != undefined) ? "tree" : "class_content";
        var lprev = "";
        if (prevPtr.additional != undefined) {
            lprev = (prevPtr.additional.length > 1) ? selector[0]+"&person_id="+prevPtr.additional: selector[0];
        } else {
            lprev = selector[0];
        }

        prev = "<a href=\"index.html?page="+pageName+"&arg="+lprev+"\" onclick=\"htLoadPage('"+pageName+"', 'html', '"+lprev+"', false); return false;\">"+prevPtr.name+"</a>";
    }

    var next = "";
    if (ptr.next == undefined) {
        next = "&nbsp;";
    } else {
        var nextPtr = idx.get(ptr.next);
        selector = ptr.next.split(":");
        pageName = (index == "families" || nextPtr.additional != undefined) ? "tree" : "class_content";

        var lnext = "";
        if (nextPtr.additional != undefined) {
            lnext = (nextPtr.additional.length > 1) ? selector[0]+"&person_id="+nextPtr.additional: selector[0];
        } else {
            lnext = selector[0];
        }

        next = "<a href=\"index.html?page="+pageName+"&arg="+lnext+"\" onclick=\"htLoadPage('"+pageName+"', 'html', '"+lnext+"', false); return false;\">"+nextPtr.name+"</a>";
    }

    var navigation = "<tr style=\"background-color: "+bgColor+";\"><td>"+prev+"</td> <td><a href=\"index.html?page="+index+"\" onclick=\"htLoadPage('"+index+"','html', '', false); return false;\"><span>"+idxName+"</span></td><td>"+next+"</td></tr>";

    return navigation;
}

function htBuildNavigation(index, currentIdx, initialBgColor)
{
    var urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('arg')) {
        return null;
    }

    var arg = urlParams.get('arg');

    var idx = htSelectIndexMap(index);

    var ptr = idx.get(arg);
    if (ptr == undefined) {
        return "";
    }

    var idxName = htSelectIndexName(index);
    // htUpdateNavigationTitle(currentIdx, ptr.name, idxName);
    var navigation = htBuildNavigationSteps(ptr, idx, index, idxName, initialBgColor);

    if (loadedIdx.length == 1) {
        return navigation;
    }

    var end = ptr.total+2;
    for (let i = 0; i < end; i++) {
        var color = (i % 2) ? "#FFFFE0" : initialBgColor;
        var j = ptr.total+1;
        var next = arg+":"+j;
        ptr = idx.get(next);
        if (ptr == undefined) {
            break;
        }
        // htUpdateNavigationTitle(j+1, ptr.name, idxName);
        navigation += htBuildNavigationSteps(ptr, idx, index, idxName, initialBgColor);
    }

    return navigation;
}

function htWriteNavigation()
{
    if (loadedIdx.length == 0) {
        return;
    }
    var navigation = "<p><table class=\"book_navigation\"><tr><th colspan=\"3\" style=\"background-color: #FFFFE0;\">"+keywords[132]+"</th></tr><tr style=\"background-color: #FFFFE0;\"><td><span>"+keywords[56]+"</span></td> <td> <span>"+keywords[57]+"</span> </td> <td><span>"+keywords[58]+"</span></td></tr>";
    for (const i in loadedIdx) {
        var color = (i % 2) ? "#FFFFE0" : "#FFFFFF";
        navigation += htBuildNavigation(loadedIdx[i], i, color);
    }
    navigation += "</table></p>";
    $(".dynamicNavigation").attr('data-after-content', keywords[132]);
    $(".dynamicNavigation").each(function() {
        $(this).html(navigation);
    });
}

function htFillPIXQRCode(id, size) {
    var $element = $(id);

    if ($element.is(':empty')) {
        $('<img>', {
            src: 'images/HistoryTracers/qrcodePix.png',
            width: size
        }).appendTo($element);
    }
}

function htFillDivAuthorsContent(target, lastUpdate, authors, reviewers) {
    if (lastUpdate <= 0 || !target) {
        return;
    }

    if ($("#paper-date").length > 0) {
        return;
    }

    const $target = $(target);
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();

    const formattedDate = htConvertDate(localCalendar, localLang, lastUpdate);

    let content = `
        <p>
            <div id="paper-title" class="paper-title-style">
                <div id="paper-date" class="paper-date-style">
    `;

    if (keywords) {
        content += `${keywords[34]} : ${authors}.<br />`;
        content += `${keywords[36]} : ${reviewers}.<br />`;
        content += `${keywords[33]} : ${formattedDate}.`;
    }

    content += `
                </div>
                <div id="paper-print" class="paper-print-style">
                    <a href="#" class="fa-solid fa-print" onclick="htPrintContent('#header', '#page_data'); return false;"></a>
                </div>
            </div>
            <br />
            <i>${keywords[24]} ${keywords[38]}</i>
        </p>
    `;

    $target.append(content);
}

function htLoadPageMountURL(page, arg, dir)
{
    const baseUrl = "lang/";

    if (page == "lang_list") {
        return baseUrl+page+".json";
    }

    let lang = $("#site_language").val();
    if (!lang) {
        lang = htDetectLanguage();
    }

    let url = baseUrl;

    if (arg === "source") {
        url += `${arg}s/`;
    } else {
        url += `${lang}/`;
    }

    if (dir && dir.length > 0) {
        url += `${dir}/`;
    }

    url += `${page}.json`;

    return url;
}

function htOverwriteHTDateWithText(text, localDate, localLang, localCalendar) {
    if (!localDate || !Array.isArray(localDate) || localDate.length === 0) {
        return text;
    }

    if (typeof text !== 'string' || !localLang || !localCalendar) {
        return text;
    }

    let result = text;
    for (let i = 0; i < localDate.length; i++) {
        const dateReplacement = htMountSpecificDate(localDate[i], localLang, localCalendar);
        result = result.replace(`<htdate${i}>`, dateReplacement);
    }

    return result;
}

function htGetTextWithDateReplacements(localObj, localLang, localCalendar) {
    if (localObj.date_time) {
        return htOverwriteHTDateWithText(localObj.text, localObj.date_time, localLang, localCalendar);
    } else if (localObj.fill_dates) {
        return htOverwriteHTDateWithText(localObj.text, localObj.fill_dates, localLang, localCalendar);
    }
    return localObj.text || '';
}

function htParagraphFromObject(localObj, localLang, localCalendar) {
    if (!localObj || typeof localObj !== 'object') {
        return '<p></p>';
    }

    const format = localObj.format || 'html';

    let originalText = htGetTextWithDateReplacements(localObj, localLang, localCalendar);

    let text = (format === 'html') ? '<p>' : '';
    text += htFormatText(originalText, format, localObj.isTable);

    if (localObj.source != undefined && localObj.source != null) {
        var sources = localObj.source;
        var citeSources = " (";
        for (const i in sources) { 
            var searchFor = "<htcite"+i+">";
            var pos = text.search(searchFor);
            var fcnt = htFillHistorySourcesSelectFunction(sources[i].type);
            var dateText = ""
            if (sources[i].date != undefined && sources[i].date.year.length > 0) {
                dateText = ", "+htMountSpecificDate(sources[i].date, localLang, localCalendar);
            } else if (sources[i].date_time != undefined && sources[i].date_time.year.length > 0) {
                dateText = ", "+htMountSpecificDate(sources[i].date_time, localLang, localCalendar);
            }

            var pageText = ""
            if (sources[i].page != undefined && sources[i].page.length > 0) {
                pageText = ", "+sources[i].page;
            }
            var appendText = "<a href=\"#\" onclick=\"htCleanSources(); "+fcnt+"('"+sources[i].uuid+"'); return false;\"><i>"+sources[i].text+dateText+pageText+"</i></a>";
            if (pos < 0) {
                if (i != 0 && citeSources.length > 2) {
                    citeSources += " ; ";
                }
                citeSources += appendText; 
            } else {
                text = text.replace(searchFor, appendText);
            }
        }
        if (citeSources.length > 2) {
            text += citeSources+ ")";
        }
    }
    text += (localObj.PostMention) ? localObj.PostMention : "";
    text += "</p>"; 
    return text;
}

//
//    Scientific Method Game Section
//

function htFillSMGameData(data) {
    if (data == undefined || data.content.length == 0) { 
        return;
    }

    var x = document.getElementsByClassName("htSlide");
    if (x.length != 0) {
        $(".htSlide").remove();
    }

    var requestType = opt0ac0098b.requestType;
    var table = data.levels;
    if (table != undefined && requestType == "splash" && $("#smGameMenu").length == 0) {
        $(opt0ac0098b.target).append("<div class=\"htSlideGameMenu htSlideGameMenuHidden\" id=\"smGameMenu\"></div> <div id=\"smGameScore\" class=\"htSlideGameScore htSlideGameMenuHidden\"><b>"+keywords[70]+"<span id=\"currentSMScore\">0</span></b></div> <div class=\"htSlideGameTextBottom smGameTextSize htSlideGameMenuHidden\" id=\"smGameDesc\"></div> <div id=\"smGamePlay\"><i class=\"fa-solid fa-play htSlidePlayGame\" onclick=\"htStartSMGame();\"></i></div>");
        for (const i in table) {
            if (table[i].type == undefined) {
                continue;
            } else if (table[i].type == "topLevel") {
                $("#smGameMenu").append("<p class=\"smGameTextSize\"><b>"+table[i].name+"</b>: "+table[i].desc+"</p><p><ul id=\""+table[i].id+"\"></ul></p>");
            } else if (table[i].type == "level") {
                if ($("#"+table[i].target).length > 0) {
                    $("#"+table[i].target).append("<li class=\"menu\"> <span class=\" smGameTextSize\"><a href=\"javascript:void(0);\" onclick=\"htLoadPageV1('"+table[i].loadID+"', 'json', '', 'false', 'smGame', '');\">"+table[i].name+"</a>: "+table[i].desc+"</span></li>");
                }
            }
        }

        var imgIndex = htGetRandomArbitrary(0, htGameImages.length - 5);
        $(opt0ac0098b.target).append("<p class=\"desc\"><img class=\"imgGameSizeWithOpacity\" src=\"images/"+htGameImages[imgIndex]+"\"><br />"+keywords[71]+" "+htGameImagesLocation[imgIndex]+".</p>");
    }

    smGame = [];
    var table = data.content;
    var extClassText = (requestType == "splash") ? "htSlideGameTextCenter": "htSlideGameTextTopCenter";
    var counter = -1;
    for (const i in table) {
        var classText;
        if (table[i].position != undefined) {
            switch (table[i].position) {
                case "center":
                    classText = "htSlideGameTextCenter";
                    break;
                case "topCenter":
                    classText = "htSlideGameTextTopCenter";
                    break;
                default:
                    classText = "htSlideGameTextTop";
            }
        } else {
            classText = extClassText;
        }

        var useText = "";
        var localLang = $("#site_language").val();
        var localCalendar = $("#site_calendar").val();
        if (table[i].text != undefined) {
            if (table[i].text.constructor === vectorConstructor) {
                var rows = table[i].text;
                for (const j in rows) {
                    var commonText = (rows[j].constructor === stringConstructor) ? rows[j] : htParagraphFromObject(rows[j], localLang, localCalendar);
                    if (table[i].paragraphClass != undefined) {
                        commonText = commonText.replace(/<p>/g, "<p class=\""+table[i].paragraphClass+"\">");
                    }
                    useText += commonText;
                }
            } else {
                useText = table[i].text;
            }
        }

        var useDesc = null;
        if (table[i].desc != undefined) {
            if (table[i].desc.constructor === vectorConstructor) {
                var rows = table[i].desc;
                useDesc = "";
                for (const j in rows) {
                    useDesc += rows[j];
                }
            } else {
                useDesc = table[i].desc;
            }
        }

        smGame.push({"desc" : useDesc, "prev" : table[i].prev, "next" : table[i].next, "jumpTo" : table[i].jumpTo, "score" : table[i].score, "answer" : table[i].answer, "played": false});
        $(opt0ac0098b.target).append("<div class=\"htSlide\" id=\""+table[i].id+"\"><div class='"+classText+"'>"+useText+"</div>");
        counter++;
    }
    opt0ac0098b.maxID = counter;

    x = document.getElementsByClassName("htSlide");
    if (requestType != "splash") {
        if ($("#smGameNext").length == 0) {
            $(opt0ac0098b.target).append("<div id=\"smGameNext\"><i class=\"fa-solid fa-chevron-right htSlideNextGame\" onclick=\"htPlusSMGameDivs(1);\"></i></div> <div id=\"smGamePrev\"><i class=\"fa-solid fa-chevron-left htSlidePrevGame htSlideGameMenuHidden\" onclick=\"htPlusSMGameDivs(-1);\"></i></div> <div id=\"smGameLike\"><i class=\"fa-solid fa-thumbs-up htSlideLikeGame\" onclick=\"htSMCheckAnswer(1);\"></i></div> <div id=\"smGameUnlike\"><i class=\"fa-solid fa-thumbs-down htSlideUnlikeGame\" onclick=\"htSMCheckAnswer(0);\"></i></div>");
            $("#smGameLike").addClass("htSlideGameMenuHidden");
            $("#smGameUnlike").addClass("htSlideGameMenuHidden");
            $("#currentSMScore").html(totalSMScore);
        } else { 
            $("#smGameNext").removeClass("htSlideGameMenuHidden");
            $("#smGamePrev").removeClass("htSlideGameMenuHidden");
        }
        $("#smGameMenu").addClass("htSlideGameMenuHidden");

        if ($("#smGameScore").hasClass("htSlideGameMenuHidden")) {
            $("#smGameScore").removeClass("htSlideGameMenuHidden");
        }

        htShowSlideDivs(x, 0);
    } else {
        if (smGameTimeoutID != 0) {
            clearTimeout(smGameTimeoutID);
            smGameTimeoutID = 0;
        }
    }

    $('table').each(function() {
        if (!$(this).hasClass('book_navigation')) {
            $(this).addClass('three_table_bg');
        }
    });
}


//
//    Atlas Section
//

function htModifyAtlasIndexMap(id) {
    if (!id) {
        return;
    }
    $("#atlasindex option[value="+id+"]").prop('selected', true);

    var myURL = 'index.html?page=atlas&atlas_page='+id;
    window.history.replaceState(null, null, myURL);
    $("#atlas").val(id);
    $("#atlasindex").val(id);
}

function htFormatText(text, format, table) {
    if (format == "html") {
        return text;
    }

    var converter = new showdown.Converter();
    if (table != undefined && table == true || table == 1) {
        converter.setOption('tables', true);
    }
    var html = converter.makeHtml(text);

    if (html.length < 4 ) {
        return html;
    }
    var htmlTest = html.substring(html.length - 4);

    return (htmlTest == "</p>") ? html.substring(0, html.length - 4 ) : html;
}

function htSelectAtlasMap(id) {
    if (!id || id.length == 0) {
        return;
    }

    var vector = htAtlas.get(id);
    var author = "";
    if (vector.author) {
        if (vector.author == "HTMW" || vector.author.length == 0) {
            author = keywords[82];
        } else {
            author = vector.author;
        }
    }

    var formattedText =  vector.text;

    if (vector.format == undefined || vector.format == "html") {
        formattedText = "<p>"+formattedText+"</p>";
    }

    var prevIdx = "&nbsp;";
    if (vector.prev) {
        var prevMap = htAtlas.get(vector.prev);
        if (prevMap) {
            prevIdx = prevMap.name;
        }
    }

    var nextIdx = "&nbsp;";
    if (vector.next) {
        var nextMap = htAtlas.get(vector.next);
        if (nextMap) {
            nextIdx = nextMap.name;
        }
    }

    var text = (vector.image.length > 0) ? "<p class=\"desc\"><img id=\"atlasimg\" src=\""+vector.image+"\" class=\"imgcenter\" onclick=\"htImageZoom('atlasimg', '-35%')\" />"+keywords[81]+" 1: "+author+".</p>"+formattedText : formattedText;
    var prevText = (vector.prev) ? "<a href=\"javascript:void(0);\" onclick=\"htSelectAtlasMap('"+vector.prev+"'); htModifyAtlasIndexMap('"+vector.prev+"');\">"+prevIdx+"</a>" : "&nbsp;";
    var nextText = (vector.next) ? "<a href=\"javascript:void(0);\" onclick=\"htSelectAtlasMap('"+vector.next+"'); htModifyAtlasIndexMap('"+vector.next+"');\">"+nextIdx+"</a>" : "&nbsp;";
    text += "<p><hr /></p><p><div style=\"width: 50%; float: left; font-weight: bold;\">"+keywords[56]+"<br />"+prevText+"</div><div style=\"width: 50%; float: right; font-weight: bold; text-align: right;\">"+keywords[58]+"<br />"+nextText+"</div></p><p>&nbsp;</p>";
    $("#rightcontent").html(text);
}

function htFillAtlas(data) {
    if (data.atlas.length == 0) {
        return;
    }

    htAtlas.clear();

    var localAtlas = data.atlas;
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();
    var firstIdx = "";
    var prevIdx = undefined;
    var idx = $("#atlas").val();
    for (i in localAtlas) {
        var item = localAtlas[i];
        if (i == 0) {
            firstIdx = item.uuid;
            if (idx.length == 0) {
                $("#atlas").val(item.uuid);
                idx = item.uuid;
            }
        } else {
            var prevMap = htAtlas.get(prevIdx);
            if (prevMap) {
                prevMap.next = item.uuid;
            }
        }

        var text = "";
        for (const j in item.text) {
            var localObj = item.text[j];
            text += htParagraphFromObject(localObj, localLang, localCalendar);
        }
        var author = (item.author != undefined && item.author.length > 0) ? item.author : null ;
        var isTable = (item.isTable != undefined) ? item.isTable : false ;
        var format = (item.format != undefined) ? item.format : "html" ;
        htAtlas.set(item.uuid, {"name": item.index, "image" : item.image, "author": author, "text" : text, "format": format, "isTable": isTable, "prev": prevIdx, "next": undefined});

        var showIdx = parseInt(i) + 1;
        var o = new Option(showIdx+". "+item.index, item.uuid);
        $("#atlasindex").append(o);
        prevIdx = item.uuid;
    }

    htModifyAtlasIndexMap(idx);
    htSelectAtlasMap(idx);
}

function htProccessData(data, optional) {
    if (data.type == undefined) {
        return false;
    }

    switch (data.type) {
        case "sm_game":
            htFillSMGameData(data);
            break;
    }

    if (data.date_time != undefined && data.date_time.constructor === vectorConstructor) {
        htFillHTDate(data.date_time);
    } else if (data.fill_dates != undefined && data.fill_dates.constructor === vectorConstructor) {
        htFillHTDate(data.fill_dates);
    }

    if ($("#family_common_sn").length > 0) {
        $("#family_common_sn").html(keywords[52]);
    }

}

//
//    Load Page Section
//

function htOnlyLoadHtml(appendPage, page, ext, unixEpoch) {
    primarySourceMap.clear();
    refSourceMap.clear();
    holyRefSourceMap.clear();
    smSourceMap.clear();

    var additional = (appendPage.length == 0) ? '&' : appendPage+'&';
    $("#page_data").load("bodies/"+page+"."+ext+"?load="+additional+'nocache='+unixEpoch);
}

function htLoadPageV1(page, ext, arg, reload, dir, optional) {
    $("#messages").html("&nbsp;");
    extLatexIdx = 0;

    $("#loading_msg").show();
    $("#header").removeClass();
    $("#header").removeAttr("style");
    $("#header").addClass("top-bar-inside-left");

    var URL = htLoadPageMountURL(page, arg, dir);
    var unixEpoch = Date.now();
    $.ajax({
        type: 'GET',
        url: URL,
        contentType: 'application/json; charset=utf-8',
        data: 'nocache='+unixEpoch,
        async: true,
        dataType: 'json',
        success: function(data) {
            if (data.length == 0) {
                $("#loading_msg").hide();
                return false;
            }

            if (data.version == undefined || data.version == null) {
                return false;
            }

            if (htIsIndexLoaded(data.index) == false) {
                htLoadIndex(data, arg, page);
            }

            htLoadSources(data, arg, page);

            htProccessData(data, optional);

            if (arg != source) {
                htEnableEdition();
            }

            return false;
        },
    });
}

function htCallFillPIXQRCode() {
    if ($("#htPixQRCode").length > 0 ) {
        htFillPIXQRCode("#htPixQRCode", "10%");
    }

    if ($("#htPixSideQRCode").length > 0 ) {
        htFillPIXQRCode("#htPixSideQRCode", "25%");
    }
}

function htLoadPage(page, ext, arg, reload) {
    $("#messages").html("&nbsp;");
    $("#ht_index_latex").append("");
    extLatexIdx = 0;
    if (ext == "html") {
        switch(page) {
            case "tree":
            case "genealogical_map_list":
            case "class_content":
                if (reload == true && lastTreeLoaded.arg != null && lastTreeLoaded.arg.length > 0) {
                    arg = lastTreeLoaded.arg;
                } else {
                    lastTreeLoaded.page = page;
                    lastTreeLoaded.arg = arg;
                }

                var myURL = (arg != undefined && arg != null) ? 'index.html?page='+page+'&arg='+arg : 'index.html?page='+page;
                genealogicalStats = htResetGenealogicalStats();

                window.history.replaceState(null, null, myURL);
                break;
            case "families":
                lastTreeLoaded.page = null;
                lastTreeLoaded.arg = null
                $("#loading").val("");
                $("#selector").val("");
            default:
                window.history.replaceState(null, null, 'index.html?page='+page);
                break;
        }

        $("#tree-source").html("");
        $("#tree-ref").html("");
        $("#tree-holy-ref").html("");
        $("#header").removeClass();
        $("#header").removeAttr("style");
        $("#header").addClass("top-bar-inside-left");
    }

    var pages = arg.split('&person_id=') ;
    var appendPage = "";
    if (pages.length != 2) {
        $("#loading").val(arg);
    } else {
        appendPage = pages[0];
        if (ext == "html") {
            $("#loading").val(pages[0]);
            $("#selector").val(pages[1]);
        }
    }

    if (ext.length != null && ext.length > 0 &&  ext == "html") {
        $("#html_loaded").val(page);
    }

    var unixEpoch = Date.now();
    if (ext === "html") {
        htOnlyLoadHtml(appendPage, page, ext, unixEpoch);

        return false;
    }

    var URL = htLoadPageMountURL(page, arg, "");

    $("#loading_msg").show();
    $.ajax({
        type: 'GET',
        url: URL,
        contentType: 'application/json; charset=utf-8',
        data: 'nocache='+unixEpoch,
        async: true,
        dataType: 'json',
        success: function(data) {
            if (data.length == 0) {
                $("#loading_msg").hide();
                return false;
            }

            htLoadIndex(data, arg, page);

            htLoadSources(data, arg, page);

            htFillWebPage(page, data);

            htCallFillPIXQRCode();

            return false;
        },
    });

    return false;
}

function htFillClassWithText(className, text)
{
    $(className).each(function() { $(this).html( text ); });
}

function htDetectLanguage()
{
    var lang = navigator.language || navigator.userLanguage;
    if (lang == undefined || lang == null || lang.length == 0) {
        lang = "en-US";
    } else {
        var llang =  lang.substring(0, 2).toLowerCase();
        if (($("#site_language option[value='"+lang+"']").length > 0) == false) {
            if (llang == "pt") {
                lang = "pt-BR";
            } else if (llang == "es") {
                lang = "es-ES";
            } else {
                lang = "en-US";
            }
        }

        var country = lang.substring(3).toUpperCase();
        llang =  lang.substring(0, 2).toLowerCase();
        lang = llang+'-'+country;
    }
    return lang;
}

function htMountSpecificDate(dateObj, localLang, localCalendar)
{
    var updateText = "";
    if (!dateObj || typeof dateObj !== 'object') {
        console.warn('htMountSpecificDate: Invalid dateObj parameter');
        return updateText;
    }

    switch (dateObj.type) {
        case "gregory":
            if (dateObj.day > 0) {
                updateText = htConvertGregorianDate(localCalendar, localLang, dateObj.year, dateObj.month, dateObj.day);
            } else {
                updateText = htConvertGregorianYear(localCalendar, dateObj.year);
            }
            break;
        case "unix":
            updateText = htConvertUnixDate(localCalendar, localLang, dateObj.epoch);
            break;
        case "julian":
            updateText = htConvertJulianDate(localCalendar, localLang, dateObj.day);
            break;
    }
    return updateText;
}

function htFillHTDate(vector)
{
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();
    var j = 0;
    $(".htdate").each(function() {
        if (j >= vector.length) {
            return false;
        }
        var w = vector[j++];
        if (!w || typeof w !== 'object') {
            console.warn(`htFillHTDate: Invalid date object at index ${index}`);
            return true; // Continue to next element
        }
        var updateText = htMountSpecificDate(w, localLang, localCalendar);
        $(this).html(updateText);
    });
}

function htFillStringOnPage(data, idx, page)
{
    const item = data.content?.[idx];
    if (!item) return;

    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();

    const hasHtmlValue = item.html_value && item.html_value.length > 0;
    const hasDateTime = item.date_time !== undefined;

    const modifiedText = hasHtmlValue
        ? (hasDateTime
            ? htOverwriteHTDateWithText(item.html_value, item.date_time, localLang, localCalendar)
            : item.html_value)
        : "";

    // Handle special IDs
    if (item.id === "date_time") {
        htFillHTDate(item.text);
        return;
    }

    // Case 1: append if html_value exists and no target
    if (hasHtmlValue && !item.target) {
        $("#" + item.id).append(modifiedText);
        return;
    }

    // Case 2: determine text to fill
    let text = "";
    if (hasHtmlValue) {
        text = modifiedText;
    } else if (item.value !== undefined) {
        text = item.value;
    } else {
        return;
    }

    const $target = $("#" + item.id);
    if ($target.length > 0) {
        $target.html(text);
        return;
    }

    // Case 3: append to group-map for specific pages
    const allowedPages = [
        "families", "history", "literature", "first_steps",
        "indigenous_who", "myths_believes", "math_games",
        "historical_events", "biology", "physics", "chemistry"
    ];

    if (allowedPages.includes(page) && item.target) {
        $("#group-map").append(
            `<ul>
                <b><span id="${item.id}">${text}</span></b>
                <ol id="${item.target}"></ol>
            </ul><br />`
        );
    }
}

function htFillWebPage(page, data)
{
    if (data?.title?.length) {
        $(document).prop("title", data.title);
    }

    // Header
    if (data?.header?.length) {
        $("#header").html(data.header);
    } else if (data?.nothing?.length) {
        // Used when a new language has been added
        $(document).prop("title", data.nothing);
        $("#header").html(data.nothing);
        return;
    }

     if (data?.common?.length) {
        const localLang = $("#site_language").val();
        const localCalendar = $("#site_calendar").val();

        data.common.forEach(commonObj => {
            const commonText =
                (typeof commonObj === "string")
                    ? commonObj
                    : htParagraphFromObject(commonObj, localLang, localCalendar);

            $("#common").append(commonText);
        });
    }

    const last_update = data?.last_update ?? 0;
    let page_authors = (keywords.length > 34) ? keywords[35] : "Editors of History Tracers";
    let page_reviewers = (keywords.length > 36) ? keywords[37] : "Reviewers of History Tracers";

    if (data?.authors?.length) page_authors = data.authors;
    if (data?.reviewers?.length) page_reviewers = data.reviewers;

    if ($("#extpaper").length && last_update > 0) {
        htFillDivAuthorsContent("#extpaper", last_update, page_authors, page_reviewers);
    }

    if ($("#htaudio").length && data?.audio) {
        htAddAudio(data.audio);
    }

    if (data?.languages) {
        htUpdateIndexSelector(data.languages, "#site_language");
        $("#loading_msg").hide();
        $(":focus").blur();
        return;
    }

    if (data?.lang_list) {
        htUpdateAvailableLanguages(data.lang_list);
        return;
    }

    if (data?.calendars) {
        htUpdateIndexSelector(data.calendars, "#site_calendar");
        $("#loading_msg").hide();
        $(":focus").blur();
        return;
    }

    if (data?.themes) {
        htUpdateIndexSelector(data.themes, "#site_theme");
        data.themes.forEach(theme => {
            $("#" + theme.dir).html(theme.text);
        });
    }

    if (data?.families) {
        htFillFamilies(page, data);
    } else if (data?.keywords) {
        htFillKeywords(data.keywords);
        $("#loading_msg").hide();
    } else if (data?.math_keywords) {
        htFillMathKeywords(data.math_keywords);
        $("#loading_msg").hide();
    } else if (data?.type && data.version == 2) {
        if (data.type == "class") {
            htFillClassContentV2(data, last_update, page_authors, page_reviewers, data.index);
        } else if (data.type == "atlas") {
            htFillClassContentV2(data, last_update, page_authors, page_reviewers, null);

            if (data.atlas != undefined) {
                htFillAtlas(data);
            }
        } else if (data.type == "index") {
            for (const i in data.content) {
                if (data.content[i].value == undefined || data.content[i].value == null) {
                    htFillStringOnPage(data, i, page);
                } else if (data.content[i].value_type == "group-list") {
                    if (data.content[i].id != undefined && data.content[i].id != null && data.content[i].id.length > 0 && data.content[i].desc != undefined && data.content[i].desc.length > 0) {
                        $("#"+data.content[i].id).html(data.content[i].desc);
                    }
                    htFillGroupList(data.content[i].value, data.content[i].target, data.content[i].page, data.content[i].date_time);
                } else if (data.content[i].value_type == "mixed-group-list") {
                    htFillMixedMapList(data.content[i].value, data.content[i].target, data.content[i].date_time);
                }
            }
        }
    } else {
        if ((data.gedcom != undefined || data.csv != undefined) && $("#files").length > 0) {
            var csvgedtxt = keywords[108]+"<p><ul>";
            if (data.csv != undefined) {
                csvgedtxt += "<li><a href=\""+data.csv+"\" target=\"_blank\">CSV</a>: "+keywords[109]+"</li>";
            }

            if (data.gedcom != undefined) {
                csvgedtxt += "<li><a href=\""+data.gedcom+"\" target=\"_blank\">GEDCOM</a>: "+keywords[110]+"</li>";
            }
            csvgedtxt += "</ul></p>"+keywords[111];
            $("#files").html(csvgedtxt);
        }

        for (const i in data.content) {
            if (data.content[i].value == undefined || data.content[i].value == null) {
                htFillStringOnPage(data, i, page);
                continue;
            }

            if (data.content[i].value.constructor === stringConstructor) {
                htFillStringOnPage(data, i, page);
            } else if (data.content[i].value.constructor === vectorConstructor && data.content[i].target != undefined) {
                if (data.content[i].value_type == undefined) {
                    continue;
                } else if (data.content[i].value_type == "family-list") {
                    var table = data.content[i].value;
                    htFillFamilyList(table, data.content[i].target);
                } else if (data.content[i].value_type == "group-list") {
                    if (data.content[i].id != undefined && data.content[i].id != null && data.content[i].id.length > 0 && data.content[i].desc != undefined && data.content[i].desc.length > 0) {
                        $("#"+data.content[i].id).html(data.content[i].desc);
                    }
                    htFillGroupList(data.content[i].value, data.content[i].target, data.content[i].page, data.content[i].date_time);
                } else if (data.content[i].value_type == "subgroup") {
                    htFillSubMapList(data.content[i].value, data.content[i].target);
                }
            } else if (data.content[i].value.constructor === vectorConstructor && data.content[i].id != undefined) {
                if (data.content[i].id != "date_time") {
                    for (const j in data.content[i].value) {
                        $("#"+data.content[i].id).append(data.content[i].value[j]);
                    }
                } else {
                    if (data.content[i].value.constructor === vectorConstructor) {
                        htFillHTDate(data.content[i].value);
                    }
                }
            }
        }

        if (data.date_time != undefined) {
            htFillHTDate(data.date_time);
        }

        if ($("#tree-sources-lbl").length > 0) {
            $("#tree-sources-lbl").html(keywords[5]);
        }

        if ($("#tree-references-lbl").length > 0) {
            $("#tree-references-lbl").html(keywords[6]);
        }

        if ($("#tree-holy_references-lbl").length > 0) {
            $("#tree-holy_references-lbl").html(keywords[7]);
        }

        if ($("#tree-sm-lbl").length > 0) {
            $("#tree-sm-lbl").html(keywords[75]);
        }

        if ($("#tree-description").length > 0) {
            $("#tree-description").html(" <p>"+keywords[52]+"</p>");
        }
    }

    if (data?.scripts?.length) {
        data.scripts.forEach(script => {
            const jsURL = `js/${script}.js`;
            $.getScript(jsURL, () => {
                if (typeof htLoadContent !== "undefined") htLoadContent();
                if (typeof htLoadExercise !== "undefined") htLoadExercise();

                $("#btncheck").off("click").on("click", e => {
                    e.preventDefault();
                    if (typeof htCheckAnswers !== "undefined") htCheckAnswers();
                });

                $("#btnnew").off("click").on("click", e => {
                    e.preventDefault();
                    if (typeof htLoadExercise !== "undefined") htLoadExercise();
                });
            });
        });
    }

    htFillClassWithText(".htPrevText", keywords[56]);
    htFillClassWithText(".htTopText", keywords[57]);
    htFillClassWithText(".htNextText", keywords[58]);
    htFillClassWithText(".htIndexText", keywords[60]);

    const reflections = {
        "#family_common_sn": 52,
        "#htZoomImageMsg": 84,
        "#htChartMsg": 112,
        "#htAmericaAbyaYalaMsg": 85,
        "#htAgeMsg": 131,
        "#htImgCopyright": 83
    };

    for (const [selector, code] of Object.entries(reflections)) {
        if ($(selector).length) {
            htAddTreeReflection(selector, code);
        }
    }

    if (!$("#tree-common-stats").length) return false;

    const htmlFields = [
        "#tree-common-stats", "#statsDescription", "#genStatRow00", "#genStatRow01",
        "#genStatRow10", "#genStatRow20", "#genStatRow30", "#genStatRow40",
        "#genStatRow50", "#genStatRow60", "#genStatRow70"
    ];
    const labelIndexes = [61, 62, 63, 64, 5, 6, 7, 65, 66, 67, 68, 69];

    htmlFields.forEach((selector, i) => {
        $(selector).html(keywords[labelIndexes[i]]);
    });

    const htmlValues = [
        "#genStatRow11", "#genStatRow21", "#genStatRow31",
        "#genStatRow41", "#genStatRow51", "#genStatRow61", "#genStatRow71"
    ];

    Object.values(genealogicalStats).forEach((val, i) => {
        $(htmlValues[i]).html(val);
    });
}

//
//    Index Section
//

function htUpdateLoadedIdx(idx) {
    if (!loadedIdx.includes(idx)) {
        loadedIdx.push(idx);
    }
}

function htIsIndexLoaded(idx) {
    if (idx == null) {
        return true;
    }

    const test = Array.isArray(idx) ? idx :
                typeof idx === 'string' ? [idx] :
                null;

    if (!test) {
        return false;
    }

    return test.every(value => {
        const indexMap = htSelectIndexMap(value);
        return indexMap && Object.keys(indexMap).length > 0;
    });
}

function htFillTopIdx(idx, data, first)
{
    htUpdateLoadedIdx(first);

    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();
    let prev = first;

    idx.set(first, {"prev" : first, "next" : undefined, "name" : keywords[57], "additional": undefined, "total": 0});
    for (const i in data.content) {
        if (data.content[i].html_value != undefined && data.content[i].html_value.length > 0 || data.content[i].value.constructor !== vectorConstructor || data.content[i].page == undefined) {
            continue;
        }

        var table = data.content[i].value;
        var name = "";
        for (const j in table) {
            var fillNext = idx.get(prev);
            var id = "";
            var additional = undefined;
            var theFirst = undefined;
            if (table[j].id.length > 0) {
                id = table[j].id;
                theFirst = idx.get(id);
            } else if (table[j].family_id.length) {
                id = table[j].family_id;
                theFirst = idx.get(id);

                if (table[j].person_id.length) {
                    additional = table[j].person_id;
                } else {
                    additional = "1";
                }
            }

            var counter = 0;
            if (theFirst != undefined) {
                counter = theFirst.total + 1;
                id += ":"+counter;
            }
            if (fillNext != undefined) {
                fillNext.next = id;
            }
            var show_text = table[j].name;
            if (first == "families") {
                var testing = show_text.search("\\(<htdate");
                if (testing > 0 && data.content[i].date_time != undefined) {
                    show_text = htOverwriteHTDateWithText(show_text, data.content[i].date_time, localLang, localCalendar);
                }
            }
            idx.set(id, {"prev" : prev, "next" : undefined, "name" : show_text, "additional": additional, "total": counter});
            prev = id;
        }
    }
}

function htLoadIndex(data, arg, page)
{
    if (data != undefined && data.index != undefined) {
        if (data.index.constructor === vectorConstructor) {
            for (const i in data.index) {
                var newData = { "index" : data.index[i] };
                htLoadIndex(newData, arg, page);
            }
            return;
        }
    }

    const pageConfig = {
        biology: htBiologyIdx,
        chemistry: htChemicalIdx,
        families: htFamilyIdx,
        first_steps: htFirstStepsIdx,
        history: htHistoryIdx,
        historical_events: htHistoricalEventsIdx,
        indigenous_who: htIndigenousWhoIdx,
        literature: htLiteratureIdx,
        math_games: htMathGamesIdx,
        myths_believes: htMythsBelievesIdx,
        physics: htPhysicsIdx
    };

    if (page && pageConfig[page] && !pageConfig[page].has(page)) {
        htFillTopIdx(pageConfig[page], data, page);
        return;
    }

    if (!data.index) {
        return;
    }

    var URL = htLoadPageMountURL(data.index, data.index, "");
    var unixEpoch = Date.now();
    $.ajax({
        type: 'GET',
        url: URL,
        contentType: 'application/json; charset=utf-8',
        data: 'nocache='+unixEpoch,
        async: true,
        dataType: 'json',
        success: function(d) {
            if (d.length == 0) {
                return false;
            }

            if (htIsIndexLoaded(data.index) == false) {
                htLoadIndex(d, arg, data.index);
            }

            return false;
        },
    });
}

//
//    Family Section
//

function htHandleSpecialItem(item) {
    const specialCases = {
        'date_time': true,
        'fill_dates': true
    };

    if (item.id && specialCases[item.id] &&
        item.text && item.text.constructor === vectorConstructor) {
        htFillHTDate(item.text);
    }
}

function htFillFamilyList(table, target) {
    if (!Array.isArray(table)) { return; }

    const siteLanguage = $('#site_language').val();
    const siteCalendar = $('#site_calendar').val();

    for (const i in table) {
        const item = table[i];
        if (item.target == undefined) {
            htHandleSpecialItem(item);
            continue;
        }

        $("#"+item.target).append("<div id=\"bottom"+item.id+"\"><h3>"+item.id+"</h3></div>");
        if (item.value.constructor === vectorConstructor) {
            var rows = item.value;
            $("#bottom"+item.id).append("<ul id=\"bottomList"+item.id+"\"></ul>");
            for (const k in rows) {
                $("#bottomList"+item.id).append("<li id=\""+rows[k].id+"\"><a href=\"index.html?page=tree&arg="+rows[k].id+"&lang="+siteLanguage+"&cal="+siteCalendar+"\" onclick=\"htLoadPage('tree', 'html', '"+rows[k].id+"', false); return false;\" >"+rows[k].value+"</a></li>");
            }
        }
    }
}

//
//    Exercise Section
//

function htCheckExerciseAnswer(val0, val1, answer, explanation) {
    const ans = parseInt($("input[name="+val0+"]:checked").val());
    var text = "";
    var format = "";
    if (ans == val1) {
        text = keywords[27];
        format = "green";
    } else {
        text = keywords[28];
        format = "red";
    }

    if ($(answer).length > 0) {
        $(answer).text(text).css("color", format);
    }

    if ($(explanation).length > 0) {
        $(explanation).css("color", format).css("display","block").css("visibility","visible");
    }

    return false;
}

function htWriteQuestions(table, later, idx)
{
    var questions = "<p><h3>"+keywords[50]+"</h3><ol>";
    var tmpAnswers = "<p class=\"ht_description\"><span id=\"htAnswersToBeUsed\">";
    var total = 0;
    for (const i in table) {
        let item = table[i];
        questions += "<li>"+item.question+" <input type=\"radio\" id=\"ans"+i+"yes\" name=\"exercise"+i+"\" value=\"1\" /> <b><label>"+keywords[31]+"</label></b> <input type=\"radio\" id=\"ans"+i+"no\" name=\"exercise"+i+"\" value=\"0\" /> <b><label>"+keywords[32]+"</label></b>. <span class=\"ht_description\" id=\"explanation"+i+"\"><span id=\"answer"+i+"\"></span> "+item.additionalInfo+"</span></li>";
        tmpAnswers += (item.yesNoAnswer == "Yes") ? 1+";" : 0+";";
        total = i;
    }
    if (total > 0) {
        total++;
    }
    questions += "</ol><input id=\"btncheck\" type=\"button\" onclick=\"return false;\" value=\""+keywords[29]+"\" /> <input id=\"btnnew\" type=\"button\" onclick=\"return false;\" value=\""+keywords[30]+"\" /></p>";
    tmpAnswers += "</span><span id=\"htTotalQuestions\">"+total+"</span></p>";

    htAddPaperDivs("#paper", "exercises0", questions, "", later, idx);
    htAddPaperDivs("#paper", "exercises1", tmpAnswers, "", later, idx+1000);
}

function htLoadAnswersFromExercise()
{
    var ret = [];
    const end = parseInt($("#htTotalQuestions").html());

    if (!end) {
        return end;
    }

    var htmlValues = $("#htAnswersToBeUsed").html();
    if (htmlValues == undefined) {
        return end;
    }

    var values = htmlValues.split(";");
    for (let i = 0; i < end; i++) {
        ret.push(parseInt(values[i]));
    }

    $("#htAnswersToBeUsed").html("");
    return ret;
}

//
//    Game Section
//

function htWriteGame(table, later, idx)
{
    const localLang = $("#site_language").val();
    const localCalendar = $("#site_calendar").val();
    var finalData = "<p class=\"ht_description\"><span id=\"htGameDataToBeUsed\">";
    var total = 0;
    for (const i in table) {
        let item = table[i];
        var finalText = item.imageDesc;
        if (item.date_time) {
            localDate = item.date_time;
            for (const j in localDate) {
                finalText = finalText.replace("<htdate"+j+">", htMountSpecificDate(localDate[j], localLang, localCalendar));
            }
        }
        finalData += finalText+"|";
        total++;
    }

    finalData += "</span><span id=\"htTotalGameData\">"+total+"</span></p>";
    htAddPaperDivs("#paper", "game1", finalData, "", later, idx+1000);
}

function htLoadGameData()
{
    var ret = [];
    var tmpData = "<p class=\"ht_description\"><span id=\"htGameDataToBeUsed\">";
    var end = parseInt($("#htTotalGameData").html());

    if (!end) {
        return end;
    }

    var htmlValues = $("#htGameDataToBeUsed").html();
    if (!htmlValues) {
        return end;
    }

    var values = htmlValues.split("|");
    for (let i = 0; i < end; i++) {
        ret.push( { "imageDesc" : values[i] });
    }

    $("#htAnswersToBeUsed").html("");
    return ret;
}

//
//    Games Section
//

// Copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random [2024-01-13]
function htGetRandomArbitrary(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function htInsertNumberField(id, min, max)
{
    return "<div class=\"number-input\" id=\""+id+"\"><i class=\"fa-solid fa-caret-down downArrowWithFA\" name=\"numberDown"+id+"\"></i><input id=\"numberField"+id+"\" type=\"number\" min=\""+min+"\" max=\""+max+"\" readonly /><i class=\"fa-solid fa-caret-up upArrowWithFA\" name=\"numberUp"+id+"\"></i></div>";
}

function htShowSlideDivs(x, index) {
    if (x == undefined) {
        return;
    }

    for (let i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    x[index].style.display = "block";
}

function htShowSlideDivsAuto(x, index, stopMax) {
    if (x == undefined) {
        return;
    }

    for (let i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    x[index].style.display = "block";

    ++index;
    if (stopMax == true && index == x.length) {
        return 0;
    }

    if (index == x.length) {
        index = 0;
    } else if (index < 0) {
        index = x.length - 1;
    }

    return setTimeout(() => { smGameTimeoutID = htShowSlideDivsAuto(x, index, stopMax) }, 6000);
}

function htAddAlterQImages(id)
{
    var kingOrder = [ "<i>Popol Hol</i> (2), <i>Yax K'uk' Mo'</i> (1),<br /> <i>Yax Pasaj Chan Yopaat</i> (16), <i>K'ahk' Yipyaj Chan K'awiil</i> (15)", "? (6), ? (5),<br /> <i>K'altuun Hix</i> (4), ? (3)", "<i>Moon Jaguar</i> (10), ? (9),<br /> <i>Wi' Yohl K'inich</i> (8), <i>Bahlam Nehn</i> (7)", "- <i>K'ahk' Joplaj Chan K'awiil</i> (14), <i>Waxaklajuun Ubaah K'awiil</i> (13),<br /> <i>K'ahk' Uti' Witz K'awiil</i> (12), <i>Butz' Chan</i> (11)"  ];
    $(id).html("");
    for (let i = 0; i < 4; i++) {
        $(id).append("<div class=\"htSlide\"> <div class=\"htSlideCounter\">"+(i + 1)+" / 4</div> <img class=\"imgGameSize\" src=\"images/Copan/CopanAltarGenealogy"+i+".jpg\" id=\"imgCopan"+i+"\" onclick=\"htImageZoom('imgCopan"+i+"', '0%')\"><div class=\"htSlideCaption\">"+kingOrder[i]+"</div></div>");
    }
    $(id).append("<i class=\"fa-solid fa-chevron-left htSlidePrev\" onclick=\"htPlusDivs(-1);\"></i> <i class=\"fa-solid fa-chevron-right htSlideNext\" onclick=\"htPlusDivs(1);\"></i>");
}
