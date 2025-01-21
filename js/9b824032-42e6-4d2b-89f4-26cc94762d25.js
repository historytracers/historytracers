// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadExercise() {
    $('table').each(function() {
        if (!$(this).hasClass('book_navigation')) {
            $(this).addClass('three_table_bg');
        }
    });
    htWriteNavigation("first_steps");

    return false;
}

