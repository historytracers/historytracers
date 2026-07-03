// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    $('table').each(function() {
        if (!$(this).hasClass('book_navigation')) {
            $(this).addClass('three_table_bg');
        }
    });

    htWriteNavigation();



    htSetImageSrc("catsCirusUrraca", "images/HistoryTracers/CatsCirusUrraca.jpg");
    htSetImageSrc("imgDNA", "images/HistoryTracers/DNA.png");
    htSetImageSrc("imgMeter", "images/HistoryTracers/Meter.jpg");
    htSetImageSrc("metate1", "images/SanJoseCRMuseo/SanJoseCRAntropologia.jpg");
    htSetImageSrc("metate2", "images/ElSalvadorMuseo/SanSalvadorESAntropologia.jpg");
    htSetImageSrc("metate3", "images/Teotihuacan/MetateTeotihuacan.jpg");
    return false;
}

