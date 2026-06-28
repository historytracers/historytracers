// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex90f34480 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex90f34480 += n;
    if (slideIndex90f34480 == x.length) { slideIndex90f34480 = 0; }
    else if (slideIndex90f34480 < 0) { slideIndex90f34480 = x.length - 1; }
    htShowSlideDivs(x, slideIndex90f34480);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("miPueblito", "images/MiPueblito/MiPueblito.jpg");
    htPlusDivs(0);

    return false;
}
