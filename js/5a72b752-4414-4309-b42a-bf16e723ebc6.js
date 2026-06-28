// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex5a72b752 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex5a72b752 += n;
    if (slideIndex5a72b752 == x.length) { slideIndex5a72b752 = 0; }
    else if (slideIndex5a72b752 < 0) { slideIndex5a72b752 = x.length - 1; }
    htShowSlideDivs(x, slideIndex5a72b752);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgTohoku", "images/Tohoku/MatteoRicci.png");
    htSetImageSrc("imgTohoku", "images/Tohoku/Soroban.png");
    htPlusDivs(0);

    return false;
}
