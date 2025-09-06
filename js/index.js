// SPDX-License-Identifier: GPL-3.0-or-later

var firstIndexTime = true;

function htReloadCurrentPage()
{
    if (!firstIndexTime) {
        var lastLoaded = $("#html_loaded").val();
        if (lastLoaded.lenght == 0 ) {
            lastLoaded = 'main';
        }

        htLoadPage('index','json', '', true);
        htLoadPage('language','json', '', true);
        htLoadPage('calendars','json', '', true);
        htLoadPage('theme','json', '', true);
        htLoadPage('common_keywords','json', '', true);
        htLoadPage('math_keywords','json', '', true);
        htLoadPage(lastLoaded, 'html', '', true);
    }
}

function htDetectLocalLanguage()
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

function htSetIndexLang(urlParams) {
    var lang = "en-US";
    if (urlParams.has('lang')) {
        var selLang = urlParams.get('lang');
        if ($("#site_language option[value='"+selLang+"']").length > 0) {
            lang = "en-US";
        }
    } else {
        lang = htDetectLocalLanguage();
    }

    return lang;
}

function htSetIndexCal(urlParams) {
    var cal = "";
    if (urlParams.has('cal')) {
        var selCalendar = urlParams.get('cal');
        if ($("#site_calendar option[value='"+selCalendar+"']").length > 0) {
            cal = selCalendar;
        }
    } else {
        cal = "gregory";
    }

    return cal;
}

function htParseIndexRequest() {
    var urlParams = new URLSearchParams(window.location.search);
    var lang = htSetIndexLang(urlParams);
    var cal = htSetIndexCal(urlParams);

    if (urlParams.has('atlas_page')) {
        var selAtlas = urlParams.get('atlas_page');
        $("#atlas").val(selAtlas);
    } else {
        $("#atlas").val(1);
    }

    $('#site_language').val(lang);
    $('#site_calendar').val(cal);

    htLoadPage('index','json', '', false);
    htLoadPage('language','json', '', false);
    htLoadPage('calendars','json', '', false);
    htLoadPage('common_keywords','json', '', false);
    htLoadPage('math_keywords','json', '', false);
    htLoadPage('theme','json', '', false);

    $('#site_language').on('change', function() {
        htReloadCurrentPage();
    });

    $('#site_calendar').on('change', function() {
        htReloadCurrentPage();
    });

    if (urlParams.has('page')) {
        var page = urlParams.get('page');
        switch(page) {
            case 'main':
            case 'license':
            case 'contact':
            case 'science':
            case 'history':
            case 'genealogical_first_steps':
            case 'genealogical_faq':
            case 'genealogical_map':
            case 'families':
            case 'myths_believes':
            case 'first_steps':
            case 'indigenous_who':
            case 'indigenous_time':
            case 'math_games':
            case 'release':
            case 'literature':
            case 'atlas':
                htLoadPage(page, 'html', '', false);
                break;
            case 'tree':
            case 'genealogical_map_list':
            case 'class_content':
                if (urlParams.has('arg')) {
                    var larg = urlParams.get('arg');
                    var lperson = (urlParams.has('person_id')) ? urlParams.get('person_id'): "";
                    var finalArg = (lperson.length == 0) ? larg : larg+'&person_id='+lperson;
                    htLoadPage(page,'html', finalArg, false);
                } else {
                    htLoadPage(page,'html', '', false);
                }
                break;
            default:
                break;
        }
    } else {
        htLoadPage('main','html', '', false);
    }

    firstIndexTime = false;
}

