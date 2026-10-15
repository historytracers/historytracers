// SPDX-License-Identifier: GPL-3.0-or-later

function htChessSelectCulture(culture) {
    var buttons = document.getElementsByClassName("htChessCultureBtn");
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute("data-culture") === culture) {
            buttons[i].classList.add("active");
        } else {
            buttons[i].classList.remove("active");
        }
    }

    var panels = document.getElementsByClassName("htChessCulturePanel");
    for (var j = 0; j < panels.length; j++) {
        if (panels[j].getAttribute("data-culture") === culture) {
            panels[j].classList.add("active");
        } else {
            panels[j].classList.remove("active");
        }
    }
}

function htLoadContent() {
    htWriteNavigation();

		htSetImageSrc("imgChess", "images/BritishMuseum/mid_00269266_001.jpg");

    return false;
}
