// SPDX-License-Identifier: GPL-3.0-or-later


// ===================== ABACUS CORE =====================
var localSorobanController = {
    "abacusMode": "suanpan",
    "COLUMNS": 9,
    "state": [],
    "decimalMarkerCol": 8,
    "canvas": null,
    "ctx": null,
    "canvasWidth": 860,
    "canvasHeight": 400,
    "colWidth": 0,
    "margin": { top: 48, bottom: 48 },
    "startX": 0,
    "ballRadius": 0,
    "upperPositions": [],
    "lowerPositions": [],
    "upperBeadCount": 2,
    "lowerBeadCount": 5,
    "decimalTrackY": 0,
    "decimalTrackTop": 0,
    "decimalTrackBottom": 0,
    "barY": 0,
    "isDraggingDecimal": false,
    "verticalStep": 14,
    "currentLevel": "units",
    "currentExercise": { a:0, b:0, expected:0 },
    "steps": [],
    "currentStepIdx": 0,
    "stepCompleted": false,
    "finalCongratsShown": false,
    "exerciseStarted": false,
    "TextManager": null
};

function htSorobanGetBeadConfig() {
    if (localSorobanController.abacusMode === "soroban") return { upperMax: 1, lowerMax: 4 };
    else return { upperMax: 2, lowerMax: 5 };
}

function htSorobanInitState() {
    const { upperMax, lowerMax } = htSorobanGetBeadConfig();
    localSorobanController.state = [];
    for(let i=0; i<localSorobanController.COLUMNS; i++){
        localSorobanController.state.push({ upper: 0, lower: 0, upperMax: upperMax, lowerMax: lowerMax });
    }
}

function htSorobanGetCurrentNumericValue() {
    let digits = [];
    for(let i=0; i<localSorobanController.COLUMNS; i++){
        let col = localSorobanController.state[i];
        let colVal = (col.upper * 5) + col.lower;
        if (colVal > 9) colVal = 9;
        digits.push(colVal);
    }
    const markerPos = localSorobanController.decimalMarkerCol;
    let intValue = 0;
    for(let i=0; i<=markerPos; i++) intValue = intValue * 10 + digits[i];
    return intValue;
}

function htSorobanSetToNumber(value) {
    for(let i=0; i<localSorobanController.COLUMNS; i++){
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    let str = Math.floor(value).toString();
    let start = localSorobanController.COLUMNS - str.length;
    for(let i=0; i<str.length; i++){
        let digit = parseInt(str[i]);
        let col = start + i;
        if(col >= 0 && col < localSorobanController.COLUMNS){
            const maxUpper = localSorobanController.state[col].upperMax;
            const maxLower = localSorobanController.state[col].lowerMax;
            let upper = Math.floor(digit / 5);
            let lower = digit % 5;
            if(upper > maxUpper) upper = maxUpper;
            if(lower > maxLower) lower = maxLower;
            localSorobanController.state[col].upper = upper;
            localSorobanController.state[col].lower = lower;
        }
    }
    htSorobanRender();
    htSorobanUpdateDisplay();
}

function htSorobanCheckOverflow() {
    if (localSorobanController.abacusMode !== "suanpan") {
        document.getElementById('suanpanWarning')?.classList.add('hidden');
        return false;
    }
    let hasOverflow = false;
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        let col = localSorobanController.state[i];
        if ((col.upper * 5) + col.lower > 9) { hasOverflow = true; break; }
    }
    const warnDiv = document.getElementById('suanpanWarning');
    if (warnDiv) hasOverflow ? warnDiv.classList.remove('hidden') : warnDiv.classList.add('hidden');
    return hasOverflow;
}

function htSorobanComputeDecimalValue() {
    let rawDigits = [];
    for(let i=0;i<localSorobanController.COLUMNS;i++){
        let col = localSorobanController.state[i];
        let colVal = (col.upper * 5) + col.lower;
        if (colVal > 9) colVal = 9;
        rawDigits.push(colVal);
    }
    const markerPos = localSorobanController.decimalMarkerCol;
    const integerDigits = rawDigits.slice(0, markerPos + 1);
    const fractionalDigits = rawDigits.slice(markerPos + 1);
    let intValue = 0;
    for(let d of integerDigits) intValue = intValue * 10 + d;
    let fracStr = fractionalDigits.join('');
    let divisor = Math.pow(10, fractionalDigits.length);
    let decimalResult = intValue + (fracStr === "" ? 0 : parseInt(fracStr, 10) / divisor);
    let display = fractionalDigits.length === 0 ? intValue + ".0" : intValue + "." + fracStr;
    return { display, numeric: decimalResult };
}

function htSorobanUpdateDisplay() {
    const numSpan = document.getElementById('numericValue');
    if (numSpan) numSpan.innerText = htSorobanComputeDecimalValue().display;
    htSorobanCheckOverflow();
}

