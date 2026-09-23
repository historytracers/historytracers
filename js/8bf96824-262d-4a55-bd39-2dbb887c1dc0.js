// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();

    for (let i = 1 ; i< 10; i++) {
        $('#repeatNumbers').append($('<option>', {
            value: i,
            text: i
        }));
    }

    $('#repeatNumbers').on('change', function() {
        htSorobanResetSoroban();
    });

    return false;
}
