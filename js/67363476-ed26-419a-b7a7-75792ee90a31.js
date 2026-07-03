// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex67363476 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex67363476 += n;
    if (slideIndex67363476 == x.length) { slideIndex67363476 = 0; }
    else if (slideIndex67363476 < 0) { slideIndex67363476 = x.length - 1; }
    htShowSlideDivs(x, slideIndex67363476);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgNature", "images/Nature/41598_2019_48093_Fig3_HTML.webp");
    htPlusDivs(0);

    return false;
}
