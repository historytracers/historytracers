// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function getCurrentHandYOffset() {
  return local.handsAreDown ? 58 : 0;
}

async function startClap(){
  if(local.clapBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    local.clapCounterDisplay.innerText = ` 0`;
    return;
  }
  local.clapBusy = true;
  let completed = 0;
  local.clapCounterDisplay.innerText = ` ${completed}`;
  
  const currentY = getCurrentHandYOffset();
  const animationDuration = local.clapCycleTime * 0.75;
  const pauseDuration = local.clapCycleTime * 0.25;
  
  // Create dynamic keyframes that respect current Y offset
  const leftKeyName = `clapLeftDynamic_${Date.now()}`;
  const rightKeyName = `clapRightDynamic_${Date.now()}`;
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes ${leftKeyName} {
      0% { transform: translateX(-140px) translateY(${currentY}px); }
      50% { transform: translateX(0px) translateY(${currentY}px); }
      100% { transform: translateX(-140px) translateY(${currentY}px); }
    }
    @keyframes ${rightKeyName} {
      0% { transform: translateX(140px) translateY(${currentY}px); }
      50% { transform: translateX(0px) translateY(${currentY}px); }
      100% { transform: translateX(140px) translateY(${currentY}px); }
    }
    .temp-clap-left {
      animation: ${leftKeyName} ${animationDuration/1000}s ease forwards !important;
    }
    .temp-clap-right {
      animation: ${rightKeyName} ${animationDuration/1000}s ease forwards !important;
    }
  `;
  document.head.appendChild(styleSheet);
  
  for(let i = 0; i < count; i++){
    // temporarily remove hand-down class to avoid conflict, but our keyframes include Y anyway.
    // But we must ensure the base transform doesn't interfere: we add animation class and it overrides.
    local.leftHandElem.classList.add("temp-clap-left");
    local.rightHandElem.classList.add("temp-clap-right");
    await new Promise(r => setTimeout(r, animationDuration));
    local.leftHandElem.classList.remove("temp-clap-left");
    local.rightHandElem.classList.remove("temp-clap-right");
    completed++;
    local.clapCounterDisplay.innerText = ` ${completed}`;
    if (i < count - 1) {
      await new Promise(r => setTimeout(r, pauseDuration));
    }
  }
  
  // cleanup dynamic style
  setTimeout(() => { if(styleSheet && styleSheet.parentNode) styleSheet.remove(); }, 200);

  if (!local.handsAreDown && local.steps == 0) {
    local.leftHandElem.classList.add("hand-down");
    local.rightHandElem.classList.add("hand-down");
    local.handsAreDown = true;

    $("#clapCount").val(local.bottomValue);
    local.steps = 1;
  } else if (local.steps = 2) {
      $("#clapCount").val(local.result);
      local.steps = 3;
  }

  local.clapBusy = false;

  if (local.handsAreDown && $("#clapCount").val() == local.bottomValue && local.steps == 1) {
      local.steps = 2;
      startClap();
  } else if (local.handsAreDown && $("#clapCount").val() == local.result && local.steps == 3) {
      local.steps = 4;
      startSteps();
  }
}

// Jump (unchanged)
async function startJump() {
  if(local.jumpBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    local.jumpCounterDisplay.innerText = `0`;
    return;
  }
  local.jumpBusy = true;
  let completed = 0;
  local.jumpCounterDisplay.innerText = `${completed}`;
  const jumpDuration = local.clapCycleTime * 0.5;
  for(let i = 0; i < count; i++) {
    local.feetJumpWrapper.classList.add('feet-jumping');
    await new Promise(r => setTimeout(r, jumpDuration));
    local.feetJumpWrapper.classList.remove('feet-jumping');
    completed++;
    local.jumpCounterDisplay.innerText = `${completed}`;
    if (i < count - 1) {
      await new Promise(r => setTimeout(r, jumpDuration * 0.3));
    }
  }
  local.jumpBusy = false;
}

// Steps (unchanged)
async function startSteps() {
  if(local.stepsBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    local.stepsCounterDisplay.innerText = `0`;
    return;
  }
  local.stepsBusy = true;
  let completed = 0;
  local.stepsCounterDisplay.innerText = `${completed}`;
  const stepDuration = local.clapCycleTime * 0.4;
  for(let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      leftFoot.classList.add('zoom-left');
      await new Promise(r => setTimeout(r, stepDuration));
      leftFoot.classList.remove('zoom-left');
    } else {
      rightFoot.classList.add('zoom-right');
      await new Promise(r => setTimeout(r, stepDuration));
      rightFoot.classList.remove('zoom-right');
    }
    completed++;
    local.stepsCounterDisplay.innerText = `${completed}`;
    if (i < count - 1) {
      await new Promise(r => setTimeout(r, stepDuration * 0.2));
    }
  }
  local.stepsBusy = false;
}

function htNewLocalAddition() {
    if (local.handsAreDown) {
        local.leftHandElem.classList.remove("hand-down");
        local.rightHandElem.classList.remove("hand-down");
    }

    local.steps = 0;
    local.topValue = htGetRandomArbitrary(1, 9);
    let topValue = local.topValue;
    local.bottomValue = htGetRandomArbitrary(1, 9);
    let bottomValue = local.bottomValue;
    let result = topValue + bottomValue;
    let nextValue = (result > 9) ? 1 : "";

    local.result = result;
    // CONTINUE WITH IT
    local.lastStep = (result > 9) ? 6: 5;

    $("#nextVal").html(nextValue);
    $("#topVal").html(topValue);
    $("#bottomVal").html(bottomValue);
    $("#resVal").html((result > 9) ? result : " "+result);
}

function htExecuteSum() {
    $("#clapCount").val(local.topValue);
    startClap();

}

function htLoadContent() {
    htWriteNavigation();

    local = { "palette":  document.getElementById("palette"), "hands": document.querySelectorAll(".hand-shape"), "leftHandElem": document.getElementById("leftHand"), "rightHandElem": document.getElementById("rightHand"), "feetJumpWrapper": document.getElementById("feetJumpWrapper"), "leftFoot": document.getElementById("leftFoot"), "rightFoot": document.getElementById("rightFoot"), "clapBusy": false, "jumpBusy": false, "stepsBusy": false, "handsAreDown": false, "handPosCounterSpan": document.getElementById("handPosCounter"), "moveToggleBtn": document.getElementById("moveDownBtn"), "speedSlider": document.getElementById("speedSlider"), "clapCycleTime": 1100, "clapCounterDisplay": document.getElementById("clapCounter"), "jumpCounterDisplay": document.getElementById("jumpCounter"), "stepsCounterDisplay": document.getElementById("stepsCounter"), "topValue": 0, "bottomValue": 0, "result": 0, "steps": 0, "lastStep": 0};

    skinTones.forEach((color, index)=>{
        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.background = color;
        if(index === 5) swatch.classList.add("active");
        swatch.onclick = ()=>{
            document.querySelectorAll(".color-swatch").forEach(s=>s.classList.remove("active"));
            swatch.classList.add("active");
            local.hands.forEach(h=>h.setAttribute("fill", color));
            document.querySelectorAll(".toe, .basis").forEach(el => el.setAttribute("fill", color));
        };
        palette.appendChild(swatch);
    });

    local.speedSlider.addEventListener("input", function() {
        local.clapCycleTime = parseInt(this.value);
        document.documentElement.style.setProperty('--jump-duration', (local.clapCycleTime * 0.5) + 'ms');
        document.documentElement.style.setProperty('--step-duration', (local.clapCycleTime * 0.4) + 'ms');
    });

    document.documentElement.style.setProperty('--jump-duration', '550ms');
    document.documentElement.style.setProperty('--step-duration', '440ms');

    htNewLocalAddition();

    return false;
}
