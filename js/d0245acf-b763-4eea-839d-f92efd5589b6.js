// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexd0245acf = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndexd0245acf += n;
    if (slideIndexd0245acf == x.length) { slideIndexd0245acf = 0; }
    else if (slideIndexd0245acf < 0) { slideIndexd0245acf = x.length - 1; }
    htShowSlideDivs(x, slideIndexd0245acf);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("cr0", "images/SanJoseCRJade/CRSuportCeramica.jpg");
    htSetImageSrc("imgMayaCRJade", "images/SanJoseCRJade/MayaCRJade.jpg");
    htPlusDivs(0);

    return false;
}
