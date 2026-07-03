// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex5f00f45c = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex5f00f45c += n;
    if (slideIndex5f00f45c == x.length) { slideIndex5f00f45c = 0; }
    else if (slideIndex5f00f45c < 0) { slideIndex5f00f45c = x.length - 1; }
    htShowSlideDivs(x, slideIndex5f00f45c);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("JC", "images/JoyaCeren/JoyaCeren.jpg");
    htSetImageSrc("JC", "images/JoyaCeren/JoyaCerenCocina.jpg");
    htPlusDivs(0);

    return false;
}
