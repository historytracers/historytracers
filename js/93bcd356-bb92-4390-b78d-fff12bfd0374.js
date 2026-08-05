// SPDX-License-Identifier: GPL-3.0-or-later

window.localTanSec93bc = {};

window.localTanSec93bc.thetaDeg = 30;
window.localTanSec93bc.MIN_THETA = 5;
window.localTanSec93bc.MAX_THETA = 72;

window.localTanSec93bc.ctx = null;
window.localTanSec93bc.canvas = null;
window.localTanSec93bc.thetaInput = null;
window.localTanSec93bc.thetaRange = null;
window.localTanSec93bc.identitySpan = null;
window.localTanSec93bc.numericProofSpan = null;
window.localTanSec93bc.resizeTimeout = null;
window.localTanSec93bc.resizeObserver = null;

window.localTanSec93bc.clampTheta = function(v) {
    if (v < window.localTanSec93bc.MIN_THETA) return window.localTanSec93bc.MIN_THETA;
    if (v > window.localTanSec93bc.MAX_THETA) return window.localTanSec93bc.MAX_THETA;
    return v;
};

window.localTanSec93bc.syncUIFromState = function() {
    var o = window.localTanSec93bc;
    if (o.thetaInput) o.thetaInput.value = o.thetaDeg.toFixed(0);
    if (o.thetaRange) o.thetaRange.value = o.thetaDeg;

    var th = o.thetaDeg * Math.PI / 180;
    var tan = Math.tan(th);
    var sec = 1 / Math.cos(th);
    var tanSq = tan * tan;
    var secSq = sec * sec;

    if (o.identitySpan && o.numericProofSpan) {
        o.identitySpan.innerHTML = "1 + tan²(θ) = sec²(θ)";
        o.numericProofSpan.innerHTML = "tan(θ) = " + tan.toFixed(4) + "  →  1 + tan²(θ) = 1 + " + tanSq.toFixed(4) + " = " + (1 + tanSq).toFixed(4) + " = sec²(θ) = " + secSq.toFixed(4);
    }

    window.localTanSec93bc.draw();
};

window.localTanSec93bc.onThetaChange = function(value) {
    var v = parseFloat(value);
    if (isNaN(v)) return;
    v = window.localTanSec93bc.clampTheta(v);
    window.localTanSec93bc.thetaDeg = v;
    window.localTanSec93bc.syncUIFromState();
};

window.localTanSec93bc.draw = function() {
    if (!window.localTanSec93bc.ctx || !window.localTanSec93bc.canvas) return;

    var o = window.localTanSec93bc;
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
    var tan = sin / cos;
    var sec = 1 / cos;

    var marginX = w * 0.14;
    if (marginX < 60) marginX = 60;
    var marginY = h * 0.15;
    if (marginY < 40) marginY = 40;

    var maxDrawingX = w - marginX * 0.8;
    var maxDrawingY = h - marginY * 1.2;

    var ox = marginX * 0.85;
    var oy = h - marginY;

    var R = (maxDrawingX - ox) / sec;
    var R2 = (maxDrawingY - marginY * 0.4) / 1.3;
    if (R2 < R) R = R2;
    R = R * 0.82;
    if (R > 130) R = 130;
    if (isNaN(R) || R <= 0) R = 60;

    var px = ox + cos * R;
    var py = oy - sin * R;
    var tx = ox + sec * R;
    var ty = oy;

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

    // triangle fill OPT
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(px, py);
    ctx.lineTo(tx, ty);
    ctx.closePath();
    ctx.fillStyle = 'rgba(113,166,210,0.15)';
    ctx.fill();

    // secant OT
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tx, ty);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // tangent PT
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(tx, ty);
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
    var vx = sin;
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
    dot(tx, ty, '#1e3a8a', Math.max(4, w / 160));

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
    ctx.fillText("T", tx + fontSize * 0.4, ty + fontSize * 1.0);

    ctx.fillStyle = '#000000';
    var ta = th / 2;
    ctx.fillText("θ", ox + (ra + fontSize * 0.8) * Math.cos(ta), oy - (ra + fontSize * 0.8) * Math.sin(ta) + fontSize * 0.35);

    ctx.fillStyle = '#71a6d2';
    var oneOff = Math.min(fontSize * 1.2, R * 0.18);
    ctx.fillText("1", ox + 0.5 * (px - ox) - sin * oneOff, oy + 0.5 * (py - oy) - cos * oneOff + fontSize * 0.3);

    ctx.fillStyle = '#8e44ad';
    var tMidX = (px + tx) / 2;
    var tMidY = (py + ty) / 2;
    var tLen = Math.hypot(tx - px, ty - py);
    var nx = -(ty - py) / (tLen || 1);
    var ny = (tx - px) / (tLen || 1);
    if ((ox - tMidX) * nx + (oy - tMidY) * ny > 0) {
        nx = -nx;
        ny = -ny;
    }
    ctx.fillText("tan θ", tMidX + nx * fontSize * 0.5, tMidY + ny * fontSize * 0.5 + fontSize * 0.3);

    ctx.fillStyle = '#1e3a8a';
    var sMidX = (ox + tx) / 2;
    var sMidY = (oy + ty) / 2;
    ctx.fillText("sec θ", sMidX + fontSize * 0.2, sMidY - fontSize * 0.8);
};

