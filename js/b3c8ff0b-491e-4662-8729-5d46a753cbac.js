// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexb3c8ff0b = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndexb3c8ff0b += n;
    if (slideIndexb3c8ff0b == x.length) { slideIndexb3c8ff0b = 0; }
    else if (slideIndexb3c8ff0b < 0) { slideIndexb3c8ff0b = x.length - 1; }
    htShowSlideDivs(x, slideIndexb3c8ff0b);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgCaracol0", "images/Caracol/CaracolWitz.jpg");
    htPlusDivs(0);

    return false;
}
