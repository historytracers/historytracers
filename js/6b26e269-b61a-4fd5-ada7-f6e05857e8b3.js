// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex6b26e269 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex6b26e269 += n;
    if (slideIndex6b26e269 == x.length) { slideIndex6b26e269 = 0; }
    else if (slideIndex6b26e269 < 0) { slideIndex6b26e269 = x.length - 1; }
    htShowSlideDivs(x, slideIndex6b26e269);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgFamilyInca", "images/Cuzco/PachacutiCuzco.jpg");
    htPlusDivs(0);

    return false;
}
