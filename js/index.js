// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    sgLoadPage('main','html', '', false);
    sgLoadPage('index','json', '', false);
    sgLoadPage('language','json', '', false);
    sgLoadPage('tree_keywords','json', '', false);

    $('#site_language').on('change', function() {
        var lastLoaded = $("#html_loaded").val();
        if (lastLoaded.lenght == 0 ) {
            lastLoaded = 'main';
        }

        sgLoadPage('index','json', '', true);
        sgLoadPage('language','json', '', true);
        sgLoadPage('tree_keywords','json', '', true);
        sgLoadPage(lastLoaded, 'html', '', true);
    });

    var urlParams = new URLSearchParams(window.location.search);
    const myState = { additionalInformation: 'Updated the URL with JS, avoiding wrong click action' };
    window.history.replaceState(myState, '', '#');
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
                sgLoadPage(page,'html', '', false);
                break;
            case 'tree':
                var larg = (urlParams.has('arg')) ? urlParams.get('arg'): "";
                sgLoadPage('tree','html', larg, false);
                break;
            default:
                $( "#messages" ).html( "Error requesting page " +  urlParams.get('page'));
        }
    }
});

// http://api.jquery.com/ajaxerror/
$(document).on( "ajaxError", function( event, request, settings ) {
  $( "#messages" ).html( "Error requesting page " + settings.url );
});

