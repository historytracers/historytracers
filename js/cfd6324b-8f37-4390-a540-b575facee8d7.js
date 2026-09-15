// SPDX-License-Identifier: GPL-3.0-or-later

var universeSlideIndex = 0;
var UNIVERSE_FALLBACK_WIDTH = 5305;
var UNIVERSE_FALLBACK_HEIGHT = 2342;

function htLayoutUniverseFrame(frame) {
    if (!frame) {
        return;
    }

    var clip = frame.getElementsByClassName("htUniverseClip")[0];
    var img = frame.getElementsByClassName("htUniverseImg")[0];

    if (!clip || !img) {
        return;
    }

    var x0 = parseFloat(img.getAttribute("data-x0"));
    var x1 = parseFloat(img.getAttribute("data-x1"));

    if (isNaN(x0) || isNaN(x1) || x1 <= x0) {
        return;
    }

    var span = x1 - x0;
    var frameWidth = frame.clientWidth;
    var frameHeight = frame.clientHeight;

    if (frameWidth <= 0 || frameHeight <= 0) {
        return;
    }

    var naturalWidth = img.naturalWidth > 0 ? img.naturalWidth : UNIVERSE_FALLBACK_WIDTH;
    var naturalHeight = img.naturalHeight > 0 ? img.naturalHeight : UNIVERSE_FALLBACK_HEIGHT;

    var scale = Math.min(frameWidth / span, frameHeight / naturalHeight);
    var drawWidth = naturalWidth * scale;
    var drawHeight = naturalHeight * scale;

    clip.style.width = (span * scale) + "px";
    clip.style.height = drawHeight + "px";

    img.style.width = drawWidth + "px";
    img.style.height = drawHeight + "px";
    img.style.left = (-x0 * scale) + "px";
    img.style.top = "0px";
}

function htShowUniverseSlide(index) {
    var slides = document.getElementsByClassName("htSlide");

    if (slides.length === 0) {
        return;
    }

    if (index < 0) {
        index = 0;
    }
    if (index >= slides.length) {
        index = slides.length - 1;
    }

    universeSlideIndex = index;
    htShowSlideDivs(slides, index);

    var frame = slides[index].getElementsByClassName("htUniverseFrame")[0];
    htLayoutUniverseFrame(frame);
}

function htPlusDivs(n) {
    htShowUniverseSlide(universeSlideIndex + n);
}

function htUniverseRelayout() {
    var slides = document.getElementsByClassName("htSlide");

    if (slides.length === 0 || slides[universeSlideIndex] === undefined) {
        return;
    }

    var frame = slides[universeSlideIndex].getElementsByClassName("htUniverseFrame")[0];
    htLayoutUniverseFrame(frame);
}

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc("imgPlanckFull", "images/ESA/Planck_history_of_Universe.jpg");

    var images = document.getElementsByClassName("htUniverseImg");
    var prefix = htGetImgSrcPrefix();

    for (var i = 0; i < images.length; i++) {
        var image = images[i];

        image.style.position = "absolute";
        image.style.display = "block";
        image.style.maxWidth = "none";
        image.style.maxHeight = "none";

        image.onload = function() {
            var parentFrame = this.parentNode.parentNode;
            var currentSlides = document.getElementsByClassName("htSlide");

            if (currentSlides.length > 0 && currentSlides[universeSlideIndex] === parentFrame.parentNode) {
                htLayoutUniverseFrame(parentFrame);
            }
        };

        image.src = prefix + "images/ESA/Planck_history_of_Universe.jpg";
    }

    var frames = document.getElementsByClassName("htUniverseFrame");
    for (var j = 0; j < frames.length; j++) {
        frames[j].style.position = "relative";
        frames[j].style.overflow = "hidden";
        frames[j].style.display = "flex";
        frames[j].style.alignItems = "center";
        frames[j].style.justifyContent = "center";
        frames[j].style.width = "100%";
        frames[j].style.height = "42vh";
        frames[j].style.backgroundColor = "#000000";
    }

    var clips = document.getElementsByClassName("htUniverseClip");
    for (var k = 0; k < clips.length; k++) {
        clips[k].style.position = "relative";
        clips[k].style.overflow = "hidden";
    }

    htShowUniverseSlide(0);

    window.addEventListener("resize", htUniverseRelayout);

    return false;
}