function htSorobanComputeLayout() {
    if (!localSorobanController.canvas) return;
    localSorobanController.canvasWidth = localSorobanController.canvas.width;
    localSorobanController.canvasHeight = localSorobanController.canvas.height;
    let hMargin = 28;
    let totalColSpace = localSorobanController.canvasWidth - (hMargin * 2);
    localSorobanController.colWidth = totalColSpace / localSorobanController.COLUMNS;
    localSorobanController.startX = hMargin + localSorobanController.colWidth/2;
    localSorobanController.decimalTrackY = localSorobanController.canvasHeight * 0.5;
    localSorobanController.decimalTrackTop = localSorobanController.decimalTrackY - 28;
    localSorobanController.decimalTrackBottom = localSorobanController.decimalTrackY + 28;
    localSorobanController.barY = localSorobanController.decimalTrackY;
    const { upperMax, lowerMax } = htSorobanGetBeadConfig();
    const upperBaseActive = localSorobanController.decimalTrackTop - 6;
    const upperStartInactive = localSorobanController.decimalTrackTop - 38;
    const stepY = 14;
    localSorobanController.upperPositions = [];
    for (let i = 0; i < upperMax; i++) {
        let activeY = upperBaseActive - (i * stepY);
        let inactiveY = upperStartInactive - (i * stepY * 0.8);
        if (inactiveY < 18) inactiveY = 18 + i * 5;
        localSorobanController.upperPositions.push({ activeY, inactiveY });
    }
    const lowerBaseActive = localSorobanController.decimalTrackBottom + 8;
    const lowerInactiveDrop = 28;
    localSorobanController.lowerPositions = [];
    for (let i = 0; i < lowerMax; i++) {
        let activeY = lowerBaseActive + (i * stepY);
        let inactiveY = activeY + lowerInactiveDrop;
        localSorobanController.lowerPositions.push({ activeY, inactiveY });
    }
    localSorobanController.ballRadius = Math.min(localSorobanController.colWidth * 0.38, stepY * 0.55, 14);
    localSorobanController.ballRadius = Math.max(localSorobanController.ballRadius, 10);
}

