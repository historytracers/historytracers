// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    var lang = "";
    var first = true;

    var urlParams = new URLSearchParams(window.location.search);
    const myState = { additionalInformation: 'Updated the URL with JS, avoiding wrong click action' };
    window.history.replaceState(myState, '', '#');
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

    $('#site_language').val(lang);
    htLoadPage('index','json', '', false);
    htLoadPage('language','json', '', false);
    htLoadPage('tree_keywords','json', '', false);

    $('#site_language').on('change', function() {
        if (!first) {
            var lastLoaded = $("#html_loaded").val();
            if (lastLoaded.lenght == 0 ) {
                lastLoaded = 'main';
            }

            htLoadPage('index','json', '', true);
            htLoadPage('language','json', '', true);
            htLoadPage('tree_keywords','json', '', true);
            htLoadPage(lastLoaded, 'html', '', true);
        }
    });

    if (urlParams.has('page')) {
        var page = urlParams.get('page');
        switch(page) {
            case 'main':
            case 'license':
            case 'contact':
            case 'science':
            case 'history':
            case 'first_steps':
            case 'genealogical_faq':
            case 'genealogical_map':
            case 'families':
            case 'kids':
            case 'sources':
            case 'indigenous_who':
            case 'indigenous_time':
            case 'acknowledgement':
            case 'release':
                htLoadPage(page,'html', '', false);
                break;
            case 'tree':
            case 'genealogical_map_list':
            case 'class_content':
                var larg = (urlParams.has('arg')) ? urlParams.get('arg'): "";
                if (larg != null && larg != undefined && larg.length > 5 ) {
                    var lperson = (urlParams.has('person_id')) ? urlParams.get('person_id'): "";
                    htLoadPage(page,'html', larg+'&person_id='+lperson, false);
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

