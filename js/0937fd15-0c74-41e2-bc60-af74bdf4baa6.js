// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex0937fd15 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex0937fd15 += n;
    if (slideIndex0937fd15 == x.length) { slideIndex0937fd15 = 0; }
    else if (slideIndex0937fd15 < 0) { slideIndex0937fd15 = x.length - 1; }
    htShowSlideDivs(x, slideIndex0937fd15);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgChimp", "images/TaiChimpanzeeProject/c4b711_0ebd581742a8483e90a28c521cadd3cb~mv2.jpeg");
    htPlusDivs(0);

    return false;
}