function htSorobanDrawDecimalTrack() {
    if (!localSorobanController.ctx) return;
    localSorobanController.ctx.fillStyle = "#dac894";
    localSorobanController.ctx.globalAlpha = 0.4;
    localSorobanController.ctx.fillRect(5, localSorobanController.decimalTrackTop, localSorobanController.canvasWidth - 10, localSorobanController.decimalTrackBottom - localSorobanController.decimalTrackTop);
    localSorobanController.ctx.globalAlpha = 1;
    localSorobanController.ctx.strokeStyle = "#c9a05a";
    localSorobanController.ctx.lineWidth = 2;
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.moveTo(8, localSorobanController.decimalTrackY);
    localSorobanController.ctx.lineTo(localSorobanController.canvasWidth - 8, localSorobanController.decimalTrackY);
    localSorobanController.ctx.stroke();
    localSorobanController.ctx.fillStyle = '#c9a86b';
    localSorobanController.ctx.fillRect(5, localSorobanController.barY-6, localSorobanController.canvasWidth-10, 12);
    localSorobanController.ctx.fillStyle = '#e5c28e';
    localSorobanController.ctx.fillRect(5, localSorobanController.barY-4, localSorobanController.canvasWidth-10, 8);
    localSorobanController.ctx.fillStyle = '#f5e2b0';
    localSorobanController.ctx.fillRect(5, localSorobanController.barY-2, localSorobanController.canvasWidth-10, 4);
}
function htSorobanDrawDecimalMarker() {
    if (!localSorobanController.ctx) return;
    const markerX = localSorobanController.startX + localSorobanController.decimalMarkerCol * localSorobanController.colWidth;
    const markerY = localSorobanController.decimalTrackY;
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.arc(markerX, markerY, localSorobanController.ballRadius + 2, 0, Math.PI*2);
    localSorobanController.ctx.fillStyle = "#2a2a3a";
    localSorobanController.ctx.fill();
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.arc(markerX, markerY, localSorobanController.ballRadius, 0, Math.PI*2);
    localSorobanController.ctx.fillStyle = "#0a0a12";
    localSorobanController.ctx.fill();
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.arc(markerX-3, markerY-3, localSorobanController.ballRadius * 0.28, 0, Math.PI*2);
    localSorobanController.ctx.fillStyle = "#5a5a6a";
    localSorobanController.ctx.fill();
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.arc(markerX-2, markerY-2, localSorobanController.ballRadius * 0.18, 0, Math.PI*2);
    localSorobanController.ctx.fillStyle = "#aaaabb";
    localSorobanController.ctx.fill();
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.arc(markerX, markerY, localSorobanController.ballRadius + 1.5, 0, Math.PI*2);
    localSorobanController.ctx.lineWidth = 1.5;
    localSorobanController.ctx.strokeStyle = "#e6c87a";
    localSorobanController.ctx.stroke();
}
function htSorobanDrawColumn(idx) {
    if (!localSorobanController.ctx) return;
    const x = localSorobanController.startX + idx * localSorobanController.colWidth;
    const col = localSorobanController.state[idx];
    const rawValue = (col.upper * 5) + col.lower;
    const isOverflow = (localSorobanController.abacusMode === "suanpan" && rawValue > 9);
    if (isOverflow) {
        localSorobanController.ctx.fillStyle = "rgba(255, 100, 50, 0.3)";
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.ellipse(x, localSorobanController.decimalTrackY, localSorobanController.colWidth * 0.4, 35, 0, 0, Math.PI*2);
        localSorobanController.ctx.fill();
    }
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.moveTo(x, localSorobanController.margin.top - 8);
    localSorobanController.ctx.lineTo(x, localSorobanController.canvasHeight - localSorobanController.margin.bottom + 10);
    localSorobanController.ctx.lineWidth = 2.5;
    localSorobanController.ctx.strokeStyle = '#b08054';
    localSorobanController.ctx.stroke();
    for(let u = 0; u < col.upperMax; u++) {
        const isActive = (u < col.upper);
        const pos = localSorobanController.upperPositions[u];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        let grad = localSorobanController.ctx.createRadialGradient(x-4, beadY-3, 3, x, beadY, localSorobanController.ballRadius);
        grad.addColorStop(0, '#f06a50');
        grad.addColorStop(1, '#c03a28');
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x, beadY, localSorobanController.ballRadius, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = grad;
        localSorobanController.ctx.fill();
        localSorobanController.ctx.strokeStyle = '#4a2018';
        localSorobanController.ctx.stroke();
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x-3, beadY-3, 3, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = '#ffead4';
        localSorobanController.ctx.fill();
    }
    for(let b=0; b<col.lowerMax; b++){
        const isActive = (b < col.lower);
        const pos = localSorobanController.lowerPositions[b];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        let grad = localSorobanController.ctx.createLinearGradient(x-5, beadY-4, x+5, beadY+4);
        grad.addColorStop(0, '#7da0ae');
        grad.addColorStop(1, '#3a6068');
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x, beadY, localSorobanController.ballRadius - 0.5, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = grad;
        localSorobanController.ctx.fill();
        localSorobanController.ctx.strokeStyle = '#1a3a3a';
        localSorobanController.ctx.stroke();
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x-2.5, beadY-2.5, 2.5, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = '#c8e2ec';
        localSorobanController.ctx.fill();
    }
}
function htSorobanDrawFrameDecorations() { }
function htSorobanRender() { 
    if(!localSorobanController.ctx) return;
    localSorobanController.ctx.clearRect(0, 0, localSorobanController.canvasWidth, localSorobanController.canvasHeight);
    localSorobanController.ctx.fillStyle = '#fef5e0';
    localSorobanController.ctx.fillRect(0, 0, localSorobanController.canvasWidth, localSorobanController.canvasHeight);
    htSorobanDrawDecimalTrack();
    for(let i=0;i<localSorobanController.COLUMNS;i++) htSorobanDrawColumn(i);
    htSorobanDrawDecimalMarker();
    htSorobanDrawFrameDecorations();
}
function htSorobanGetHitRegion(mx, my) { 
    const markerX = localSorobanController.startX + localSorobanController.decimalMarkerCol * localSorobanController.colWidth;
    if (Math.hypot(mx - markerX, my - localSorobanController.decimalTrackY) < localSorobanController.ballRadius + 10) return { type: 'decimal' };
    for(let i=0;i<localSorobanController.COLUMNS;i++){
        let cx = localSorobanController.startX + i*localSorobanController.colWidth;
        if(Math.abs(mx - cx) < localSorobanController.colWidth * 0.45){
            const col = localSorobanController.state[i];
            for(let u=0; u<col.upperMax; u++){
                const pos = localSorobanController.upperPositions[u];
                if(!pos) continue;
                const y = (u < col.upper) ? pos.activeY : pos.inactiveY;
                if(Math.hypot(mx-cx, my-y) < localSorobanController.ballRadius+6) return { type: 'upper', col: i, idx: u };
            }
            for(let b=0; b<col.lowerMax; b++){
                const pos = localSorobanController.lowerPositions[b];
                if(!pos) continue;
                const y = (b < col.lower) ? pos.activeY : pos.inactiveY;
                if(Math.hypot(mx-cx, my-y) < localSorobanController.ballRadius+6) return { type: 'lower', col: i, idx: b };
            }
        }
    }
    return null;
}

