// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexe862d966 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndexe862d966 += n;
    if (slideIndexe862d966 == x.length) { slideIndexe862d966 = 0; }
    else if (slideIndexe862d966 < 0) { slideIndexe862d966 = x.length - 1; }
    htShowSlideDivs(x, slideIndexe862d966);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgScience", "images/Science/aat4505-f6.jpeg");
    htPlusDivs(0);

    return false;
}
