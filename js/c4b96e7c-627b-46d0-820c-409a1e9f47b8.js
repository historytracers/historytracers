// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

async function startClap(){
  if(local.busy) return;
  if(local.upDownBusy) return;

  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    local.counterDisplay.innerText = `0 / 0`;
    return;
  }

  local.busy = true;

  let completed = 0;
  local.counterDisplay.innerText = `${completed} / ${count}`;

  const animationDuration = local.clapCycleTime * 0.75;
  const pauseDuration = local.clapCycleTime * 0.25;

  for(let i = 0; i < count; i++){
    local.left.style.animation = `clapLeft ${animationDuration/1000}s ease`;
    local.right.style.animation = `clapRight ${animationDuration/1000}s ease`;

    await new Promise(r => setTimeout(r, animationDuration));

    local.left.style.animation = "";
    local.right.style.animation = "";

    completed++;
    local.counterDisplay.innerText = `${completed} / ${count}`;

    if (i < count - 1) {
      await new Promise(r => setTimeout(r, pauseDuration));
    }
  }

  local.busy = false;
}

// ===== Up/Down only (based on clapCount) - repeated up+down movements =====
async function performUpDownMoves() {
  if (local.busy) return;
  if (local.upDownBusy) return;
  
  const countInput = document.getElementById("clapCount");
  let moves = parseInt(countInput.value);
  
  if (isNaN(moves) || moves < 1) {
    return;
  }
  
  if (moves > 9) moves = 9;
  
  local.upDownBusy = true;
  
  let cycleDuration = Math.max(350, local.clapCycleTime * 0.7);
  cycleDuration = Math.min(cycleDuration, 1400);
  const moveDuration = cycleDuration;
  
  let completedMoves = 0;
  local.counterDisplay.innerText = `${completedMoves} / ${moves}`;
  
  for (let i = 0; i < moves; i++) {
    local.left.style.animation = `moveUpThenDown ${moveDuration/1000}s ease-in-out`;
    local.right.style.animation = `moveRightUpThenDown ${moveDuration/1000}s ease-in-out`;
    
    await new Promise(resolve => setTimeout(resolve, moveDuration));
    
    local.left.style.animation = "";
    local.right.style.animation = "";
    local.left.style.transform = "";
    local.right.style.transform = "";
    
    completedMoves++;
    local.counterDisplay.innerText = `${completedMoves} / ${moves}`;
    
    if (i < moves - 1) {
      await new Promise(resolve => setTimeout(resolve, 80));
    }
  }
  
  local.counterDisplay.innerText = `0 / 0`;
  local.upDownBusy = false;
}

// ===== NEW: Repeated sequence: Hands Up → Hands Down → Clap (repeats according to clapCount) =====
// Each full cycle consists of: up motion, down motion, then an immediate clap.
async function performRepeatedUpDownThenClap() {
  if (local.busy) return;
  if (local.upDownBusy) return;
  
  const countInput = document.getElementById("clapCount");
  let repeats = parseInt(countInput.value);
  
  if (isNaN(repeats) || repeats < 1) {
    return;
  }
  if (repeats > 9) repeats = 9;
  
  local.upDownBusy = true;
  
  // Duration for the up+down motion (smooth rise and fall)
  let motionDuration = Math.max(400, local.clapCycleTime * 0.7);
  motionDuration = Math.min(motionDuration, 1400);
  
  // Duration for the clap part (same as original clap timing)
  const clapDuration = local.clapCycleTime * 0.75;
  // Small pause between sequences for natural feel
  const interSequencePause = 100;
  
  let completedCycles = 0;
  local.counterDisplay.innerText = `${completedCycles} / ${repeats}`;
  
  for (let cycle = 0; cycle < repeats; cycle++) {
    // STEP 1: Hands go UP then DOWN (return to neutral position)
    local.left.style.animation = `moveUpThenDown ${motionDuration/1000}s ease-in-out`;
    local.right.style.animation = `moveRightUpThenDown ${motionDuration/1000}s ease-in-out`;
    
    await new Promise(resolve => setTimeout(resolve, motionDuration));
    
    // Clear up/down animation and reset transforms
    local.left.style.animation = "";
    local.right.style.animation = "";
    local.left.style.transform = "";
    local.right.style.transform = "";
    
    // Tiny micro-pause to ensure hands are settled at neutral before clap
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // STEP 2: Perform ONE clap immediately (hands come together and back)
    local.left.style.animation = `clapLeft ${clapDuration/1000}s ease`;
    local.right.style.animation = `clapRight ${clapDuration/1000}s ease`;
    
    await new Promise(resolve => setTimeout(resolve, clapDuration));
    
    // Clear clap animation
    local.left.style.animation = "";
    local.right.style.animation = "";
    
    completedCycles++;
    local.counterDisplay.innerText = `${completedCycles} / ${repeats}`;
    
    // Small pause between full sequences (except after last one)
    if (cycle < repeats - 1) {
      await new Promise(resolve => setTimeout(resolve, interSequencePause));
    }
  }
  
  // Final counter reset after all sequences complete
  local.counterDisplay.innerText = `0 / 0`;
  local.upDownBusy = false;
}

function htNewLocalMultiplication() {
    local.busy = false,
    local.upDownBusy = false,

    local.topValue = htGetRandomArbitrary(1, 10);
    let topValue = parseInt(local.topValue);
    local.currentSelection = $("#mtValues").val();
    if (local.currentSelection == "-1") {
        local.bottomValue = local.prevMultiplier;
        local.prevMultiplier = (local.prevMultiplier == "4") ? "5" : "4";
    } else {
        local.bottomValue = local.currentSelection;
    }
    local.currentSelection = local.bottomValue;
    let bottomValue = local.bottomValue;
    let result = topValue * bottomValue;

    local.result = result;

    $("#topVal").html(topValue);
    $("#bottomVal").html(bottomValue);
    $("#resVal").html((result > 9) ? result : " "+result);

    $("#clapCounter").html(": 0");
}

function htLoadContent() {
    htWriteNavigation();
    htSetImageSrc("img9", "images/ResearchGate/Figura-9-Hueso-de-Lebombo.png");
    htSetImageSrc("imgHNaledi", "images/eLife/elife-09560-fig1-v1.jpg");

    local = { 
        "palette": document.getElementById("palette"),
        "hands": document.querySelectorAll(".hand-shape"),
        "left": document.getElementById("leftHand"),
        "right": document.getElementById("rightHand"),

        "busy": false,
        "upDownBusy": false,

        "speedSlider": document.getElementById("speedSlider"),
        "clapCycleTime": 800,
        "counterDisplay": document.getElementById("clapCounter"),
        
        "topValue": 0,
        "bottomValue": 0,
        "prevMultiplier": 4,
        "currentSelection": 5,
        "result": 0
    };

    if (local.speedSlider) {
        local.speedSlider.addEventListener("input", function() {
            local.clapCycleTime = parseInt(this.value);
        });
    }

    skinTones.forEach((color, index)=>{
        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.background = color;

        if(index === 5) swatch.classList.add("active");

        swatch.onclick = ()=>{
            document.querySelectorAll(".color-swatch").forEach(s=>s.classList.remove("active"));
            swatch.classList.add("active");
            local.hands.forEach(h=>h.setAttribute("fill", color));
        };

        local.palette.appendChild(swatch);
    });


    return false;
}