function htSorobanToggleUpper(col, idx) { let c=localSorobanController.state[col]; if(idx<c.upper) c.upper=idx; else c.upper=idx+1; if(c.upper>c.upperMax)c.upper=c.upperMax; htSorobanRender(); htSorobanUpdateDisplay(); if(window.checkCurrentStepPositive) window.checkCurrentStepPositive();}
function htSorobanHandleLowerClick(col, idx) { let c=localSorobanController.state[col]; if(idx<c.lower) c.lower=idx; else c.lower=idx+1; if(c.lower>c.lowerMax)c.lower=c.lowerMax; htSorobanRender(); htSorobanUpdateDisplay(); if(window.checkCurrentStepPositive) window.checkCurrentStepPositive();}
function htSorobanReset() { for(let i=0;i<localSorobanController.COLUMNS;i++){ localSorobanController.state[i].upper=0; localSorobanController.state[i].lower=0; } htSorobanRender(); htSorobanUpdateDisplay();}
function htSorobanSwitchMode(mode) { 
    if(localSorobanController.abacusMode === mode) return;
    const currentValue = htSorobanGetCurrentNumericValue();
    localSorobanController.abacusMode = mode;
    const { upperMax, lowerMax } = htSorobanGetBeadConfig();
    for(let i=0;i<localSorobanController.COLUMNS;i++){ localSorobanController.state[i].upperMax = upperMax; localSorobanController.state[i].lowerMax = lowerMax; localSorobanController.state[i].upper = 0; localSorobanController.state[i].lower = 0; }
    htSorobanSetToNumber(currentValue);
    htSorobanComputeLayout();
    htSorobanRender();
    htSorobanUpdateDisplay();
    document.getElementById('btnSorobanMode').classList.toggle('active', mode==='soroban');
    document.getElementById('btnSuanpanMode').classList.toggle('active', mode==='suanpan');
    if(window.checkCurrentStepPositive) window.checkCurrentStepPositive();
}

function setupEvents() { const canvas = localSorobanController.canvas; const getCoords = (e) => { const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width/rect.width; const scaleY = canvas.height/rect.height; let cx, cy; if(e.touches){ cx=e.touches[0].clientX; cy=e.touches[0].clientY; e.preventDefault(); } else { cx=e.clientX; cy=e.clientY; } return { x: (cx-rect.left)*scaleX, y: (cy-rect.top)*scaleY }; }; canvas.onmousedown = (e) => { const {x,y}=getCoords(e); const hit=htSorobanGetHitRegion(x,y); if(hit?.type==='decimal') return; if(hit?.type==='upper') htSorobanToggleUpper(hit.col, hit.idx); if(hit?.type==='lower') htSorobanHandleLowerClick(hit.col, hit.idx); }; canvas.ontouchstart = (e) => { e.preventDefault(); const {x,y}=getCoords(e); const hit=htSorobanGetHitRegion(x,y); if(hit?.type==='upper') htSorobanToggleUpper(hit.col,hit.idx); if(hit?.type==='lower') htSorobanHandleLowerClick(hit.col,hit.idx); };}
function initAbacus() { localSorobanController.canvas = document.getElementById('sorobanCanvas'); if(!localSorobanController.canvas) return; localSorobanController.ctx = localSorobanController.canvas.getContext('2d'); htSorobanInitState(); htSorobanComputeLayout(); setupEvents(); htSorobanRender(); htSorobanUpdateDisplay(); window.addEventListener('resize', () => { htSorobanComputeLayout(); htSorobanRender(); }); }

// ================ TUTOR WITH 9 LEVELS & FIXED CARRY (NO EXTRA STEPS) ================
function getAbacusValue() { return htSorobanGetCurrentNumericValue(); }
function setAbacusToNumber(val) { htSorobanSetToNumber(val); }

function generateRandomNumbersByLevel() {
    if (localSorobanController.currentLevel === "units") {
        return { a: Math.floor(Math.random() * 10), b: Math.floor(Math.random() * 10) };
    } else if (localSorobanController.currentLevel === "tens") {
        return { a: Math.floor(Math.random() * 99) + 1, b: Math.floor(Math.random() * 99) + 1 };
    } else if (localSorobanController.currentLevel === "hundreds") {
        return { a: Math.floor(Math.random() * 900) + 100, b: Math.floor(Math.random() * 900) + 100 };
    } else if (localSorobanController.currentLevel === "thousands") {
        return { a: Math.floor(Math.random() * 9000) + 1000, b: Math.floor(Math.random() * 9000) + 1000 };
    } else if (localSorobanController.currentLevel === "tenThousands") {
        return { a: Math.floor(Math.random() * 10000) + 10000, b: Math.floor(Math.random() * 10000) + 10000 };
    } else if (localSorobanController.currentLevel === "hundredThousands") {
        return { a: Math.floor(Math.random() * 100000) + 100000, b: Math.floor(Math.random() * 100000) + 100000 };
    } else if (localSorobanController.currentLevel === "millions") {
        return { a: Math.floor(Math.random() * 1000000) + 1000000, b: Math.floor(Math.random() * 1000000) + 1000000 };
    } else if (localSorobanController.currentLevel === "tenMillions") {
        return { a: Math.floor(Math.random() * 10000000) + 10000000, b: Math.floor(Math.random() * 10000000) + 10000000 };
    } else {
        return { a: Math.floor(Math.random() * 100000000) + 100000000, b: Math.floor(Math.random() * 100000000) + 100000000 };
    }
}

