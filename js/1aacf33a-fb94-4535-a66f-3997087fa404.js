// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();
    htRomanAbacusLoadContent();
    return false;
}

// ----- Roman Abacus Controller (Soroban-shaped archaeological layout) -----
var localRomanAbacusController = {};

localRomanAbacusController.HEADINGS = ["(((I)))", "((I))", "(I)", "C", "X", "I"];
localRomanAbacusController.PLACES = [100000, 10000, 1000, 100, 10, 1];
localRomanAbacusController.LEVELS = 6;

function htRomanAbacusInitState() {
    localRomanAbacusController.state = [];
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        localRomanAbacusController.state.push({ upper: 0, lower: 0 });
    }
}

function htRomanAbacusColumnValue(c) {
    const col = localRomanAbacusController.state[c];
    return (col.upper * 5 + col.lower) * localRomanAbacusController.PLACES[c];
}

function htRomanAbacusComputeValue() {
    let value = 0;
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        value += htRomanAbacusColumnValue(c);
    }
    return value;
}

function htRomanAbacusRomanOf(n) {
    if (n <= 0) return "";
    const table = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
                   [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
                   [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    let roman = "";
    let rest = n;
    for (let i = 0; i < table.length; i++) {
        while (rest >= table[i][0]) {
            roman += table[i][1];
            rest -= table[i][0];
        }
    }
    return roman;
}

function htRomanAbacusRomanHTML(value) {
    if (value <= 0) return "";
    const upper = Math.floor(value / 1000);
    const lower = value % 1000;
    let html = "";
    if (upper > 0) {
        html += '<span class="roman-abacus-overline">' + htRomanAbacusRomanOf(upper) + '</span>';
    }
    if (lower > 0) {
        html += htRomanAbacusRomanOf(lower);
    }
    return html;
}

function htRomanAbacusComputeLayout() {
    const cvs = localRomanAbacusController.canvas;
    localRomanAbacusController.canvasWidth = cvs.width;
    localRomanAbacusController.canvasHeight = cvs.height;

    const horizontalMargin = 24;
    const totalColSpace = localRomanAbacusController.canvasWidth - (horizontalMargin * 2);
    localRomanAbacusController.colWidth = totalColSpace / localRomanAbacusController.HEADINGS.length;
    localRomanAbacusController.startX = horizontalMargin + localRomanAbacusController.colWidth / 2;

    localRomanAbacusController.decimalTrackY = localRomanAbacusController.canvasHeight * 0.5;
    localRomanAbacusController.decimalTrackTop = localRomanAbacusController.decimalTrackY - 30;
    localRomanAbacusController.decimalTrackBottom = localRomanAbacusController.decimalTrackY + 30;
    localRomanAbacusController.barY = localRomanAbacusController.decimalTrackY;

    const upperMax = 1;
    const lowerMax = 4;
    const verticalStep = 26;

    const upperBaseActive = localRomanAbacusController.decimalTrackTop - 8;
    const upperStartInactive = localRomanAbacusController.decimalTrackTop - 52;
    localRomanAbacusController.upperPositions = [];
    for (let i = 0; i < upperMax; i++) {
        let activeY = upperBaseActive - (i * verticalStep);
        let inactiveY = upperStartInactive - (i * verticalStep * 0.8);
        if (inactiveY < 20) inactiveY = 20 + i * 5;
        localRomanAbacusController.upperPositions.push({ activeY: activeY, inactiveY: inactiveY });
    }

    const lowerBaseActive = localRomanAbacusController.decimalTrackBottom + 8;
    const lowerInactiveDrop = 30;
    localRomanAbacusController.lowerPositions = [];
    for (let i = 0; i < lowerMax; i++) {
        let activeY = lowerBaseActive + (i * verticalStep);
        let inactiveY = activeY + lowerInactiveDrop;
        localRomanAbacusController.lowerPositions.push({ activeY: activeY, inactiveY: inactiveY });
    }

    let maxRadiusByWidth = localRomanAbacusController.colWidth * 0.38;
    let maxRadiusByVertical = verticalStep * 0.45;
    localRomanAbacusController.ballRadius = Math.min(maxRadiusByWidth, maxRadiusByVertical, 13);
    localRomanAbacusController.ballRadius = Math.max(localRomanAbacusController.ballRadius, 9);
}

function htRomanAbacusDrawTrack() {
    const ctx = localRomanAbacusController.ctx;
    ctx.fillStyle = "#dac894";
    ctx.globalAlpha = 0.4;
    ctx.fillRect(6, localRomanAbacusController.decimalTrackTop,
                 localRomanAbacusController.canvasWidth - 12,
                 localRomanAbacusController.decimalTrackBottom - localRomanAbacusController.decimalTrackTop);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#b59762";
    ctx.lineWidth = 2;
    ctx.strokeRect(7, localRomanAbacusController.decimalTrackTop + 2,
                   localRomanAbacusController.canvasWidth - 14,
                   (localRomanAbacusController.decimalTrackBottom - localRomanAbacusController.decimalTrackTop) - 4);

    ctx.fillStyle = '#c9a86b';
    ctx.fillRect(5, localRomanAbacusController.barY - 6, localRomanAbacusController.canvasWidth - 10, 12);
    ctx.fillStyle = '#e5c28e';
    ctx.fillRect(5, localRomanAbacusController.barY - 4, localRomanAbacusController.canvasWidth - 10, 8);
    ctx.fillStyle = '#f5e2b0';
    ctx.fillRect(5, localRomanAbacusController.barY - 2, localRomanAbacusController.canvasWidth - 10, 4);
}

function htRomanAbacusDrawColumn(idx) {
    const ctx = localRomanAbacusController.ctx;
    const x = localRomanAbacusController.startX + idx * localRomanAbacusController.colWidth;
    const col = localRomanAbacusController.state[idx];
    const lowerCount = col.lower;
    const upperCount = col.upper;

    ctx.beginPath();
    ctx.moveTo(x, 78);
    ctx.lineTo(x, localRomanAbacusController.canvasHeight - 28);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#b08054';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 1, 76);
    ctx.lineTo(x - 1, localRomanAbacusController.canvasHeight - 26);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#e9c48b';
    ctx.stroke();

    for (let u = 0; u < 1; u++) {
        const isActive = (u < upperCount);
        const pos = localRomanAbacusController.upperPositions[u];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        let gradUp = ctx.createRadialGradient(x - 4, beadY - 3, 3, x, beadY, localRomanAbacusController.ballRadius);
        gradUp.addColorStop(0, '#f06a50');
        gradUp.addColorStop(1, '#c03a28');
        ctx.beginPath();
        ctx.arc(x, beadY, localRomanAbacusController.ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradUp;
        ctx.fill();
        ctx.strokeStyle = '#4a2018';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 3, beadY - 3, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffead4';
        ctx.fill();
    }

    for (let b = 0; b < 4; b++) {
        const isActive = (b < lowerCount);
        const pos = localRomanAbacusController.lowerPositions[b];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        let gradLow = ctx.createLinearGradient(x - 5, beadY - 4, x + 5, beadY + 4);
        gradLow.addColorStop(0, '#7da0ae');
        gradLow.addColorStop(1, '#3a6068');
        ctx.beginPath();
        ctx.arc(x, beadY, localRomanAbacusController.ballRadius - 0.5, 0, Math.PI * 2);
        ctx.fillStyle = gradLow;
        ctx.fill();
        ctx.strokeStyle = '#1a3a3a';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 2.5, beadY - 2.5, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#c8e2ec';
        ctx.fill();
    }
}

function htRomanAbacusDrawLabels() {
    const ctx = localRomanAbacusController.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        const x = localRomanAbacusController.startX + c * localRomanAbacusController.colWidth;
        ctx.font = 'bold 16px Georgia, "Times New Roman", serif';
        ctx.fillStyle = '#40280f';
        ctx.fillText(localRomanAbacusController.HEADINGS[c], x, 36);
        ctx.font = '10px Verdana, sans-serif';
        ctx.fillStyle = '#7a4a24';
        ctx.fillText(localRomanAbacusController.PLACES[c].toString(), x, 56);
    }
}

function htRomanAbacusDrawFrame() {
    const ctx = localRomanAbacusController.ctx;
    ctx.strokeStyle = '#f9eec7';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(5, 5, localRomanAbacusController.canvasWidth - 10, localRomanAbacusController.canvasHeight - 10);
    ctx.strokeStyle = '#b48b5a';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(3, 3, localRomanAbacusController.canvasWidth - 6, localRomanAbacusController.canvasHeight - 6);
}

function htRomanAbacusRender() {
    const ctx = localRomanAbacusController.ctx;
    if (!ctx) return;
    const W = localRomanAbacusController.canvasWidth;
    const H = localRomanAbacusController.canvasHeight;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fef5e0';
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 8);
        ctx.lineTo(W, i * 8 + 3);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#c8b280';
        ctx.stroke();
    }
    ctx.globalAlpha = 1;

    htRomanAbacusDrawTrack();
    htRomanAbacusDrawLabels();
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        htRomanAbacusDrawColumn(c);
    }
    htRomanAbacusDrawFrame();
}

