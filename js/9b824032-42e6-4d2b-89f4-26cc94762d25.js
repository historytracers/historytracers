// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    $('table').each(function() {
        if (!$(this).hasClass('book_navigation')) {
            $(this).addClass('three_table_bg');
        }
    });

    htWriteNavigation();

    return false;
}

