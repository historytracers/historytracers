// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexfdb0a7ff = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexfdb0a7ff += n;
    if (slideIndexfdb0a7ff == x.length) { slideIndexfdb0a7ff = 0; }
    else if (slideIndexfdb0a7ff < 0) { slideIndexfdb0a7ff = x.length - 1; }
    htShowSlideDivs(x, slideIndexfdb0a7ff);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgEA", "images/Ashmolean/10015.jpg");
    htSetImageSrc("imgHarappaW", "images/Ashmolean/28932.jpg");
    htSetImageSrc("imgS", "images/Ashmolean/47565.jpg");
    htSetImageSrc("imgKL", "images/Ashmolean/KingList.jpg");
    htPlusDivs(0);

    return false;
}
