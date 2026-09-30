// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexeeb89b04 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexeeb89b04 += n;
    if (slideIndexeeb89b04 == x.length) { slideIndexeeb89b04 = 0; }
    else if (slideIndexeeb89b04 < 0) { slideIndexeeb89b04 = x.length - 1; }
    htShowSlideDivs(x, slideIndexeeb89b04);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgSanJoseCR0", "images/SanJoseCRMuseo/SanJoseCRAntropologia.jpg");
    htSetImageSrc("imgSanJoseCR1", "images/SanJoseCRMuseo/MusicCR.jpg");
    htPlusDivs(0);

    return false;
}
