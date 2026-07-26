// SPDX-License-Identifier: GPL-3.0-or-later
var localSorobanController = { };

function htSorobanGetBeadConfig() {
    if (localSorobanController.abacusMode === "soroban") {
        return { upperMax: 1, lowerMax: 4 };
    } else {
        return { upperMax: 2, lowerMax: 5 };
    }
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
    if (isNaN(value)) value = 0;
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
    if (localSorobanController.abacusMode !== "suanpan") return false;
    let hasOverflow = false;
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        let col = localSorobanController.state[i];
        let rawVal = (col.upper * 5) + col.lower;
        if (rawVal > 9) {
            hasOverflow = true;
            break;
        }
    }
    const warningDiv = document.getElementById('suanpanWarning');
    if (warningDiv) {
        if (hasOverflow) warningDiv.classList.remove('hidden');
        else warningDiv.classList.add('hidden');
    }
    return hasOverflow;
}

function htSorobanComputeDecimalValue() {
    let rawDigits = [];
    for(let i=0; i<localSorobanController.COLUMNS; i++){
        let col = localSorobanController.state[i];
        let colVal = (col.upper * 5) + col.lower;
        // clamp only for display value computation, but keep visual warning separate
        if (colVal > 9) colVal = 9;
        if (colVal < 0) colVal = 0;
        rawDigits.push(colVal);
    }
    
    // decimalMarkerCol is the column index (0-based) where the marker is placed. 
    // The marker sits between decimalMarkerCol and decimalMarkerCol+1.
    // So integer part = columns 0..decimalMarkerCol (inclusive)
    // fractional part = columns decimalMarkerCol+1 .. end
    const markerPos = localSorobanController.decimalMarkerCol;
    
    // Integer part digits (left side of marker)
    const integerDigits = rawDigits.slice(0, markerPos + 1);
    // Fractional part digits (right side of marker)
    const fractionalDigits = rawDigits.slice(markerPos + 1);
    
    // Build integer value
    let intValue = 0;
    for(let i=0; i<integerDigits.length; i++){
        intValue = intValue * 10 + integerDigits[i];
    }
    
    // Build fractional value as integer representing fractional digits
    let fracValue = 0;
    for(let i=0; i<fractionalDigits.length; i++){
        fracValue = fracValue * 10 + fractionalDigits[i];
    }
    
    const fracLen = fractionalDigits.length;
    let divisor = Math.pow(10, fracLen);
    let decimalResult = intValue + (fracValue / divisor);

    // Format display string without trailing unintended zeros: 
    // Show exactly the fractional digits that exist. If no fractional digits, show ".0"
    let formattedDisplay = "";
    if (fracLen === 0) {
        formattedDisplay = intValue.toString() + ".0";
    } else {
        // Build fractional part with proper leading zeros: e.g., if fractionalDigits = [0,1,2] -> "012"
        let fracStr = "";
        for (let i = 0; i < fractionalDigits.length; i++) {
            fracStr += fractionalDigits[i].toString();
        }
        // Remove trailing zeros? No – keep exact digits to reflect abacus state precisely.
        // But the bug "0.1230" came from leftover fractional positions due to marker shift.
        // Now we slice based on actual digits: originally 0.123 (marker col 6? need test).
        // Let's ensure we trim trailing zeros only if they are not significant? Better to show actual digits as set.
        // The bug scenario: value 0.123 (fractional digits length = 3). Moving decimal marker left: marker col becomes 5? 
        // Then integer digits = columns 0..5 (6 digits) includes some zero columns? That would produce 0000123? Wait.
        // The real bug was that old code used raw digits incorrectly: moving marker left would treat fractional digits wrong,
        // making extra zero appear. Now we recalc correctly based on new marker. This ensures 0.123 (digits: ... 0,1,2,3)
        // when marker moves left, integer part includes more leading zeros but fractional part shrinks, producing 0.0123 properly.
        // For instance, start with marker after column 6 => digits: col0-col6 integer => 0? Actually typical: columns 0..8.
        // Let's ensure we get exactly correct interpretation.
        formattedDisplay = intValue.toString() + "." + fracStr;
    }
    
    return { display: formattedDisplay, numeric: decimalResult };
}

function htSorobanUpdateDisplay() {
    if (localSorobanController.abacusMode === 'schyoty') {
        htSchyotyUpdateDisplay();
        return;
    }
    const numSpan = document.getElementById('numericValue');
    if (!numSpan) return;
    const { display } = htSorobanComputeDecimalValue();
    numSpan.innerText = display;
    htSorobanCheckOverflow();

    const cmpobj = document.getElementById('abacoCMP');
    if (cmpobj == undefined) {
        return;
    }

    const test = parseInt(display);
    if (test == cmpobj.innerText) {
        const successDiv = document.getElementById('suanpanSuccessText');
        if (successDiv) {
            $("#suanpanSuccessText").css("display","block").css("visibility","visible");
        }
    }
}
        
