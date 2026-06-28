  // Ancient JS style - all variables inside global object, no IIFE
  window.localRightTriangle = {};

  // Global variables attached to the object
  window.localRightTriangle.a = 3.00;
  window.localRightTriangle.b = 4.00;
  window.localRightTriangle.c = 5.00;
  
  window.localRightTriangle.ctx = null;
  window.localRightTriangle.canvas = null;
  window.localRightTriangle.aInput = null;
  window.localRightTriangle.aRange = null;
  window.localRightTriangle.bInput = null;
  window.localRightTriangle.bRange = null;
  window.localRightTriangle.cInput = null;
  window.localRightTriangle.cRange = null;
  window.localRightTriangle.theoremSpan = null;
  window.localRightTriangle.numericProofSpan = null;
  
  window.localRightTriangle.preventLoop = false;
  window.localRightTriangle.resizeTimeout = null;
  window.localRightTriangle.resizeObserver = null;
  
  window.localRightTriangle.MIN_SIDE = 1.0;
  window.localRightTriangle.MAX_SIDE_LEG = 10.0;
  window.localRightTriangle.MAX_HYP = Math.sqrt(200);

  // Helper functions
  window.localRightTriangle.clampLeg = function(v) {
    if (v < window.localRightTriangle.MIN_SIDE) return window.localRightTriangle.MIN_SIDE;
    if (v > window.localRightTriangle.MAX_SIDE_LEG) return window.localRightTriangle.MAX_SIDE_LEG;
    return v;
  };
  
  window.localRightTriangle.getLegRatio = function() {
    if (window.localRightTriangle.b < 0.001) return 1.0;
    return window.localRightTriangle.a / window.localRightTriangle.b;
  };
  
  window.localRightTriangle.updateFromHypotenuse = function(newC, preserveRatio) {
    if (preserveRatio === undefined) preserveRatio = true;
    var hyp = newC;
    if (hyp < 1.0) hyp = 1.0;
    if (hyp > window.localRightTriangle.MAX_HYP) hyp = window.localRightTriangle.MAX_HYP;
    if (!preserveRatio) return;
    
    var ratio = window.localRightTriangle.getLegRatio();
    var denom = ratio * ratio + 1;
    var bNew = Math.sqrt((hyp * hyp) / denom);
    var aNew = ratio * bNew;
    
    aNew = window.localRightTriangle.clampLeg(aNew);
    bNew = window.localRightTriangle.clampLeg(bNew);
    
    var finalHyp = Math.hypot(aNew, bNew);
    if (finalHyp > window.localRightTriangle.MAX_HYP) finalHyp = window.localRightTriangle.MAX_HYP;
    
    window.localRightTriangle.a = aNew;
    window.localRightTriangle.b = bNew;
    window.localRightTriangle.c = finalHyp;
  };
  
  window.localRightTriangle.updateFromLegA = function(newA) {
    var newLegA = window.localRightTriangle.clampLeg(newA);
    var oldB = window.localRightTriangle.b;
    var hyp = Math.hypot(newLegA, oldB);
    if (hyp > window.localRightTriangle.MAX_HYP) hyp = window.localRightTriangle.MAX_HYP;
    window.localRightTriangle.a = newLegA;
    window.localRightTriangle.b = oldB;
    window.localRightTriangle.c = hyp;
  };
  
  window.localRightTriangle.updateFromLegB = function(newB) {
    var newLegB = window.localRightTriangle.clampLeg(newB);
    var oldA = window.localRightTriangle.a;
    var hyp = Math.hypot(oldA, newLegB);
    if (hyp > window.localRightTriangle.MAX_HYP) hyp = window.localRightTriangle.MAX_HYP;
    window.localRightTriangle.a = oldA;
    window.localRightTriangle.b = newLegB;
    window.localRightTriangle.c = hyp;
  };
  
  window.localRightTriangle.syncUIFromState = function() {
    if (window.localRightTriangle.aInput) window.localRightTriangle.aInput.value = window.localRightTriangle.a.toFixed(2);
    if (window.localRightTriangle.bInput) window.localRightTriangle.bInput.value = window.localRightTriangle.b.toFixed(2);
    if (window.localRightTriangle.cInput) window.localRightTriangle.cInput.value = window.localRightTriangle.c.toFixed(2);
    
    if (window.localRightTriangle.aRange) window.localRightTriangle.aRange.value = window.localRightTriangle.a;
    if (window.localRightTriangle.bRange) window.localRightTriangle.bRange.value = window.localRightTriangle.b;
    if (window.localRightTriangle.cRange) window.localRightTriangle.cRange.value = window.localRightTriangle.c;
    
    if (window.localRightTriangle.theoremSpan && window.localRightTriangle.numericProofSpan) {
      var aSq = (window.localRightTriangle.a * window.localRightTriangle.a).toFixed(4);
      var bSq = (window.localRightTriangle.b * window.localRightTriangle.b).toFixed(4);
      var cSq = (window.localRightTriangle.c * window.localRightTriangle.c).toFixed(4);
      window.localRightTriangle.theoremSpan.innerHTML = "📐 " + window.localRightTriangle.a.toFixed(2) + "² + " + window.localRightTriangle.b.toFixed(2) + "² = " + window.localRightTriangle.c.toFixed(2) + "²";
      window.localRightTriangle.numericProofSpan.innerHTML = window.localRightTriangle.a.toFixed(2) + "² + " + window.localRightTriangle.b.toFixed(2) + "² = " + window.localRightTriangle.c.toFixed(2) + "² &nbsp; → &nbsp; " + aSq + " + " + bSq + " = " + cSq;
    }
    
    window.localRightTriangle.drawTriangle();
  };
  
  window.localRightTriangle.applyUpdate = function(source, value) {
    if (window.localRightTriangle.preventLoop) return;
    window.localRightTriangle.preventLoop = true;
    
    var numValue = parseFloat(value);
    if (isNaN(numValue)) {
      window.localRightTriangle.preventLoop = false;
      return;
    }
    
    if (source === 'a') {
      window.localRightTriangle.updateFromLegA(numValue);
    } else if (source === 'b') {
      window.localRightTriangle.updateFromLegB(numValue);
    } else if (source === 'c') {
      window.localRightTriangle.updateFromHypotenuse(numValue, true);
    }
    
    var perfectC = Math.hypot(window.localRightTriangle.a, window.localRightTriangle.b);
    if (Math.abs(perfectC - window.localRightTriangle.c) > 0.0001) {
      window.localRightTriangle.c = perfectC;
      if (window.localRightTriangle.c > window.localRightTriangle.MAX_HYP) window.localRightTriangle.c = window.localRightTriangle.MAX_HYP;
    }
    window.localRightTriangle.a = window.localRightTriangle.clampLeg(window.localRightTriangle.a);
    window.localRightTriangle.b = window.localRightTriangle.clampLeg(window.localRightTriangle.b);
    window.localRightTriangle.c = Math.hypot(window.localRightTriangle.a, window.localRightTriangle.b);
    if (window.localRightTriangle.c > window.localRightTriangle.MAX_HYP) window.localRightTriangle.c = window.localRightTriangle.MAX_HYP;
    if (window.localRightTriangle.c < window.localRightTriangle.a - 0.0001 || window.localRightTriangle.c < window.localRightTriangle.b - 0.0001) {
      window.localRightTriangle.c = Math.hypot(window.localRightTriangle.a, window.localRightTriangle.b);
    }
    
    window.localRightTriangle.syncUIFromState();
    window.localRightTriangle.preventLoop = false;
  };
  
  window.localRightTriangle.onAChange = function(value) {
    var v = parseFloat(value);
    if (isNaN(v)) return;
    if (v < window.localRightTriangle.MIN_SIDE) v = window.localRightTriangle.MIN_SIDE;
    if (v > window.localRightTriangle.MAX_SIDE_LEG) v = window.localRightTriangle.MAX_SIDE_LEG;
    window.localRightTriangle.applyUpdate('a', v);
  };
  
  window.localRightTriangle.onBChange = function(value) {
    var v = parseFloat(value);
    if (isNaN(v)) return;
    if (v < window.localRightTriangle.MIN_SIDE) v = window.localRightTriangle.MIN_SIDE;
    if (v > window.localRightTriangle.MAX_SIDE_LEG) v = window.localRightTriangle.MAX_SIDE_LEG;
    window.localRightTriangle.applyUpdate('b', v);
  };
  
  window.localRightTriangle.onCChange = function(value) {
    var v = parseFloat(value);
    if (isNaN(v)) return;
    if (v < 1.0) v = 1.0;
    if (v > window.localRightTriangle.MAX_HYP) v = window.localRightTriangle.MAX_HYP;
    window.localRightTriangle.applyUpdate('c', v);
  };
  
  window.localRightTriangle.drawTriangle = function() {
    if (!window.localRightTriangle.ctx || !window.localRightTriangle.canvas) return;
    
    var container = window.localRightTriangle.canvas.parentElement;
    var maxWidth = 500;
    if (container.clientWidth - 20 < maxWidth) maxWidth = container.clientWidth - 20;
    var targetWidth = maxWidth;
    if (targetWidth < 280) targetWidth = 280;
    var targetHeight = targetWidth * 0.68;
    if (targetHeight > 310) targetHeight = 310;
    
    window.localRightTriangle.canvas.width = targetWidth;
    window.localRightTriangle.canvas.height = targetHeight;
    window.localRightTriangle.canvas.style.width = targetWidth + "px";
    window.localRightTriangle.canvas.style.height = targetHeight + "px";
    
    window.localRightTriangle.ctx = window.localRightTriangle.canvas.getContext('2d');
    var w = window.localRightTriangle.canvas.width;
    var h = window.localRightTriangle.canvas.height;
    
    window.localRightTriangle.ctx.clearRect(0, 0, w, h);
    
    var marginX = w * 0.2;
    if (marginX < 70) marginX = 70;
    var marginY = h * 0.13;
    if (marginY < 35) marginY = 35;
    var maxDrawingAreaX = w - marginX * 0.9;
    var maxDrawingAreaY = h - marginY * 1.1;
    
    var scale = maxDrawingAreaX / window.localRightTriangle.b;
    var scaleY = maxDrawingAreaY / window.localRightTriangle.a;
    if (scaleY < scale) scale = scaleY;
    scale = scale * 0.75;
    if (isNaN(scale) || scale <= 0) scale = 4;
    
    var ax = marginX;
    var ay = h - marginY;
    var bx = ax + window.localRightTriangle.b * scale;
    var by = ay;
    var cx = ax;
    var cy = ay - window.localRightTriangle.a * scale;
    
    // Draw triangle background
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(ax, ay);
    window.localRightTriangle.ctx.lineTo(bx, by);
    window.localRightTriangle.ctx.lineTo(cx, cy);
    window.localRightTriangle.ctx.closePath();
    window.localRightTriangle.ctx.fillStyle = '#d9ecf2cc';
    window.localRightTriangle.ctx.fill();
    
    // Draw sides
    var lineWidth = w / 140;
    if (lineWidth < 3) lineWidth = 3;
    window.localRightTriangle.ctx.lineWidth = lineWidth;
    window.localRightTriangle.ctx.lineCap = 'round';
    
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(ax, ay);
    window.localRightTriangle.ctx.lineTo(cx, cy);
    window.localRightTriangle.ctx.strokeStyle = '#c44536';
    window.localRightTriangle.ctx.stroke();
    
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(ax, ay);
    window.localRightTriangle.ctx.lineTo(bx, by);
    window.localRightTriangle.ctx.strokeStyle = '#2e7d64';
    window.localRightTriangle.ctx.stroke();
    
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(cx, cy);
    window.localRightTriangle.ctx.lineTo(bx, by);
    window.localRightTriangle.ctx.strokeStyle = '#1e3a8a';
    window.localRightTriangle.ctx.stroke();
    
    // Right angle square
    var squareSize = w / 30;
    if (squareSize < 6) squareSize = 6;
    if (squareSize > 14) squareSize = 14;
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(ax, ay);
    window.localRightTriangle.ctx.lineTo(ax + squareSize, ay);
    window.localRightTriangle.ctx.lineTo(ax + squareSize, ay - squareSize);
    window.localRightTriangle.ctx.lineTo(ax, ay - squareSize);
    window.localRightTriangle.ctx.fillStyle = '#b3cfdd';
    window.localRightTriangle.ctx.fill();
    window.localRightTriangle.ctx.strokeStyle = '#346f82';
    window.localRightTriangle.ctx.lineWidth = 1.5;
    window.localRightTriangle.ctx.stroke();
    
    // Vertex dot
    var dotSize = w / 90;
    if (dotSize < 3) dotSize = 3;
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.arc(ax, ay, dotSize, 0, 2 * Math.PI);
    window.localRightTriangle.ctx.fillStyle = '#2c8faa';
    window.localRightTriangle.ctx.fill();
    
    // Labels
    var fontSize = w / 30;
    if (fontSize < 12) fontSize = 12;
    if (fontSize > 18) fontSize = 18;
    window.localRightTriangle.ctx.font = "bold " + fontSize + "px 'Segoe UI', 'Roboto'";
    window.localRightTriangle.ctx.shadowBlur = 0;
    
    // Leg a label - MINIMAL FIX: moved just 2 characters right from original position
    window.localRightTriangle.ctx.fillStyle = '#c44536';
    var legAMidY = (ay + cy) / 2;
    // Original was: extremeLeftOffset = fontSize * 7.5 (too far left)
    // Changed to: fontSize * 5.0 (about 2 character widths to the right)
    var extremeLeftOffset = fontSize * 5.0;
    if (extremeLeftOffset < 65) extremeLeftOffset = 65;
    var labelAX = cx - extremeLeftOffset;
    window.localRightTriangle.ctx.fillText("a = " + window.localRightTriangle.a.toFixed(2), labelAX, legAMidY + fontSize * 0.3);
    
    // Dashed leader for leg a
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(labelAX + fontSize * 3.5, legAMidY + fontSize * 0.2);
    window.localRightTriangle.ctx.lineTo(cx - 3, legAMidY);
    window.localRightTriangle.ctx.strokeStyle = '#c4453688';
    window.localRightTriangle.ctx.setLineDash([4, 4]);
    window.localRightTriangle.ctx.lineWidth = 1.2;
    window.localRightTriangle.ctx.stroke();
    window.localRightTriangle.ctx.setLineDash([]);
    
    // Leg b label
    window.localRightTriangle.ctx.fillStyle = '#2e7d64';
    var legBMidX = (ax + bx) / 2;
    var bottomOffset = fontSize * 1.6;
    var labelBY = ay + bottomOffset;
    window.localRightTriangle.ctx.fillText("b = " + window.localRightTriangle.b.toFixed(2), legBMidX - fontSize * 0.8, labelBY);
    
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(legBMidX, ay + 3);
    window.localRightTriangle.ctx.lineTo(legBMidX, labelBY - fontSize * 0.5);
    window.localRightTriangle.ctx.strokeStyle = '#2e7d6488';
    window.localRightTriangle.ctx.setLineDash([4, 4]);
    window.localRightTriangle.ctx.stroke();
    window.localRightTriangle.ctx.setLineDash([]);
    
    // Hypotenuse label
    var hypMidX = (cx + bx) / 2;
    var hypMidY = (cy + by) / 2;
    var centroidX = (ax + bx + cx) / 3;
    var centroidY = (ay + by + cy) / 3;
    var outDirX = hypMidX - centroidX;
    var outDirY = hypMidY - centroidY;
    var len = Math.hypot(outDirX, outDirY);
    if (len > 0.01) {
      outDirX = outDirX / len;
      outDirY = outDirY / len;
    } else {
      outDirX = 0.7;
      outDirY = -0.7;
    }
    var offset = fontSize * 2.2;
    var labelCX = hypMidX + outDirX * offset;
    var labelCY = hypMidY + outDirY * offset;
    
    window.localRightTriangle.ctx.fillStyle = '#1e3a8a';
    window.localRightTriangle.ctx.fillText("c = " + window.localRightTriangle.c.toFixed(2), labelCX - fontSize * 0.6, labelCY);
    
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(hypMidX, hypMidY);
    window.localRightTriangle.ctx.lineTo(labelCX - fontSize * 0.3, labelCY);
    window.localRightTriangle.ctx.strokeStyle = '#1e3a8a88';
    window.localRightTriangle.ctx.setLineDash([4, 4]);
    window.localRightTriangle.ctx.stroke();
    window.localRightTriangle.ctx.setLineDash([]);
    
    // Decorative tick
    window.localRightTriangle.ctx.beginPath();
    window.localRightTriangle.ctx.moveTo(ax + 4, ay - 4);
    window.localRightTriangle.ctx.lineTo(ax + 9, ay - 9);
    window.localRightTriangle.ctx.strokeStyle = '#6d8f9c';
    window.localRightTriangle.ctx.setLineDash([]);
    window.localRightTriangle.ctx.lineWidth = 1;
    window.localRightTriangle.ctx.stroke();
  };
  
  window.localRightTriangle.handleResize = function() {
    if (window.localRightTriangle.resizeTimeout) clearTimeout(window.localRightTriangle.resizeTimeout);
    window.localRightTriangle.resizeTimeout = setTimeout(function() {
      window.localRightTriangle.drawTriangle();
    }, 100);
  };
  
  window.localRightTriangle.init = function() {
    window.localRightTriangle.canvas = document.getElementById('triangleCanvas');
    if (window.localRightTriangle.canvas) window.localRightTriangle.ctx = window.localRightTriangle.canvas.getContext('2d');
    
    window.localRightTriangle.aInput = document.getElementById('sideAInput');
    window.localRightTriangle.aRange = document.getElementById('sideARange');
    window.localRightTriangle.bInput = document.getElementById('sideBInput');
    window.localRightTriangle.bRange = document.getElementById('sideBRange');
    window.localRightTriangle.cInput = document.getElementById('sideCInput');
    window.localRightTriangle.cRange = document.getElementById('sideCRange');
    window.localRightTriangle.theoremSpan = document.getElementById('theoremText');
    window.localRightTriangle.numericProofSpan = document.getElementById('numericProof');
    
    window.localRightTriangle.a = 3.0;
    window.localRightTriangle.b = 4.0;
    window.localRightTriangle.c = 5.0;
    
    if (window.localRightTriangle.aRange) {
      window.localRightTriangle.aRange.min = window.localRightTriangle.MIN_SIDE;
      window.localRightTriangle.aRange.max = window.localRightTriangle.MAX_SIDE_LEG;
    }
    if (window.localRightTriangle.bRange) {
      window.localRightTriangle.bRange.min = window.localRightTriangle.MIN_SIDE;
      window.localRightTriangle.bRange.max = window.localRightTriangle.MAX_SIDE_LEG;
    }
    if (window.localRightTriangle.cRange) {
      window.localRightTriangle.cRange.min = 1.0;
      window.localRightTriangle.cRange.max = window.localRightTriangle.MAX_HYP;
    }
    
    if (window.localRightTriangle.aInput) {
      window.localRightTriangle.aInput.addEventListener('input', function(e) { window.localRightTriangle.onAChange(e.target.value); });
      window.localRightTriangle.aInput.addEventListener('change', function(e) { window.localRightTriangle.onAChange(e.target.value); });
    }
    if (window.localRightTriangle.aRange) {
      window.localRightTriangle.aRange.addEventListener('input', function(e) { window.localRightTriangle.onAChange(e.target.value); });
    }
    if (window.localRightTriangle.bInput) {
      window.localRightTriangle.bInput.addEventListener('input', function(e) { window.localRightTriangle.onBChange(e.target.value); });
      window.localRightTriangle.bInput.addEventListener('change', function(e) { window.localRightTriangle.onBChange(e.target.value); });
    }
    if (window.localRightTriangle.bRange) {
      window.localRightTriangle.bRange.addEventListener('input', function(e) { window.localRightTriangle.onBChange(e.target.value); });
    }
    if (window.localRightTriangle.cInput) {
      window.localRightTriangle.cInput.addEventListener('input', function(e) { window.localRightTriangle.onCChange(e.target.value); });
      window.localRightTriangle.cInput.addEventListener('change', function(e) { window.localRightTriangle.onCChange(e.target.value); });
    }
    if (window.localRightTriangle.cRange) {
      window.localRightTriangle.cRange.addEventListener('input', function(e) { window.localRightTriangle.onCChange(e.target.value); });
    }
    
    window.addEventListener('resize', window.localRightTriangle.handleResize);
    if (window.localRightTriangle.canvas && window.localRightTriangle.canvas.parentElement) {
      window.localRightTriangle.resizeObserver = new ResizeObserver(function() { window.localRightTriangle.drawTriangle(); });
      window.localRightTriangle.resizeObserver.observe(window.localRightTriangle.canvas.parentElement);
    }
    
    window.localRightTriangle.syncUIFromState();
    setTimeout(function() { window.localRightTriangle.drawTriangle(); }, 20);
  };

function htLoadContent() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (window.localRightTriangle && window.localRightTriangle.init) {
        window.localRightTriangle.init();
      }
    });
  } else {
    if (window.localRightTriangle && window.localRightTriangle.init) {
      window.localRightTriangle.init();
    }
  }
}