window.localTanSec93bc.handleResize = function() {
    if (window.localTanSec93bc.resizeTimeout) clearTimeout(window.localTanSec93bc.resizeTimeout);
    window.localTanSec93bc.resizeTimeout = setTimeout(function() {
        window.localTanSec93bc.draw();
    }, 100);
};

window.localTanSec93bc.init = function() {
    window.localTanSec93bc.canvas = document.getElementById('tansecCanvas93bc');
    if (window.localTanSec93bc.canvas) window.localTanSec93bc.ctx = window.localTanSec93bc.canvas.getContext('2d');

    window.localTanSec93bc.thetaInput = document.getElementById('thetaInput93bc');
    window.localTanSec93bc.thetaRange = document.getElementById('thetaRange93bc');
    window.localTanSec93bc.identitySpan = document.getElementById('identityText93bc');
    window.localTanSec93bc.numericProofSpan = document.getElementById('numericProof93bc');

    window.localTanSec93bc.thetaDeg = 30;

    if (window.localTanSec93bc.thetaRange) {
        window.localTanSec93bc.thetaRange.min = window.localTanSec93bc.MIN_THETA;
        window.localTanSec93bc.thetaRange.max = window.localTanSec93bc.MAX_THETA;
    }
    if (window.localTanSec93bc.thetaInput) {
        window.localTanSec93bc.thetaInput.min = window.localTanSec93bc.MIN_THETA;
        window.localTanSec93bc.thetaInput.max = window.localTanSec93bc.MAX_THETA;
    }

    if (window.localTanSec93bc.thetaInput) {
        window.localTanSec93bc.thetaInput.addEventListener('input', function(e) { window.localTanSec93bc.onThetaChange(e.target.value); });
        window.localTanSec93bc.thetaInput.addEventListener('change', function(e) { window.localTanSec93bc.onThetaChange(e.target.value); });
    }
    if (window.localTanSec93bc.thetaRange) {
        window.localTanSec93bc.thetaRange.addEventListener('input', function(e) { window.localTanSec93bc.onThetaChange(e.target.value); });
    }

    window.addEventListener('resize', window.localTanSec93bc.handleResize);
    if (window.localTanSec93bc.canvas && window.localTanSec93bc.canvas.parentElement) {
        window.localTanSec93bc.resizeObserver = new ResizeObserver(function() { window.localTanSec93bc.draw(); });
        window.localTanSec93bc.resizeObserver.observe(window.localTanSec93bc.canvas.parentElement);
    }

    window.localTanSec93bc.syncUIFromState();
    setTimeout(function() { window.localTanSec93bc.draw(); }, 20);
};

function htLoadContent() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.localTanSec93bc && window.localTanSec93bc.init) {
                window.localTanSec93bc.init();
            }
        });
    } else {
        if (window.localTanSec93bc && window.localTanSec93bc.init) {
            window.localTanSec93bc.init();
        }
    }
}
