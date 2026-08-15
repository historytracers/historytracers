// SPDX-License-Identifier: GPL-3.0-or-later

window.localSelect9ebb = {};

window.localSelect9ebb.mode = "functions";
window.localSelect9ebb.func = "sine";
window.localSelect9ebb.rel = "identity";
window.localSelect9ebb.thetaDeg = 30;
window.localSelect9ebb.MIN_THETA = 5;
window.localSelect9ebb.MAX_THETA = 90;

window.localSelect9ebb.circleCanvas = null;
window.localSelect9ebb.circleCtx = null;
window.localSelect9ebb.chartCanvas = null;
window.localSelect9ebb.chartCtx = null;
window.localSelect9ebb.thetaInput = null;
window.localSelect9ebb.thetaRange = null;
window.localSelect9ebb.identityText = null;
window.localSelect9ebb.numericProof = null;
window.localSelect9ebb.titleFunc = null;
window.localSelect9ebb.titleRel = null;
window.localSelect9ebb.funcTabs = null;
window.localSelect9ebb.relTabs = null;
window.localSelect9ebb.resizeTimeout = null;
window.localSelect9ebb.resizeObserver = null;
window.localSelect9ebb.circleObserver = null;
window.localSelect9ebb.chartObserver = null;

window.localSelect9ebb.getMaxTheta = function() {
    var mode = window.localSelect9ebb.mode;
    var func = window.localSelect9ebb.func;
    var rel = window.localSelect9ebb.rel;
    if (mode === "functions") {
        if (func === "tangent") return 78;
        return 90;
    }
    if (rel === "tansec") return 78;
    if (rel === "cotcsc") return 88;
    return 90;
};

window.localSelect9ebb.clampTheta = function(v) {
    var min = window.localSelect9ebb.MIN_THETA;
    var max = window.localSelect9ebb.getMaxTheta();
    if (v < min) return min;
    if (v > max) return max;
    return v;
};

window.localSelect9ebb.syncUIFromState = function() {
    var o = window.localSelect9ebb;
    if (o.thetaInput) o.thetaInput.value = o.thetaDeg.toFixed(0);
    if (o.thetaRange) {
        o.thetaRange.min = o.MIN_THETA;
        o.thetaRange.max = o.getMaxTheta();
        o.thetaRange.value = o.thetaDeg;
    }

    if (o.funcTabs) o.funcTabs.style.display = (o.mode === "functions") ? "" : "none";
    if (o.relTabs) o.relTabs.style.display = (o.mode === "relationships") ? "" : "none";

    if (o.titleFunc && o.titleRel) {
        o.titleFunc.style.display = (o.mode === "functions") ? "" : "none";
        o.titleRel.style.display = (o.mode === "relationships") ? "" : "none";
    }

    o.updateTheoremBox();
    o.drawCircle();
    o.drawChart();
};

