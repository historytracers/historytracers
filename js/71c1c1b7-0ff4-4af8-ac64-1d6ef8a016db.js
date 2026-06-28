// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex71c1c1b7 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex71c1c1b7 += n;
    if (slideIndex71c1c1b7 == x.length) { slideIndex71c1c1b7 = 0; }
    else if (slideIndex71c1c1b7 < 0) { slideIndex71c1c1b7 = x.length - 1; }
    htShowSlideDivs(x, slideIndex71c1c1b7);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("bndPortugal6r", "images/BibliotecaNacionalDigital/BNDTordesillas_6r.jpg");
    htPlusDivs(0);

    return false;
}