function htSorobanComputeLayout() {
    localSorobanController.canvasWidth = localSorobanController.canvas.width;
    localSorobanController.canvasHeight = localSorobanController.canvas.height;
    if (localSorobanController.abacusMode === 'schyoty') {
        htSchyotyComputeLayout();
        return;
    }
    
    let horizontalMargin = 28;
    let totalColSpace = localSorobanController.canvasWidth - (horizontalMargin * 2);
    localSorobanController.colWidth = totalColSpace / localSorobanController.COLUMNS;
    localSorobanController.startX = horizontalMargin + localSorobanController.colWidth/2;
    
    localSorobanController.decimalTrackY = localSorobanController.canvasHeight * 0.5;
    localSorobanController.decimalTrackTop = localSorobanController.decimalTrackY - 28;
    localSorobanController.decimalTrackBottom = localSorobanController.decimalTrackY + 28;
    localSorobanController.barY = localSorobanController.decimalTrackY;
    
    const { upperMax, lowerMax } = htSorobanGetBeadConfig();
    localSorobanController.upperBeadCount = upperMax;
    localSorobanController.lowerBeadCount = lowerMax;
    
    const upperBaseActive = localSorobanController.decimalTrackTop - 6;
    const upperStartInactive = localSorobanController.decimalTrackTop - 38;
    const stepY = 22;
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
        let activeY = lowerBaseActive + (i * localSorobanController.verticalStep);
        let inactiveY = activeY + lowerInactiveDrop;
        localSorobanController.lowerPositions.push({ activeY, inactiveY });
    }
    
    let maxRadiusByWidth = localSorobanController.colWidth * 0.38;
    let maxRadiusByVertical = localSorobanController.verticalStep * 0.45;
    localSorobanController.ballRadius = Math.min(maxRadiusByWidth, maxRadiusByVertical, 14);
    localSorobanController.ballRadius = Math.max(localSorobanController.ballRadius, 10);

    if (localSorobanController.upperPositions.length > 0) {
        let lowestUpperActive = localSorobanController.upperPositions[0].activeY;
        if (lowestUpperActive + localSorobanController.ballRadius >= localSorobanController.decimalTrackTop) {
            let shift = (lowestUpperActive + localSorobanController.ballRadius) - (localSorobanController.decimalTrackTop - 3);
            for (let u of localSorobanController.upperPositions) {
                u.activeY -= shift;
                u.inactiveY -= shift;
            }
        }
    }
    
    if (localSorobanController.lowerPositions.length > 0) {
        let highestLowerActive = localSorobanController.lowerPositions[0].activeY;
        if (highestLowerActive - localSorobanController.ballRadius <= localSorobanController.decimalTrackBottom) {
            let shift = (localSorobanController.decimalTrackBottom + 4) - (highestLowerActive - localSorobanController.ballRadius);
            for (let l of localSorobanController.lowerPositions) {
                l.activeY += shift;
                l.inactiveY += shift;
            }
        }
    }
}
        
