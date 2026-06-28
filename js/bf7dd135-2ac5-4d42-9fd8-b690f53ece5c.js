// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexbf7dd135 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexbf7dd135 += n;
    if (slideIndexbf7dd135 == x.length) { slideIndexbf7dd135 = 0; }
    else if (slideIndexbf7dd135 < 0) { slideIndexbf7dd135 = x.length - 1; }
    htShowSlideDivs(x, slideIndexbf7dd135);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgHNaledi", "images/eLife/elife-09560-fig1-v1.jpg");
    htPlusDivs(0);

    return false;
}
