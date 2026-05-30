// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();
    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);
    $("#OriginHTMW").html(keywords[82]);

    htSetImageSrc("ChronologyCaralPyramid", "images/Caral/CaralPiramideH1.jpg");
    htSetImageSrc("ChronologyTeotihuacan", "images/Teotihuacan/TeotihuacanGeneral.jpg");

    htSetImageSrc("imgTohoku", "images/Tohoku/MatteoRicci.png");
    htSetImageSrc("imgAbyaYala", "images/Mapswire/world-physical-map-graticules-mercator-v1_AbyaYala.jpg");
    htSetImageSrc("imgZhongguo", "images/Mapswire/world-physical-map-graticules-mercator-v1_China.jpg");
    htSetImageSrc("originmigration", "images/Mapswire/mapswire-world-political-white-equal_earth_journey.png");
    return false;
}