window.localSelect9ebb.updateTheoremBox = function() {
    var o = window.localSelect9ebb;
    if (!o.identityText || !o.numericProof) return;

    var th = o.thetaDeg * Math.PI / 180;
    var sin = Math.sin(th);
    var cos = Math.cos(th);
    var tan = Math.tan(th);
    var sec = 1 / Math.cos(th);
    var cot = Math.cos(th) / Math.sin(th);
    var csc = 1 / Math.sin(th);

    if (o.mode === "functions") {
        if (o.func === "sine") {
            o.identityText.innerHTML = "sin(θ) = opposite / hypotenuse";
            o.numericProof.innerHTML = "θ = " + o.thetaDeg.toFixed(0) + "°  →  sin(θ) = " + sin.toFixed(4);
        } else if (o.func === "cosine") {
            o.identityText.innerHTML = "cos(θ) = adjacent / hypotenuse";
            o.numericProof.innerHTML = "θ = " + o.thetaDeg.toFixed(0) + "°  →  cos(θ) = " + cos.toFixed(4);
        } else {
            o.identityText.innerHTML = "tan(θ) = sin(θ) / cos(θ)";
            o.numericProof.innerHTML = "θ = " + o.thetaDeg.toFixed(0) + "°  →  sin(θ) = " + sin.toFixed(4) + ", cos(θ) = " + cos.toFixed(4) + "  →  tan(θ) = " + tan.toFixed(4);
        }
        return;
    }

    if (o.rel === "identity") {
        o.identityText.innerHTML = "sin²(θ) + cos²(θ) = 1";
        o.numericProof.innerHTML = "sin(θ) = " + sin.toFixed(4) + ", cos(θ) = " + cos.toFixed(4) + "  →  sin²(θ) + cos²(θ) = " + (sin * sin).toFixed(4) + " + " + (cos * cos).toFixed(4) + " = " + (sin * sin + cos * cos).toFixed(4);
    } else if (o.rel === "tansec") {
        o.identityText.innerHTML = "1 + tan²(θ) = sec²(θ)";
        o.numericProof.innerHTML = "tan(θ) = " + tan.toFixed(4) + "  →  1 + tan²(θ) = 1 + " + (tan * tan).toFixed(4) + " = " + (1 + tan * tan).toFixed(4) + " = sec²(θ) = " + (sec * sec).toFixed(4);
    } else {
        o.identityText.innerHTML = "1 + cot²(θ) = csc²(θ)";
        o.numericProof.innerHTML = "cot(θ) = " + cot.toFixed(4) + "  →  1 + cot²(θ) = 1 + " + (cot * cot).toFixed(4) + " = " + (1 + cot * cot).toFixed(4) + " = csc²(θ) = " + (csc * csc).toFixed(4);
    }
};

window.localSelect9ebb.onThetaChange = function(value) {
    var v = parseFloat(value);
    if (isNaN(v)) return;
    v = window.localSelect9ebb.clampTheta(v);
    window.localSelect9ebb.thetaDeg = v;
    window.localSelect9ebb.syncUIFromState();
};

window.localSelect9ebb.onModeChange = function(mode) {
    window.localSelect9ebb.mode = mode;
    window.localSelect9ebb.thetaDeg = window.localSelect9ebb.clampTheta(window.localSelect9ebb.thetaDeg);
    window.localSelect9ebb.syncUIFromState();
};

window.localSelect9ebb.onFuncChange = function(func) {
    window.localSelect9ebb.func = func;
    window.localSelect9ebb.thetaDeg = window.localSelect9ebb.clampTheta(window.localSelect9ebb.thetaDeg);
    window.localSelect9ebb.syncUIFromState();
};

window.localSelect9ebb.onRelChange = function(rel) {
    window.localSelect9ebb.rel = rel;
    window.localSelect9ebb.thetaDeg = window.localSelect9ebb.clampTheta(window.localSelect9ebb.thetaDeg);
    window.localSelect9ebb.syncUIFromState();
};

