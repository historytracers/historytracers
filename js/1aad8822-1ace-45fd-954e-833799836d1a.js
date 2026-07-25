// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();
    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);
    htSetImageSrc("abacus", "images/BritishMuseum/289044001.jpg");
    htSchyotyLoadContent();
    return false;
}

// ----- Horizontal Schyoty (счёты) Abacus Controller -----
var localSchyotyController = {};

localSchyotyController.ROWS = 9;
localSchyotyController.BEADS_PER_ROW = 10;

function htSchyotyInitState() {
    localSchyotyController.state = [];
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        localSchyotyController.state.push(0);
    }
}

function htSchyotyComputeLayout() {
    const cvs = localSchyotyController.canvas;
    localSchyotyController.W = cvs.width;
    localSchyotyController.H = cvs.height;

    const M = { top: 16, bottom: 14, left: 14, right: 14 };
    localSchyotyController.M = M;

    localSchyotyController.wireL = M.left;
    localSchyotyController.wireR = localSchyotyController.W - M.right;
    const wireLen = localSchyotyController.wireR - localSchyotyController.wireL;

    const areaH = localSchyotyController.H - M.top - M.bottom;
    const rowSp = areaH / (localSchyotyController.ROWS + 1);
    localSchyotyController.rowSp = rowSp;

    localSchyotyController.rowY = [];
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        localSchyotyController.rowY.push(M.top + rowSp * (localSchyotyController.ROWS - r));
    }

    let rMax = Math.min(wireLen / (localSchyotyController.BEADS_PER_ROW * 2.6), rowSp * 0.38, 15);
    rMax = Math.max(rMax, 7);
    localSchyotyController.beadR = rMax;
    localSchyotyController.beadGap = rMax * 0.3;
    localSchyotyController.beadStep = rMax * 2 + localSchyotyController.beadGap;

    localSchyotyController.activeX0 = localSchyotyController.wireL + rMax;
    localSchyotyController.inactiveX0 = localSchyotyController.wireR - rMax;
}

function htSchyotyTotalValue() {
    let v = 0;
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        v += localSchyotyController.state[r] * Math.pow(10, r);
    }
    return v;
}

function htSchyotyUpdateDisplay() {
    const sp = document.getElementById('schyotyValue');
    if (sp) sp.innerText = htSchyotyTotalValue().toString();

    const cmp = document.getElementById('schyotyCMP');
    if (cmp) {
        const val = htSchyotyTotalValue();
        const sv = document.getElementById('schyotySuccess');
        if (sv) {
            if (val.toString() === cmp.innerText.trim()) {
                sv.style.display = 'inline'; sv.style.visibility = 'visible';
                if (localSchyotyController.currentTargetLevel === localSchyotyController.ROWS - 1) {
                    const fb = document.getElementById('feedbackArea');
                    const msg = document.getElementById('txt_finalLevelMessage');
                    if (fb && msg) fb.innerHTML = '<div class="congrats">' + msg.innerHTML + '</div>';
                }
            } else {
                sv.style.display = 'none'; sv.style.visibility = 'hidden';
            }
        }
    }
}

function htSchyotyRender() {
    const ctx = localSchyotyController.ctx;
    if (!ctx) return;
    const W = localSchyotyController.W;
    const H = localSchyotyController.H;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#fef5e0';
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 9);
        ctx.lineTo(W, i * 9 + 3);
        ctx.strokeStyle = '#c8b280';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = '#b48b5a';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.strokeStyle = '#f9eec7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5, 5, W - 10, H - 10);

    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        htSchyotyDrawRow(r, ctx);
    }
}

function htSchyotyDrawRow(r, ctx) {
    const y = localSchyotyController.rowY[r];

    ctx.beginPath();
    ctx.moveTo(localSchyotyController.wireL, y);
    ctx.lineTo(localSchyotyController.wireR, y);
    ctx.strokeStyle = '#b08054';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#e9c48b';
    ctx.lineWidth = 1;
    ctx.stroke();

    const cnt = localSchyotyController.state[r];

    for (let p = 0; p < cnt; p++) {
        const x = localSchyotyController.activeX0 + p * localSchyotyController.beadStep;
        htSchyotyDrawBead(ctx, x, y, true);
    }

    for (let p = 0; p < localSchyotyController.BEADS_PER_ROW - cnt; p++) {
        const x = localSchyotyController.inactiveX0 - p * localSchyotyController.beadStep;
        htSchyotyDrawBead(ctx, x, y, false);
    }

    ctx.fillStyle = '#3a2a1a';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(cnt.toString(), localSchyotyController.wireL + 3, y - localSchyotyController.rowSp * 0.28);
}

