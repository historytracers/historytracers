// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex6487ffc3 = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndex6487ffc3 += n;
    if (slideIndex6487ffc3 == x.length) { slideIndex6487ffc3 = 0; }
    else if (slideIndex6487ffc3 < 0) { slideIndex6487ffc3 = x.length - 1; }
    htShowSlideDivs(x, slideIndex6487ffc3);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgPhoenician", "images/BritishMuseum/437857001.jpg");
    htSetImageSrc("imgBanner", "images/BritishMuseum/mid_00014278_003.jpg");
    htSetImageSrc("imgAtra", "images/BritishMuseum/mid_00032581_001.jpg");
    htSetImageSrc("imgBuda", "images/BritishMuseum/mid_00034168_001.jpg");
    htSetImageSrc("imgBritishMuseum0", "images/BritishMuseum/mid_00034725_001.jpg");
    htSetImageSrc("imgGilgamesh", "images/BritishMuseum/mid_00107404_001.jpg");
    htSetImageSrc("imgMid001", "images/BritishMuseum/mid_00108766_001.jpg");
    htSetImageSrc("imgEgypt", "images/BritishMuseum/mid_00178382_001.jpg");
    htSetImageSrc("imgPottery1", "images/BritishMuseum/mid_00237212_001.jpg");
    htSetImageSrc("imgCylinder", "images/BritishMuseum/mid_00262857_001.jpg");
    htSetImageSrc("imgB", "images/BritishMuseum/mid_00404485_001.jpg");
    htSetImageSrc("imgT1", "images/BritishMuseum/mid_00425090_001.jpg");
    htSetImageSrc("imgAstro", "images/BritishMuseum/mid_00437459_001.jpg");
    htSetImageSrc("imgCoin", "images/BritishMuseum/mid_00809351_001.jpg");
    htSetImageSrc("imgLugalbanda", "images/BritishMuseum/mid_00846714_001.jpg");
    htSetImageSrc("imgMagan", "images/BritishMuseum/mid_00862177_001.jpg");
    htSetImageSrc("imgCD", "images/BritishMuseum/mid_01020674_001.jpg");
    htSetImageSrc("imgGB", "images/BritishMuseum/mid_01289911_001.jpg");
    htSetImageSrc("imgSuanpan", "images/BritishMuseum/mid_01381495_001.jpg");
    htSetImageSrc("imgC1", "images/BritishMuseum/mid_01532055_001.jpg");
    htSetImageSrc("imgBritishMuseum1", "images/BritishMuseum/mid_C_161.jpg");
    htSetImageSrc("imgPottery", "images/BritishMuseum/mid_DSC04993.jpg");
    htSetImageSrc("imgPoint", "images/BritishMuseum/mid_DSC_0597.jpg");
    htSetImageSrc("imgXuanzong", "images/BritishMuseum/mid_JP2105_1.jpg");
    htSetImageSrc("imgChinese", "images/BritishMuseum/mid_RRC5932_14.jpg");
    htSetImageSrc("imgPBM", "images/BritishMuseum/mid_WCT24211.jpg");
    htPlusDivs(0);

    return false;
}
