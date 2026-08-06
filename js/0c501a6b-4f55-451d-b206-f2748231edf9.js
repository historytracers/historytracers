// SPDX-License-Identifier: GPL-3.0-or-later

window.localIdentity0c50 = {};

window.localIdentity0c50.thetaDeg = 30;
window.localIdentity0c50.MIN_THETA = 5;
window.localIdentity0c50.MAX_THETA = 90;

window.localIdentity0c50.ctx = null;
window.localIdentity0c50.canvas = null;
window.localIdentity0c50.thetaInput = null;
window.localIdentity0c50.thetaRange = null;
window.localIdentity0c50.identitySpan = null;
window.localIdentity0c50.numericProofSpan = null;
window.localIdentity0c50.resizeTimeout = null;
window.localIdentity0c50.resizeObserver = null;

window.localIdentity0c50.clampTheta = function(v) {
    if (v < window.localIdentity0c50.MIN_THETA) return window.localIdentity0c50.MIN_THETA;
    if (v > window.localIdentity0c50.MAX_THETA) return window.localIdentity0c50.MAX_THETA;
    return v;
};

window.localIdentity0c50.syncUIFromState = function() {
    var o = window.localIdentity0c50;
    if (o.thetaInput) o.thetaInput.value = o.thetaDeg.toFixed(0);
    if (o.thetaRange) o.thetaRange.value = o.thetaDeg;

    var th = o.thetaDeg * Math.PI / 180;
    var sin = Math.sin(th);
    var cos = Math.cos(th);
    var sinSq = sin * sin;
    var cosSq = cos * cos;

    if (o.identitySpan && o.numericProofSpan) {
        o.identitySpan.innerHTML = "sen²(θ) + cos²(θ) = 1";
        o.numericProofSpan.innerHTML = "sen(θ) = " + sin.toFixed(4) + ", cos(θ) = " + cos.toFixed(4) + "  →  sen²(θ) + cos²(θ) = " + sinSq.toFixed(4) + " + " + cosSq.toFixed(4) + " = " + (sinSq + cosSq).toFixed(4);
    }

    window.localIdentity0c50.draw();
};

window.localIdentity0c50.onThetaChange = function(value) {
    var v = parseFloat(value);
    if (isNaN(v)) return;
    v = window.localIdentity0c50.clampTheta(v);
    window.localIdentity0c50.thetaDeg = v;
    window.localIdentity0c50.syncUIFromState();
};

