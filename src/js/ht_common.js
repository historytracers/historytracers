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

var htAtlas = [];

var htHistoryIdx = new Map();
var htLiteratureIdx = new Map();
var htFirstStepsIdx = new Map();
var htFamilyIdx = new Map();
var htIdxLang = "en-US";

var htGameImages = [ "MachuPicchu.jpg", "WitzXunantunich.jpg", "TeotihuacanGeneral.jpg", "CaralPiramideH1.jpg", "PachacutiCusco.jpg", "CahalPech.jpg", "CaracolWitz.jpg", "JoyaCeren.jpg", "SanAndres.jpg", "NecropoleTikal.jpg", "CiudadTula.jpg", "Huaca.jpg", "MiPueblito.jpg", "Copan/CopanAltarGenealogy0.jpg", "Copan/CopanAltarGenealogy1.jpg", "Copan/CopanAltarGenealogy2.jpg", "Copan/CopanAltarGenealogy3.jpg", "TeotihuacanMountains.jpg", "CopanWholeTextStelaAltar.png", "StelaACopan.jpg", "Kaminaljuyu.jpg" ];
var htGameImagesLocation = [ "Machu Picchu, Perú", "Xunantunich, Belieze", "Teotihuacan, México", "Caral, Perú", "Cusco, Perú", "Cahal Pech, Belieze", "Caracol, Belieze", "Joya de Ceren, El Salvador", "San Andres, El Salvador", "Tikal, Guatemala", "Ciudad de Tula, México", "Huaca Puclana, Perú", "Mi Pueblito, Panamá", "Copan, Honduras", "Copan, Honduras", "Copan, Honduras", "Copan, Honduras", "Teotihuacan, México", "Copan, Honduras", "Copan, Honduras", "Kaminaljuyu, Guatemala" ];

var htSequenceGame = [ "CeramicaAntropologiaPeru.jpg", "ChocolatPotCahalPech.jpg", "EstelaAntropologiaGuatemala.jpg", "Kaminaljuyu.jpg", "MayaCRJade.jpg", "MetateTeotihuacan.jpg", "SanJoseCRAntropologia.jpg", "SanSalvadorESAntropologia.jpg", "StelaACopan.jpg", "MusicCR.jpg" ];
var htSequenceGameLocation = [ "Lima, Peru", "Cahal Pech, Belize", "Ciudad de Guatemala, Guatemala", "Kaminaljuyu - Ciudad de Guatemala, Guatemala", "San Jose, Costa Rica", "Teotihuacan, Mexico", "San Jose, Costa Rica", "San Salvador, El Salvador", "Copan, Honduras", "San Jose, Costa Rica" ];

var htEditable = undefined;
var htEditableCheck = true;

function htEnableEdition() {
    if (htEditableCheck == false || htEditable != undefined) {
        return;
    }
    htEditableCheck = false;

    $("#loading_msg").hide();
    $("#messages").hide();
    var unixEpoch = Date.now();
    $.ajax({
        type: 'GET',
        url: 'edit/',
        contentType: 'application/json; charset=utf-8',
        data: 'nocache='+unixEpoch,
        async: true,
        dataType: 'json',
        success: function(data) {
            if (data.length == 0) {
                $("#loading_msg").hide();
                return false;
            }

            if (data.editable != undefined) {
                htEditable = data.editable;
                htEditableCheck = true;

                $(".htEditor").each(function() {
                    $(this).css('visibility','visible');
                });
            }

            return false;
        },
        error: function(data) {
            $(".htEditor").each(function() {
                $(this).css('visibility','hidden');
            });
        },
    });
}

function htScroolToID(id) {
    $('html, body').scrollTop($(id).offset().top);
}

function htResetGenealogicalStats() {
    return { "primary_src" : 0, "reference_src" : 0, "holy_src": 0, "families": 0, "people": 0, "marriages": 0, "children": 0 };
}

function htAddTreeReflection(id, key)
{
    if ($(id).length > 0 && keywords.length >= key) {
        $(id).html(keywords[key]);
    }
}

