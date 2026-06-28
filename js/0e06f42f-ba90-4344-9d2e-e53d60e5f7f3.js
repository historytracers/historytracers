// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex0e06f42f = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    slideIndex0e06f42f += n;
    if (slideIndex0e06f42f == x.length) { slideIndex0e06f42f = 0; }
    else if (slideIndex0e06f42f < 0) { slideIndex0e06f42f = x.length - 1; }
    htShowSlideDivs(x, slideIndex0e06f42f);
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("imgHistoryTracers0", "images/HistoryTracers/0LeftFoot.png");
    htSetImageSrc("leftHandImg", "images/HistoryTracers/0Left_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers1", "images/HistoryTracers/0RightFoot.png");
    htSetImageSrc("rightHandImg", "images/HistoryTracers/0Right_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers2", "images/HistoryTracers/1LeftFoot.png");
    htSetImageSrc("leftHandImg5", "images/HistoryTracers/1Left_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers3", "images/HistoryTracers/1RightFoot.png");
    htSetImageSrc("rightHandImg5", "images/HistoryTracers/1Right_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers4", "images/HistoryTracers/2LeftFoot.png");
    htSetImageSrc("leftHandImg4", "images/HistoryTracers/2Left_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers5", "images/HistoryTracers/2RightFoot.png");
    htSetImageSrc("rightHandImg1", "images/HistoryTracers/2Right_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers6", "images/HistoryTracers/2daxis.jpg");
    htSetImageSrc("imgHistoryTracers7", "images/HistoryTracers/3LeftFoot.png");
    htSetImageSrc("leftHandImg2", "images/HistoryTracers/3Left_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers8", "images/HistoryTracers/3RightFoot.png");
    htSetImageSrc("rightHandImg2", "images/HistoryTracers/3Right_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers9", "images/HistoryTracers/4LeftFoot.png");
    htSetImageSrc("img22", "images/HistoryTracers/4Left_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers10", "images/HistoryTracers/4RightFoot.png");
    htSetImageSrc("img13", "images/HistoryTracers/4Right_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers11", "images/HistoryTracers/5LeftFoot.png");
    htSetImageSrc("img5", "images/HistoryTracers/5Left_Hand_Small.png");
    htSetImageSrc("imgHistoryTracers12", "images/HistoryTracers/5RightFoot.png");
    htSetImageSrc("img6", "images/HistoryTracers/5Right_Hand_Small.png");
    htSetImageSrc("imgAndesQuipu", "images/HistoryTracers/Andes_Quipu.png");
    htSetImageSrc("imgAB", "images/HistoryTracers/Atom_Bohr.png");
    htSetImageSrc("imgAP", "images/HistoryTracers/Atom_Philosophical.png");
    htSetImageSrc("imgAQ", "images/HistoryTracers/Atom_Quantum.png");
    htSetImageSrc("dogFadinha", "images/HistoryTracers/CadelaOwner.jpg");
    htSetImageSrc("catsCirusUrraca", "images/HistoryTracers/CatsCirusUrraca.jpg");
    htSetImageSrc("imgDNA", "images/HistoryTracers/DNA.png");
    htSetImageSrc("imgE", "images/HistoryTracers/Enmebaragesi.png");
    htSetImageSrc("imgHistoryTracers13", "images/HistoryTracers/Facebook.png");
    htSetImageSrc("imgHHB", "images/HistoryTracers/HTHumanBody.jpg");
    htSetImageSrc("img3", "images/HistoryTracers/Hand_Finger.png");
    htSetImageSrc("img1", "images/HistoryTracers/Hand_Grape.jpg");
    htSetImageSrc("imgHistoryTracers14", "images/HistoryTracers/LeftFoot.png");
    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("imgme12", "images/HistoryTracers/Maya_0.png");
    htSetImageSrc("imgme13", "images/HistoryTracers/Maya_1.png");
    htSetImageSrc("imgme6", "images/HistoryTracers/Maya_10.png");
    htSetImageSrc("imgHistoryTracers15", "images/HistoryTracers/Maya_11.png");
    htSetImageSrc("imgm12", "images/HistoryTracers/Maya_12.png");
    htSetImageSrc("imgHistoryTracers16", "images/HistoryTracers/Maya_13.png");
    htSetImageSrc("imgmr110", "images/HistoryTracers/Maya_14.png");
    htSetImageSrc("imgHistoryTracers17", "images/HistoryTracers/Maya_15.png");
    htSetImageSrc("imgHistoryTracers18", "images/HistoryTracers/Maya_16.png");
    htSetImageSrc("imgme160", "images/HistoryTracers/Maya_17.png");
    htSetImageSrc("imgme1600", "images/HistoryTracers/Maya_18.png");
    htSetImageSrc("imgme17", "images/HistoryTracers/Maya_19.png");
    htSetImageSrc("imgmr2", "images/HistoryTracers/Maya_2.png");
    htSetImageSrc("imgHistoryTracers19", "images/HistoryTracers/Maya_20.png");
    htSetImageSrc("imgm3", "images/HistoryTracers/Maya_3.png");
    htSetImageSrc("imgm4", "images/HistoryTracers/Maya_4.png");
    htSetImageSrc("imgme180", "images/HistoryTracers/Maya_5.png");
    htSetImageSrc("imgme1800", "images/HistoryTracers/Maya_6.png");
    htSetImageSrc("imgHistoryTracers20", "images/HistoryTracers/Maya_7.png");
    htSetImageSrc("imgme1700", "images/HistoryTracers/Maya_8.png");
    htSetImageSrc("imgHistoryTracers21", "images/HistoryTracers/Maya_9.png");
    htSetImageSrc("imgMeter", "images/HistoryTracers/Meter.jpg");
    htSetImageSrc("imgMMF", "images/HistoryTracers/MusaMusaFortun.png");
    htSetImageSrc("imgHistoryTracers22", "images/HistoryTracers/Phylogeny.png");
    htSetImageSrc("imgPlanetSpaceTime", "images/HistoryTracers/Planet_Space_Time.png");
    htSetImageSrc("img2", "images/HistoryTracers/RHand_Grape.jpg");
    htSetImageSrc("imgRNA", "images/HistoryTracers/RNA.png");
    htSetImageSrc("imgHistoryTracers23", "images/HistoryTracers/RightFoot.png");
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png");
    htSetImageSrc("imgRule", "images/HistoryTracers/RuleQuipu.jpg");
    htSetImageSrc("c0", "images/HistoryTracers/TortillaFinal1.png");
    htSetImageSrc("c1", "images/HistoryTracers/TortillaFinal2.png");
    htSetImageSrc("imgHistoryTracers24", "images/HistoryTracers/White.png");
    htSetImageSrc("imgGeo23", "images/HistoryTracers/conesphere.jpg");
    htSetImageSrc("imgGrape", "images/HistoryTracers/grape.jpg");
    htSetImageSrc("img3", "images/HistoryTracers/pentagonal_pyramid.jpg");
    htSetImageSrc("img2", "images/HistoryTracers/pyramid.jpg");
    htSetImageSrc("imgHistoryTracers25", "images/HistoryTracers/qrcodePix.png");
    htPlusDivs(0);

    return false;
}
