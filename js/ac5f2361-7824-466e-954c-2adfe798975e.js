// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexac5f2361 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexac5f2361 += n;
    if (slideIndexac5f2361 == x.length) { slideIndexac5f2361 = 0; }
    else if (slideIndexac5f2361 < 0) { slideIndexac5f2361 = x.length - 1; }
    htShowSlideDivs(x, slideIndexac5f2361);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgBingZhao0", "images/BingZhao/img-24.jpg");
    htSetImageSrc("imgBZ0", "images/BingZhao/img-5.jpg");
    htPlusDivs(0);

    return false;
}
