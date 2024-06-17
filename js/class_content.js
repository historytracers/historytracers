// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    var loadSite = $("#loading").val();
    if (loadSite != undefined && loadSite != null && loadSite.length > 0) {
        htLoadPage(loadSite, 'json', '', false);
    }

    if ($("#prevText").length > 0) {  $("#prevText").html(keywords[56]); }

    if ($("#topText").length > 0) {  $("#topText").html(keywords[57]);  }

    if ($("#nextText").length > 0) { $("#nextText").html(keywords[58]);  }
});

