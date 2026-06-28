// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexa65ba26f = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndexa65ba26f += n;
    if (slideIndexa65ba26f == x.length) { slideIndexa65ba26f = 0; }
    else if (slideIndexa65ba26f < 0) { slideIndexa65ba26f = x.length - 1; }
    htShowSlideDivs(x, slideIndexa65ba26f);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("img4", "images/Xunantunich/WitzXunantunich.jpg");
    htPlusDivs(0);

    return false;
}