function buildStepsForNumbers(a, b) {
    const stepsList = [];
    
    let maxDigits, placeNames, multipliers;
    
    if (localSorobanController.currentLevel === "units") {
        maxDigits = 1;
        placeNames = [localSorobanController.TextManager.getUnitUnits()];
        multipliers = [1];
    } else if (localSorobanController.currentLevel === "tens") {
        maxDigits = 2;
        placeNames = [localSorobanController.TextManager.getUnitUnits(), localSorobanController.TextManager.getUnitTens()];
        multipliers = [1, 10];
    } else if (localSorobanController.currentLevel === "hundreds") {
        maxDigits = 3;
        placeNames = [localSorobanController.TextManager.getUnitUnits(), localSorobanController.TextManager.getUnitTens(), localSorobanController.TextManager.getUnitHundreds()];
        multipliers = [1, 10, 100];
    } else if (localSorobanController.currentLevel === "thousands") {
        maxDigits = 4;
        placeNames = [localSorobanController.TextManager.getUnitUnits(), localSorobanController.TextManager.getUnitTens(), localSorobanController.TextManager.getUnitHundreds(), localSorobanController.TextManager.getUnitThousands()];
        multipliers = [1, 10, 100, 1000];
    } else if (localSorobanController.currentLevel === "tenThousands") {
        maxDigits = 5;
        placeNames = [localSorobanController.TextManager.getUnitUnits(), localSorobanController.TextManager.getUnitTens(), localSorobanController.TextManager.getUnitHundreds(), localSorobanController.TextManager.getUnitThousands(), localSorobanController.TextManager.getUnitTenThousands()];
        multipliers = [1, 10, 100, 1000, 10000];
    } else if (localSorobanController.currentLevel === "hundredThousands") {
        maxDigits = 6;
        placeNames = [localSorobanController.TextManager.getUnitUnits(), localSorobanController.TextManager.getUnitTens(), localSorobanController.TextManager.getUnitHundreds(), localSorobanController.TextManager.getUnitThousands(), localSorobanController.TextManager.getUnitTenThousands(), localSorobanController.TextManager.getUnitHundredThousands()];
        multipliers = [1, 10, 100, 1000, 10000, 100000];
    } else if (localSorobanController.currentLevel === "millions") {
        maxDigits = 7;
        placeNames = [localSorobanController.TextManager.getUnitUnits(), localSorobanController.TextManager.getUnitTens(), localSorobanController.TextManager.getUnitHundreds(), localSorobanController.TextManager.getUnitThousands(), localSorobanController.TextManager.getUnitTenThousands(), localSorobanController.TextManager.getUnitHundredThousands(), localSorobanController.TextManager.getUnitMillions()];
        multipliers = [1, 10, 100, 1000, 10000, 100000, 1000000];
    } else if (localSorobanController.currentLevel === "tenMillions") {
        maxDigits = 8;
        placeNames = [localSorobanController.TextManager.getUnitUnits(), localSorobanController.TextManager.getUnitTens(), localSorobanController.TextManager.getUnitHundreds(), localSorobanController.TextManager.getUnitThousands(), localSorobanController.TextManager.getUnitTenThousands(), localSorobanController.TextManager.getUnitHundredThousands(), localSorobanController.TextManager.getUnitMillions(), localSorobanController.TextManager.getTenMillions()];
        multipliers = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000];
    } else {
        maxDigits = 9;
        placeNames = [localSorobanController.TextManager.getUnitUnits(), localSorobanController.TextManager.getUnitTens(), localSorobanController.TextManager.getUnitHundreds(), localSorobanController.TextManager.getUnitThousands(), localSorobanController.TextManager.getUnitTenThousands(), localSorobanController.TextManager.getUnitHundredThousands(), localSorobanController.TextManager.getUnitMillions(), localSorobanController.TextManager.getTenMillions(), localSorobanController.TextManager.getHundredMillions()];
        multipliers = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000];
    }
    
    let placeDescription = placeNames.slice().reverse().join(', ');
    stepsList.push({
        instruction: localSorobanController.TextManager.getStep1Instruction(a.toLocaleString($("#site_language").val()), placeDescription),
        targetValue: a
    });
    
    let currentValue = a;
    
    // Process ONLY digits where b has a non-zero digit
    // The carry is handled within the same step and does NOT generate additional steps
    for (let p = 0; p < maxDigits; p++) {
        const digitB = Math.floor(b / multipliers[p]) % 10;
        
        // Skip if this digit of b is 0 (no addition needed in this column)
        if (digitB === 0) continue;
        
        const digitA = Math.floor(currentValue / multipliers[p]) % 10;
        const total = digitA + digitB;
        
        if (total < 10) {
            // Simple addition
            currentValue += digitB * multipliers[p];
            stepsList.push({
                instruction: localSorobanController.TextManager.getSimpleAddInstruction(placeNames[p], digitB, currentValue.toLocaleString($("#site_language").val())),
                targetValue: currentValue
            });
        } else {
            // Carry needed - user performs carry operation in ONE step
            const complement = 10 - digitB;
            const newValue = currentValue + (multipliers[p] * 10) - (complement * multipliers[p]);
            const nextPlace = placeNames[p+1] || (p+1 < placeNames.length ? placeNames[p+1] : localSorobanController.TextManager.getNextText());
            
            stepsList.push({
                instruction: localSorobanController.TextManager.getCarryInstruction(placeNames[p], digitB, digitA, total, nextPlace, complement, newValue.toLocaleString($("#site_language").val())),
                targetValue: newValue
            });
            currentValue = newValue;
        }
    }
    
    // Final verification step
    stepsList.push({
        instruction: localSorobanController.TextManager.getFinalInstruction(a.toLocaleString($("#site_language").val()), b.toLocaleString($("#site_language").val()), (a+b).toLocaleString($("#site_language").val())),
        targetValue: a + b
    });
    
    return stepsList;
}

