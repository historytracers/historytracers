// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex0a9faf6b = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex0a9faf6b += n;
    if (slideIndex0a9faf6b == x.length) { slideIndex0a9faf6b = 0; }
    else if (slideIndex0a9faf6b < 0) { slideIndex0a9faf6b = x.length - 1; }
    htShowSlideDivs(x, slideIndex0a9faf6b);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("gc", "images/Tikal/GranJaguar.jpg");
    htSetImageSrc("imgTikal0", "images/Tikal/NecropoleTikal.jpg");
    htSetImageSrc("gc", "images/Tikal/TikalReservorio.jpg");
    htPlusDivs(0);

    return false;
}