window.localIdentity0c50.draw = function() {
    if (!window.localIdentity0c50.ctx || !window.localIdentity0c50.canvas) return;

    var o = window.localIdentity0c50;
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

    var marginX = w * 0.14;
    if (marginX < 60) marginX = 60;
    var marginY = h * 0.15;
    if (marginY < 40) marginY = 40;

    var maxDrawingX = w - marginX * 0.8;
    var maxDrawingY = h - marginY * 1.2;

    var ox = marginX * 0.85;
    var oy = h - marginY;

    var R = maxDrawingX - ox;
    var R2 = maxDrawingY - marginY * 0.4;
    if (R2 < R) R = R2;
    R = R * 0.82;
    if (R > 130) R = 130;
    if (isNaN(R) || R <= 0) R = 60;

    var px = ox + cos * R;
    var py = oy - sin * R;
    var qx = px;
    var qy = oy;

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

    // triangle fill OPQ
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(px, py);
    ctx.lineTo(qx, qy);
    ctx.closePath();
    ctx.fillStyle = 'rgba(113,166,210,0.15)';
    ctx.fill();

    // cosine leg OQ
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(qx, qy);
    ctx.strokeStyle = '#2e7d64';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // sine leg QP
    ctx.beginPath();
    ctx.moveTo(qx, qy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#c44536';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // radius OP
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = '#71a6d2';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // right angle square at Q
    var s = w / 34;
    if (s < 8) s = 8;
    if (s > 14) s = 14;
    ctx.beginPath();
    ctx.moveTo(qx, qy);
    ctx.lineTo(qx - s, qy);
    ctx.lineTo(qx - s, qy - s);
    ctx.lineTo(qx, qy - s);
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
    dot(qx, qy, '#2e7d64', Math.max(4, w / 160));

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
    ctx.fillStyle = '#2e7d64';
    ctx.fillText("Q", qx + fontSize * 0.5, qy + fontSize * 1.0);

    ctx.fillStyle = '#000000';
    var ta = th / 2;
    ctx.fillText("θ", ox + (ra + fontSize * 0.8) * Math.cos(ta), oy - (ra + fontSize * 0.8) * Math.sin(ta) + fontSize * 0.35);

    ctx.fillStyle = '#71a6d2';
    var oneOff = Math.min(fontSize * 1.2, R * 0.18);
    ctx.fillText("1", ox + 0.5 * (px - ox) - sin * oneOff, oy + 0.5 * (py - oy) - cos * oneOff + fontSize * 0.3);

    ctx.fillStyle = '#2e7d64';
    ctx.fillText("cos θ", (ox + qx) / 2, oy + fontSize * 1.1);

    ctx.fillStyle = '#c44536';
    ctx.fillText("sen θ", px + fontSize * 0.6, (py + qy) / 2 + fontSize * 0.3);
};

window.localIdentity0c50.handleResize = function() {
    if (window.localIdentity0c50.resizeTimeout) clearTimeout(window.localIdentity0c50.resizeTimeout);
    window.localIdentity0c50.resizeTimeout = setTimeout(function() {
        window.localIdentity0c50.draw();
    }, 100);
};

window.localIdentity0c50.init = function() {
    window.localIdentity0c50.canvas = document.getElementById('identityCanvas0c50');
    if (window.localIdentity0c50.canvas) window.localIdentity0c50.ctx = window.localIdentity0c50.canvas.getContext('2d');

    window.localIdentity0c50.thetaInput = document.getElementById('thetaInput0c50');
    window.localIdentity0c50.thetaRange = document.getElementById('thetaRange0c50');
    window.localIdentity0c50.identitySpan = document.getElementById('identityText0c50');
    window.localIdentity0c50.numericProofSpan = document.getElementById('numericProof0c50');

    window.localIdentity0c50.thetaDeg = 30;

    if (window.localIdentity0c50.thetaRange) {
        window.localIdentity0c50.thetaRange.min = window.localIdentity0c50.MIN_THETA;
        window.localIdentity0c50.thetaRange.max = window.localIdentity0c50.MAX_THETA;
    }
    if (window.localIdentity0c50.thetaInput) {
        window.localIdentity0c50.thetaInput.min = window.localIdentity0c50.MIN_THETA;
        window.localIdentity0c50.thetaInput.max = window.localIdentity0c50.MAX_THETA;
    }

    if (window.localIdentity0c50.thetaInput) {
        window.localIdentity0c50.thetaInput.addEventListener('input', function(e) { window.localIdentity0c50.onThetaChange(e.target.value); });
        window.localIdentity0c50.thetaInput.addEventListener('change', function(e) { window.localIdentity0c50.onThetaChange(e.target.value); });
    }
    if (window.localIdentity0c50.thetaRange) {
        window.localIdentity0c50.thetaRange.addEventListener('input', function(e) { window.localIdentity0c50.onThetaChange(e.target.value); });
    }

    window.addEventListener('resize', window.localIdentity0c50.handleResize);
    if (window.localIdentity0c50.canvas && window.localIdentity0c50.canvas.parentElement) {
        window.localIdentity0c50.resizeObserver = new ResizeObserver(function() { window.localIdentity0c50.draw(); });
        window.localIdentity0c50.resizeObserver.observe(window.localIdentity0c50.canvas.parentElement);
    }

    window.localIdentity0c50.syncUIFromState();
    setTimeout(function() { window.localIdentity0c50.draw(); }, 20);
};

function htLoadContent() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.localIdentity0c50 && window.localIdentity0c50.init) {
                window.localIdentity0c50.init();
            }
        });
    } else {
        if (window.localIdentity0c50 && window.localIdentity0c50.init) {
            window.localIdentity0c50.init();
        }
    }
}