window.localSelect9ebb.drawCircle = function() {
    if (!window.localSelect9ebb.circleCtx || !window.localSelect9ebb.circleCanvas) return;

    var o = window.localSelect9ebb;
    var container = o.circleCanvas.parentElement;
    var avail = container.clientWidth - 12;
    if (avail < 200) avail = 200;
    if (avail > 560) avail = 560;
    var targetWidth = avail;
    var targetHeight = targetWidth * 0.68;
    if (targetHeight > 380) targetHeight = 380;

    o.circleCanvas.width = targetWidth;
    o.circleCanvas.height = targetHeight;
    o.circleCanvas.style.width = targetWidth + "px";
    o.circleCanvas.style.height = targetHeight + "px";

    o.circleCtx = o.circleCanvas.getContext('2d');
    var w = o.circleCanvas.width;
    var h = o.circleCanvas.height;
    var ctx = o.circleCtx;
    ctx.clearRect(0, 0, w, h);

    var th = o.thetaDeg * Math.PI / 180;
    var cos = Math.cos(th);
    var sin = Math.sin(th);
    var sec = 1 / Math.cos(th);
    var csc = 1 / Math.sin(th);

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

    var useSec = (o.mode === "relationships" && o.rel === "tansec") || (o.mode === "functions" && o.func === "tangent");
    var useCsc = (o.mode === "relationships" && o.rel === "cotcsc");
    if (useSec) {
        var Rs = (maxDrawingX - ox) / sec;
        var R2s = (maxDrawingY - marginY * 0.4) / 1.3;
        if (R2s < Rs) Rs = R2s;
        Rs = Rs * 0.82;
        if (Rs > 130) Rs = 130;
        if (isNaN(Rs) || Rs <= 0) Rs = 60;
        R = Rs;
    }
    if (useCsc) {
        var Rc = (maxDrawingX - ox) / 1.0;
        var R2c = (maxDrawingY - marginY * 0.4) / csc;
        if (R2c < Rc) Rc = R2c;
        Rc = Rc * 0.82;
        if (Rc > 130) Rc = 130;
        if (isNaN(Rc) || Rc <= 0) Rc = 60;
        R = Rc;
    }

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

    var isIdentity = (o.mode === "relationships" && o.rel === "identity") || (o.mode === "functions" && o.func === "sine") || (o.mode === "functions" && o.func === "cosine");

    if (isIdentity) {
        // triangle fill OPQ
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(px, py);
        ctx.lineTo(qx, qy);
        ctx.closePath();
        ctx.fillStyle = 'rgba(113,166,210,0.15)';
        ctx.fill();

        // radius OP
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = '#71a6d2';
        ctx.lineWidth = lineWidth;
        ctx.stroke();

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
    } else if (useSec) {
        var tx = ox + sec * R;
        var ty = oy;

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
        var s2 = w / 34;
        if (s2 < 8) s2 = 8;
        if (s2 > 14) s2 = 14;
        var ux = cos;
        var uy = -sin;
        var vx = sin;
        var vy = cos;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + s2 * ux, py + s2 * uy);
        ctx.lineTo(px + s2 * ux + s2 * vx, py + s2 * uy + s2 * vy);
        ctx.lineTo(px + s2 * vx, py + s2 * vy);
        ctx.closePath();
        ctx.fillStyle = '#b3cfdd';
        ctx.fill();
        ctx.strokeStyle = '#346f82';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // dots and labels
        ctx.fillStyle = '#1e3a8a';
        var fontSize2 = w / 28;
        if (fontSize2 < 13) fontSize2 = 13;
        if (fontSize2 > 19) fontSize2 = 19;
        ctx.font = "bold " + fontSize2 + "px 'Segoe UI', 'Roboto'";
        ctx.textAlign = 'center';
        ctx.fillText("T", tx + fontSize2 * 0.4, ty + fontSize2 * 1.0);
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
        ctx.fillText("tan θ", tMidX + nx * fontSize2 * 0.5, tMidY + ny * fontSize2 * 0.5 + fontSize2 * 0.3);
        ctx.fillStyle = '#1e3a8a';
        var sMidX = (ox + tx) / 2;
        var sMidY = (oy + ty) / 2;
        ctx.fillText("sec θ", sMidX + fontSize2 * 0.2, sMidY - fontSize2 * 0.8);
    } else if (useCsc) {
        var cx = ox;
        var cy = oy - csc * R;

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
        var s3 = w / 34;
        if (s3 < 8) s3 = 8;
        if (s3 > 14) s3 = 14;
        var ux3 = cos;
        var uy3 = -sin;
        var vx3 = -sin;
        var vy3 = cos;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + s3 * ux3, py + s3 * uy3);
        ctx.lineTo(px + s3 * ux3 + s3 * vx3, py + s3 * uy3 + s3 * vy3);
        ctx.lineTo(px + s3 * vx3, py + s3 * vy3);
        ctx.closePath();
        ctx.fillStyle = '#b3cfdd';
        ctx.fill();
        ctx.strokeStyle = '#346f82';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#1e3a8a';
        var fontSize3 = w / 28;
        if (fontSize3 < 13) fontSize3 = 13;
        if (fontSize3 > 19) fontSize3 = 19;
        ctx.font = "bold " + fontSize3 + "px 'Segoe UI', 'Roboto'";
        ctx.textAlign = 'center';
        ctx.fillText("C", cx - fontSize3 * 0.8, cy + fontSize3 * 0.3);
        ctx.fillStyle = '#8e44ad';
        var tMidX3 = (px + cx) / 2;
        var tMidY3 = (py + cy) / 2;
        var tLen3 = Math.hypot(cx - px, cy - py);
        var nx3 = -(cy - py) / (tLen3 || 1);
        var ny3 = (cx - px) / (tLen3 || 1);
        if ((ox - tMidX3) * nx3 + (oy - tMidY3) * ny3 > 0) {
            nx3 = -nx3;
            ny3 = -ny3;
        }
        ctx.fillText("cot θ", tMidX3 + nx3 * fontSize3 * 0.5, tMidY3 + ny3 * fontSize3 * 0.5 + fontSize3 * 0.3);
        ctx.fillStyle = '#1e3a8a';
        var sMidX3 = (ox + cx) / 2;
        var sMidY3 = (oy + cy) / 2;
        ctx.fillText("csc θ", sMidX3 + fontSize3 * 0.3, sMidY3 - fontSize3 * 0.8);
    }

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
    if (isIdentity) {
        dot(qx, qy, '#2e7d64', Math.max(4, w / 160));
    } else if (useSec) {
        dot(ox + sec * R, oy, '#1e3a8a', Math.max(4, w / 160));
    } else if (useCsc) {
        dot(ox, oy - csc * R, '#1e3a8a', Math.max(4, w / 160));
    }

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
    if (isIdentity) {
        ctx.fillStyle = '#2e7d64';
        ctx.fillText("Q", qx + fontSize * 0.5, qy + fontSize * 1.0);
    }

    ctx.fillStyle = '#000000';
    var ta = th / 2;
    ctx.fillText("θ", ox + (ra + fontSize * 0.8) * Math.cos(ta), oy - (ra + fontSize * 0.8) * Math.sin(ta) + fontSize * 0.35);

    if (isIdentity) {
        ctx.fillStyle = '#71a6d2';
        var oneOff = Math.min(fontSize * 1.2, R * 0.18);
        ctx.fillText("1", ox + 0.5 * (px - ox) - sin * oneOff, oy + 0.5 * (py - oy) - cos * oneOff + fontSize * 0.3);
        ctx.fillStyle = '#2e7d64';
        ctx.fillText("cos θ", (ox + qx) / 2, oy + fontSize * 1.1);
        ctx.fillStyle = '#c44536';
        ctx.fillText("sin θ", px + fontSize * 0.6, (py + qy) / 2 + fontSize * 0.3);
    } else if (useSec) {
        ctx.fillStyle = '#71a6d2';
        var oneOff2 = Math.min(fontSize * 1.2, R * 0.18);
        ctx.fillText("1", ox + 0.5 * (px - ox) - sin * oneOff2, oy + 0.5 * (py - oy) - cos * oneOff2 + fontSize * 0.3);
    } else if (useCsc) {
        ctx.fillStyle = '#71a6d2';
        var oneOff3 = Math.min(fontSize * 1.2, R * 0.18);
        ctx.fillText("1", ox + 0.5 * (px - ox) - sin * oneOff3, oy + 0.5 * (py - oy) - cos * oneOff3 + fontSize * 0.3);
    }
};

