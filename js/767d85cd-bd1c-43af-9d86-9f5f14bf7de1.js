// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex767d85cd = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex767d85cd += n;
    if (slideIndex767d85cd == x.length) { slideIndex767d85cd = 0; }
    else if (slideIndex767d85cd < 0) { slideIndex767d85cd = x.length - 1; }
    htShowSlideDivs(x, slideIndex767d85cd);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgCopan0", "images/Copan/CopanAltarGenealogy0.jpg");
    htSetImageSrc("imgCopan1", "images/Copan/CopanAltarGenealogy1.jpg");
    htSetImageSrc("imgCopan2", "images/Copan/CopanAltarGenealogy2.jpg");
    htSetImageSrc("imgCopan3", "images/Copan/CopanAltarGenealogy3.jpg");
    htSetImageSrc("CEast", "images/Copan/CopanStelaC.jpg");
    htSetImageSrc("CWest", "images/Copan/CopanStelaCBeard.jpg");
    htSetImageSrc("imgCopanWholeTextSA", "images/Copan/CopanWholeTextStelaAltar.png");
    htSetImageSrc("Copan", "images/Copan/JuegoDePelotaCopan.jpg");
    htSetImageSrc("imgCopanTemple2", "images/Copan/RosalilaReconstruction.jpg");
    htSetImageSrc("imgCopanStelaA", "images/Copan/StelaACopan.jpg");
    htSetImageSrc("imgCopanTemple", "images/Copan/Temple16Copan.png");
    htSetImageSrc("imgCopanTemple3", "images/Copan/Temple16External.jpg");
    htSetImageSrc("imgCopanTemple2", "images/Copan/Templo16Inside.jpg");
    htPlusDivs(0);

    return false;
}
