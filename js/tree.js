// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    var loadSite = $("#loading").val();
    if (loadSite.length > 0) {
        sgLoadPage(loadSite, 'json', '', false);
    }
});

