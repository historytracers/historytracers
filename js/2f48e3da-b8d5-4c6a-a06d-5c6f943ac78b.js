// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex2f48e3da = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex2f48e3da += n;
    if (slideIndex2f48e3da == x.length) { slideIndex2f48e3da = 0; }
    else if (slideIndex2f48e3da < 0) { slideIndex2f48e3da = x.length - 1; }
    htShowSlideDivs(x, slideIndex2f48e3da);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgShona", "images/UniversityJohannesburg/ShonaJohannnesburg.jpg");
    htPlusDivs(0);

    return false;
}