function htRomanAbacusGetHitRegion(mouseX, mouseY) {
    let colIdx = -1;
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        const centerX = localRomanAbacusController.startX + c * localRomanAbacusController.colWidth;
        if (Math.abs(mouseX - centerX) < localRomanAbacusController.colWidth * 0.45) {
            colIdx = c;
            break;
        }
    }
    if (colIdx === -1) return null;

    const col = localRomanAbacusController.state[colIdx];
    const centerX = localRomanAbacusController.startX + colIdx * localRomanAbacusController.colWidth;
    const radius = localRomanAbacusController.ballRadius;

    for (let u = 0; u < 1; u++) {
        const pos = localRomanAbacusController.upperPositions[u];
        if (!pos) continue;
        const beadY = (u < col.upper) ? pos.activeY : pos.inactiveY;
        if (Math.abs(mouseY - beadY) < radius + 8 && Math.hypot(mouseX - centerX, mouseY - beadY) < radius + 6) {
            if (mouseY < localRomanAbacusController.decimalTrackTop - 2) {
                return { type: 'upper', col: colIdx, beadIdx: u };
            }
        }
    }

    for (let b = 0; b < 4; b++) {
        const pos = localRomanAbacusController.lowerPositions[b];
        if (!pos) continue;
        const beadY = (b < col.lower) ? pos.activeY : pos.inactiveY;
        if (Math.abs(mouseY - beadY) < radius + 8 && Math.hypot(mouseX - centerX, mouseY - beadY) < radius + 6) {
            if (mouseY > localRomanAbacusController.decimalTrackBottom + 2) {
                return { type: 'lower', col: colIdx, beadIdx: b };
            }
        }
    }
    return null;
}

