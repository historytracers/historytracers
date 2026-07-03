// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex49e96a41 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex49e96a41 += n;
    if (slideIndex49e96a41 == x.length) { slideIndex49e96a41 = 0; }
    else if (slideIndex49e96a41 < 0) { slideIndex49e96a41 = x.length - 1; }
    htShowSlideDivs(x, slideIndex49e96a41);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgLAMSE", "images/UNESCO/Lanse.jpg");
    htSetImageSrc("imgUNESCO", "images/UNESCO/site_0310_0001-1000-1000-20090924132936.jpg");
    htSetImageSrc("imgWALL", "images/UNESCO/site_0364_0028-1000-750-20250313170037.jpg");
    htSetImageSrc("imgCW", "images/UNESCO/site_0438_0002.jpg");
    htSetImageSrc("imgBI", "images/UNESCO/site_1222_0004-1000-650-20110920204338.jpg");
    htPlusDivs(0);

    return false;
}
