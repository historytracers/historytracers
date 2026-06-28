// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex104aa305 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex104aa305 += n;
    if (slideIndex104aa305 == x.length) { slideIndex104aa305 = 0; }
    else if (slideIndex104aa305 < 0) { slideIndex104aa305 = x.length - 1; }
    htShowSlideDivs(x, slideIndex104aa305);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgSCP", "images/SanAndres/SanAndresCoveredPyramid.jpg");
    htSetImageSrc("imgSanAndres0", "images/SanAndres/SanAndresPyramid.jpg");
    htPlusDivs(0);

    return false;
}
