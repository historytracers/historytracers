// SPDX-License-Identifier: GPL-3.0-or-later

window.localCotCscF74e = {};

window.localCotCscF74e.thetaDeg = 30;
window.localCotCscF74e.MIN_THETA = 15;
window.localCotCscF74e.MAX_THETA = 75;

window.localCotCscF74e.ctx = null;
window.localCotCscF74e.canvas = null;
window.localCotCscF74e.thetaInput = null;
window.localCotCscF74e.thetaRange = null;
window.localCotCscF74e.identitySpan = null;
window.localCotCscF74e.numericProofSpan = null;
window.localCotCscF74e.resizeTimeout = null;
window.localCotCscF74e.resizeObserver = null;

window.localCotCscF74e.clampTheta = function(v) {
    if (v < window.localCotCscF74e.MIN_THETA) return window.localCotCscF74e.MIN_THETA;
    if (v > window.localCotCscF74e.MAX_THETA) return window.localCotCscF74e.MAX_THETA;
    return v;
};

window.localCotCscF74e.syncUIFromState = function() {
    var o = window.localCotCscF74e;
    if (o.thetaInput) o.thetaInput.value = o.thetaDeg.toFixed(0);
    if (o.thetaRange) o.thetaRange.value = o.thetaDeg;

    var th = o.thetaDeg * Math.PI / 180;
    var cot = Math.cos(th) / Math.sin(th);
    var csc = 1 / Math.sin(th);
    var cotSq = cot * cot;
    var cscSq = csc * csc;

    if (o.identitySpan && o.numericProofSpan) {
        o.identitySpan.innerHTML = "1 + cot²(θ) = csc²(θ)";
        o.numericProofSpan.innerHTML = "cot(θ) = " + cot.toFixed(4) + "  →  1 + cot²(θ) = 1 + " + cotSq.toFixed(4) + " = " + (1 + cotSq).toFixed(4) + " = csc²(θ) = " + cscSq.toFixed(4);
    }

    window.localCotCscF74e.draw();
};

window.localCotCscF74e.onThetaChange = function(value) {
    var v = parseFloat(value);
    if (isNaN(v)) return;
    v = window.localCotCscF74e.clampTheta(v);
    window.localCotCscF74e.thetaDeg = v;
    window.localCotCscF74e.syncUIFromState();
};