function setControlButtonsVisibility(show) {
    const resetTutorBtn = document.getElementById('resetTutorBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (show) {
        resetTutorBtn.classList.remove('hidden');
        nextLevelBtn.classList.remove('hidden');
    } else {
        resetTutorBtn.classList.add('hidden');
        nextLevelBtn.classList.add('hidden');
    }
}

function setControlStepVisibility(show) {
    const nextLevelBtn = document.getElementById('nextStepBtn');
    if (show) {
        nextLevelBtn.classList.remove('hidden');
    } else {
        nextLevelBtn.classList.add('hidden');
    }
}

function startNewExercise() {
    localSorobanController.finalCongratsShown = false;
    localSorobanController.exerciseStarted = false;
    const nums = generateRandomNumbersByLevel();
    localSorobanController.currentExercise = { a: nums.a, b: nums.b, expected: nums.a + nums.b };
    document.getElementById('problemDisplay').innerHTML = `${localSorobanController.currentExercise.a.toLocaleString($("#site_language").val())} + ${localSorobanController.currentExercise.b.toLocaleString($("#site_language").val())}`;
    setAbacusToNumber(0);
    localSorobanController.steps = buildStepsForNumbers(localSorobanController.currentExercise.a, localSorobanController.currentExercise.b);
    localSorobanController.currentStepIdx = 0;
    localSorobanController.stepCompleted = false;
    document.getElementById('stepMessage').innerHTML = `${localSorobanController.TextManager.getStepPrefix()} ${localSorobanController.steps[0].instruction}`;
    document.getElementById('stepStatus').innerHTML = localSorobanController.TextManager.getStepStatus(1, localSorobanController.steps.length);
    document.getElementById('feedbackArea').innerHTML = '';
    setControlButtonsVisibility(true);
    setControlStepVisibility(true);
}

function resetTutorToStepOne() {
    localSorobanController.finalCongratsShown = false;
    localSorobanController.exerciseStarted = false;
    setAbacusToNumber(0);
    localSorobanController.steps = buildStepsForNumbers(localSorobanController.currentExercise.a, localSorobanController.currentExercise.b);
    localSorobanController.currentStepIdx = 0;
    localSorobanController.stepCompleted = false;
    document.getElementById('stepMessage').innerHTML = `${localSorobanController.TextManager.getStepPrefix()} ${localSorobanController.steps[0].instruction}`;
    document.getElementById('stepStatus').innerHTML = localSorobanController.TextManager.getStepStatus(1, localSorobanController.steps.length);
    document.getElementById('feedbackArea').innerHTML = '';
    setControlButtonsVisibility(true);
    setControlStepVisibility(true);
}

