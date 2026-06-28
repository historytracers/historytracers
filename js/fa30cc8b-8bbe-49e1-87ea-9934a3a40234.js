// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexfa30cc8b = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexfa30cc8b += n;
    if (slideIndexfa30cc8b == x.length) { slideIndexfa30cc8b = 0; }
    else if (slideIndexfa30cc8b < 0) { slideIndexfa30cc8b = x.length - 1; }
    htShowSlideDivs(x, slideIndexfa30cc8b);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("metate3", "images/Teotihuacan/MetateTeotihuacan.jpg");
    htSetImageSrc("ChronologyTeotihuacan", "images/Teotihuacan/TeotihuacanGeneral.jpg");
    htSetImageSrc("ChronologyTeotihuacan2", "images/Teotihuacan/TeotihuacanMountains.jpg");
    htPlusDivs(0);

    return false;
}
