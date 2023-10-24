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
});

// http://api.jquery.com/ajaxerror/
$(document).on( "ajaxError", function( event, request, settings ) {
  $( "#messages" ).html( "Error requesting page " + settings.url );
});

