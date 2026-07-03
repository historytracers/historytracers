// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex95dcd656 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex95dcd656 += n;
    if (slideIndex95dcd656 == x.length) { slideIndex95dcd656 = 0; }
    else if (slideIndex95dcd656 < 0) { slideIndex95dcd656 = x.length - 1; }
    htShowSlideDivs(x, slideIndex95dcd656);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgAtlatl", "images/MetropolitanMuseum/1987.394.70.jpeg");
    htSetImageSrc("imgPottery2", "images/MetropolitanMuseum/DP23088.jpg");
    htPlusDivs(0);

    return false;
}
