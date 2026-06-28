// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex6df38bff = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex6df38bff += n;
    if (slideIndex6df38bff == x.length) { slideIndex6df38bff = 0; }
    else if (slideIndex6df38bff < 0) { slideIndex6df38bff = x.length - 1; }
    htShowSlideDivs(x, slideIndex6df38bff);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgLVR", "images/Louvre/0000166561_OG.JPG");
    htSetImageSrc("imgLVR", "images/Louvre/0000226857_OG.JPG");
    htSetImageSrc("imgLVR", "images/Louvre/0001315485_OG.JPG");
    htPlusDivs(0);

    return false;
}
