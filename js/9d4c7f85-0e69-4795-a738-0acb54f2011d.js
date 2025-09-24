// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex9d4c7f85 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex9d4c7f85 += n;
    if (slideIndex9d4c7f85 == x.length) {
        slideIndex9d4c7f85 = 0;
    } else if (slideIndex9d4c7f85 < 0) {
        slideIndex9d4c7f85 = x.length - 1;
    }

    htShowSlideDivs(x, slideIndex9d4c7f85);
}

function htLoadContent() {
    htAddAlterQImages(".htSlides");
    htPlusDivs(0);
    htFillSequenceTable("#sequenceNum", 0, 99);
    htWriteNavigation();

    return false;
}

