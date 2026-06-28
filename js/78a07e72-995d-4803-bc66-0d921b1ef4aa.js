// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex78a07e72 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex78a07e72 += n;
    if (slideIndex78a07e72 == x.length) { slideIndex78a07e72 = 0; }
    else if (slideIndex78a07e72 < 0) { slideIndex78a07e72 = x.length - 1; }
    htShowSlideDivs(x, slideIndex78a07e72);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgMV", "images/PLOS/pone.0141923.g006.png");
    htPlusDivs(0);

    return false;
}
