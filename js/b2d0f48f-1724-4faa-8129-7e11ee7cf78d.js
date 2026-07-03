// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexb2d0f48f = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexb2d0f48f += n;
    if (slideIndexb2d0f48f == x.length) { slideIndexb2d0f48f = 0; }
    else if (slideIndexb2d0f48f < 0) { slideIndexb2d0f48f = x.length - 1; }
    htShowSlideDivs(x, slideIndexb2d0f48f);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("img9", "images/ResearchGate/Figura-9-Hueso-de-Lebombo.png");
    htPlusDivs(0);

    return false;
}
