// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();
    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);

    htSetImageSrc("imgOaxaca", "images/MexicoCityMuseo/Oaxaca.jpg");
    htSetImageSrc("imgBM", "images/BritishMuseum/mid_01381495_001.jpg");

    return false;
}