window.localCotCscF74e.draw = function() {
    if (!window.localCotCscF74e.ctx || !window.localCotCscF74e.canvas) return;

    var o = window.localCotCscF74e;
    var container = o.canvas.parentElement;
    var maxWidth = 560;
    if (container.clientWidth - 20 < maxWidth) maxWidth = container.clientWidth - 20;
    if (maxWidth < 320) maxWidth = 320;
    var targetWidth = maxWidth;
    var targetHeight = targetWidth * 0.68;
    if (targetHeight > 380) targetHeight = 380;

    o.canvas.width = targetWidth;
    o.canvas.height = targetHeight;
    o.canvas.style.width = targetWidth + "px";
    o.canvas.style.height = targetHeight + "px";

    o.ctx = o.canvas.getContext('2d');
    var w = o.canvas.width;
    var h = o.canvas.height;
    var ctx = o.ctx;
    ctx.clearRect(0, 0, w, h);

    var th = o.thetaDeg * Math.PI / 180;
    var cos = Math.cos(th);
    var sin = Math.sin(th);
    var cot = cos / sin;
    var csc = 1 / sin;

    var marginX = w * 0.14;
    if (marginX < 60) marginX = 60;
    var marginY = h * 0.15;
    if (marginY < 40) marginY = 40;

    var maxDrawingX = w - marginX * 0.8;
    var maxDrawingY = h - marginY * 1.2;

    var ox = marginX * 0.85;
    var oy = h - marginY;

    var R = (maxDrawingX - ox) / 1.0;
    var R2 = (maxDrawingY - marginY * 0.4) / csc;
    if (R2 < R) R = R2;
    R = R * 0.82;
    if (R > 130) R = 130;
    if (isNaN(R) || R <= 0) R = 60;

    var px = ox + cos * R;
    var py = oy - sin * R;
    var cx = ox;
    var cy = oy - csc * R;

    ctx.lineCap = 'round';

    var lineWidth = w / 140;
    if (lineWidth < 3) lineWidth = 3;

    // x axis
    ctx.beginPath();
    ctx.moveTo(marginX * 0.3, oy);
    ctx.lineTo(w - marginX * 0.3, oy);
    ctx.strokeStyle = '#9aa7ad';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // y axis
    ctx.beginPath();
    ctx.moveTo(ox, marginY * 0.5);
    ctx.lineTo(ox, h - marginY * 0.3);
    ctx.strokeStyle = '#9aa7ad';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // unit circle
    ctx.beginPath();
    ctx.arc(ox, oy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = '#71a6d2';
    ctx.lineWidth = 3;
    ctx.stroke();

    // triangle fill OPC
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(px, py);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fillStyle = 'rgba(113,166,210,0.15)';
    ctx.fill();

    // cosecant OC
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // cotangent PC
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#8e44ad';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // radius OP
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#71a6d2';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // right angle square at P
    var s = w / 34;
    if (s < 8) s = 8;
    if (s > 14) s = 14;
    var ux = cos;
    var uy = -sin;
    var vx = -sin;
    var vy = cos;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + s * ux, py + s * uy);
    ctx.lineTo(px + s * ux + s * vx, py + s * uy + s * vy);
    ctx.lineTo(px + s * vx, py + s * vy);
    ctx.closePath();
    ctx.fillStyle = '#b3cfdd';
    ctx.fill();
    ctx.strokeStyle = '#346f82';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // angle arc at O
    var ra = w / 26;
    if (ra < 16) ra = 16;
    if (ra > 26) ra = 26;
    ctx.beginPath();
    ctx.moveTo(ox + ra, oy);
    ctx.arc(ox, oy, ra, -th, 0);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // dots
    function dot(x, y, color, r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
    dot(ox, oy, '#2c8faa', Math.max(4, w / 160));
    dot(px, py, '#71a6d2', Math.max(4, w / 150));
    dot(cx, cy, '#1e3a8a', Math.max(4, w / 160));

    // labels
    var fontSize = w / 28;
    if (fontSize < 13) fontSize = 13;
    if (fontSize > 19) fontSize = 19;
    ctx.font = "bold " + fontSize + "px 'Segoe UI', 'Roboto'";
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';

    ctx.fillStyle = '#2c8faa';
    ctx.fillText("O", ox - fontSize * 1.1, oy + fontSize * 0.8);
    ctx.fillStyle = '#71a6d2';
    ctx.fillText("P", px + fontSize * 0.1, py - fontSize * 0.4);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText("C", cx - fontSize * 0.8, cy + fontSize * 0.3);

    ctx.fillStyle = '#000000';
    var ta = th / 2;
    ctx.fillText("θ", ox + (ra + fontSize * 0.8) * Math.cos(ta), oy - (ra + fontSize * 0.8) * Math.sin(ta) + fontSize * 0.35);

    ctx.fillStyle = '#71a6d2';
    var oneOff = Math.min(fontSize * 1.2, R * 0.18);
    ctx.fillText("1", ox + 0.5 * (px - ox) - sin * oneOff, oy + 0.5 * (py - oy) - cos * oneOff + fontSize * 0.3);

    ctx.fillStyle = '#8e44ad';
    var tMidX = (px + cx) / 2;
    var tMidY = (py + cy) / 2;
    var tLen = Math.hypot(cx - px, cy - py);
    var nx = -(cy - py) / (tLen || 1);
    var ny = (cx - px) / (tLen || 1);
    if ((ox - tMidX) * nx + (oy - tMidY) * ny > 0) {
        nx = -nx;
        ny = -ny;
    }
    ctx.fillText("cot θ", tMidX + nx * fontSize * 0.5, tMidY + ny * fontSize * 0.5 + fontSize * 0.3);

    ctx.fillStyle = '#1e3a8a';
    var sMidX = (ox + cx) / 2;
    var sMidY = (oy + cy) / 2;
    ctx.fillText("csc θ", sMidX + fontSize * 0.3, sMidY - fontSize * 0.8);
};

window.localCotCscF74e.handleResize = function() {
    if (window.localCotCscF74e.resizeTimeout) clearTimeout(window.localCotCscF74e.resizeTimeout);
    window.localCotCscF74e.resizeTimeout = setTimeout(function() {
        window.localCotCscF74e.draw();
    }, 100);
};

window.localCotCscF74e.init = function() {
    window.localCotCscF74e.canvas = document.getElementById('cotcscCanvasf74e');
    if (window.localCotCscF74e.canvas) window.localCotCscF74e.ctx = window.localCotCscF74e.canvas.getContext('2d');

    window.localCotCscF74e.thetaInput = document.getElementById('thetaInputf74e');
    window.localCotCscF74e.thetaRange = document.getElementById('thetaRangef74e');
    window.localCotCscF74e.identitySpan = document.getElementById('identityTextf74e');
    window.localCotCscF74e.numericProofSpan = document.getElementById('numericProoff74e');

    window.localCotCscF74e.thetaDeg = 30;

    if (window.localCotCscF74e.thetaRange) {
        window.localCotCscF74e.thetaRange.min = window.localCotCscF74e.MIN_THETA;
        window.localCotCscF74e.thetaRange.max = window.localCotCscF74e.MAX_THETA;
    }
    if (window.localCotCscF74e.thetaInput) {
        window.localCotCscF74e.thetaInput.min = window.localCotCscF74e.MIN_THETA;
        window.localCotCscF74e.thetaInput.max = window.localCotCscF74e.MAX_THETA;
    }

    if (window.localCotCscF74e.thetaInput) {
        window.localCotCscF74e.thetaInput.addEventListener('input', function(e) { window.localCotCscF74e.onThetaChange(e.target.value); });
        window.localCotCscF74e.thetaInput.addEventListener('change', function(e) { window.localCotCscF74e.onThetaChange(e.target.value); });
    }
    if (window.localCotCscF74e.thetaRange) {
        window.localCotCscF74e.thetaRange.addEventListener('input', function(e) { window.localCotCscF74e.onThetaChange(e.target.value); });
    }

    window.addEventListener('resize', window.localCotCscF74e.handleResize);
    if (window.localCotCscF74e.canvas && window.localCotCscF74e.canvas.parentElement) {
        window.localCotCscF74e.resizeObserver = new ResizeObserver(function() { window.localCotCscF74e.draw(); });
        window.localCotCscF74e.resizeObserver.observe(window.localCotCscF74e.canvas.parentElement);
    }

    window.localCotCscF74e.syncUIFromState();
    setTimeout(function() { window.localCotCscF74e.draw(); }, 20);
};

function htLoadContent() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.localCotCscF74e && window.localCotCscF74e.init) {
                window.localCotCscF74e.init();
            }
        });
    } else {
        if (window.localCotCscF74e && window.localCotCscF74e.init) {
            window.localCotCscF74e.init();
        }
    }
}
