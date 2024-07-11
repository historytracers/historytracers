// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    var loadSite = $("#loading").val();
    if (loadSite != undefined && loadSite != null && loadSite.length > 0) {
        htLoadPage(loadSite, 'json', '', false);
    }

});

