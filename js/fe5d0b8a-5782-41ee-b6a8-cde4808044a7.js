// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexfe5d0b8a = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");

    slideIndexfe5d0b8a += n;
    if (slideIndexfe5d0b8a == x.length) { slideIndexfe5d0b8a = 0; }
    else if (slideIndexfe5d0b8a < 0) { slideIndexfe5d0b8a = x.length - 1; }
    htShowSlideDivs(x, slideIndexfe5d0b8a);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("ArmsMaertin", "images/ANTT/ANTTPT-TT-CR-D-A-1-19_m0235.jpg");
    htSetImageSrc("ArmsAntonio", "images/ANTT/ANTTPT-TT-CR-D-A-1-19_m0236.jpg");
    htSetImageSrc("PDPFamilyTree", "images/ANTT/ANTT_PT-TT-TSO-CG-A-008-001-23165_m0062_derivada.jpg");
    htSetImageSrc("imgANTTINCOMPLETE", "images/ANTT/PT-TT-MCO-A-C-002-007-0006-00066_m0001_derivada.jpg");
    htSetImageSrc("RP", "images/ANTT/RomanusPontifex.jpg");
    $("#ANTTPortugal1").html(keywords[89]);
    $("#ANTTPortugal2").html(keywords[89]);
    $("#ANTTPortugal3").html(keywords[89]);
    htPlusDivs(0);

    return false;
}
