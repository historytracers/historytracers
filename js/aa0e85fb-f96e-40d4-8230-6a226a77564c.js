// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexaa0e85fb = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexaa0e85fb += n;
    if (slideIndexaa0e85fb == x.length) { slideIndexaa0e85fb = 0; }
    else if (slideIndexaa0e85fb < 0) { slideIndexaa0e85fb = x.length - 1; }
    htShowSlideDivs(x, slideIndexaa0e85fb);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgBering", "images/ElSalvadorMuseo/Bering.jpg");
    htSetImageSrc("img1", "images/ElSalvadorMuseo/SanSalvadorESAntropologia.jpg");
    htPlusDivs(0);

    return false;
}
