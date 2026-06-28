// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex3ff47bc4 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex3ff47bc4 += n;
    if (slideIndex3ff47bc4 == x.length) { slideIndex3ff47bc4 = 0; }
    else if (slideIndex3ff47bc4 < 0) { slideIndex3ff47bc4 = x.length - 1; }
    htShowSlideDivs(x, slideIndex3ff47bc4);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgEstela", "images/GuatemalaAntropologia/EstelaAntropologiaGuatemala.jpg");
    htPlusDivs(0);

    return false;
}