window.localSelect9ebb.drawChart = function() {
    if (!window.localSelect9ebb.chartCtx || !window.localSelect9ebb.chartCanvas) return;

    var o = window.localSelect9ebb;
    var container = o.chartCanvas.parentElement;
    var avail = container.clientWidth - 12;
    if (avail < 200) avail = 200;
    if (avail > 560) avail = 560;
    var targetWidth = avail;
    var targetHeight = targetWidth * 0.5;
    if (targetHeight > 280) targetHeight = 280;

    o.chartCanvas.width = targetWidth;
    o.chartCanvas.height = targetHeight;
    o.chartCanvas.style.width = targetWidth + "px";
    o.chartCanvas.style.height = targetHeight + "px";

    o.chartCtx = o.chartCanvas.getContext('2d');
    var w = o.chartCanvas.width;
    var h = o.chartCanvas.height;
    var ctx = o.chartCtx;
    ctx.clearRect(0, 0, w, h);

    var mode = o.mode;
    var func = o.func;
    var rel = o.rel;

    var th = o.thetaDeg * Math.PI / 180;

    var funcs = [];
    if (mode === "functions") {
        funcs = [func];
    } else if (rel === "identity") {
        funcs = ["sine", "cosine"];
    } else if (rel === "tansec") {
        funcs = ["tangent", "secant"];
    } else {
        funcs = ["cotangent", "cosecant"];
    }

    var ymax = 1.2;
    if (funcs.indexOf("tangent") >= 0 || funcs.indexOf("secant") >= 0 || funcs.indexOf("cotangent") >= 0 || funcs.indexOf("cosecant") >= 0) {
        ymax = 4.0;
    }

    var marginX = w * 0.12;
    if (marginX < 50) marginX = 50;
    var marginY = h * 0.18;
    if (marginY < 40) marginY = 40;

    var plotW = w - marginX * 2;
    var plotH = h - marginY * 2;
    var x0 = marginX;
    var y0 = h - marginY;

    // grid + axes
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#d8e2e8';
    for (var gx = 0; gx <= 90; gx += 30) {
        var pxg = x0 + (gx / 90) * plotW;
        ctx.beginPath();
        ctx.moveTo(pxg, y0);
        ctx.lineTo(pxg, y0 - plotH);
        ctx.stroke();
    }
    for (var gy = 0; gy <= ymax; gy += 0.5) {
        var pyg = y0 - (gy / ymax) * plotH;
        ctx.beginPath();
        ctx.moveTo(x0, pyg);
        ctx.lineTo(x0 + plotW, pyg);
        ctx.stroke();
    }

    ctx.strokeStyle = '#9aa7ad';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + plotW, y0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y0 - plotH);
    ctx.stroke();

    // axis labels
    var fontSize = w / 30;
    if (fontSize < 12) fontSize = 12;
    if (fontSize > 16) fontSize = 16;
    ctx.font = "bold " + fontSize + "px 'Segoe UI', 'Roboto'";
    ctx.fillStyle = '#2c5a6e';
    ctx.textAlign = 'center';
    ctx.fillText("θ (degrees)", x0 + plotW / 2, h - marginY * 0.35);
    ctx.textAlign = 'left';
    for (var gx2 = 0; gx2 <= 90; gx2 += 30) {
        var pxg2 = x0 + (gx2 / 90) * plotW;
        ctx.fillText(String(gx2) + "°", pxg2, y0 + fontSize * 1.3);
    }
    ctx.textAlign = 'right';
    for (var gy2 = 0; gy2 <= ymax; gy2 += 0.5) {
        var pyg2 = y0 - (gy2 / ymax) * plotH;
        ctx.fillText(gy2.toFixed(1), x0 - 8, pyg2 + fontSize * 0.35);
    }
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(x0 - marginX * 0.45, y0 - plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("value", 0, 0);
    ctx.restore();

    // first quadrant shading
    ctx.fillStyle = 'rgba(113,166,210,0.08)';
    ctx.fillRect(x0, y0 - plotH, plotW, plotH);

    function fval(fname, thRad) {
        if (fname === "sine") return Math.sin(thRad);
        if (fname === "cosine") return Math.cos(thRad);
        if (fname === "tangent") return Math.tan(thRad);
        if (fname === "secant") return 1 / Math.cos(thRad);
        if (fname === "cotangent") return Math.cos(thRad) / Math.sin(thRad);
        if (fname === "cosecant") return 1 / Math.sin(thRad);
        return 0;
    }

    var colors = { "sine": '#c44536', "cosine": '#2e7d64', "tangent": '#8e44ad', "secant": '#1e3a8a', "cotangent": '#8e44ad', "cosecant": '#1e3a8a' };

    // draw curves
    for (var fi = 0; fi < funcs.length; fi++) {
        var fname = funcs[fi];
        ctx.beginPath();
        ctx.strokeStyle = colors[fname];
        ctx.lineWidth = 2.5;
        var started = false;
        for (var deg = 0; deg <= 90; deg += 0.5) {
            var val = fval(fname, deg * Math.PI / 180);
            if (isNaN(val) || !isFinite(val) || val < 0 || val > ymax) {
                started = false;
                continue;
            }
            var xp = x0 + (deg / 90) * plotW;
            var yp = y0 - (val / ymax) * plotH;
            if (!started) {
                ctx.moveTo(xp, yp);
                started = true;
            } else {
                ctx.lineTo(xp, yp);
            }
        }
        ctx.stroke();
    }

    // dashed guide lines for the point
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    var xp2 = x0 + (o.thetaDeg / 90) * plotW;
    ctx.strokeStyle = '#9aa7ad';
    ctx.beginPath();
    ctx.moveTo(xp2, y0);
    ctx.lineTo(xp2, y0 - plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // point markers
    var dotR = Math.max(4, w / 150);
    for (var pj = 0; pj < funcs.length; pj++) {
        var pname = funcs[pj];
        var pval = fval(pname, th);
        if (isNaN(pval) || !isFinite(pval)) continue;
        var offTop = (pval < 0 || pval > ymax);
        var pyp = y0 - (pval / ymax) * plotH;
        if (pyp < marginY * 0.6) pyp = marginY * 0.6;
        if (pyp > y0 - dotR) pyp = y0 - dotR;
        ctx.beginPath();
        ctx.arc(xp2, pyp, dotR, 0, 2 * Math.PI);
        ctx.fillStyle = colors[pname];
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = "bold " + fontSize + "px 'Segoe UI', 'Roboto'";
        ctx.fillStyle = colors[pname];
        ctx.textAlign = 'left';
        var label = pname + "(θ) = " + pval.toFixed(2);
        if (offTop) label = pname + "(θ) ↑";
        var lx = xp2 + 6;
        if (lx + fontSize * label.length * 0.5 > w - marginX * 0.5) lx = xp2 - 6 - fontSize * label.length * 0.5;
        var ly = pyp - 8;
        if (ly < marginY * 0.4) ly = pyp + 14;
        ctx.fillText(label, lx, ly);
    }

    ctx.textAlign = 'left';
    ctx.font = "bold " + (fontSize - 1) + "px 'Segoe UI', 'Roboto'";
    ctx.fillStyle = '#2c5a6e';
    var legend = funcs.map(function(f) { return f; }).join(", ");
    ctx.fillText("f(θ): " + legend, x0 + 6, marginY * 0.55);
};

window.localSelect9ebb.handleResize = function() {
    if (window.localSelect9ebb.resizeTimeout) clearTimeout(window.localSelect9ebb.resizeTimeout);
    window.localSelect9ebb.resizeTimeout = setTimeout(function() {
        window.localSelect9ebb.drawCircle();
        window.localSelect9ebb.drawChart();
    }, 100);
};

window.localSelect9ebb.init = function() {
    var o = window.localSelect9ebb;

    o.circleCanvas = document.getElementById('circleCanvas9ebb');
    if (o.circleCanvas) o.circleCtx = o.circleCanvas.getContext('2d');
    o.chartCanvas = document.getElementById('chartCanvas9ebb');
    if (o.chartCanvas) o.chartCtx = o.chartCanvas.getContext('2d');

    o.thetaInput = document.getElementById('thetaInput9ebb');
    o.thetaRange = document.getElementById('thetaRange9ebb');
    o.identityText = document.getElementById('identityText9ebb');
    o.numericProof = document.getElementById('numericProof9ebb');
    o.titleFunc = document.getElementById('titleFunc9ebb');
    o.titleRel = document.getElementById('titleRel9ebb');
    o.funcTabs = document.getElementById('funcTabs9ebb');
    o.relTabs = document.getElementById('relTabs9ebb');

    o.thetaDeg = 30;

    if (o.thetaRange) {
        o.thetaRange.min = o.MIN_THETA;
        o.thetaRange.max = o.getMaxTheta();
    }
    if (o.thetaInput) {
        o.thetaInput.min = o.MIN_THETA;
        o.thetaInput.max = o.getMaxTheta();
    }

    if (o.thetaInput) {
        o.thetaInput.addEventListener('input', function(e) { o.onThetaChange(e.target.value); });
        o.thetaInput.addEventListener('change', function(e) { o.onThetaChange(e.target.value); });
    }
    if (o.thetaRange) {
        o.thetaRange.addEventListener('input', function(e) { o.onThetaChange(e.target.value); });
    }

    // mode tabs
    var modeButtons = document.querySelectorAll('.mode-tab-9ebb');
    for (var mi = 0; mi < modeButtons.length; mi++) {
        (function(btn) {
            btn.addEventListener('click', function() {
                var mode = btn.getAttribute('data-mode');
                var all = document.querySelectorAll('.mode-tab-9ebb');
                for (var aj = 0; aj < all.length; aj++) all[aj].classList.remove('active');
                btn.classList.add('active');
                o.onModeChange(mode);
            });
        })(modeButtons[mi]);
    }

    // function tabs
    var funcButtons = document.querySelectorAll('.func-tab-9ebb');
    for (var fi = 0; fi < funcButtons.length; fi++) {
        (function(btn) {
            btn.addEventListener('click', function() {
                var f = btn.getAttribute('data-func');
                var all = document.querySelectorAll('.func-tab-9ebb');
                for (var aj = 0; aj < all.length; aj++) all[aj].classList.remove('active');
                btn.classList.add('active');
                o.onFuncChange(f);
            });
        })(funcButtons[fi]);
    }

    // relationship tabs
    var relButtons = document.querySelectorAll('.rel-tab-9ebb');
    for (var ri = 0; ri < relButtons.length; ri++) {
        (function(btn) {
            btn.addEventListener('click', function() {
                var r = btn.getAttribute('data-rel');
                var all = document.querySelectorAll('.rel-tab-9ebb');
                for (var aj = 0; aj < all.length; aj++) all[aj].classList.remove('active');
                btn.classList.add('active');
                o.onRelChange(r);
            });
        })(relButtons[ri]);
    }

    window.addEventListener('resize', o.handleResize);
    if (o.circleCanvas && o.circleCanvas.parentElement) {
        o.circleObserver = new ResizeObserver(function() { o.drawCircle(); });
        o.circleObserver.observe(o.circleCanvas.parentElement);
    }
    if (o.chartCanvas && o.chartCanvas.parentElement) {
        o.chartObserver = new ResizeObserver(function() { o.drawChart(); });
        o.chartObserver.observe(o.chartCanvas.parentElement);
    }

    o.syncUIFromState();
    setTimeout(function() {
        o.drawCircle();
        o.drawChart();
    }, 20);
};

function htLoadContent() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (window.localSelect9ebb && window.localSelect9ebb.init) {
                window.localSelect9ebb.init();
            }
        });
    } else {
        if (window.localSelect9ebb && window.localSelect9ebb.init) {
            window.localSelect9ebb.init();
        }
    }
}
