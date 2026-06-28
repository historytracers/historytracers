// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex7dee7d74 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex7dee7d74 += n;
    if (slideIndex7dee7d74 == x.length) { slideIndex7dee7d74 = 0; }
    else if (slideIndex7dee7d74 < 0) { slideIndex7dee7d74 = x.length - 1; }
    htShowSlideDivs(x, slideIndex7dee7d74);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgAthens", "images/Athens/Erechtheion.jpg");
    htSetImageSrc("img5", "images/Athens/ParthenonColumns.jpg");
    htSetImageSrc("img0", "images/Athens/PrisionSocrates.jpg");
    htPlusDivs(0);

    return false;
}
