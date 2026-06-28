// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexdf13cec3 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexdf13cec3 += n;
    if (slideIndexdf13cec3 == x.length) { slideIndexdf13cec3 = 0; }
    else if (slideIndexdf13cec3 < 0) { slideIndexdf13cec3 = x.length - 1; }
    htShowSlideDivs(x, slideIndexdf13cec3);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("img4", "images/Tula/CiudadTula.jpg");
    htSetImageSrc("img3", "images/Tula/TulaColumna.jpg");
    htPlusDivs(0);

    return false;
}
