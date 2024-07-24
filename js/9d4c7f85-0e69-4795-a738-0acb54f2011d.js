// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndex9d4c7f85 = 0;

function htShowDivs(n) {
  var x = document.getElementsByClassName("htSlide");
  if (n == x.length) {
      slideIndex9d4c7f85 = 0;
  } else if (n < 0) {
      slideIndex9d4c7f85 = x.length - 1;
  }

  for (let i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  x[slideIndex9d4c7f85].style.display = "block";
}

function htPlusDivs(n) {
  htShowDivs(slideIndex9d4c7f85 += n);
}

function htAddAlterQImages(id)
{
    var kingOrder = [ "<i>Popol Hol</i> (2), <i>Yax K'uk' Mo'</i> (1),<br /> <i>Yax Pasaj Chan Yopaat</i> (16), <i>K'ahk' Yipyaj Chan K'awiil</i> (15)", "? (6), ? (5),<br /> <i>K'altuun Hix</i> (4), ? (3)", "<i>Moon Jaguar</i> (10), ? (9),<br /> <i>Wi' Yohl K'inich</i> (8), <i>Bahlam Nehn</i> (7)", "- <i>K'ahk' Joplaj Chan K'awiil</i> (14), <i>Waxaklajuun Ubaah K'awiil</i> (13),<br /> <i>K'ahk' Uti' Witz K'awiil</i> (12), <i>Butz' Chan</i> (11)"  ];
    $(id).html("");
    for (let i = 0; i < 4; i++) {
        $(id).append("<div class=\"htSlide\"> <div class=\"htSlideCounter\">"+(i + 1)+" / 4</div> <img class=\"imgGameSize\" src=\"images/CopanAltarGenealogy"+i+".jpg\"><div class=\"htSlideCaption\">"+kingOrder[i]+"</div></div>");
    }
    $(id).append("<i class=\"fa-solid fa-chevron-left htSlidePrev\" onclick=\"htPlusDivs(-1);\"></i> <i class=\"fa-solid fa-chevron-right htSlideNext\" onclick=\"htPlusDivs(1);\"></i>");
    htShowDivs(slideIndex9d4c7f85);
}

function htLoadExercise() {
    htAddAlterQImages(".htSlides");
    htFillSequenceTable("#sequenceNum", 0, 99);

    return false;
}

