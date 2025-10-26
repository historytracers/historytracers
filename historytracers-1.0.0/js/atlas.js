// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    htLoadPage('atlas','json', '', false);
});

function htLoadContent() {
    var divRadius = parseInt($(".htCircle[name='fig2']").width());

    $(".htCircle").mouseenter(function(){
        $(this).animate({ width: divRadius/4, height: divRadius/4 }, 'slow');
    }).mouseleave(function(){
        $(this).animate({ width: divRadius, height: divRadius }, 'slow');
    });

    return false;
}
