// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    var loadSite = $("#loading").val();
    if (loadSite != undefined && loadSite != null && loadSite.length > 0) {
        htLoadPage(loadSite, 'json', '', false);
    }
    if (typeof htWriteNavigation !== "undefined") {
        htWriteNavigation();
        setTimeout(function(){ if (typeof htWriteNavigation !== "undefined") htWriteNavigation(); }, 500);
        setTimeout(function(){ if (typeof htWriteNavigation !== "undefined") htWriteNavigation(); }, 1500);
    }

});

