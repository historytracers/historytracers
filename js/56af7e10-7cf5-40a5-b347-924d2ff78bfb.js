// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex56af7e10 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex56af7e10 += n;
    if (slideIndex56af7e10 == x.length) { slideIndex56af7e10 = 0; }
    else if (slideIndex56af7e10 < 0) { slideIndex56af7e10 = x.length - 1; }
    htShowSlideDivs(x, slideIndex56af7e10);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgCPE", "images/CahalPech/CahalPechExcavation.jpg");
    htSetImageSrc("imgCahalPech0", "images/CahalPech/CahalPechPyramid.jpg");
    htSetImageSrc("img1", "images/CahalPech/ChocolatPot.jpg");
    htPlusDivs(0);

    return false;
}
