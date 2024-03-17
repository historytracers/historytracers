// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    if ($("#tree-sources-lbl").length > 0) {
        $("#tree-sources-lbl").html(keywords[5]);
    }

    if ($("#tree-references-lbl").length > 0) {
        $("#tree-references-lbl").html(keywords[6]);
    }

    if ($("#tree-holy_references-lbl").length > 0) {
        $("#tree-holy_references-lbl").html(keywords[7]);
    }

    if ($("#tree-descripton").length > 0) {
        $("#tree-descripton").html(keywords[24]);
    }

    htLoadPage('families','json', '', false);
});

