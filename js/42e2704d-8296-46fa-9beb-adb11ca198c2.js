// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex42e2704d = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex42e2704d += n;
    if (slideIndex42e2704d == x.length) { slideIndex42e2704d = 0; }
    else if (slideIndex42e2704d < 0) { slideIndex42e2704d = x.length - 1; }
    htShowSlideDivs(x, slideIndex42e2704d);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgMachuPicchu0", "images/MachuPicchu/MachuPicchu.jpg");
    htSetImageSrc("imgMachuPicchu1", "images/MachuPicchu/MachuPicchu2.jpg");
    htSetImageSrc("imgMachuPicchu2", "images/MachuPicchu/MachuPicchu3.jpg");
    htPlusDivs(0);

    return false;
}