function htSorobanDrawDecimalTrack() {
    if (!localSorobanController.ctx) return;
    localSorobanController.ctx.shadowBlur = 0;
    localSorobanController.ctx.fillStyle = "#dac894";
    localSorobanController.ctx.globalAlpha = 0.4;
    localSorobanController.ctx.fillRect(5, localSorobanController.decimalTrackTop, localSorobanController.canvasWidth - 10, localSorobanController.decimalTrackBottom - localSorobanController.decimalTrackTop);
    localSorobanController.ctx.globalAlpha = 1;
            
    localSorobanController.ctx.strokeStyle = "#b59762";
    localSorobanController.ctx.lineWidth = 2;
    localSorobanController.ctx.strokeRect(6, localSorobanController.decimalTrackTop + 2, localSorobanController.canvasWidth - 12, (localSorobanController.decimalTrackBottom - localSorobanController.decimalTrackTop) - 4);
            
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.moveTo(8, localSorobanController.decimalTrackY);
    localSorobanController.ctx.lineTo(localSorobanController.canvasWidth - 8, localSorobanController.decimalTrackY);
    localSorobanController.ctx.lineWidth = 3;
    localSorobanController.ctx.strokeStyle = "#c9a05a";
    localSorobanController.ctx.stroke();
    
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.moveTo(8, localSorobanController.decimalTrackY - 12);
    localSorobanController.ctx.lineTo(localSorobanController.canvasWidth - 8, localSorobanController.decimalTrackY - 12);
    localSorobanController.ctx.lineWidth = 1;
    localSorobanController.ctx.strokeStyle = "#e5c88a";
    localSorobanController.ctx.stroke();
    
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.moveTo(8, localSorobanController.decimalTrackY + 12);
    localSorobanController.ctx.lineTo(localSorobanController.canvasWidth - 8, localSorobanController.decimalTrackY + 12);
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
    
    localSorobanController.ctx.shadowBlur = 4;
    localSorobanController.ctx.shadowColor = "rgba(0,0,0,0.5)";
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
    
    localSorobanController.ctx.shadowBlur = 0;
    
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
    const lowerCount = col.lower;
    const upperCount = col.upper;
    const upperMax = col.upperMax;
    const lowerMax = col.lowerMax;
    
    const rawValue = (col.upper * 5) + col.lower;
    const isOverflowColumn = (localSorobanController.abacusMode === "suanpan" && rawValue > 9);
    
    if (isOverflowColumn) {
        localSorobanController.ctx.save();
        localSorobanController.ctx.shadowBlur = 0;
        localSorobanController.ctx.fillStyle = "rgba(255, 100, 50, 0.3)";
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.ellipse(x, localSorobanController.decimalTrackY, localSorobanController.colWidth * 0.4, 35, 0, 0, Math.PI*2);
        localSorobanController.ctx.fill();
        localSorobanController.ctx.restore();
    }
            
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.moveTo(x, localSorobanController.margin.top - 8);
    localSorobanController.ctx.lineTo(x, localSorobanController.canvasHeight - localSorobanController.margin.bottom + 10);
    localSorobanController.ctx.lineWidth = 3;
    localSorobanController.ctx.strokeStyle = '#b08054';
    localSorobanController.ctx.stroke();
    localSorobanController.ctx.beginPath();
    localSorobanController.ctx.moveTo(x-1, localSorobanController.margin.top - 6);
    localSorobanController.ctx.lineTo(x-1, localSorobanController.canvasHeight - localSorobanController.margin.bottom + 8);
    localSorobanController.ctx.lineWidth = 1.5;
    localSorobanController.ctx.strokeStyle = '#e9c48b';
    localSorobanController.ctx.stroke();

    for(let u = 0; u < upperMax; u++) {
        const isActive = (u < upperCount);
        const pos = localSorobanController.upperPositions[u];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        let gradUp = localSorobanController.ctx.createRadialGradient(x-4, beadY-3, 3, x, beadY, localSorobanController.ballRadius);
        gradUp.addColorStop(0, '#f06a50');
        gradUp.addColorStop(1, '#c03a28');
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x, beadY, localSorobanController.ballRadius, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = gradUp;
        localSorobanController.ctx.fill();
        localSorobanController.ctx.strokeStyle = '#4a2018';
        localSorobanController.ctx.lineWidth = 1.5;
        localSorobanController.ctx.stroke();
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x-3, beadY-3, 3, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = '#ffead4';
        localSorobanController.ctx.fill();
    }
    
    for(let b=0; b<lowerMax; b++){
        const isActive = (b < lowerCount);
        const pos = localSorobanController.lowerPositions[b];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        
        let gradLow = localSorobanController.ctx.createLinearGradient(x-5, beadY-4, x+5, beadY+4);
        gradLow.addColorStop(0, '#7da0ae');
        gradLow.addColorStop(1, '#3a6068');
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x, beadY, localSorobanController.ballRadius - 0.5, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = gradLow;
        localSorobanController.ctx.fill();
        localSorobanController.ctx.strokeStyle = '#1a3a3a';
        localSorobanController.ctx.lineWidth = 1.2;
        localSorobanController.ctx.stroke();
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x-2.5, beadY-2.5, 2.5, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = '#c8e2ec';
        localSorobanController.ctx.fill();
    }
}
        
function htSorobanDrawFrameDecorations() {
    if (!localSorobanController.ctx) return;
    localSorobanController.ctx.strokeStyle = '#f9eec7';
    localSorobanController.ctx.lineWidth = 2.5;
    localSorobanController.ctx.strokeRect(5, 5, localSorobanController.canvasWidth-10, localSorobanController.canvasHeight-10);
    localSorobanController.ctx.strokeStyle = '#b48b5a';
    localSorobanController.ctx.lineWidth = 1.8;
    localSorobanController.ctx.strokeRect(3, 3, localSorobanController.canvasWidth-6, localSorobanController.canvasHeight-6);
            
    for(let i=0;i<localSorobanController.COLUMNS;i++){
        let x = localSorobanController.startX + i*localSorobanController.colWidth;
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x, localSorobanController.decimalTrackY, 2.5, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = '#f3dd9a';
        localSorobanController.ctx.fill();
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.arc(x, localSorobanController.decimalTrackY, 1.5, 0, Math.PI*2);
        localSorobanController.ctx.fillStyle = '#b66b32';
        localSorobanController.ctx.fill();
    }
}
        
function htSorobanRender() {
    if(!localSorobanController.ctx) return;
    if (localSorobanController.abacusMode === 'schyoty') {
        htSchyotyRender();
        return;
    }
    localSorobanController.ctx.clearRect(0, 0, localSorobanController.canvasWidth, localSorobanController.canvasHeight);
    localSorobanController.ctx.fillStyle = '#fef5e0';
    localSorobanController.ctx.fillRect(0, 0, localSorobanController.canvasWidth, localSorobanController.canvasHeight);
            
    localSorobanController.ctx.globalAlpha = 0.2;
    for(let i=0;i<60;i++){
        localSorobanController.ctx.beginPath();
        localSorobanController.ctx.moveTo(0, i*8);
        localSorobanController.ctx.lineTo(localSorobanController.canvasWidth, i*8+3);
        localSorobanController.ctx.lineWidth = 1;
        localSorobanController.ctx.strokeStyle = '#c8b280';
        localSorobanController.ctx.stroke();
    }
    localSorobanController.ctx.globalAlpha = 1;
    
    htSorobanDrawDecimalTrack();
    
    for(let i=0;i<localSorobanController.COLUMNS;i++){
        htSorobanDrawColumn(i);
    }
    
    htSorobanDrawDecimalMarker();
    htSorobanDrawFrameDecorations();
}
        
