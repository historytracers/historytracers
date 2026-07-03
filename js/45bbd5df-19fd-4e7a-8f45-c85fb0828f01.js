// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex45bbd5df = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex45bbd5df += n;
    if (slideIndex45bbd5df == x.length) { slideIndex45bbd5df = 0; }
    else if (slideIndex45bbd5df < 0) { slideIndex45bbd5df = x.length - 1; }
    htShowSlideDivs(x, slideIndex45bbd5df);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgPeruPucllana0", "images/PeruPucllana/Huaca.jpg");
    htPlusDivs(0);

    return false;
}
