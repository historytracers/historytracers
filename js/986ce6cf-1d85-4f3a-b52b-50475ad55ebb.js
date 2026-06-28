// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex986ce6cf = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex986ce6cf += n;
    if (slideIndex986ce6cf == x.length) { slideIndex986ce6cf = 0; }
    else if (slideIndex986ce6cf < 0) { slideIndex986ce6cf = x.length - 1; }
    htShowSlideDivs(x, slideIndex986ce6cf);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgALICE", "images/CERN/2ALICEimages.jpg");
    htPlusDivs(0);

    return false;
}
