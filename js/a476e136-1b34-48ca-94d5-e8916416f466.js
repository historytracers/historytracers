// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexa476e136 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndexa476e136 += n;
    if (slideIndexa476e136 == x.length) { slideIndexa476e136 = 0; }
    else if (slideIndexa476e136 < 0) { slideIndexa476e136 = x.length - 1; }
    htShowSlideDivs(x, slideIndexa476e136);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgCreativeCommons0", "images/CreativeCommons/by.svg");
    htSetImageSrc("imgCreativeCommons1", "images/CreativeCommons/cc.svg");
    htSetImageSrc("imgCreativeCommons2", "images/CreativeCommons/nc.svg");
    htPlusDivs(0);

    return false;
}
