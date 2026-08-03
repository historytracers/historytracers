// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex9b10b3ad = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex9b10b3ad += n;
    if (slideIndex9b10b3ad == x.length) { slideIndex9b10b3ad = 0; }
    else if (slideIndex9b10b3ad < 0) { slideIndex9b10b3ad = x.length - 1; }
    htShowSlideDivs(x, slideIndex9b10b3ad);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("z0", "images/Sadomba/Gourd.png");
    htSetImageSrc("imgShona1", "images/Sadomba/ShonaHut.png");
    htPlusDivs(0);

    return false;
}
