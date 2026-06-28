// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex8bc82716 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex8bc82716 += n;
    if (slideIndex8bc82716 == x.length) { slideIndex8bc82716 = 0; }
    else if (slideIndex8bc82716 < 0) { slideIndex8bc82716 = x.length - 1; }
    htShowSlideDivs(x, slideIndex8bc82716);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgGuatemalaKaminaljuyu0", "images/GuatemalaKaminaljuyu/Kaminaljuyu.jpg");
    htPlusDivs(0);

    return false;
}
