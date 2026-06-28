// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex57091b10 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex57091b10 += n;
    if (slideIndex57091b10 == x.length) { slideIndex57091b10 = 0; }
    else if (slideIndex57091b10 < 0) { slideIndex57091b10 = x.length - 1; }
    htShowSlideDivs(x, slideIndex57091b10);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgESA2", "images/ESA/Planck_history_of_Universe.jpg");
    htSetImageSrc("imgESA1", "images/ESA/Planck_s_view_of_the_cosmic_microwave_background.jpg");
    htSetImageSrc("imgUniverseTimeBigBang", "images/ESA/The_Universe_across_space_and_time.jpg");
    htSetImageSrc("imgWebbDisc", "images/ESA/Webb_s_view_of_planet-forming_disc_IRAS_04302_2247.jpg");
    htSetImageSrc("imgGaiaStarFormation", "images/ESA/Zoom_into_Gaia_s_star-formation_map_highlighted.jpg");
    htPlusDivs(0);

    return false;
}