function htSchyotyDrawBead(ctx, x, y, active) {
    const r = localSchyotyController.beadR;
    ctx.shadowBlur = active ? 3 : 1;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';

    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    if (active) {
        grad.addColorStop(0, '#f5c860');
        grad.addColorStop(1, '#b08030');
    } else {
        grad.addColorStop(0, '#d4bc98');
        grad.addColorStop(1, '#8a7050');
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = active ? '#6a4a1a' : '#5a4030';
    ctx.lineWidth = active ? 1.5 : 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = active ? 'rgba(255,235,190,0.6)' : 'rgba(240,225,205,0.35)';
    ctx.fill();
}

function htSchyotyHitTest(mx, my) {
    const r = localSchyotyController.beadR;
    for (let row = 0; row < localSchyotyController.ROWS; row++) {
        const y = localSchyotyController.rowY[row];
        if (Math.abs(my - y) > r + 10) continue;

        const cnt = localSchyotyController.state[row];

        for (let p = 0; p < cnt; p++) {
            const x = localSchyotyController.activeX0 + p * localSchyotyController.beadStep;
            if (Math.abs(mx - x) < r + 5) return { row, pos: p, side: 'active' };
        }

        for (let p = 0; p < localSchyotyController.BEADS_PER_ROW - cnt; p++) {
            const x = localSchyotyController.inactiveX0 - p * localSchyotyController.beadStep;
            if (Math.abs(mx - x) < r + 5) return { row, pos: p, side: 'inactive' };
        }
    }
    return null;
}

function htSchyotyToggle(hit) {
    const cnt = localSchyotyController.state[hit.row];
    if (hit.side === 'active') {
        localSchyotyController.state[hit.row] = hit.pos;
    } else {
        localSchyotyController.state[hit.row] = localSchyotyController.BEADS_PER_ROW - hit.pos;
    }
    htSchyotyRender();
    htSchyotyUpdateDisplay();
}

function htSchyotyReset() {
    for (let r = 0; r < localSchyotyController.ROWS; r++) {
        localSchyotyController.state[r] = 0;
    }
    const fb = document.getElementById('feedbackArea');
    if (fb) fb.innerHTML = '';
    const cmp = document.getElementById('schyotyCMP');
    if (cmp) {
        const sv = document.getElementById('schyotySuccess');
        if (sv) { sv.style.display = 'none'; sv.style.visibility = 'hidden'; }
        htSchyotyFillGame();
    }
    htSchyotyRender();
    htSchyotyUpdateDisplay();
}

function htSchyotyFillGame() {
    const cmp = document.getElementById('schyotyCMP');
    if (!cmp) return;

    const sv = document.getElementById('schyotySuccess');
    if (sv) { sv.style.display = 'none'; sv.style.visibility = 'hidden'; }

    const lvl = localSchyotyController.gameLvl || 0;
    localSchyotyController.currentTargetLevel = lvl;
    const minV = Math.pow(10, lvl);
    const maxV = Math.pow(10, lvl + 1) - 1;
    cmp.innerText = Math.floor(Math.random() * (maxV - minV + 1)) + minV;

    localSchyotyController.gameLvl = lvl + 1;
    if (localSchyotyController.gameLvl >= localSchyotyController.ROWS) localSchyotyController.gameLvl = 0;
}

function htSchyotyHandleClick(e) {
    const cvs = localSchyotyController.canvas;
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
    const hit = htSchyotyHitTest((cx - rect.left) * sx, (cy - rect.top) * sy);
    if (hit) htSchyotyToggle(hit);
}

function htSchyotyBindEvents() {
    const cvs = localSchyotyController.canvas;
    if (!cvs) return;
    cvs.addEventListener('click', htSchyotyHandleClick);
    cvs.addEventListener('touchstart', htSchyotyHandleClick, { passive: false });

    const rb = document.getElementById('schyotyResetBtn');
    if (rb) rb.addEventListener('click', htSchyotyReset);

    window.addEventListener('resize', function () {
        htSchyotyComputeLayout();
        htSchyotyRender();
    });
}

function htSchyotyInit() {
    localSchyotyController.currentTargetLevel = 0;
    localSchyotyController.canvas = document.getElementById('schyotyCanvas');
    if (!localSchyotyController.canvas) return;
    localSchyotyController.ctx = localSchyotyController.canvas.getContext('2d');
    if (!localSchyotyController.ctx) return;

    const cols = document.getElementById('schyotyCols');
    if (cols) {
        const v = parseInt(cols.innerText);
        if (!isNaN(v) && v > 0) localSchyotyController.ROWS = Math.min(v, 12);
    }

    htSchyotyInitState();
    htSchyotyComputeLayout();
    htSchyotyBindEvents();
    htSchyotyRender();
    htSchyotyFillGame();
    htSchyotyUpdateDisplay();
}

function htSchyotyLoadContent() {
    localSchyotyController.gameLvl = 0;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', htSchyotyInit);
    } else {
        htSchyotyInit();
    }
}
