// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexea34a7b6 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexea34a7b6 += n;
    if (slideIndexea34a7b6 == x.length) { slideIndexea34a7b6 = 0; }
    else if (slideIndexea34a7b6 < 0) { slideIndexea34a7b6 = x.length - 1; }
    htShowSlideDivs(x, slideIndexea34a7b6);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgBRES140", "images/Archive/BRes140146_0206.jpg");
    htSetImageSrc("imgLL", "images/Archive/LucreciaLeme.png");
    htSetImageSrc("imgPD", "images/Archive/PedroDias.png");
    htSetImageSrc("Experiment", "images/Archive/The_Optics_of_Ibn_al-Haytham_22.jpg");
    htPlusDivs(0);

    return false;
}
