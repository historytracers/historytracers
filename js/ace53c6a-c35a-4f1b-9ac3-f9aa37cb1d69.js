// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexace53c6a = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexace53c6a += n;
    if (slideIndexace53c6a == x.length) { slideIndexace53c6a = 0; }
    else if (slideIndexace53c6a < 0) { slideIndexace53c6a = x.length - 1; }
    htShowSlideDivs(x, slideIndexace53c6a);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("img4", "images/AntopologyPeru/CeramicaAntropologiaPeru.jpg");
    htPlusDivs(0);

    return false;
}
