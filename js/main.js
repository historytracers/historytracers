// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    var divRadius = parseInt($(".htCircle[name='fig1']").width());

    $(".htCircle").mouseenter(function(){
        var name = $(this).attr('name');;
        if (name == "fig1") {
            $(this).animate({ width: 4*divRadius, height: 4*divRadius }, 'slow');
        } else {
            $(this).animate({ width: divRadius, height: divRadius }, 'slow');
        }
    }).mouseleave(function(){
        var name = $(this).attr('name');;
        if (name == "fig1") {
            $(this).animate({ width: divRadius, height: divRadius }, 'slow');
        } else {
            $(this).animate({ width: 4*divRadius, height: 4*divRadius }, 'slow');
        }
    });
}
