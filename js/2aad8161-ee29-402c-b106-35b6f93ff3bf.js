// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex2aad8161 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex2aad8161 += n;
    if (slideIndex2aad8161 == x.length) { slideIndex2aad8161 = 0; }
    else if (slideIndex2aad8161 < 0) { slideIndex2aad8161 = x.length - 1; }
    htShowSlideDivs(x, slideIndex2aad8161);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgUSGS0", "images/USGS/USGS_WaterCycle_English_ONLINE_20230302.png");
    htSetImageSrc("imgUSG", "images/USGS/USGS_WaterCycle_Spanish_ONLINE_20230302.png");
    htPlusDivs(0);

    return false;
}