function toggleLevel() {
    if (localSorobanController.currentLevel === "units") {
        localSorobanController.currentLevel = "tens";
        document.getElementById('levelBadge').innerHTML = '🔟 '+localSorobanController.TextManager.getUnitTens();
        document.getElementById('levelBadge').style.background = "#4caf50";
    } else if (localSorobanController.currentLevel === "tens") {
        localSorobanController.currentLevel = "hundreds";
        document.getElementById('levelBadge').innerHTML = '🏆 '+localSorobanController.TextManager.getUnitHundreds();
        document.getElementById('levelBadge').style.background = "#ff7043";
    } else if (localSorobanController.currentLevel === "hundreds") {
        localSorobanController.currentLevel = "thousands";
        document.getElementById('levelBadge').innerHTML = '🔥 '+localSorobanController.TextManager.getUnitThousands();
        document.getElementById('levelBadge').style.background = "#9c27b0";
    } else if (localSorobanController.currentLevel === "thousands") {
        localSorobanController.currentLevel = "tenThousands";
        document.getElementById('levelBadge').innerHTML = '💎 '+localSorobanController.TextManager.getUnitTenThousands();
        document.getElementById('levelBadge').style.background = "#e91e63";
    } else if (localSorobanController.currentLevel === "tenThousands") {
        localSorobanController.currentLevel = "hundredThousands";
        document.getElementById('levelBadge').innerHTML = '🌟 '+localSorobanController.TextManager.getUnitHundredThousands();
        document.getElementById('levelBadge').style.background = "#00bcd4";
    } else if (localSorobanController.currentLevel === "hundredThousands") {
        localSorobanController.currentLevel = "millions";
        document.getElementById('levelBadge').innerHTML = '💰 '+localSorobanController.TextManager.getUnitMillions();
        document.getElementById('levelBadge').style.background = "#ff9800";
    } else if (localSorobanController.currentLevel === "millions") {
        localSorobanController.currentLevel = "tenMillions";
        document.getElementById('levelBadge').innerHTML = '💎 '+localSorobanController.TextManager.getTenMillions();
        document.getElementById('levelBadge').style.background = "#9c27b0";
    } else if (localSorobanController.currentLevel === "tenMillions") {
        localSorobanController.currentLevel = "hundredMillions";
        document.getElementById('levelBadge').innerHTML = '👑 '+localSorobanController.TextManager.getHundredMillions();
        document.getElementById('levelBadge').style.background = "#f44336";
    } else {
        localSorobanController.currentLevel = "units";
        document.getElementById('levelBadge').innerHTML = '🔢 '+localSorobanController.TextManager.getUnitUnits();
        document.getElementById('levelBadge').style.background = "#ffb347";
        document.getElementById('feedbackArea').innerHTML = `<div class="congrats">${localSorobanController.TextManager.getFinalLevelMessage()}</div>`;
    }
    startNewExercise();
}

window.checkCurrentStepPositive = function() {
    if (localSorobanController.currentStepIdx >= localSorobanController.steps.length) return;
    const currentVal = getAbacusValue();
    const step = localSorobanController.steps[localSorobanController.currentStepIdx];
    
    if (currentVal === step.targetValue) {
        if (!localSorobanController.stepCompleted) {
            localSorobanController.stepCompleted = true;
            if (localSorobanController.currentStepIdx === localSorobanController.steps.length - 1) {
                if (!localSorobanController.finalCongratsShown) {
                    localSorobanController.finalCongratsShown = true;
                    document.getElementById('feedbackArea').innerHTML = `<div class="congrats">${localSorobanController.TextManager.getPerfectMessage(localSorobanController.currentExercise.a.toLocaleString($("#site_language").val()), localSorobanController.currentExercise.b.toLocaleString($("#site_language").val()), localSorobanController.currentExercise.expected.toLocaleString($("#site_language").val()))}</div>`;
                    setControlButtonsVisibility(true);
                    setControlStepVisibility(false);
                }
            } else {
                document.getElementById('feedbackArea').innerHTML = `<div class="success-message">${localSorobanController.TextManager.getCorrectMessage()}</div>`;
            }
        }
    } else {
        localSorobanController.stepCompleted = false;
        if (document.getElementById('feedbackArea').innerHTML && 
            !document.getElementById('feedbackArea').innerHTML.includes('PERFECT') &&
            !document.getElementById('feedbackArea').innerHTML.includes('Correct')) {
            document.getElementById('feedbackArea').innerHTML = '';
        }
    }
};

