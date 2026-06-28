// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex8bea5d94 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex8bea5d94 += n;
    if (slideIndex8bea5d94 == x.length) { slideIndex8bea5d94 = 0; }
    else if (slideIndex8bea5d94 < 0) { slideIndex8bea5d94 = x.length - 1; }
    htShowSlideDivs(x, slideIndex8bea5d94);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgGeo5", "images/Mapswire/continent_af-physical-map-africa-lambert-az-hemi-265_Bantu.jpg");
    htSetImageSrc("imgGeo6", "images/Mapswire/continent_af-physical-map-africa-lambert-az-hemi-265_Great_Zimbawe.jpg");
    htSetImageSrc("imgMapswire0", "images/Mapswire/continent_af-physical-map-africa-lambert-az-hemi-265_mutapa.jpg");
    htSetImageSrc("imgGeo4", "images/Mapswire/continent_af-where-is-africa.png");
    htSetImageSrc("imgMath12", "images/Mapswire/continent_af-where-is-africa_coordinates.png");
    htSetImageSrc("imgGeo3", "images/Mapswire/continent_an-where-is-antarctica.png");
    htSetImageSrc("imgMapswire1", "images/Mapswire/continent_as-physical-map-asia-robinson-267_japan.jpg");
    htSetImageSrc("imgMapswire2", "images/Mapswire/continent_as-physical-map-asia-robinson-267_sui.jpg");
    htSetImageSrc("imgMapswire3", "images/Mapswire/continent_as-physical-map-asia-robinson-267_tang.jpg");
    htSetImageSrc("imgGeo7", "images/Mapswire/continent_as-where-is-asia.png");
    htSetImageSrc("imgGeo15", "images/Mapswire/continent_eu-where-is-europe.png");
    htSetImageSrc("imgMoutains", "images/Mapswire/continent_na-physical-map-north-america-robinson-269.jpg");
    htSetImageSrc("imgGeo12", "images/Mapswire/continent_na-where-is-north-america.png");
    htSetImageSrc("imgGeo19", "images/Mapswire/continent_oc-where-is-australia-oceania.png");
    htSetImageSrc("imgGeo9", "images/Mapswire/continent_sa-where-is-south-america.png");
    htSetImageSrc("imgMWPWEEJ", "images/Mapswire/mapswire-continent_af-physical-map-africa-lambert-az-hemi-265_egypt_001.jpg");
    htSetImageSrc("imgGeo26", "images/Mapswire/mapswire-continent_as-plain-map-asia-robinson-267_Sumer.jpg");
    htSetImageSrc("imgGeo20", "images/Mapswire/mapswire-continent_as-plain-map-asia-robinson-267_geolocation.jpg");
    htSetImageSrc("imgAsia", "images/Mapswire/mapswire-continent_as-printable-map-asia-robinson-267.jpg");
    htSetImageSrc("imgGeo13", "images/Mapswire/mapswire-continent_na-printable-map-north-america-robinson-269_mesoamerica1.jpg");
    htSetImageSrc("imgGeo14", "images/Mapswire/mapswire-continent_na-printable-map-north-america-robinson-269_mesoamerica2.jpg");
    htSetImageSrc("imgGeo11", "images/Mapswire/mapswire-continent_sa-printable-map-south-america-lambert-az-hemi-271_Brazil_States.jpg");
    htSetImageSrc("imgMapswire4", "images/Mapswire/mapswire-continent_sa-printable-map-south-america-lambert-az-hemi-271_San_Vicent.jpg");
    htSetImageSrc("imgGeo10", "images/Mapswire/mapswire-continent_sa-printable-map-south-america-lambert-az-hemi-271_Tawantsuyu.jpg");
    htSetImageSrc("imgGeo17", "images/Mapswire/mapswire-es-plain-map-spain-lcc-118_BanuQasi.jpg");
    htSetImageSrc("imgGeo18", "images/Mapswire/mapswire-es-plain-map-spain-lcc-118_Leon.jpg");
    htSetImageSrc("imgGeo16", "images/Mapswire/mapswire-es-plain-map-spain-lcc-118_Visigoth.jpg");
    htSetImageSrc("imgCMP", "images/Mapswire/mapswire-world-political-white-equal_earth_babylon.png");
    htSetImageSrc("imgCradle", "images/Mapswire/mapswire-world-political-white-equal_earth_cradle.png");
    htSetImageSrc("originmigration", "images/Mapswire/mapswire-world-political-white-equal_earth_journey.png");
    htSetImageSrc("imgMapswire5", "images/Mapswire/mapswire-world-political-white-equal_earth_leme.png");
    htSetImageSrc("imgMapswire6", "images/Mapswire/world-physical-map-graticules-mercator-v1.jpg");
    htSetImageSrc("imgAbyaYala", "images/Mapswire/world-physical-map-graticules-mercator-v1_AbyaYala.jpg");
    htSetImageSrc("imgZhongguo", "images/Mapswire/world-physical-map-graticules-mercator-v1_China.jpg");
    htSetImageSrc("imgPeabiru", "images/Mapswire/world-physical-map-graticules-mercator-v1_Peabiru.jpg");
    htSetImageSrc("imgMapswire7", "images/Mapswire/world-political-white-equal_earth_dias.png");
    htPlusDivs(0);

    return false;
}