function htRomanAbacusToggleUpper(col, beadIdx) {
    const colState = localRomanAbacusController.state[col];
    const currentUpper = colState.upper;
    if (beadIdx < currentUpper) {
        colState.upper = beadIdx;
    } else {
        colState.upper = beadIdx + 1;
    }
    if (colState.upper > 1) colState.upper = 1;
    if (colState.upper < 0) colState.upper = 0;
    htRomanAbacusRender();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusHandleLowerClick(col, beadIdx) {
    const colState = localRomanAbacusController.state[col];
    const currentLower = colState.lower;
    const isActive = (beadIdx < currentLower);
    if (isActive) {
        let newLower = beadIdx;
        if (newLower < 0) newLower = 0;
        colState.lower = newLower;
    } else {
        let newLower = beadIdx + 1;
        if (newLower > 4) newLower = 4;
        colState.lower = newLower;
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

    const minV = [1, 10, 100, 1000, 10000, 100000][lvl];
    const maxV = [9, 99, 999, 9999, 99999, 999999][lvl];
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
    if (rEl) rEl.innerHTML = htRomanAbacusRomanHTML(val);

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
    for (let c = 0; c < localRomanAbacusController.HEADINGS.length; c++) {
        localRomanAbacusController.state[c].upper = 0;
        localRomanAbacusController.state[c].lower = 0;
    }
    const fb = document.getElementById('romanAbacusFeedback');
    if (fb) fb.innerHTML = '';
    htRomanAbacusFillGame();
    htRomanAbacusRender();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusHandleCanvasStart(e) {
    const cvs = localRomanAbacusController.canvas;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    const hit = htRomanAbacusGetHitRegion(canvasX, canvasY);
    if (!hit) return;
    if (hit.type === 'upper') htRomanAbacusToggleUpper(hit.col, hit.beadIdx);
    else if (hit.type === 'lower') htRomanAbacusHandleLowerClick(hit.col, hit.beadIdx);
}

function htRomanAbacusAttachEvents() {
    const cvs = localRomanAbacusController.canvas;
    if (!cvs) return;
    cvs.addEventListener('mousedown', htRomanAbacusHandleCanvasStart);
    cvs.addEventListener('touchstart', htRomanAbacusHandleCanvasStart, { passive: false });

    const rb = document.getElementById('romanAbacusResetBtn');
    if (rb) rb.addEventListener('click', htRomanAbacusReset);

    window.addEventListener('resize', function () {
        htRomanAbacusComputeLayout();
        htRomanAbacusRender();
    });
}

function htRomanAbacusInit() {
    localRomanAbacusController.canvas = document.getElementById('romanAbacusCanvas');
    if (!localRomanAbacusController.canvas) return;
    localRomanAbacusController.ctx = localRomanAbacusController.canvas.getContext('2d');
    if (!localRomanAbacusController.ctx) return;

    htRomanAbacusInitState();
    htRomanAbacusComputeLayout();
    htRomanAbacusAttachEvents();
    htRomanAbacusRender();
    htRomanAbacusFillGame();
    htRomanAbacusUpdateDisplay();
}

function htRomanAbacusLoadContent() {
    localRomanAbacusController.gameLvl = 0;
    localRomanAbacusController.currentTargetLevel = 0;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', htRomanAbacusInit);
    } else {
        htRomanAbacusInit();
    }
}
