// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();
    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);
    $("#OriginHTMW").html(keywords[82]);

    htSetImageSrc("ChronologyCaralPyramid", "images/Caral/CaralPiramideH1.jpg");
    htSetImageSrc("ChronologyTeotihuacan", "images/Teotihuacan/TeotihuacanGeneral.jpg");

    return false;
}
