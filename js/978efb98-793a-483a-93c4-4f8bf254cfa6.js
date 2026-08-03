// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex978efb98 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex978efb98 += n;
    if (slideIndex978efb98 == x.length) { slideIndex978efb98 = 0; }
    else if (slideIndex978efb98 < 0) { slideIndex978efb98 = x.length - 1; }
    htShowSlideDivs(x, slideIndex978efb98);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("ChronologyCaralPyramid", "images/Caral/CaralPiramideH1.jpg");
    htSetImageSrc("img0", "images/Caral/MusicCaral.jpg");
    htSetImageSrc("imgQuipuPanel", "images/Caral/QuipuPanel.png");
    htPlusDivs(0);

    return false;
}
