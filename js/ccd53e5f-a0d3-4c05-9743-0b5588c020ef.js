// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexccd53e5f = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexccd53e5f += n;
    if (slideIndexccd53e5f == x.length) { slideIndexccd53e5f = 0; }
    else if (slideIndexccd53e5f < 0) { slideIndexccd53e5f = x.length - 1; }
    htShowSlideDivs(x, slideIndexccd53e5f);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgHer", "images/DonsMaps/1590b.jpg");
    htSetImageSrc("imgHer", "images/DonsMaps/1594.jpg");
    htSetImageSrc("imgFlore", "images/DonsMaps/dsc03345flores.jpg");
    htSetImageSrc("imgDon", "images/DonsMaps/img_6463willendorf.jpg");
    htSetImageSrc("imgHr0", "images/DonsMaps/img_6647rudolfensis.jpg");
    htSetImageSrc("imgHabilis", "images/DonsMaps/img_6652habilissm.jpg");
    htSetImageSrc("imgPb", "images/DonsMaps/img_6709boisei406.jpg");
    htSetImageSrc("imgHe", "images/DonsMaps/img_6776erectusdmanisi.jpg");
    htSetImageSrc("imgNean", "images/DonsMaps/img_6801ferrassie.jpg");
    htPlusDivs(0);

    return false;
}
