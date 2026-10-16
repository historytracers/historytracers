// SPDX-License-Identifier: GPL-3.0-or-later

function htChessSelectCulture(el, culture) {
    var cultureName = culture;
    var root = document;
    if (cultureName === undefined) {
        cultureName = el;
    } else if (el && el.closest) {
        root = el.closest(".htChessCultures") || document;
    }

    var buttons = root.getElementsByClassName("htChessCultureBtn");
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute("data-culture") === cultureName) {
            buttons[i].classList.add("active");
        } else {
            buttons[i].classList.remove("active");
        }
    }

    var panels = root.getElementsByClassName("htChessCulturePanel");
    for (var j = 0; j < panels.length; j++) {
        if (panels[j].getAttribute("data-culture") === cultureName) {
            panels[j].classList.add("active");
        } else {
            panels[j].classList.remove("active");
        }
    }
}

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc("imgChess", "images/BritishMuseum/mid_00137035_001.jpg");
    htSetImageSrc("imgChinaChess", "images/BritishMuseum/mid_00269266_001.jpg");
    htSetImageSrc("imgShogi", "images/MetropolitanMuseum/DP119519.jpg");

    return false;
}
