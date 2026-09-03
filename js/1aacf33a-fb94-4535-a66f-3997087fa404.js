// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();
    htRomanAbacusLoadContent();
    return false;
}

// ----- Roman Abacus Controller -----
var localRomanAbacusController = {};

localRomanAbacusController.SYMBOLS = ["M", "D", "C", "L", "X", "V", "I"];
localRomanAbacusController.VALUES = [1000, 500, 100, 50, 10, 5, 1];
localRomanAbacusController.CAPS = [4, 1, 4, 1, 4, 1, 4];
localRomanAbacusController.LEVELS = 4;

function htRomanAbacusInitState() {
    localRomanAbacusController.state = [];
    for (let c = 0; c < localRomanAbacusController.SYMBOLS.length; c++) {
        localRomanAbacusController.state.push(0);
    }
}

function htRomanAbacusComputeValue() {
    let value = 0;
    for (let c = 0; c < localRomanAbacusController.state.length; c++) {
        value += localRomanAbacusController.state[c] * localRomanAbacusController.VALUES[c];
    }
    return value;
}

function htRomanAbacusComputeRoman() {
    let roman = "";
    for (let c = 0; c < localRomanAbacusController.state.length; c++) {
        for (let k = 0; k < localRomanAbacusController.state[c]; k++) {
            roman += localRomanAbacusController.SYMBOLS[c];
        }
    }
    return roman;
}

function htRomanAbacusComputeLayout() {
    const cvs = localRomanAbacusController.canvas;
    localRomanAbacusController.W = cvs.width;
    localRomanAbacusController.H = cvs.height;

    const M = { top: 52, bottom: 14, left: 12, right: 12 };
    localRomanAbacusController.M = M;

    const colW = (localRomanAbacusController.W - M.left - M.right) / localRomanAbacusController.SYMBOLS.length;
    localRomanAbacusController.colW = colW;

    localRomanAbacusController.colX = [];
    for (let c = 0; c < localRomanAbacusController.SYMBOLS.length; c++) {
        localRomanAbacusController.colX.push(M.left + colW * (c + 0.5));
    }

    const slotTop = M.top;
    const slotBottom = localRomanAbacusController.H - M.bottom;
    const slotArea = slotBottom - slotTop;
    const maxCap = Math.max.apply(null, localRomanAbacusController.CAPS);
    localRomanAbacusController.beadR = slotArea / (2 * maxCap);

    localRomanAbacusController.groove = [];
    for (let c = 0; c < localRomanAbacusController.SYMBOLS.length; c++) {
        const h = slotArea * localRomanAbacusController.CAPS[c] / maxCap;
        localRomanAbacusController.groove.push({
            top: slotTop + (slotArea - h) / 2,
            h: h
        });
    }
}

