var localSorobanController = {
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
    "verticalStep": 14
};

function htSorobanGetBeadConfig() {
    if (localSorobanController.abacusMode === "soroban") {
        return { upperMax: 1, lowerMax: 4 };
    } else {
        return { upperMax: 2, lowerMax: 5 };
    }
}


function htSorobanInitState(){
    const { upperMax, lowerMax } = htSorobanGetBeadConfig();
    localSorobanController.state = [];
    for(let i=0; i<localSorobanController.COLUMNS; i++){
        localSorobanController.state.push({ upper: 0, lower: 0, upperMax: upperMax, lowerMax: lowerMax });
    }
}

function htSorobanCheckOverflow() {
    if (localSorobanController.abacusMode !== "suanpan") return false;
    let hasOverflow = false;
    let overflowColumns = [];
    for (let i = 0; i < localSorobanController.COLUMNS; i++) {
        let col = localSorobanController.state[i];
        let rawVal = (col.upper * 5) + col.lower;
        if (rawVal > 9) {
            hasOverflow = true;
            overflowColumns.push(i + 1);
        }
    }
    const warningDiv = document.getElementById('suanpanWarning');
    const warningText = document.getElementById('warningText');
    if (warningDiv && warningText) {
        if (hasOverflow) {
            warningDiv.classList.remove('hidden');
        } else {
            warningDiv.classList.add('hidden');
        }
    }
    return hasOverflow;
}

function htSorobanComputeDecimalValue() {
    let rawDigits = [];
    let overflowDetected = false;
    for(let i=0; i<localSorobanController.COLUMNS; i++){
        let col = localSorobanController.state[i];
        let colVal = (col.upper * 5) + col.lower;
        if (colVal > 9) {
            overflowDetected = true;
            colVal = 9;
        }
        rawDigits.push(colVal);
    }
    
    const intEnd = localSorobanController.decimalMarkerCol;
    const fracStart = localSorobanController.decimalMarkerCol + 1;
            
    let integerDigits = rawDigits.slice(0, intEnd + 1);
    let fractionalDigits = rawDigits.slice(fracStart);
            
    let intValue = 0;
    for(let i=0; i<integerDigits.length; i++){
        intValue = intValue * 10 + integerDigits[i];
    }
    
    let fracValue = 0;
    for(let i=0; i<fractionalDigits.length; i++){
        fracValue = fracValue * 10 + fractionalDigits[i];
    }
    let divisor = Math.pow(10, fractionalDigits.length);
    let decimalResult = intValue + (fracValue / divisor);
            
    let formattedDisplay = intValue.toString();
    if(fractionalDigits.length > 0){
        let neededDecimals = fractionalDigits.length;
        let currentFracPart = fracValue.toString();
        while(currentFracPart.length < neededDecimals) currentFracPart = "0" + currentFracPart;
        formattedDisplay = intValue.toString() + "." + currentFracPart;
    } else {
        formattedDisplay = intValue.toString() + ".0";
    }
    
    return { display: formattedDisplay, numeric: decimalResult };
}

function htSorobanUpdateDisplay() {
    const numSpan = document.getElementById('numericValue');
    if (!numSpan) return;
    const { display } = htSorobanComputeDecimalValue();
    numSpan.innerText = display;
    htSorobanCheckOverflow();
}
        
function htSorobanComputeLayout() {
    if (!localSorobanController.canvas || !localSorobanController.ctx) return;
    localSorobanController.canvasWidth = localSorobanController.canvas.width;
    localSorobanController.canvasHeight = localSorobanController.canvas.height;
    
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
        let activeY = lowerBaseActive + (i * localSorobanController.verticalStep);
        let inactiveY = activeY + lowerInactiveDrop;
        localSorobanController.lowerPositions.push({ activeY, inactiveY });
    }
    
    let maxRadiusByWidth = localSorobanController.colWidth * 0.38;
    let maxRadiusByVertical = localSorobanController.verticalStep * 0.55;
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
        
function htSorobanDrawFrameDecorations(){
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
        
function htSorobanRender(){
    if(!localSorobanController.ctx) return;
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
function htSorobanGetHitRegion(mouseX, mouseY){
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
        
function htSorobanToggleUpper(col, beadIdx){
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
        
function htSorobanHandleLowerClick(col, beadIdx){
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
        
function htSorobanMoveDecimalMarkerToColumn(targetCol){
    if(targetCol >= 0 && targetCol < localSorobanController.COLUMNS) {
        localSorobanController.decimalMarkerCol = targetCol;
        htSorobanRender();
        htSorobanUpdateDisplay();
    }
}
        
function htSorobanStartDecimalDrag(e){
    localSorobanController.isDraggingDecimal = true;
    e.preventDefault();
}
        
function htSorobanOnDecimalDrag(mouseX, mouseY){
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
            if(localSorobanController.decimalMarkerCol !== closestCol){
                htSorobanMoveDecimalMarkerToColumn(closestCol);
            }
        }
    }
}
        
function htSorobanStopDecimalDrag(){
    localSorobanController.isDraggingDecimal = false;
}
        
function htSorobanHandleCanvasStart(e){
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
        
function htSorobanHandleCanvasMove(e){
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
        
function htSorobanHandleCanvasEnd(e){
    if(localSorobanController.isDraggingDecimal){
        htSorobanStopDecimalDrag();
    }
}
        
function htSorobanResetSoroban(){
    for(let i=0;i<localSorobanController.COLUMNS;i++){
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    localSorobanController.decimalMarkerCol = 8;
    htSorobanRender();
    htSorobanUpdateDisplay();
    localSorobanController.isDraggingDecimal = false;
}

function htSorobanSwitchMode(mode) {
    if (localSorobanController.abacusMode === mode) return;
    localSorobanController.abacusMode = mode;
    const { upperMax, lowerMax } = htSorobanGetBeadConfig();
    for(let i = 0; i < localSorobanController.COLUMNS; i++) {
        localSorobanController.state[i].upperMax = upperMax;
        localSorobanController.state[i].lowerMax = lowerMax;
        localSorobanController.state[i].upper = 0;
        localSorobanController.state[i].lower = 0;
    }
    document.getElementById('btnSorobanMode').classList.toggle('active', mode === 'soroban');
    document.getElementById('btnSuanpanMode').classList.toggle('active', mode === 'suanpan');
    
    htSorobanComputeLayout();
    htSorobanRender();
    htSorobanUpdateDisplay();
}
        
function htSorobanAttachEvents(){
    const canvas = localSorobanController.canvas;
    const resetBtn = document.getElementById('resetButton');
    const sorobanBtn = document.getElementById('btnSorobanMode');
    const suanpanBtn = document.getElementById('btnSuanpanMode');
    
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
    window.addEventListener('resize', function() {
        htSorobanComputeLayout();
        htSorobanRender();
    });
}
        
function htSorobanInit(){
    localSorobanController.canvas = document.getElementById('sorobanCanvas');
    if (!localSorobanController.canvas) return;

    localSorobanController.ctx = localSorobanController.canvas.getContext('2d');
    if (!localSorobanController.ctx) return;

    htSorobanInitState();
    htSorobanComputeLayout();
    htSorobanAttachEvents();
    htSorobanRender();
    htSorobanUpdateDisplay();
}

function htLoadContent() {
    if (document.getElementById('btnSuanpanMode') == undefined) {
        localSorobanController.abacusMode = "soroban";
    } else if (document.getElementById('btnSorobanMode') == undefined) {
        localSorobanController.abacusMode = "suanpan";
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', htSorobanInit);
    } else {
        htSorobanInit();
    }
}