function htAddReligionReflection(id)
{
    if ($(id).length > 0 && keywords.length > 68) {
        $(id).html(keywords[69]);
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

function htFillSourceContentToPrint(text, map, id)
{
    if (map.size == 0 || text.size == 0) {
        return text;
    }

    var mention = "";
    for (let [key, value] of map) {
        var dateValue = "";
        if (value.date != undefined && value.date != null && value.date.length > 0) {
            var dateVector = value.date.split("-");
            var textDate = htFillHTDate(dateVector);
            dateValue = ". [ "+keywords[22]+" "+textDate+" ].";
        }
        var urlValue = "";
        if (value.url != undefined && value.url != null && value.url.length > 0) {
            urlValue = keywords[23]+"  "+value.url;
        }
        mention += "<p>"+value.citation+" "+dateValue +" "+urlValue+"</p>";
    }

    text = text.replace("<div id=\""+id+"\" class=\"cited-text\"></div>", "<div id=\""+id+"\" class=\"cited-text\">"+mention+"</div>");
    return text;
}

function htPrintContent(header, body)
{
    // Code inspired by https://jsfiddle.net/gFtUY/
    var pageHeader = $(header).html();
    var pageBody = $(body).html();
    var pageCitation = $(".right-sources").html();

    pageCitation = htFillSourceContentToPrint(pageCitation, primarySourceMap, 'tree-source');
    pageCitation = htFillSourceContentToPrint(pageCitation, refSourceMap, 'tree-ref');
    pageCitation = htFillSourceContentToPrint(pageCitation, holyRefSourceMap, 'tree-holy-ref');
    pageCitation = htFillSourceContentToPrint(pageCitation, smSourceMap, 'tree-sm-ref');

    var printMe = "<p><h1><center>" + pageHeader + "</center></h1></p><p>" + pageBody + "</p><p>" + pageCitation + "</p>";
    var printScreen = window.open('', 'PRINT');

    printScreen.document.write(printMe);

    printScreen.document.close();

    printScreen.window.focus();
    printScreen.window.print();
}

function htAdjustGregorianZeroYear(text)
{
    var parsed = text.split(" ");
    var finalText = parsed[0] +" ";
    var end = parsed.length - 1;
    for (let i = 1; i < end; i++) {
        finalText += parsed[i] +" ";
    }

    return finalText + "0";
}

function htConvertDate(test, locale, unixEpoch, julianEpoch, gregorianDate)
{
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
    switch(test) {
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
            test = "gregory";
            break;
    }

    if (unixEpoch != undefined) {
        ct.setUTCSeconds(intEpoch);
    }

    text = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', calendar: test }).format(ct);

    if (test == "gregory") { 
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
                year = (frCals[0] < 0 ) ? mod(frCals[0]) + keywords[43] : frCals[0]; 
    
                text = "" + year;
                return text;
            case "shaka":
                var indianCal = jd_to_indian_civil(jd);
                year = (indianCal[0] < 0 ) ? mod(indianCal[0]) + year : indianCal[0]; 
    
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

function htFillDivAuthorsContent(target, last_update, authors, reviewers) {
    if (last_update <= 0) {
        return;
    }

    if ($("#paper-date").length > 0) {
        return;
    }

    var dateDiv = "<p><div id=\"paper-title\" class=\"paper-title-style\"><div id=\"paper-date\" class=\"paper-date-style\">";
    var local_lang = $("#site_language").val();
    var local_calendar = $("#site_calendar").val();
    var text = htConvertDate(local_calendar, local_lang, last_update, undefined, undefined);

    if (keywords.length > 33) {
        dateDiv += keywords[34] + " : " + authors + ".<br />";
    }

    if (keywords.length > 35) {
        dateDiv += keywords[36] + " : " + reviewers + ".<br />";
    }
    dateDiv += keywords[33] + " : " + text+ ".";

    dateDiv += "</div><div id=\"paper-print\" class=\"paper-print-style\"><a href=\"#\" class=\"fa-solid fa-print\" onclick=\"htPrintContent('#header', '#page_data'); return false;\"></a></div></div><br /><i>"+keywords[24]+" "+keywords[38]+"</i></p>";

    $(target).append(dateDiv);
}

function htLoadPageMountURL(page, arg, dir)
{
    var url = "lang/"; 

    var lang = $("#site_language").val();
    // Use default language
    if (lang == null || lang == undefined) {
        lang = htDetectLanguage();
    }

    if (arg == "source") {
        url += arg+"s/";
    } else {
        url  += lang+"/";
    }

    if (dir.length != 0) {
        url += dir+"/";
    }

    url += page+".json";

    return url;
}

function htOverwriteHTDateWithText(text, localDate, localLang, localCalendar) {
    if (localDate == undefined  || localDate.length == 0) {
        return text;
    }

    var ret = text;
    for (const i in localDate) {
        var changed = ret.replace("<htdate"+i+">", htMountSpecificDate(localDate[i], localLang, localCalendar));
        ret = changed;
    }

    return ret;
}

function htParagraphFromObject(localObj, localLang, localCalendar) {
    var format = (localObj.format == undefined) ? "html" : localObj.format;
    var originalText = "";
    if (localObj.fill_dates != undefined) {
        originalText = htOverwriteHTDateWithText(localObj.text, localObj.fill_dates, localLang, localCalendar);
    } else if (localObj.date_time != undefined) {
        originalText = htOverwriteHTDateWithText(localObj.text, localObj.date_time, localLang, localCalendar);
    } else {
        originalText = localObj.text;
    }
    var text = (format == "html") ? "<p>" : ""; 
    text += htFormatText(originalText, format, localObj.isTable);

    if (localObj.source != undefined && localObj.source != null) {
        var sources = localObj.source;
        text += " (";
        for (const i in sources) { 
            if (i != 0) {
                text += " ; ";
            }
            var fcnt = htFillHistorySourcesSelectFunction(sources[i].type);
            var dateText = (sources[i].date != undefined) ? ", "+htMountSpecificDate(sources[i].date, localLang, localCalendar) : "";
            text += "<a href=\"#\" onclick=\"htCleanSources(); "+fcnt+"('"+sources[i].uuid+"'); return false;\"><i>"+sources[i].text+" "+dateText+"</i></a>";
        }
        text += ")";
    }
    text += (localObj.PostMention != undefined && localObj.PostMention != null) ? localObj.PostMention : "";
    return text+"</p>";
}

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

        var imgIndex = getRandomArbitrary(0, htGameImages.length - 5);
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

function htImageZoom(id, translate) {
    var name = $("#"+id).prop("name");
    if (name.length == 0) {
        $("#"+id).attr("name", "zoomin");
        $("#"+id).css("transform", "scale(2.7)");
        $("#"+id).css("translate", translate);
    } else {
        $("#"+id).attr("name", "");
        $("#"+id).css("transform", "scale(1)");
        $("#"+id).css("translate", "0%");
    }
}

function htModifyAtlasIndexMap(id) {
    var next = parseInt(id) + 1;
    $("#atlasindex option[value="+next+"]").prop('selected', true);

    var myURL = 'index.html?page=atlas&atlas_page='+next;
    window.history.replaceState(null, null, myURL);
    $("#atlas").val(next);
}

function htFormatText(text, format, table) {
    if (format == "html") {
        return text;
    }

    var converter = new showdown.Converter();
    if (table != undefined && table == true || table == 1) {
        converter.setOption('tables', true);
    }
    var html      = converter.makeHtml(text);

    if (html.length < 4 ) {
        return html;
    }
    var htmlTest = html.substring(html.length - 4);

    return (htmlTest == "</p>") ? html.substring(0, html.length - 4 ) : html;
}

function htSelectAtlasMap(id) {
    if (htAtlas.length < id || id < 0) {
        return;
    }

    var vector = htAtlas[id];
    var author = "";
    if (vector.author != null) {
        if (vector.author == "HTMW" || vector.author.length == 0) {
            author = keywords[82];
        } else {
            author = vector.author;
        }
    }

    var formattedText = htFormatText(vector.text, vector.format, vector.isTable);

    if (vector.format == undefined || vector.format == "html") {
        formattedText = "<p>"+formattedText+"</p>";
    } else {
        formattedText += "</p>";
    }

    var text = (vector.image != null) ? "<p class=\"desc\"><img id=\"atlasimg\" src=\""+vector.image+"\" class=\"imgcenter\" onclick=\"htImageZoom('atlasimg', '-35%')\" />"+keywords[81]+" 1: "+author+".</p>"+formattedText : formattedText;
    var prevIdx = id - 1;
    var nextIdx = id + 1;
    var prevText = (prevIdx >= 0) ? "<a href=\"javascript:void(0);\" onclick=\"htSelectAtlasMap("+prevIdx+"); htModifyAtlasIndexMap("+prevIdx+");\">"+htAtlas[prevIdx].name+"</a>" : "&nbsp;";
    var nextText = (nextIdx < htAtlas.length) ? "<a href=\"javascript:void(0);\" onclick=\"htSelectAtlasMap("+nextIdx+"); htModifyAtlasIndexMap("+nextIdx+");\">"+htAtlas[nextIdx].name+"</a>" : "&nbsp;";
    text += "<p><div style=\"width: 50%; float: left; font-weight: bold;\">"+keywords[56]+"<br />"+prevText+"</div><div style=\"width: 50%; float: right; font-weight: bold; text-align: right;\">"+keywords[58]+"<br />"+nextText+"</div></p><p>&nbsp;</p>";
    $("#rightcontent").html(text);
}

function htFillAtlas(data) {
    htAtlas = [];

    if (data.atlas.length == 0) {
        return;
    }

    var localAtlas = data.atlas;
    var localLang = $("#site_language").val();
    var localCalendar = $("#site_calendar").val();
    for (i in localAtlas) {
        var text = "";
        for (const j in localAtlas[i].text) {
            var localObj = localAtlas[i].text[j];
            var localtext = (localObj.text != undefined && localObj.source != undefined) ? htParagraphFromObject(localObj, localLang, localCalendar) : localObj;
            text += localtext;
        }
        var author = (localAtlas[i].author != undefined && localAtlas[i].author.length > 0) ? localAtlas[i].author : null ;
        var isTable = (localAtlas[i].isTable != undefined) ? localAtlas[i].isTable : false ;
        var format = (localAtlas[i].format != undefined) ? localAtlas[i].format : "html" ;
        htAtlas.push({"name": localAtlas[i].name, "image" : localAtlas[i].image, "author": author, "text" : text, "format": format, "isTable": isTable});

        var showIdx = parseInt(i) + 1;
        var o = new Option(showIdx+". "+localAtlas[i].name, showIdx);
        $("#atlasindex").append(o);
    }

    var idx = ($("#atlas").length > 0 ) ? $("#atlas").val() : 0;
    if (isNaN(idx) || idx.length == 0) {
        htModifyAtlasIndexMap(1);
        idx = 1;
    } else {
        idx -= 1;
        htModifyAtlasIndexMap(idx);
    }
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

    if (data.fill_dates != undefined && data.fill_dates.constructor === vectorConstructor) {
        htFillHTDate(data.fill_dates);
    }
    else if (data.date_time != undefined && data.date_time.constructor === vectorConstructor) {
        htFillHTDate(data.date_time);
    }

    if ($("#family_common_sn").length > 0) {
        $("#family_common_sn").html(keywords[52]);
    }

}

function htLoadPageV1(page, ext, arg, reload, dir, optional) {
    $("#messages").html("&nbsp;");

    $("#loading_msg").show();

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

            htLoadIndex(data, arg, page);

            htLoadSources(data, arg, page);

            htProccessData(data, optional);

            if (arg != source) {
                htEnableEdition();
            }

            return false;
        },
    });
}


function htLoadPage(page, ext, arg, reload) {
    $("#messages").html("&nbsp;");
    if (ext == "html") {
        if (page != "tree") {
            $('.right-tree').css('display','none');
            $('.right-tree').css('visibility','hidden');
        }
        switch(page) {
            case "tree":
            case "genealogical_map_list":
            case "class_content":
                if (reload == true && lastTreeLoaded.arg != null && lastTreeLoaded.arg.length > 0) {
                    arg = lastTreeLoaded.arg;
                    htHistoryIdx.clear();
                    htLiteratureIdx.clear();
                    htFirstStepsIdx.clear();
                    htFamilyIdx.clear();
                } else {
                    lastTreeLoaded.page = page;
                    lastTreeLoaded.arg = arg;
                }

                if (page == "tree") {
                   $('.right-tree').css('display','block');
                   $('.right-tree').css('visibility','visible');
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
    if (ext == "html") {
        primarySourceMap.clear();
        refSourceMap.clear();
        holyRefSourceMap.clear();
        smSourceMap.clear();

        var additional = (appendPage.length == 0) ? '&' : appendPage+'&';
        $("#page_data").load("bodies/"+page+"."+ext+"?load="+additional+'nocache='+unixEpoch);

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

            if (arg != "source") {
                htEnableEdition();
            }

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

        // address browsers that stores only lower case values.
        var country = lang.substring(3).toUpperCase();
        llang =  lang.substring(0, 2).toLowerCase();
        lang = llang+'-'+country;
    }
    return lang;
}

function htMountSpecificDate(dateObj, localLang, localCalendar)
{
    switch (dateObj.type) {
        case "gregory":
            if (dateObj.day > 0 ) {
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
    var localLang = $("#site_language").val();
    var localCalendar = $("#site_calendar").val();
    var j = 0;
    $(".htdate").each(function() {
        if (j == vector.length) {
            return;
        }
        var w = vector[j++];
        var updateText = htMountSpecificDate(w, localLang, localCalendar);
        $(this).html(updateText);
    });
}

function htFillStringOnPage(data, idx, page)
{
    if (data.content[idx].html_value != undefined && data.content[idx].target == undefined) {
        $("#"+data.content[idx].id).append(data.content[idx].html_value);
    } else if (data.content[idx].id != undefined && data.content[idx].id == "fill_dates") {
        htFillHTDate(data.content[idx].text);
        return;
    } else if (data.content[idx].id != undefined && data.content[idx].id == "date_time") {
        htFillHTDate(data.content[idx].text);
        return;
    }

    var text = "";
    if (data.content[idx].html_value != undefined) {
        text = data.content[idx].html_value;
    } else if (data.content[idx].value != undefined) {
        text = data.content[idx].value;
    } else {
        return;
    }

    if ($("#"+data.content[idx].id).length > 0) {
        $("#"+data.content[idx].id).html(text);
    } else if ((page == "families" || page == "history" ||page == "literature" ||page == "first_steps") && (data.content[idx].target != undefined)) {
        $("#group-map").append("<ul><b><span id=\""+data.content[idx].id+"\">"+text+"</span></b><ol id=\""+data.content[idx].target+"\"></ol></ul><br />");
    }
}

function htFillWebPage(page, data)
{
    if (data.title != undefined && data.title != null && data.title.length > 0) {
        $(document).prop('title', data.title);
    }

    if (data.header != undefined && data.header != null && data.header.length > 0) {
        $("#header").html(data.header);
    } else  if (data.nothing != undefined && data.nothing != null && data.nothing.length > 0) {
        // Used when a new language has been added
        $(document).prop('title', data.nothing);
        $("#header").html(data.nothing);
        return;
    }

    if (data.common != undefined && data.common != null && data.common.length > 0) {
        var localLang = $("#site_language").val();
        var localCalendar = $("#site_calendar").val();
        for (const i in data.common) {
            var commonObj = data.common[i];
            var commonText = (commonObj.constructor === stringConstructor) ? commonObj : htParagraphFromObject(commonObj, localLang, localCalendar);

            $("#common").append(commonText);
        }
    }

    var last_update = 0;
    if (data.last_update != undefined && data.last_update != null) {
        last_update = data.last_update;
    }

    var page_authors = (keywords.length > 34 ) ? keywords[35] : "Editors of History Tracers";
    var page_reviewers = (keywords.length > 36 ) ? keywords[37] : "Reviewers of History Tracers";
    if (data.authors != undefined && data.authors != null && data.authors.length > 0) {
        page_authors = data.authors;
    }

    if (data.reviewers != undefined && data.reviewers != null && data.reviewers.length > 0) {
        page_reviewers = data.reviewers;
    }

    if ($("#extpaper").length > 0 && last_update > 0) {
        htFillDivAuthorsContent("#extpaper", last_update, page_authors, page_reviewers);
    }

    if (data.languages != undefined) {
        htFillIndexSelector(data.languages, "#site_language");
        $("#loading_msg").hide();
        $(':focus').blur()
        return;
    }
    else if (data.calendars != undefined) {
        htFillIndexSelector(data.calendars, "#site_calendar");
        $("#loading_msg").hide();
        $(':focus').blur()
        return;
    }
    else if (data.themes != undefined) {
        htFillIndexSelector(data.themes, "#site_theme");
        $("#loading_msg").hide();
        $(':focus').blur()
    }

    if (data.families != undefined) {
        htFillFamilies(page, data);
    } else if (data.keywords != undefined) {
        htFillKeywords(data.keywords);
        $("#loading_msg").hide();
    } else if (data.math_keywords != undefined) {
        htFillMathKeywords(data.math_keywords);
        $("#loading_msg").hide();
    } else {
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
                    htFillMapList(data.content[i].value, data.content[i].target, data.content[i].page);
                } else if (data.content[i].value_type == "subgroup") {
                    htFillSubMapList(data.content[i].value, data.content[i].target);
                } else if (data.content[i].value_type == "paper") {
                    htFillPaperContent(data.content[i].value, last_update, page_authors, page_reviewers, data.index);
                }
            } else if (data.content[i].value.constructor === vectorConstructor && data.content[i].id != undefined) {
                if (data.content[i].id != "fill_dates") {
                    for (const j in data.content[i].value) {
                        $("#"+data.content[i].id).append(data.content[i].value[j]);
                    }
                } else if (data.content[i].id != "date_time") {
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

        if (data.atlas != undefined) {
            htFillAtlas(data);
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

    if (data.scripts != undefined && data.scripts != null) {
        for (const i in data.scripts) {
            var jsURL = "js/" + data.scripts[i] + ".js";
            $.getScript( jsURL, function() {
                if (typeof htLoadExercise !== "undefined") {
                    htLoadExercise();
                }

                if ($("#btncheck").length > 0) {
                    $("#btncheck").on( "click", function() {
                        if (typeof htCheckAnswers !== "undefined") {
                            htCheckAnswers();
                        }
                        return false;
                    });
                }

                if ($("#btnnew").length > 0) {
                    $("#btnnew").on( "click", function() {
                        if (typeof htLoadExercise !== "undefined") {
                            htLoadExercise();
                        }
                        return false;
                    });
                }
            });
        }
    }

    htFillClassWithText(".htPrevText", keywords[56]);
    htFillClassWithText(".htTopText", keywords[57]);
    htFillClassWithText(".htNextText", keywords[58]);
    htFillClassWithText(".htIndexText", keywords[60]);

    if ($("#family_common_sn").length > 0) {
        $("#family_common_sn").html(keywords[52]);
    }

    if ($("#htZoomImageMsg").length > 0) {
        $("#htZoomImageMsg").html(keywords[84]);
    }

    if ($("#htAmericaAbyaYalaMsg").length > 0) {
        $("#htAmericaAbyaYalaMsg").html(keywords[85]);
    }

    if ($("#tree-common-stats").length <= 0) {
        return false;
    }

    var htmlFields = [ "#tree-common-stats", "#statsDescription", "#genStatRow00", "#genStatRow01", "#genStatRow10", "#genStatRow20", "#genStatRow30", "#genStatRow40", "#genStatRow50", "#genStatRow60", "#genStatRow70"];
    var labelIndexes = [ 61, 62, 63, 64, 5, 6, 7, 65, 66, 67, 68, 69];
    for (let i = 0; i < htmlFields.length; i++) {
        $(htmlFields[i]).html(keywords[labelIndexes[i]]);
    }

    var htmlValues = [ "#genStatRow11", "#genStatRow21", "#genStatRow31", "#genStatRow41", "#genStatRow51", "#genStatRow61", "#genStatRow71"];
    var counter = 0;
    Object.values(genealogicalStats).forEach(val => {
        $(htmlValues[counter++]).html(val);
    });
}

function htFillHistorySourcesSelectFunction(id)
{
    switch (id) {
        case 0:
            return "htFillPrimarySource";
        case 1:
            return "htFillReferenceSource";
        case 2:
            return "htFillHolySource";
        case 3:
        default:
            return "htFillSMSource";
    }
}

function htSelectIndexMap(index)
{
    if (index == "history") {
        return htHistoryIdx;
    } else if (index == "literature") {
        return htLiteratureIdx;
    } else if (index == "first_steps") {
        return htFirstStepsIdx;
    } else if (index == "families") {
        return htFamilyIdx;
    }

    return undefined;
}

function htBuildNavigation(index)
{
    var urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('arg')) {
        return null;
    }

    var arg = urlParams.get('arg');

    var idx = htSelectIndexMap(index);

    var ptr = idx.get(arg);
    if (ptr == undefined) {
        return null;
    }

    var pageName = (index == "families") ? "tree" : "class_content";

    var prev = "";
    if (ptr.prev == index) {
        prev = "<a href=\"index.html?page="+index+"\" onclick=\"htLoadPage('"+index+"','html', '', false); return false;\"><span>"+keywords[60]+"</span></a>";
    } else {
        var prevPtr = idx.get(ptr.prev);
        prev = "<a href=\"index.html?page="+pageName+"&arg="+ptr.prev+"\" onclick=\"htLoadPage('"+pageName+"', 'html', '"+ptr.prev+"', false); return false;\">"+prevPtr.name+"</a>";
    }

    var next = "";
    if (ptr.next == undefined) {
        next = "&nbsp;";
    } else {
        var nextPtr = idx.get(ptr.next);
        next = "<a href=\"index.html?page="+pageName+"&arg="+ptr.next+"\" onclick=\"htLoadPage('"+pageName+"', 'html', '"+ptr.next+"', false); return false;\">"+nextPtr.name+"</a>";
    }

    var navigation = "<p><table class=\"book_navigation\"><tr><td><span>"+keywords[56]+"</span></td> <td> <span>"+keywords[57]+"</span> </td> <td><span>"+keywords[58]+"</span></td></tr><tr><td>"+prev+"</td> <td><a href=\"index.html?page="+index+"\" onclick=\"htLoadPage('"+index+"','html', '', false); return false;\"><span>"+keywords[60]+"</span></td><td>"+next+"</td></tr></table></p>";

    return navigation;
}

function htWriteNavigation(index) 
{
    var navigation = htBuildNavigation(index);
    $(".dynamicNavigation").each(function() {
        $(this).html(navigation);
    });
}

function htFillTopIdx(idx, data, first)
{
    var prev = first;
    idx.set(first, {"prev" : first, "next" : undefined, "name" : keywords[57]});
    for (const i in data.content) {
        if (data.content[i].html_value != undefined && data.content[i].html_value.length > 0 || data.content[i].value.constructor !== vectorConstructor || data.content[i].page == undefined) {
            continue;
        }

        var table = data.content[i].value;
        var name = "";
        for (const j in table) {
            var fillNext = idx.get(prev);
            if (fillNext != undefined) {
                fillNext.next = table[j].id;
            }
            var pos = table[j].name.length;
            if (first == "families") {
                var testing = table[j].name.search("\\(<span");
                if (testing > 0) {
                    pos = testing;
                }
            }
            idx.set(table[j].id, {"prev" : prev, "next" : undefined, "name" : table[j].name.substring(0, pos) });
            prev = table[j].id;
        }
    }
}

function htLoadIndex(data, arg, page)
{
    if (data.content == undefined && data.families == undefined) {
        return;
    }

    var localLang = $("#site_language").val();
    if (localLang != htIdxLang) {
        htHistoryIdx.clear();
        htLiteratureIdx.clear();
        htFirstStepsIdx.clear();
        htFamilyIdx.clear();
    }

    if (page == "history" && htHistoryIdx.has("history") == false) {
        htFillTopIdx(htHistoryIdx, data, "history");
        return;
    } else if (page == "first_steps" && htFirstStepsIdx.has("first_steps") == false) {
        htFillTopIdx(htFirstStepsIdx, data, "first_steps");
        return;
    } else if (page == "literature" && htLiteratureIdx.has("literature") == false) {
        htFillTopIdx(htLiteratureIdx, data, "literature");
        return;
    } else if (page == "families" && htFamilyIdx.has("families") == false) {
        htFillTopIdx(htFamilyIdx, data, "families");
        return;
    }

    if (data.index == undefined) {
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

            htLoadIndex(d, arg, data.index);

            return false;
        },
    });
}

function htLoadSources(data, arg, page)
{
    if (data.sources != undefined) {
        for (const i in data.sources) {
            htLoadPage(data.sources[i], 'json', 'source', false);
        }
    } else {
        if (arg != 'source') {
            return true;
        }

        htFillMapSource(primarySourceMap, data.primary_sources);
        htFillMapSource(refSourceMap, data.reference_sources);
        htFillMapSource(holyRefSourceMap, data.religious_sources);
        htFillMapSource(smSourceMap, data.social_media_sources);

        if (page.length == 36) {
            genealogicalStats.primary_src = (data.primary_sources != undefined) ? data.primary_sources.length : 0;
            genealogicalStats.reference_src = (data.reference_sources != undefined) ? data.reference_sources.length : 0;
            genealogicalStats.holy_src =  (data.religious_sources != undefined) ? data.religious_sources.length : 0;
        }

        if (page == 'tree') {
            $("#loading_msg").hide();
            return false;
        }
    }
    return true;
}

function htFillIndexSelector(table, target) {
    // Avoid duplication
    var current = $(target).val();
    $(target).find("option").remove();

    // Fill selector
    for (const i in table) {
        $(target).append(new Option(table[i].text, table[i].dir));
    }

    $(target).val(current);
}

function htFillKeywords(table) {
    keywords = [];
    // Fill keyword
    for (const i in table) {
        keywords.push(table[i]);
    }
    if (keywords.length < 40)
        return;

    $("#index_lang").html(keywords[39]);
    $("#index_calendar").html(keywords[40]);
    $("#index_theme").html(keywords[74]);
    htUpdateCurrentDateOnIndex();
}

function htFillMathKeywords(table) {
    mathKeywords = [];
    // Fill keyword
    for (const i in table) {
        mathKeywords.push(table[i]);
    }
}

function htFillFamilyList(table, target) {
    for (const i in table) {
        if (table[i].target == undefined) {
            if (table[i].id != undefined && table[i].id == "fill_dates") {
                if (table[i].text.constructor === vectorConstructor) {
                    htFillHTDate(table[i].text);
                }
            } else if (table[i].id != undefined && table[i].id == "date_time") {
                if (table[i].text.constructor === vectorConstructor) {
                    htFillHTDate(table[i].text);
                }
            }
            continue;
        }

        $("#"+table[i].target).append("<div id=\"bottom"+table[i].id+"\"><h3>"+table[i].id+"</h3></div>");
        if (table[i].value.constructor === vectorConstructor) {
            var rows = table[i].value;
            $("#bottom"+table[i].id).append("<ul id=\"bottomList"+table[i].id+"\"></ul>");
            for (const k in rows) {
                $("#bottomList"+table[i].id).append("<li id=\""+rows[k].id+"\"><a href=\"index.html?page=tree&arg="+rows[k].id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+rows[k].id+"', false); return false;\" >"+rows[k].value+"</a></li>");
            }
        }
    }
}

function htFillMapList(table, target, page) {
    for (const i in table) {
        if (table[i].id != "fill_dates" && table[i].id != "date_time") {
            $("#"+target).append("<li id=\""+table[i].id+"\"><a href=\"index.html?page="+page+"&arg="+table[i].id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('"+page+"', 'html', '"+table[i].id+"', false); return false;\" >"+table[i].name+"</a>: "+table[i].desc+"</li>");
        } else {
            if (table[i].text.constructor === vectorConstructor) {
                htFillHTDate(table[i].text);
            }
        }
    }
}

function htFillSubMapList(table, target) {
    for (const i in table) {
        switch(table[i].page) {
            case "class_content":
                if (table[i].id != undefined && table[i].name != undefined && table[i].desc != undefined) {
                    $("#"+target).append("<li id=\""+i+"\"><a href=\"index.html?page=class_content&arg="+table[i].id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('class_content', 'html', '"+table[i].id+"', false); return false;\" >"+table[i].name+"</a>: "+table[i].desc+"</li>"); 
                }
                break;
            case "tree":
            default:
                if (table[i].person_id != undefined && table[i].family_id != undefined && table[i].family_id.length > 0 && table[i].name != undefined && table[i].desc != undefined) {
                    $("#"+target).append("<li id=\""+i+"\"><a href=\"index.html?page=tree&arg="+table[i].family_id+"&person_id="+table[i].person_id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+table[i].family_id+"&person_id="+table[i].person_id+"', false); return false;\" >"+table[i].name+"</a>: "+table[i].desc+"</li>");
                }
        }
    }
}

function htCheckExerciseAnswer(val0, val1, answer, explanation) {
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

    if ($(answer).length > 0) {
        $(answer).text(text);
        $(answer).css("color", format);
    }

    if ($(explanation).length > 0) {
        $(explanation).css("color", format);
        $(explanation).css("display","block");
        $(explanation).css("visibility","visible");
    }

    return false;
}

function htResetAnswers(vector)
{
    for (let i = 0; i < vector.length; i++) {
        $("#answer"+i).text("");
        $("input[name=exercise"+i+"]").prop("checked", false);

        $("#explanation"+i).css("display","none");
        $("#explanation"+i).css("visibility","hidden");
    }
}

function htWriteGame(table, later, idx)
{
    var tmpData = "<p class=\"ht_description\"><span id=\"htGameDataToBeUsed\">";
    var total = 0;
    for (const i in table) {
        tmpData += table[i].imageDesc+"|";
        total++;
    }

    tmpData += "</span><span id=\"htTotalGameData\">"+total+"</span></p>";
    htAddPaperDivs("#paper", "game1", tmpData, "", later, idx+1000);
}

function htWriteQuestions(table, later, idx)
{
    var questions = "<p><h3>"+keywords[50]+"</h3><ol>";
    var tmpAnswers = "<p class=\"ht_description\"><span id=\"htAnswersToBeUsed\">";
    var total = 0;
    for (const i in table) {
        questions += "<li>"+table[i].question+" <input type=\"radio\" id=\"ans"+i+"yes\" name=\"exercise"+i+"\" value=\"1\" /> <b><label>"+keywords[31]+"</label></b> <input type=\"radio\" id=\"ans"+i+"no\" name=\"exercise"+i+"\" value=\"0\" /> <b><label>"+keywords[32]+"</label></b>. <span class=\"ht_description\" id=\"explanation"+i+"\"><span id=\"answer"+i+"\"></span> "+table[i].additionalInfo+"</span></li>";
        tmpAnswers += (table[i].yesNoAnswer == "Yes") ? 1+";" : 0+";";
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

function htLoadGameData()
{
    var ret = [];
    var tmpData = "<p class=\"ht_description\"><span id=\"htGameDataToBeUsed\">";
    var end = parseInt($("#htTotalGameData").html());

    if (end == undefined) {
        return end;
    }

    var htmlValues = $("#htGameDataToBeUsed").html();
    if (htmlValues == undefined) {
        return end;
    }

    var values = htmlValues.split("|");
    for (let i = 0; i < end; i++) {
        ret.push( { "imageDesc" : values[i] });
    }

    $("#htAnswersToBeUsed").html("");
    return ret;
}

function htLoadAnswersFromExercise()
{
    var ret = [];
    var end = parseInt($("#htTotalQuestions").html());

    if (end == undefined) {
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

function htFillPaperContent(table, last_update, page_authors, page_reviewers, index) {
    var localLang = $("#site_language").val();
    var localCalendar = $("#site_calendar").val();

    $("#paper").html("<i>"+keywords[87]+"</i>");

    var navigationPage = table[0].text;
    var idx = 0;
    var later = "";
    for (const i in table) {
        if (i == 1) {
            htFillDivAuthorsContent("#paper", last_update, page_authors, page_reviewers);
        }

        if (index && i == 0) {
            navigationPage = "<p class=\"dynamicNavigation\"></p>";
            htAddPaperDivs("#paper", "indexTop", navigationPage, "", "<hr class=\"limit\" />", idx);
            idx++;
            later = "";
        } else {
            //TODO: REMOVE THESE LINE AFTER TO UPDATE ALL CHILDPAGES
            if (table[i].id == "navigation") {
                navigationPage = table[0].text;
            }
            later = (i == 0 && last_update > 0 && table[i].id == "navigation") ? "<hr class=\"limit\" />" : "";
        }

        if (table[i].text.constructor === stringConstructor) {
            htAddPaperDivs("#paper", table[i].id, table[i].text, "", later, idx);
        } else if (table[i].text.constructor === vectorConstructor) {
            if (table[i].id == "exercise_v2") {
                htWriteQuestions(table[i].text, later, idx);
            } else if (table[i].id == "game_v1") {
                htWriteGame(table[i].text, later, idx);
            } else if (table[i].id != "fill_dates" && table[i].id != "date_time") {
                for (const j in table[i].text) {
                    var localObj = table[i].text[j];
                    var text = (localObj.text != undefined) ? htParagraphFromObject(localObj, localLang, localCalendar) : localObj;
                    htAddPaperDivs("#paper", table[i].id + "_"+j, text, "", later, idx);
                }
            } else {
                htFillHTDate(table[i].text);
            }
        }
        idx++;
    }

    if (navigationPage.length > 0) {
        htAddPaperDivs("#paper", "repeat-index", navigationPage, "<hr class=\"limit\" />", "", 100000);
    }
}

function htFillFamilies(page, table) {
    if (table.title != undefined) {
        $(document).prop('title', table.title);
    }

    if (table.documentsInfo != undefined && table.documentsInfo != null && $("#overallInfo").length > 0) {
        var dIText = "<p><h3>"+keywords[53]+"</h3>"+keywords[59]+"</p>";
        if (table.documentsInfo.length == 4) {
            dIText += table.documentsInfo[3];
        }

        $("#overallInfo").html(dIText);

        if ($("#documentsInfoLang").length > 0) { $("#documentsInfoLang").html(table.documentsInfo[0]); }
        if ($("#documentsInfoCalendarName").length > 0) { $("#documentsInfoCalendarName").html(table.documentsInfo[1]); }
        if ($("#documentsInfoCalendarVisibleOption").length > 0) { $("#documentsInfoCalendarVisibleOption").html(table.documentsInfo[2]); }
    }

    if (table.periodOfTime != undefined && table.periodOfTime != null && $("#periodOfTime").length > 0) {
        if (table.periodOfTime.length == 2) {
            var pOTText = "<p><h3>"+keywords[76]+"</h3>"+keywords[77]+"</p>";

            $("#periodOfTime").html(pOTText);

            if ($("#documentsPeriodOrigin").length > 0) { $("#documentsPeriodOrigin").html(table.periodOfTime[0]); }
            if ($("#documentsPeriodTime").length > 0) { $("#documentsPeriodTime").html(table.periodOfTime[1]); }
        }
    }

    if (table.maps != undefined && table.maps != null && $("#maps").length > 0) {
        var textMap = "<p><h3>"+keywords[79]+"</h3>"+keywords[80]+"</p>";

        for (const i in table.maps) {
            var currMap = table.maps[i];
            if (currMap.text == undefined || currMap.img == undefined) {
                continue;
            }

            textMap += "<p class=\"desc\"><img src=\""+currMap.img+"\" id=\"imgFamilyMap\" onclick=\"htImageZoom('imgFamilyMap', '0%')\" class=\"imgcenter\"/>"+keywords[81]+" "+currMap.order+": "+currMap.text+" "+keywords[82]+" "+keywords[83]+"</p>";
        }

        if ($("#maps").length > 0) { $("#maps").html(textMap); }
    }

    if (table.prerequisites != undefined && table.prerequisites != null && $("#pre_requisites").length > 0) {
        var preRequisites = "";
        for (const i in table.prerequisites) {
            preRequisites += (i == 0) ? "<p><ul><li>"+table.prerequisites[i] + "</li>" :  "<li>"+ table.prerequisites[i] + "</li>";
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
        if (table.families[i].id == undefined ||
            table.families[i].name == undefined) {
            continue;
        }

        var family_id = table.families[i].id;
        $("#index_list").append("<li id=\"lnk-"+family_id+"\"><a href=\"javascript:void(0);\" onclick=\"htScroolTree('#hist-"+family_id+"');\">"+keywords[8] + " : " +table.families[i].name+"</a></li>");

        $("#trees").append("<div id=\"hist-"+family_id+"\"></div>");

        var family = table.families[i];
        htAppendData("hist",
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

            personNameMap.set(people[j].id, people[j].name);
            htAppendData("tree",
                       person_id,
                       family_id,
                       people[j].name,
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

    if (table.game_v1 != undefined && table.game_v1.constructor === vectorConstructor) {
        htWriteGame(table.game_v1, "", 1);
    }

    if (table.fill_dates != undefined && table.fill_dates.constructor === vectorConstructor) {
        htFillHTDate(table.fill_dates);
    }
    else if (table.date_time != undefined && table.date_time.constructor === vectorConstructor) {
        htFillHTDate(table.date_time);
    }

    $("#loading_msg").hide();
}

function htSetMapFamily(id, father, mother, type)
{
    if (father == null && mother == null) {
        familyMap.set(id, "null&null&t");
        return;
    }

    var parent_idx = "";
    if (father != undefined && father != null) {
        parent_idx += father;
    } else {
        parent_idx += "null";
    }

    if (mother != undefined && mother != null) {
        parent_idx += "&"+mother;
    } else {
        parent_idx += "&null";
    }

    parent_idx += (type == "theory") ? "&t" : "&h";

    familyMap.set(id, parent_idx);
}

function htMountCurrentLinkBasis(familyID, id)
{
    var url = window.location.href;
    var remove = url.search("#");
    if (remove < 0) {
        remove = url.search("\\?");
    }

    var userURL = (remove > 0 )? url.substring(0, remove) : url;

    userURL += "?page=tree&arg="+familyID;

    if (id != undefined) {
        var myTree = url.search("page=tree");
        if (myTree >= 0) {
            userURL += "&person_id=" + id;
        }
    }

    return userURL;
}

function htSetCurrentLinkBasis(familyID, id, finalURL)
{
    var myURL = (finalURL == undefined) ? htMountCurrentLinkBasis(familyID, id) : finalURL;
    window.history.replaceState(null, null, myURL);

    return false;
}

function htCopyLink(familyID, id)
{
    var userURL = htMountCurrentLinkBasis(familyID, id);
    htSetCurrentLinkBasis(familyID, id, userURL);

    userURL += "&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val();

    var temp = $("<input>");
    $("body").append(temp);
    temp.val(userURL).select();
    document.execCommand("copy");
    temp.remove();

    return false;
}

function htAppendData(prefix, id, familyID, name, table, page) {
    var history = table.history;
    var parents = table.parents;
    var marriages = table.marriages;

    if (history != undefined) {
        var title;
        var localHeader;
        var goToTop;
        if ((parents == undefined || marriages == undefined) && (prefix != "tree")) {
            title = keywords[8];
            localHeader = "3";
            goToTop ="<a href=\"javascript:void(0);\" onclick=\"htScroolToID('#index_list');\">"+keywords[78]+"</a>";
        } else {
            title = keywords[9];
            localHeader = "4";
            goToTop ="";
        }
        $("#"+prefix+"-"+id).append("<p><h"+localHeader+" id=\"name-"+id+"\" onclick=\"htFillTree('"+id+"'); htSetCurrentLinkBasis('"+page+"', '"+id+"',"+undefined+");\">"+title + " : " +name+" (<a href=\"javascript:void(0);\" onclick=\"htCopyLink('"+page+"', '"+id+"'); return false;\" >"+keywords[26]+"</a>). "+goToTop+"</h"+localHeader+"></p>");
    }

    var primary_source = table.primary_source;
    var references = table.references;
    var holy_references = table.holy_references;
    htFillHistorySources(id, "#"+prefix+"-"+id, history, "tree-default-align", id);

    var global_father = null;
    if (parents != undefined) {
        for (const i in parents) {
            var couple = parents[i];
            var parents_id = prefix+"-parents-"+id;
            var father = (couple.father_id) ? couple.father_id : couple.father;
            var mother = (couple.mother_id) ? couple.mother_id : couple.mother;
            if (father == null && mother == null) {
                $("#"+prefix+"-"+id).append("<div id=\""+parents_id+"\" class=\"tree-real-family-text\"><p><b>"+keywords[0] + "</b>: " + keywords[10]+"</p></div>");

                familyMap.set(id, "null&null&t");
            } else {
                var parentsLink = "";
                var name = "";
                if (father != undefined && father != null) {
                    global_father = father;
                    parents_id += father + "-";

                    name = personNameMap.get(father);
                    if (name != undefined) {
                        parentsLink += "<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+father+"'); htFillTree('"+father+"'); htSetCurrentLinkBasis('"+page+"', '"+father+"',"+undefined+");\">" +name+"</a> ";
                    } else if (couple.father_name != undefined && couple.father_family != undefined && couple.father_family != familyID) {
                        parentsLink += "<a href=\"index.html?page=tree&arg="+couple.father_family+"&person_id="+father+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.father_family+"&person_id="+father+"', false); return false;\">"+couple.father_name+"</a> & ";
                    }
                }
                parents_id += "-";

                if (mother != null && mother != undefined) {
                    parents_id += mother + "-";

                    name = personNameMap.get(mother);
                    if (name != undefined) {
                        if (couple.mother_family != undefined) {
                            if (couple.mother_family == familyID || (couple.mother_external_family_file != undefined && couple.mother_external_family_file == false)) {
                                parentsLink += " & <a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+mother+"'); htFillTree('"+mother+"'); htSetCurrentLinkBasis('"+page+"', '"+mother+"',"+undefined+");\">" +name+"</a>";
                            } else {
                                parentsLink += "<a href=\"index.html?page=tree&arg="+couple.mother_family+"&person_id="+mother+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.mother_family+"&person_id="+mother+"', false); return false;\">"+name+"</a>";
                            }
                        } else {
                            parentsLink += " & " +name;
                        }
                    } else if (couple.mother_name != undefined && couple.mother_family != undefined && couple.mother_family != familyID) {
                        parentsLink += "<a href=\"index.html?page=tree&arg="+couple.mother_family+"&person_id="+mother+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.mother_family+"&person_id="+mother+"', false); return false;\">"+couple.mother_name+"</a>";
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

    if (marriages != undefined) {
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
                if (type == "theory") {
                    marriage_class = "tree-real-family-text";
                    marriage_keyword = keywords[17];
                } else {
                    marriage_class = "tree-hipothetical-family-text";
                    marriage_keyword = keywords[18];
                }

                if (official != undefined && official == false) {
                    marriage_keyword = keywords[86];
                }
                var marriageLink = "";
                if (marriage.family_id == undefined) {
                    marriageLink = marriage.name;
                } else if (familyID == marriage.family_id || (marriage.external_family_file != undefined && marriage.external_family_file == false)) {
                    marriageLink = "<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+marriage.id+"'); htFillTree('"+marriage.id+"'); htSetCurrentLinkBasis('"+page+"', '"+marriage.id+"',"+undefined+");\">"+marriage.name+"</a>";
                } else {
                    marriageLink = "<a href=\"index.html?page=tree&arg="+marriage.family_id+"&person_id="+marriage.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+marriage.family_id+"&person_id="+marriage.id+"', false); return false;\">"+marriage.name+"</a>";
                }

                $("#"+prefix+"-"+id).append("<div id=\""+rel_id+"\" class=\""+marriage_class+"\"><p><b>"+marriage_keyword+"</b>: "+marriageLink+".</p></div>");
               htFillHistorySources(marriage.id, "#"+rel_id, marriage.history, "tree-default-align", marriage.id);

                var showTree = personNameMap.has(marriage.id);
                if (showTree == false) {
                    personNameMap.set(marriage.id, marriage.name);
                }
            }

        }
    }

    var children = table.children;
    if (children != undefined) {
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
            if (type == "theory") {
                child_class = "tree-real-child-text";
                child_keyword = keywords[20];
            } else {
                child_class = "tree-hipothetical-child-text";
                child_keyword = keywords[21];
            }

            var childLink = "";
            if (child.family_id == undefined || child.family_id.length == 0) {
                childLink = child.name ;
            } else if (familyID == child.family_id || (child.external_family_file != undefined && child.external_family_file == false)) {
                childLink = "<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+child.id+"'); htFillTree('"+child.id+"'); htSetCurrentLinkBasis('"+page+"', '"+child.id+"',"+undefined+");\">"+child.name+"</a>";
            } else { 
                childLink = "<a href=\"index.html?page=tree&arg="+child.family_id+"&person_id="+child.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+child.family_id+"&person_id="+child.id+"', false);\">"+child.name+"</a>";
            }

            $("#"+relationship_id).append("<div id=\""+child_id+"\" class=\""+child_class+"\"><p><b>"+child_keyword+"</b>: </p></div>");
            $("#"+child_id).append("<div id=\"with-parent-"+child.id+"\" class=\""+child_class+"\"><p><b>"+childLink+"</b>: </p></div>");
            htFillHistorySources("parent-"+child.id, "#with-parent-"+child.id, child.history, "", child.id);
            htSetMapFamily(child.id, id, child.marriage_id, child.type);
            personNameMap.set(child.id, child.name);
        }
    }
}

function htFillHistorySources(divId, histID, history, useClass, personID)
{
    var localLang = $("#site_language").val();
    var localCalendar = $("#site_calendar").val();
    if (history != undefined) {
        for (const i in history) {
            var localObj = history[i];
            var text = (localObj.text != undefined && localObj.format != undefined) ? htParagraphFromObject(localObj, localLang, localCalendar) : "<p>"+localObj+"</p>";
            $(histID).append("<p class=\""+useClass+"\" onclick=\"htFillTree('"+personID+"'); \">"+text+"</p>");
        }
    }
}

function htFillMapSource(myMap, data)
{
    if (data == undefined) {
        return;
    }

    var currentLanguage = $("#site_language").val();
    var currentCalendar = $("#site_calendar").val();
    for (const i in data) {
        var ids = myMap.has(data[i].id);
        if (ids == false) {
            var finalDate = "";
            if (data[i].date != undefined ) {
                var dateVector = data[i].date.split('-');
                if (dateVector.length != 3) {
                    continue;
                }
                finalDate = htConvertGregorianDate(currentCalendar, currentLanguage, dateVector[0], dateVector[1], dateVector[2]);
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

function htCleanSources()
{
    $("#tree-source").html("");
    $("#tree-ref").html("");
    $("#tree-holy-ref").html("");
    $("#tree-sm-ref").html("");
}

function htFillSource(divID, sourceMap, id)
{
    var src = sourceMap.get(id);
    if (src != undefined) {
        var dateValue = "";
        if (src.date != undefined && src.date != null && src.date.length > 0) {
            dateValue = ". [ "+keywords[22]+" "+src.date+" ].";
        }
        var urlValue = "";
        if (src.url != undefined && src.url != null && src.url.length > 0) {
            urlValue = keywords[23]+" <a target=\"_blank\" href=\""+src.url+"\"> "+src.url+"</a>";
        }
        $(divID).append("<p>"+src.citation+" "+dateValue +" "+urlValue+"</p>");
    }
}

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

function htScroolTree(id)
{
    var destination = $(id).val();
    if (destination != undefined) {
        $('html, body').scrollTop($(id).offset().top);
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

// Copied from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random [2024-01-13]
function getRandomArbitrary(min, max) {
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