function nextStep() {
    const currentVal = getAbacusValue();
    const currentStepTarget = localSorobanController.steps[localSorobanController.currentStepIdx]?.targetValue;
    
    if (currentVal !== currentStepTarget) {
        return;
    }
    
    if (!localSorobanController.exerciseStarted && localSorobanController.currentStepIdx === 0) {
        localSorobanController.exerciseStarted = true;
        setControlButtonsVisibility(false);
    }
    
    if (localSorobanController.currentStepIdx + 1 < localSorobanController.steps.length) {
        localSorobanController.currentStepIdx++;
        localSorobanController.stepCompleted = false;
        document.getElementById('stepMessage').innerHTML = `${localSorobanController.TextManager.getStepPrefix()} ${localSorobanController.steps[localSorobanController.currentStepIdx].instruction}`;
        document.getElementById('stepStatus').innerHTML = localSorobanController.TextManager.getStepStatus(localSorobanController.currentStepIdx+1, localSorobanController.steps.length);
        document.getElementById('feedbackArea').innerHTML = '';
        setTimeout(() => window.checkCurrentStepPositive(), 50);
    } else {
        if (currentVal === localSorobanController.currentExercise.expected && !localSorobanController.finalCongratsShown) {
            localSorobanController.finalCongratsShown = true;
            document.getElementById('feedbackArea').innerHTML = `<div class="congrats">${localSorobanController.TextManager.getCongratsMessage(localSorobanController.currentExercise.a.toLocaleString($("#site_language").val()), localSorobanController.currentExercise.b.toLocaleString($("#site_language").val()), localSorobanController.currentExercise.expected.toLocaleString($("#site_language").val()))}</div>`;
            setControlButtonsVisibility(true);
        }
    }
}

function htLoadContent() {
    htWriteNavigation();
    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);

    localSorobanController.TextManager = {
        get: function(id) {
            const element = document.getElementById(id);
            return element ? element.innerHTML : id;
        },
    
        format: function(template, data) {
            let result = template;
            for (const [key, value] of Object.entries(data)) {
                result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
            }
            return result;
        },
    
        getStepPrefix: function() {
            return this.get('txt_stepPrefix');
        },
    
        getCorrectMessage: function() {
            return this.get('txt_correctMessage');
        },
    
        getPerfectMessage: function(a, b, result) {
            return this.format(this.get('txt_perfectMessage'), { a, b, result });
        },
    
        getCongratsMessage: function(a, b, result) {
            return this.format(this.get('txt_congratsMessage'), { a, b, result });
        },

        getFinalLevelMessage: function() {
            return this.get('txt_finalLevelMessage');
        },

        getStep1Instruction: function(a, columns) {
            return this.format(this.get('txt_step1Instruction'), { a, columns });
        },
    
        getSimpleAddInstruction: function(placeName, digit, result) {
            return this.format(this.get('txt_simpleAddInstruction'), { placeName, digit, result });
        },
    
        getCarryInstruction: function(placeName, digit, digitA, total, nextPlace, complement, result) {
            return this.format(this.get('txt_carryInstruction'), { 
                placeName, digit, digitA, digit, total, nextPlace, complement, result 
            });
        },
    
        getFinalInstruction: function(a, b, result) {
            return this.format(this.get('txt_finalInstruction'), { a, b, result });
        },
    
        getStepStatus: function(current, total) {
            return this.format(this.get('txt_stepStatus'), { current, total });
        },
    
        getReadyStatus: function() {
            return this.get('txt_readyStatus');
        },
    
        getWelcomeMessage: function() {
            return this.get('txt_welcomeMessage');
        },
    
        getUnitUnits: function() {
            return this.get('txt_units');
        },
    
        getUnitTens: function() {
            return this.get('txt_tens');
        },
    
        getUnitHundreds: function() {
            return this.get('txt_hundreds');
        },
    
        getUnitThousands: function() {
            return this.get('txt_thousands');
        },
    
        getUnitTenThousands: function() {
            return this.get('txt_tenthousands');
        },
    
        getUnitHundredThousands: function() {
            return this.get('txt_hundredthousands');
        },
    
        getUnitMillions: function() {
            return this.get('txt_million');
        },
    
        getUnitTenMillions: function() {
            return this.get('txt_tenmillions');
        },
    
        getUnitHundredMillions: function() {
            return this.get('txt_hundredmillions');
        },
    
        getNextText: function() {
            return this.get('txt_next');
        },

        formatNumber: function(num) {
            const locale = $("#site_language").val();
            return new Intl.NumberFormat(locale).format(num);
        }
    };

    initAbacus();
    document.getElementById('nextStepBtn').onclick = nextStep;
    document.getElementById('resetTutorBtn').onclick = () => { startNewExercise(); };
    document.getElementById('resetButton').onclick = () => { resetTutorToStepOne(); };
    document.getElementById('nextLevelBtn').onclick = () => { toggleLevel(); };
    document.getElementById('btnSorobanMode').onclick = () => { htSorobanSwitchMode('soroban'); };
    document.getElementById('btnSuanpanMode').onclick = () => { htSorobanSwitchMode('suanpan'); };
    window.checkCurrentStepPositive = checkCurrentStepPositive;
    
    document.getElementById('stepMessage').innerHTML = `${localSorobanController.TextManager.getStepPrefix()} ${localSorobanController.TextManager.getWelcomeMessage()}`;

    startNewExercise();

    return false;
}
