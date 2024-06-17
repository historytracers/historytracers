// SPDX-License-Identifier: GPL-3.0-or-later

function htReloadCurrentPage(first)
{
    if (!first) {
        var lastLoaded = $("#html_loaded").val();
        if (lastLoaded.lenght == 0 ) {
            lastLoaded = 'main';
        }

        htLoadPage('index','json', '', true);
        htLoadPage('language','json', '', true);
        htLoadPage('calendars','json', '', true);
        htLoadPage('common_keywords','json', '', true);
        htLoadPage('math_keywords','json', '', true);
        htLoadPage(lastLoaded, 'html', '', true);
    }
}

$(document).ready(function(){
    var lang = "";
    var cal = "";
    var first = true;

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('lang')) {
        var selLang = urlParams.get('lang');
        if ($("#site_language option[value='"+selLang+"']").length < 0) {
            lang = "en-US";
        } else {
            lang = selLang;
        }
    } else {
        lang = htDetectLanguage();
    }

    if (urlParams.has('cal')) {
        var selCalendar = urlParams.get('cal');
        if ($("#site_calendar option[value='"+selCalendar+"']").length < 0) {
            cal = "gregory";
        } else {
            cal = selCalendar;
        }
    } else {
        cal = "gregory";
    }

    $('#site_language').val(lang);
    $('#site_calendar').val(cal);
    htLoadPage('index','json', '', false);
    htLoadPage('language','json', '', false);
    htLoadPage('calendars','json', '', false);
    htLoadPage('common_keywords','json', '', false);
    htLoadPage('math_keywords','json', '', false);

    $('#site_language').on('change', function() {
        htReloadCurrentPage(first);
    });

    $('#site_calendar').on('change', function() {
        htReloadCurrentPage(first);
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
            case 'first_step':
            case 'sources':
            case 'indigenous_who':
            case 'indigenous_time':
            case 'acknowledgement':
            case 'release':
                htLoadPage(page, 'html', '', false);
                break;
            case 'tree':
            case 'genealogical_map_list':
            case 'class_content':
                var larg = (urlParams.has('arg')) ? urlParams.get('arg'): "";
                if (larg != null && larg != undefined && larg.length > 5 ) {
                    var lperson = (urlParams.has('person_id')) ? urlParams.get('person_id'): "";
                    var finalArg = (lperson.length == 0) ? larg : larg+'&person_id='+lperson;
                    htLoadPage(page,'html', finalArg, false);
                }
                break;
            default:
                $( "#messages" ).html( "Error requesting page " +  urlParams.get('page'));
        }
    } else {
        htLoadPage('main','html', '', false);
    }
    first = false;
});

// http://api.jquery.com/ajaxerror/
$(document).on( "ajaxError", function( event, request, settings ) {
  $( "#messages" ).html( "Error requesting page " + settings.url );
});