function htRomanAbacusDrawBead(ctx, x, y, r, active) {
    const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    if (active) {
        grad.addColorStop(0, '#ffe2a0');
        grad.addColorStop(1, '#b57b2c');
    } else {
        grad.addColorStop(0, '#d9c9a3');
        grad.addColorStop(1, '#8b7752');
    }

    ctx.beginPath();
    ctx.arc(x, y, r - 0.75, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = active ? '#6e4a15' : '#5f4c30';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = active ? 'rgba(255, 250, 225, 0.75)' : 'rgba(255, 250, 225, 0.4)';
    ctx.fill();
}

function htRomanAbacusDrawColumn(c, ctx) {
    const g = localRomanAbacusController;
    const cx = g.colX[c];
    const gro = g.groove[c];
    const n = g.CAPS[c];
    const a = g.state[c];
    const step = gro.h / n;

    for (let k = 0; k < n; k++) {
        const y = gro.top + g.beadR + k * step;
        htRomanAbacusDrawBead(ctx, cx, y, g.beadR, k < a);
    }
}

function htRomanAbacusDrawGroove(c, ctx) {
    const g = localRomanAbacusController;
    const gro = g.groove[c];
    const w = g.colW * 0.6;
    const x = g.colX[c] - w / 2;

    ctx.beginPath();
    ctx.rect(x, gro.top, w, gro.h);
    ctx.fillStyle = 'rgba(122, 90, 55, 0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(90, 62, 30, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

function htRomanAbacusDrawLabel(c, ctx) {
    const g = localRomanAbacusController;
    const x = g.colX[c];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 18px Georgia, "Times New Roman", serif';
    ctx.fillStyle = '#40280f';
    ctx.fillText(g.SYMBOLS[c], x, 20);
    ctx.font = '10px Verdana, sans-serif';
    ctx.fillStyle = '#7c5a2c';
    ctx.fillText(g.VALUES[c].toString(), x, 38);
}

function htRomanAbacusRender() {
    const ctx = localRomanAbacusController.ctx;
    if (!ctx) return;
    const W = localRomanAbacusController.W;
    const H = localRomanAbacusController.H;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#efe1bd';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#6d451f';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.strokeStyle = '#c9a05f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, W - 12, H - 12);

    for (let c = 0; c < localRomanAbacusController.SYMBOLS.length; c++) {
        htRomanAbacusDrawLabel(c, ctx);
    }
    for (let c = 0; c < localRomanAbacusController.SYMBOLS.length; c++) {
        htRomanAbacusDrawGroove(c, ctx);
    }
    for (let c = 0; c < localRomanAbacusController.SYMBOLS.length; c++) {
        htRomanAbacusDrawColumn(c, ctx);
    }
}

function htRomanAbacusHitTest(mx, my) {
    const g = localRomanAbacusController;
    for (let c = 0; c < g.SYMBOLS.length; c++) {
        if (Math.abs(mx - g.colX[c]) > g.colW * 0.45) continue;
        const gro = g.groove[c];
        const n = g.CAPS[c];
        if (my < gro.top || my > gro.top + gro.h) continue;
        const step = gro.h / n;
        let k = Math.floor((my - gro.top) / step);
        if (k < 0) k = 0;
        if (k >= n) k = n - 1;
        return { col: c, k: k };
    }
    return null;
}

function htRomanAbacusToggle(col, k) {
    const n = localRomanAbacusController.CAPS[col];
    const a = localRomanAbacusController.state[col];
    if (k < a) {
        localRomanAbacusController.state[col] = k;
    } else {
        localRomanAbacusController.state[col] = Math.min(n, k + 1);
    }
    htRomanAbacusRender();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusHideSuccess() {
    const sv = document.getElementById('romanAbacusSuccess');
    if (sv) {
        sv.style.display = 'none';
        sv.style.visibility = 'hidden';
    }
}

function htRomanAbacusFillGame() {
    const cmp = document.getElementById('romanAbacusCMP');
    if (!cmp) return;

    htRomanAbacusHideSuccess();

    const lvl = localRomanAbacusController.gameLvl || 0;
    localRomanAbacusController.currentTargetLevel = lvl;

    const minV = [1, 10, 100, 1000][lvl];
    const maxV = [9, 99, 999, 3999][lvl];
    cmp.innerText = (Math.floor(Math.random() * (maxV - minV + 1)) + minV).toString();

    localRomanAbacusController.gameLvl = lvl + 1;
    if (localRomanAbacusController.gameLvl >= localRomanAbacusController.LEVELS) {
        localRomanAbacusController.gameLvl = 0;
    }
}

function htRomanAbacusUpdateDisplay() {
    const val = htRomanAbacusComputeValue();

    const vEl = document.getElementById('romanAbacusValue');
    if (vEl) vEl.innerText = val.toString();

    const rEl = document.getElementById('romanAbacusRoman');
    if (rEl) rEl.innerText = htRomanAbacusComputeRoman();

    const cmp = document.getElementById('romanAbacusCMP');
    const sv = document.getElementById('romanAbacusSuccess');
    if (cmp && sv) {
        if (cmp.innerText.trim() === val.toString()) {
            sv.style.display = 'inline-block';
            sv.style.visibility = 'visible';
            if (localRomanAbacusController.currentTargetLevel === localRomanAbacusController.LEVELS - 1) {
                const fb = document.getElementById('romanAbacusFeedback');
                const msg = document.getElementById('txt_romanAbacusFinalMessage');
                if (fb && msg) fb.innerHTML = '<div class="roman-abacus-congrats">' + msg.innerHTML + '</div>';
            }
        } else {
            htRomanAbacusHideSuccess();
        }
    }
}

function htRomanAbacusReset() {
    for (let c = 0; c < localRomanAbacusController.SYMBOLS.length; c++) {
        localRomanAbacusController.state[c] = 0;
    }
    const fb = document.getElementById('romanAbacusFeedback');
    if (fb) fb.innerHTML = '';
    htRomanAbacusFillGame();
    htRomanAbacusRender();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusHandleClick(e) {
    const cvs = localRomanAbacusController.canvas;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const sx = cvs.width / rect.width;
    const sy = cvs.height / rect.height;
    let cx, cy;
    if (e.touches) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
        e.preventDefault();
    } else {
        cx = e.clientX;
        cy = e.clientY;
    }
    const hit = htRomanAbacusHitTest((cx - rect.left) * sx, (cy - rect.top) * sy);
    if (hit) htRomanAbacusToggle(hit.col, hit.k);
}

function htRomanAbacusBindEvents() {
    const cvs = localRomanAbacusController.canvas;
    if (!cvs) return;
    cvs.addEventListener('click', htRomanAbacusHandleClick);
    cvs.addEventListener('touchstart', htRomanAbacusHandleClick, { passive: false });

    const rb = document.getElementById('romanAbacusResetBtn');
    if (rb) rb.addEventListener('click', htRomanAbacusReset);

    window.addEventListener('resize', function () {
        htRomanAbacusComputeLayout();
        htRomanAbacusRender();
    });
}

function htRomanAbacusInit() {
    localRomanAbacusController.currentTargetLevel = 0;
    localRomanAbacusController.canvas = document.getElementById('romanAbacusCanvas');
    if (!localRomanAbacusController.canvas) return;
    localRomanAbacusController.ctx = localRomanAbacusController.canvas.getContext('2d');
    if (!localRomanAbacusController.ctx) return;

    htRomanAbacusInitState();
    htRomanAbacusComputeLayout();
    htRomanAbacusBindEvents();
    htRomanAbacusRender();
    htRomanAbacusFillGame();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusLoadContent() {
    localRomanAbacusController.gameLvl = 0;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', htRomanAbacusInit);
    } else {
        htRomanAbacusInit();
    }
}