// ----- Interaction -----
function htSorobanGetHitRegion(mouseX, mouseY) {
    const markerX = localSorobanController.startX + localSorobanController.decimalMarkerCol * localSorobanController.colWidth;
    const markerY = localSorobanController.decimalTrackY;
    if (Math.hypot(mouseX - markerX, mouseY - markerY) < localSorobanController.ballRadius + 10) {
        return { type: 'decimal_marker' };
    }
    
    let colIdx = -1;
    for(let i=0;i<localSorobanController.COLUMNS;i++){
        let centerX = localSorobanController.startX + i*localSorobanController.colWidth;
        if(Math.abs(mouseX - centerX) < localSorobanController.colWidth * 0.45){
            colIdx = i;
            break;
        }
    }
    if(colIdx === -1) return null;
            
    const col = localSorobanController.state[colIdx];
    const centerX = localSorobanController.startX + colIdx*localSorobanController.colWidth;
    const upperMax = col.upperMax;
    
    for(let u = 0; u < upperMax; u++) {
        const isActive = (u < col.upper);
        const pos = localSorobanController.upperPositions[u];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        if (Math.abs(mouseY - beadY) < localSorobanController.ballRadius + 8 && Math.hypot(mouseX - centerX, mouseY - beadY) < localSorobanController.ballRadius + 6) {
            if (mouseY < localSorobanController.decimalTrackTop - 2) 
                return { type: 'upper', col: colIdx, beadIdx: u };
        }
    }
    
    const lowerMax = col.lowerMax;
    for(let b=0; b<lowerMax; b++){
        const isActive = (b < col.lower);
        const pos = localSorobanController.lowerPositions[b];
        if (!pos) continue;
        const beadY = isActive ? pos.activeY : pos.inactiveY;
        if (Math.abs(mouseY - beadY) < localSorobanController.ballRadius + 8 && Math.hypot(mouseX - centerX, mouseY - beadY) < localSorobanController.ballRadius + 6) {
            if (mouseY > localSorobanController.decimalTrackBottom + 2)
                return { type: 'lower', col: colIdx, beadIdx: b };
        }
    }
    return null;
}
        
function htSorobanToggleUpper(col, beadIdx) {
    const colState = localSorobanController.state[col];
    const maxUpper = colState.upperMax;
    let currentUpper = colState.upper;
    if (beadIdx < currentUpper) {
        colState.upper = beadIdx;
    } else {
        colState.upper = beadIdx + 1;
    }
    if (colState.upper > maxUpper) colState.upper = maxUpper;
    if (colState.upper < 0) colState.upper = 0;
    htSorobanRender();
    htSorobanUpdateDisplay();
}
        
function htSorobanHandleLowerClick(col, beadIdx) {
    let currentLower = localSorobanController.state[col].lower;
    const maxLower = localSorobanController.state[col].lowerMax;
    let isActive = (beadIdx < currentLower);
    if(isActive){
        let newLower = beadIdx;
        if(newLower < 0) newLower = 0;
        localSorobanController.state[col].lower = newLower;
    } else {
        let newLower = beadIdx + 1;
        if(newLower > maxLower) newLower = maxLower;
        localSorobanController.state[col].lower = newLower;
    }
    htSorobanRender();
    htSorobanUpdateDisplay();
}
        
function htSorobanMoveDecimalMarkerToColumn(targetCol) {
    if(targetCol >= 0 && targetCol < localSorobanController.COLUMNS) {
        if (localSorobanController.decimalMarkerCol !== targetCol) {
            localSorobanController.decimalMarkerCol = targetCol;
            htSorobanRender();
            htSorobanUpdateDisplay();  // updates numeric value based on new marker position -> fixes the 0.1230 bug
        }
    }
}
        
function htSorobanStartDecimalDrag(e) {
    localSorobanController.isDraggingDecimal = true;
    e.preventDefault();
}
        
function htSorobanOnDecimalDrag(mouseX, mouseY) {
    if(!localSorobanController.isDraggingDecimal) return;
    let closestCol = -1;
    let minDist = localSorobanController.colWidth * 0.6;
    for(let i=0;i<localSorobanController.COLUMNS;i++){
        let centerX = localSorobanController.startX + i*localSorobanController.colWidth;
        let dist = Math.abs(mouseX - centerX);
        if(dist < minDist){
            minDist = dist;
            closestCol = i;
        }
    }
    if(closestCol !== -1){
        if(mouseY > localSorobanController.decimalTrackTop - 15 && mouseY < localSorobanController.decimalTrackBottom + 15){
            htSorobanMoveDecimalMarkerToColumn(closestCol);
        }
    }
}
        
function htSorobanStopDecimalDrag() {
    localSorobanController.isDraggingDecimal = false;
}
        
