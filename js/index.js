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
    sgLoadPage('index','json', '', false);
    sgLoadPage('language','json', '', false);
    sgLoadPage('tree_keywords','json', '', false);

    $('#site_language').on('change', function() {
        if (!first) {
            var lastLoaded = $("#html_loaded").val();
            if (lastLoaded.lenght == 0 ) {
                lastLoaded = 'main';
            }

            sgLoadPage('index','json', '', true);
            sgLoadPage('language','json', '', true);
            sgLoadPage('tree_keywords','json', '', true);
            sgLoadPage(lastLoaded, 'html', '', true);
        }
    });

    if (urlParams.has('page')) {
        var page = urlParams.get('page');
        switch(page) {
            case 'main':
            case 'license':
            case 'contact':
            case 'first_steps':
            case 'genealogical_faq':
            case 'genealogical_map':
            case 'families':
            case 'sources':
            case 'indigenous_who':
            case 'acknowledgement':
            case 'release':
                sgLoadPage(page,'html', '', false);
                break;
            case 'tree':
            case 'genealogical_map_list':
            case 'indigenous_who_content':
                var larg = (urlParams.has('arg')) ? urlParams.get('arg'): "";
                if (larg != null && larg != undefined && larg.length > 5 ) {
                    var lperson = (urlParams.has('person_id')) ? urlParams.get('person_id'): "";
                    sgLoadPage(page,'html', larg+'&person_id='+lperson, false);
                }
                break;
            default:
                $( "#messages" ).html( "Error requesting page " +  urlParams.get('page'));
        }
    } else {
        sgLoadPage('main','html', '', false);
    }
    first = false;
});

// http://api.jquery.com/ajaxerror/
$(document).on( "ajaxError", function( event, request, settings ) {
  $( "#messages" ).html( "Error requesting page " + settings.url );
});

