// SPDX-License-Identifier: GPL-3.0-or-later

var slideIndexaeGFS = 0;

function htPlusDivs(n) {
    var x = document.getElementsByClassName("htSlide");
    if (!x) {
        return;
    }

    slideIndexaeGFS += n;
    if (slideIndexaeGFS == x.length) {
        slideIndexaeGFS = 0;
    } else if (slideIndexaeGFS < 0) {
        slideIndexaeGFS = x.length - 1;
    }

    htShowSlideDivs(x, slideIndexaeGFS);
}

function htLoadExercise() {
    htAddTreeReflection("#myFirstReflection", 55);

    htAddAlterQImages(".htSlides");
    htPlusDivs(0);

    return false;
}