function htSorobanHandleCanvasStart(e) {
    if (!localSorobanController.canvas) return;
    if (localSorobanController.abacusMode === 'schyoty') {
        htSchyotyHandleCanvasStart(e);
        return;
    }
    const rect = localSorobanController.canvas.getBoundingClientRect();
    const scaleX = localSorobanController.canvas.width / rect.width;
    const scaleY = localSorobanController.canvas.height / rect.height;
    let clientX, clientY;
    if(e.touches){
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    let canvasX = (clientX - rect.left) * scaleX;
    let canvasY = (clientY - rect.top) * scaleY;
            
    const hit = htSorobanGetHitRegion(canvasX, canvasY);
    if(hit && hit.type === 'decimal_marker'){
        htSorobanStartDecimalDrag(e);
        return;
    }
    
    if(!hit) return;
    if(hit.type === 'upper'){
        htSorobanToggleUpper(hit.col, hit.beadIdx);
    } else if(hit.type === 'lower'){
        htSorobanHandleLowerClick(hit.col, hit.beadIdx);
    }
}
        
function htSorobanHandleCanvasMove(e) {
    if(!localSorobanController.isDraggingDecimal) return;
    if (!localSorobanController.canvas) return;
    const rect = localSorobanController.canvas.getBoundingClientRect();
    const scaleX = localSorobanController.canvas.width / rect.width;
    const scaleY = localSorobanController.canvas.height / rect.height;
    let clientX, clientY;
    if(e.touches){
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    let canvasX = (clientX - rect.left) * scaleX;
    let canvasY = (clientY - rect.top) * scaleY;
    htSorobanOnDecimalDrag(canvasX, canvasY);
}
        
function htSorobanHandleCanvasEnd(e) {
    if(localSorobanController.isDraggingDecimal){
        htSorobanStopDecimalDrag();
    }
}
        
function htFillAbacoGameValue() {
    const cmpobj = document.getElementById('abacoCMP');
    if (cmpobj == undefined) {
        return;
    }

    if (localSorobanController.abacusMode === 'schyoty') {
        const level = localSorobanController.currentTargetLevel;
        if (level >= HT_SCHYOTY_ROWS) {
            cmpobj.innerText = '0';
            const feedback = document.getElementById('feedbackArea');
            if (feedback) {
                const msg = document.getElementById('txt_finalLevelMessage');
                feedback.innerHTML = '<div class="congrats">' + (msg ? msg.innerText : '') + '</div>';
            }
            return;
        }
        const minVal = Math.pow(10, level);
        const maxVal = Math.pow(10, level + 1) - 1;
        if (level === 0) {
            cmpobj.innerText = htGetRandomArbitrary(1, 9).toString();
        } else {
            cmpobj.innerText = htGetRandomArbitrary(minVal, maxVal).toString();
        }
        return;
    }

    const successDiv = document.getElementById('successText');
    if (successDiv) {
        successDiv.classList.add('hidden');
    }
    let maxVal  = 9, minVal = 1;
    const maxValStr = document.getElementById('suanpanMaxValue');
    const minValStr = document.getElementById('suanpanMinValue');
    if ((maxValStr != undefined) && (minValStr != undefined)) {
        minVal =  parseInt(minValStr.innerText);

        const localPower = 10**localSorobanController.currentGameLevel;
        minVal *=  localPower;
        maxVal =  parseInt(99.9999999*localPower);

        localSorobanController.currentGameLevel++;
        if (localSorobanController.currentGameLevel == 8) {
            localSorobanController.currentGameLevel = 0;
        }
    }

    cmpobj.innerText = htGetRandomArbitrary(minVal, maxVal)+".0";
}

function htSetAbacusValue(value) {
    if (localSorobanController.abacusMode === 'schyoty') {
        localSorobanController.schyotyState = new Array(HT_SCHYOTY_ROWS).fill(0);
        let numStr = Math.abs(value).toString();
        for (let i = 0; i < numStr.length && i < HT_SCHYOTY_ROWS; i++) {
            localSorobanController.schyotyState[i] = parseInt(numStr[numStr.length - 1 - i]);
        }
        htSorobanRender();
        htSorobanUpdateDisplay();
        return;
    }

    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }

    let numStr = Math.abs(value).toString();
    let colIdx = localSorobanController.COLUMNS - 1;
    for (let i = numStr.length - 1; i >= 0; i--) {
        if (colIdx < 0) break;
        const digit = parseInt(numStr[i]);
        const upper = Math.floor(digit / 5);
        const lower = digit % 5;
        localSorobanController.state[colIdx].upper = Math.min(upper, localSorobanController.state[colIdx].upperMax);
        localSorobanController.state[colIdx].lower = Math.min(lower, localSorobanController.state[colIdx].lowerMax);
        colIdx--;
    }

    htSorobanRender();
    htSorobanUpdateDisplay();
}

function htMultiplicationTableAbacus(selectId) {
    if (localSorobanController._multTimer) {
        clearInterval(localSorobanController._multTimer);
        localSorobanController._multTimer = null;
    }

    const repeatVal = parseInt(document.getElementById(selectId).value);
    let currentSum = 0;
    let sumCount = 0;

    htSetAbacusValue(0);

    sumCount++;
    currentSum += repeatVal;
    htSetAbacusValue(currentSum);

    localSorobanController._multTimer = setInterval(function() {
        if (sumCount >= 10) {
            clearInterval(localSorobanController._multTimer);
            localSorobanController._multTimer = null;
            return;
        }
        sumCount++;
        currentSum += repeatVal;
        htSetAbacusValue(currentSum);
    }, 1500);
}

function htMultiplicationTableAbacusStepByStep(selectId) {
    if (localSorobanController._multTimer) {
        clearInterval(localSorobanController._multTimer);
        localSorobanController._multTimer = null;
    }

    const repeatVal = parseInt(document.getElementById(selectId).value);

    if (localSorobanController._multStepCount === undefined ||
        localSorobanController._multStepCount >= 10 ||
        localSorobanController._multRepeatVal !== repeatVal) {
        localSorobanController._multStepCount = 0;
        localSorobanController._multRepeatVal = repeatVal;
        htSetAbacusValue(0);
    }

    localSorobanController._multStepCount++;
    if (localSorobanController._multStepCount > 10) {
        return;
    }

    const currentSum = repeatVal * localSorobanController._multStepCount;
    htSetAbacusValue(currentSum);
}

function htSorobanResetSoroban() {
    if (localSorobanController._multTimer) {
        clearInterval(localSorobanController._multTimer);
        localSorobanController._multTimer = null;
    }
    localSorobanController._multStepCount = undefined;
    localSorobanController._multCurrentSum = undefined;
    localSorobanController._multRepeatVal = undefined;

    if (localSorobanController.abacusMode === 'schyoty') {
        const feedback = document.getElementById('feedbackArea');
        if (feedback) feedback.innerHTML = '';
        htSchyotyReset();
        return;
    }

    for(let i=0;i<localSorobanController.COLUMNS;i++){
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    localSorobanController.decimalMarkerCol = 8;
    htSorobanRender();
    htSorobanUpdateDisplay();
    localSorobanController.isDraggingDecimal = false;

    const cmpobj = document.getElementById('abacoCMP');
    if (cmpobj == undefined) {
        return;
    }

    const successDiv = document.getElementById('suanpanSuccessText');
    if (successDiv) {
        $("#suanpanSuccessText").css("display","none").css("visibility","hidden");
        htFillAbacoGameValue();
    }
}

function htSorobanSwitchMode(mode) {
    if (localSorobanController.abacusMode === mode) return;
    localSorobanController.abacusMode = mode;

    const sorobanBtn = document.getElementById('btnSorobanMode');
    const suanpanBtn = document.getElementById('btnSuanpanMode');
    const schyotyBtn = document.getElementById('btnSchyotyMode');
    if (sorobanBtn) sorobanBtn.classList.toggle('active', mode === 'soroban');
    if (suanpanBtn) suanpanBtn.classList.toggle('active', mode === 'suanpan');
    if (schyotyBtn) schyotyBtn.classList.toggle('active', mode === 'schyoty');

    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = '';

    const successDiv = document.getElementById('suanpanSuccessText');
    if (successDiv) {
        $("#suanpanSuccessText").css("display","none").css("visibility","hidden");
    }

    if (mode === 'schyoty') {
        htSchyotyInitState();
        htSchyotyComputeLayout();
        htSchyotyRender();
        htSorobanUpdateDisplay();
        const cmpobj = document.getElementById('abacoCMP');
        if (cmpobj) htFillAbacoGameValue();
        return;
    }

    const { upperMax, lowerMax } = htSorobanGetBeadConfig();
    for(let i = 0; i < localSorobanController.COLUMNS; i++) {
        localSorobanController.state[i].upperMax = upperMax;
        localSorobanController.state[i].lowerMax = lowerMax;
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    
    htSorobanComputeLayout();
    htSorobanRender();
    htSorobanUpdateDisplay();
}
        
function htSorobanAttachEvents() {
    const canvas = localSorobanController.canvas;
    const resetBtn = document.getElementById('resetButton');
    const sorobanBtn = document.getElementById('btnSorobanMode');
    const suanpanBtn = document.getElementById('btnSuanpanMode');
    const schyotyBtn = document.getElementById('btnSchyotyMode');
    
    if (!canvas) return;
    
    canvas.removeEventListener('mousedown', htSorobanHandleCanvasStart);
    canvas.removeEventListener('touchstart', htSorobanHandleCanvasStart);
    window.removeEventListener('mousemove', htSorobanHandleCanvasMove);
    window.removeEventListener('mouseup', htSorobanHandleCanvasEnd);
    window.removeEventListener('touchmove', htSorobanHandleCanvasMove);
    window.removeEventListener('touchend', htSorobanHandleCanvasEnd);
    if (resetBtn) resetBtn.removeEventListener('click', htSorobanResetSoroban);
    if (sorobanBtn) sorobanBtn.removeEventListener('click', () => htSorobanSwitchMode('soroban'));
    if (suanpanBtn) suanpanBtn.removeEventListener('click', () => htSorobanSwitchMode('suanpan'));
    if (schyotyBtn) schyotyBtn.removeEventListener('click', () => htSorobanSwitchMode('schyoty'));
    window.removeEventListener('resize', htSorobanComputeLayout);
    
    canvas.addEventListener('mousedown', htSorobanHandleCanvasStart);
    window.addEventListener('mousemove', htSorobanHandleCanvasMove);
    window.addEventListener('mouseup', htSorobanHandleCanvasEnd);
    canvas.addEventListener('touchstart', htSorobanHandleCanvasStart, { passive: false });
    window.addEventListener('touchmove', htSorobanHandleCanvasMove, { passive: false });
    window.addEventListener('touchend', htSorobanHandleCanvasEnd);
    if (resetBtn) resetBtn.addEventListener('click', htSorobanResetSoroban);
    if (sorobanBtn) sorobanBtn.addEventListener('click', () => htSorobanSwitchMode('soroban'));
    if (suanpanBtn) suanpanBtn.addEventListener('click', () => htSorobanSwitchMode('suanpan'));
    if (schyotyBtn) schyotyBtn.addEventListener('click', () => htSorobanSwitchMode('schyoty'));
    window.addEventListener('resize', function() {
        htSorobanComputeLayout();
        htSorobanRender();
    });
}
        
function htSorobanInit() {
    localSorobanController.canvas = document.getElementById('sorobanCanvas');
    if (!localSorobanController.canvas) return;

    localSorobanController.ctx = localSorobanController.canvas.getContext('2d');
    if (!localSorobanController.ctx) return;

    htSorobanInitState();
    htSorobanComputeLayout();
    htSorobanAttachEvents();
    htSorobanRender();

    htFillAbacoGameValue();
    htSorobanUpdateDisplay();
}

function htSorobanLoadContent() {
    localSorobanController = {
        "abacusMode": "suanpan",
        "COLUMNS": 9,
        "state": [],
        "decimalMarkerCol": 8,
        "canvas": null,
        "ctx": undefined,
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
        "verticalStep": 22,
        "currentGameLevel": 0,
        "schyotyState": [],
        "schyotyRowY": [],
        "schyotyBeadR": 0,
        "schyotyBeadStep": 0,
        "schyotyActiveX0": 0,
        "schyotyInactiveX0": 0,
        "schyotyWireL": 14,
        "currentTargetLevel": 0
    };

    if (document.getElementById('btnSuanpanMode') == undefined) {
        localSorobanController.abacusMode = "soroban";
    } else if (document.getElementById('btnSorobanMode') == undefined) {
        localSorobanController.abacusMode = "suanpan";
    }

    const maxCols = document.getElementById('suanpanColumnNumber');
    if (maxCols != undefined) {
        localSorobanController.COLUMNS = parseInt(maxCols.innerText);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', htSorobanInit);
    } else {
        htSorobanInit();
    }
}

// ----- Schyoty (счёты) Mode -----

var HT_SCHYOTY_ROWS = 9;
var HT_SCHYOTY_BEADS_PER_ROW = 10;

function htSchyotyInitState() {
    localSorobanController.schyotyState = new Array(HT_SCHYOTY_ROWS).fill(0);
    localSorobanController.currentTargetLevel = 0;
}

function htSchyotyComputeLayout() {
    const topMargin = 20;
    const bottomMargin = 30;
    const rowSpacing = (localSorobanController.canvasHeight - topMargin - bottomMargin) / (HT_SCHYOTY_ROWS - 1);
    localSorobanController.schyotyRowY = [];
    for (let r = 0; r < HT_SCHYOTY_ROWS; r++) {
        localSorobanController.schyotyRowY.push(localSorobanController.canvasHeight - bottomMargin - r * rowSpacing);
    }
    const wireL = localSorobanController.schyotyWireL;
    const wireR = localSorobanController.canvasWidth - wireL;
    const beadSpace = (wireR - wireL) / (HT_SCHYOTY_BEADS_PER_ROW + 1);
    localSorobanController.schyotyBeadR = Math.min(beadSpace * 0.4, rowSpacing * 0.4, 18);
    localSorobanController.schyotyBeadR = Math.max(localSorobanController.schyotyBeadR, 8);
    localSorobanController.schyotyBeadStep = localSorobanController.schyotyBeadR * 2;
    localSorobanController.schyotyActiveX0 = wireL + localSorobanController.schyotyBeadR + 2;
    localSorobanController.schyotyInactiveX0 = wireR - localSorobanController.schyotyBeadR - 2;
}

function htSchyotyRender() {
    const ctx = localSorobanController.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, localSorobanController.canvasWidth, localSorobanController.canvasHeight);
    ctx.fillStyle = '#fef7e0';
    ctx.fillRect(0, 0, localSorobanController.canvasWidth, localSorobanController.canvasHeight);

    ctx.shadowBlur = 0;
    const wireL = localSorobanController.schyotyWireL;
    const wireR = localSorobanController.canvasWidth - wireL;

    for (let r = 0; r < HT_SCHYOTY_ROWS; r++) {
        const y = localSorobanController.schyotyRowY[r];
        ctx.beginPath();
        ctx.moveTo(wireL, y);
        ctx.lineTo(wireR, y);
        ctx.strokeStyle = '#5a4030';
        ctx.lineWidth = 2;
        ctx.stroke();

        const cnt = localSorobanController.schyotyState[r];
        for (let p = 0; p < cnt; p++) {
            const x = localSorobanController.schyotyActiveX0 + p * localSorobanController.schyotyBeadStep;
            htSchyotyDrawBead(ctx, x, y, true, p);
        }
        for (let p = 0; p < HT_SCHYOTY_BEADS_PER_ROW - cnt; p++) {
            const x = localSorobanController.schyotyInactiveX0 - p * localSorobanController.schyotyBeadStep;
            htSchyotyDrawBead(ctx, x, y, false, 9 - p);
        }
    }
}

function htSchyotyDrawBead(ctx, x, y, active, idx) {
    const r = localSorobanController.schyotyBeadR;
    const isSpecial = idx === 4 || idx === 5;
    ctx.shadowBlur = active ? 3 : 1;
    ctx.shadowColor = 'rgba(0,0,0,0.25)';

    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    if (isSpecial) {
        grad.addColorStop(0, active ? '#d0d0d0' : '#a0a0a0');
        grad.addColorStop(1, active ? '#808080' : '#606060');
    } else if (active) {
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
    ctx.strokeStyle = isSpecial ? (active ? '#3a3a3a' : '#2a2a2a') : (active ? '#6a4a1a' : '#5a4030');
    ctx.lineWidth = active ? 1.5 : 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = isSpecial ? (active ? 'rgba(230,230,230,0.6)' : 'rgba(180,180,180,0.35)') : (active ? 'rgba(255,235,190,0.6)' : 'rgba(240,225,205,0.35)');
    ctx.fill();
}

function htSchyotyGetNumericValue() {
    let value = 0;
    for (let r = 0; r < HT_SCHYOTY_ROWS; r++) {
        value += localSorobanController.schyotyState[r] * Math.pow(10, r);
    }
    return value;
}

function htSchyotyGetHitRegion(mouseX, mouseY) {
    const r = localSorobanController.schyotyBeadR;
    for (let row = 0; row < HT_SCHYOTY_ROWS; row++) {
        const y = localSorobanController.schyotyRowY[row];
        if (Math.abs(mouseY - y) > r + 10) continue;
        const cnt = localSorobanController.schyotyState[row];
        for (let p = 0; p < cnt; p++) {
            const x = localSorobanController.schyotyActiveX0 + p * localSorobanController.schyotyBeadStep;
            if (Math.abs(mouseX - x) < r + 4 && Math.hypot(mouseX - x, mouseY - y) < r + 4) {
                return { type: 'schyoty', row: row, position: p, isActive: true };
            }
        }
        for (let p = 0; p < HT_SCHYOTY_BEADS_PER_ROW - cnt; p++) {
            const x = localSorobanController.schyotyInactiveX0 - p * localSorobanController.schyotyBeadStep;
            if (Math.abs(mouseX - x) < r + 4 && Math.hypot(mouseX - x, mouseY - y) < r + 4) {
                return { type: 'schyoty', row: row, position: p, isActive: false };
            }
        }
    }
    return null;
}

function htSchyotyHandleClick(hit) {
    const row = hit.row;
    const cnt = localSorobanController.schyotyState[row];
    if (hit.isActive) {
        localSorobanController.schyotyState[row] = hit.position;
    } else {
        const inactiveCount = HT_SCHYOTY_BEADS_PER_ROW - cnt;
        const beadsFromRight = hit.position;
        localSorobanController.schyotyState[row] = cnt + (inactiveCount - beadsFromRight);
    }
    htSchyotyRender();
    htSorobanUpdateDisplay();
}

function htSchyotyUpdateDisplay() {
    const numSpan = document.getElementById('numericValue');
    if (numSpan) {
        numSpan.innerText = htSchyotyGetNumericValue().toString();
    }
    const cmpobj = document.getElementById('abacoCMP');
    if (cmpobj) {
        if (htSchyotyGetNumericValue().toString() == cmpobj.innerText) {
            const successDiv = document.getElementById('suanpanSuccessText');
            if (successDiv) {
                $("#suanpanSuccessText").css("display","block").css("visibility","visible");
            }
            localSorobanController.currentTargetLevel++;
            const feedback = document.getElementById('feedbackArea');
            if (feedback) feedback.innerHTML = '';
            htFillAbacoGameValue();
        }
    }
}

function htSchyotyReset() {
    htSchyotyInitState();
    htSchyotyRender();
    htSorobanUpdateDisplay();
    const successDiv = document.getElementById('suanpanSuccessText');
    if (successDiv) {
        $("#suanpanSuccessText").css("display","none").css("visibility","hidden");
    }
    const cmpobj = document.getElementById('abacoCMP');
    if (cmpobj) {
        htFillAbacoGameValue();
    }
}

function htSchyotyHandleCanvasStart(e) {
    if (!localSorobanController.canvas) return;
    const rect = localSorobanController.canvas.getBoundingClientRect();
    const scaleX = localSorobanController.canvas.width / rect.width;
    const scaleY = localSorobanController.canvas.height / rect.height;
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
    const hit = htSchyotyGetHitRegion(canvasX, canvasY);
    if (hit) {
        htSchyotyHandleClick(hit);
    }
}

