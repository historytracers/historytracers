// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexf5c298f9 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexf5c298f9 += n;
    if (slideIndexf5c298f9 == x.length) { slideIndexf5c298f9 = 0; }
    else if (slideIndexf5c298f9 < 0) { slideIndexf5c298f9 = x.length - 1; }
    htShowSlideDivs(x, slideIndexf5c298f9);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgd700", "images/MexicoCityMuseo/Cuauhxicalli.jpg");
    htSetImageSrc("imgHs3", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("mamut", "images/MexicoCityMuseo/Mamute.jpg");
    htSetImageSrc("imgOaxaca", "images/MexicoCityMuseo/Oaxaca.jpg");
    htPlusDivs(0);

    return false;
}
