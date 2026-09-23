// SPDX-License-Identifier: GPL-3.0-or-later

var universeSlideIndex = 0;
var UNIVERSE_FALLBACK_WIDTH = 5305;
var UNIVERSE_FALLBACK_HEIGHT = 2342;
var UNIVERSE_MAX_LAYOUT_ATTEMPTS = 40;
var htUniverseLayoutAttempts = 0;
var htUniverseLayoutTimer = 0;
var htUniverseResizeObserver = null;

function htLayoutUniverseFrame(frame) {
    if (!frame) {
        return false;
    }

    var clip = frame.getElementsByClassName("htUniverseClip")[0];
    var img = frame.getElementsByClassName("htUniverseImg")[0];

    if (!clip || !img) {
        return false;
    }

    var x0 = parseFloat(img.getAttribute("data-x0"));
    var x1 = parseFloat(img.getAttribute("data-x1"));

    if (isNaN(x0) || isNaN(x1) || x1 <= x0) {
        return false;
    }

    var span = x1 - x0;
    var frameWidth = frame.clientWidth;
    var frameHeight = frame.clientHeight;

    if (frameWidth <= 0 || frameHeight <= 0) {
        return false;
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

    return true;
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

    htUniverseLayoutAttempts = 0;
    if (htUniverseLayoutTimer !== 0) {
        window.clearTimeout(htUniverseLayoutTimer);
        htUniverseLayoutTimer = 0;
    }
    htUniverseRelayout();
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

    if (!htLayoutUniverseFrame(frame)) {
        // Chromium may report a zero-sized frame when the slide is shown before
        // the page (or viewer window) has completed its first layout. Keep
        // trying for a short while so the visible slide is scaled correctly
        // instead of silently keeping an unlaid-out image.
        htScheduleUniverseRelayout();
    }
}

function htScheduleUniverseRelayout() {
    if (htUniverseLayoutTimer !== 0 || htUniverseLayoutAttempts >= UNIVERSE_MAX_LAYOUT_ATTEMPTS) {
        return;
    }

    htUniverseLayoutAttempts++;
    htUniverseLayoutTimer = window.setTimeout(function() {
        htUniverseLayoutTimer = 0;
        htUniverseRelayout();
    }, 50);
}

function htObserveUniverseFrames() {
    if (typeof ResizeObserver === "undefined") {
        return;
    }

    htUniverseResizeObserver = new ResizeObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
            htLayoutUniverseFrame(entries[i].target);
        }
    });

    var frames = document.getElementsByClassName("htUniverseFrame");
    for (var j = 0; j < frames.length; j++) {
        htUniverseResizeObserver.observe(frames[j]);
    }
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
            // The real intrinsic size is only known once the bitmap is ready,
            // so re-scale the visible slide even if it was rendered earlier
            // with the fallback dimensions.
            htUniverseRelayout();
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

    // The class may load inside a hidden viewer tab/iframe and only be shown
    // later. In that case the frames have no size when the first slide is
    // shown, and no resize/visibilitychange event fires when the container
    // becomes visible (Chromium keeps the unlaid-out image). A ResizeObserver
    // lays the frame out as soon as it actually gets a size.
    htObserveUniverseFrames();

    window.addEventListener("resize", htUniverseRelayout);
    document.addEventListener("visibilitychange", htUniverseRelayout);

    return false;
}
