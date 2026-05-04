// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function getCurrentHandYOffset() {
  return local.handsAreDown ? 58 : 0;
}

async function startClap(){
  if(local.clapBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) { local.clapCounterDisplay.innerText = `: 0`; return; }
  local.clapBusy = true;
  let completed = 0;
  local.clapCounterDisplay.innerText = `: ${completed}`;
  const currentY = getCurrentHandYOffset();
  const animationDuration = local.clapCycleTime * 0.75;
  const pauseDuration = local.clapCycleTime * 0.25;
  const leftKeyName = `clapLeft_${Date.now()}`;
  const rightKeyName = `clapRight_${Date.now()}`;
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes ${leftKeyName} { 0% { transform: translateX(-140px) translateY(${currentY}px); } 50% { transform: translateX(0px) translateY(${currentY}px); } 100% { transform: translateX(-140px) translateY(${currentY}px); } }
    @keyframes ${rightKeyName} { 0% { transform: translateX(140px) translateY(${currentY}px); } 50% { transform: translateX(0px) translateY(${currentY}px); } 100% { transform: translateX(140px) translateY(${currentY}px); } }
    .temp-clap-left { animation: ${leftKeyName} ${animationDuration/1000}s ease forwards !important; }
    .temp-clap-right { animation: ${rightKeyName} ${animationDuration/1000}s ease forwards !important; }
  `;
  document.head.appendChild(styleSheet);
  let next = parseInt(local.bottomValue);
  for(let i=0;i<count;i+=next){
    local.leftHandElem.classList.add("temp-clap-left");
    local.rightHandElem.classList.add("temp-clap-right");
    await new Promise(r=>setTimeout(r, animationDuration));
    local.leftHandElem.classList.remove("temp-clap-left");
    local.rightHandElem.classList.remove("temp-clap-right");
    completed++;
    local.clapCounterDisplay.innerText = `: ${i + next}`;
    if(i<count-1) await new Promise(r=>setTimeout(r, pauseDuration));
  }
  setTimeout(()=>styleSheet.remove(),200);
  local.running = false;
  local.clapBusy=false;
}

async function startJump(){
  if(local.jumpBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) { local.clapCounterDisplay.innerText = `: 0`; return; }
  local.jumpBusy=true; let completed=0;
  local.clapCounterDisplay.innerText = `: ${completed}`;
  const jumpDuration = local.clapCycleTime * 0.5;
  let next = parseInt(local.bottomValue);
  for(let i=0;i<count;i+=next){
    local.feetJumpWrapper.classList.add('feet-jumping');
    await new Promise(r=>setTimeout(r, jumpDuration));
    local.feetJumpWrapper.classList.remove('feet-jumping');
    completed++;
    local.clapCounterDisplay.innerText = `: ${i + next}`;
    if(i<count-1) await new Promise(r=>setTimeout(r, jumpDuration*0.3));
  }
  local.running = false;
  local.jumpBusy=false;
}

async function startSteps(){
  if(local.stepsBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) { local.clapCounterDisplay.innerText = `: 0`; return; }
  local.stepsBusy=true; let completed=0;
  local.clapCounterDisplay.innerText = `: ${completed}`;
  const stepDuration = local.clapCycleTime * 0.4;
  for(let i=0;i<count;i+=local.bottomValue){
    if(i%2===0){ local.leftFoot.classList.add('zoom-left'); await new Promise(r=>setTimeout(r, stepDuration)); local.leftFoot.classList.remove('zoom-left'); }
    else{ local.rightFoot.classList.add('zoom-right'); await new Promise(r=>setTimeout(r, stepDuration)); local.rightFoot.classList.remove('zoom-right'); }
    completed++;
    local.clapCounterDisplay.innerText = `: ${completed}`;
    if(i<count-1) await new Promise(r=>setTimeout(r, stepDuration*0.2));
  }
  local.running = false;
  local.stepsBusy=false;
}

async function startWave(){
  if(local.waveBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) { local.clapCounterDisplay.innerText = `: 0`; return; }
  local.waveBusy=true; let completed=0;
  local.clapCounterDisplay.innerText = `: ${completed}`;
  const currentY = getCurrentHandYOffset();
  const waveMoveDuration = local.clapCycleTime * 0.45;
  const rest = waveMoveDuration * 0.25;
  let next = parseInt(local.bottomValue);
  for(let i=0;i<count;i+=next){
    const leftAnim = `waveL_${Date.now()}_${i}`;
    const rightAnim = `waveR_${Date.now()}_${i}`;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ${leftAnim} { 0% { transform: translateX(-140px) translateY(${currentY}px); } 50% { transform: translateX(-178px) translateY(${currentY}px); } 100% { transform: translateX(-140px) translateY(${currentY}px); } }
      @keyframes ${rightAnim} { 0% { transform: translateX(140px) translateY(${currentY}px); } 50% { transform: translateX(178px) translateY(${currentY}px); } 100% { transform: translateX(140px) translateY(${currentY}px); } }
      .wave-left-temp { animation: ${leftAnim} ${waveMoveDuration/1000}s ease-in-out forwards; }
      .wave-right-temp { animation: ${rightAnim} ${waveMoveDuration/1000}s ease-in-out forwards; }
    `;
    document.head.appendChild(style);
    local.leftHandElem.classList.add("wave-left-temp");
    local.rightHandElem.classList.add("wave-right-temp");
    await new Promise(r=>setTimeout(r, waveMoveDuration));
    local.leftHandElem.classList.remove("wave-left-temp");
    local.rightHandElem.classList.remove("wave-right-temp");
    setTimeout(()=>style.remove(),100);
    completed++;
    local.clapCounterDisplay.innerText = `: ${i + next}`;
    if(i<count-1) await new Promise(r=>setTimeout(r, rest));
  }
  local.running = false;
  local.waveBusy=false;
}

async function repeatIsolatedHandLeft() {
  if(local.isolatedBusy || local.clapBusy || local.jumpBusy || local.stepsBusy || local.waveBusy) return;
  local.clapCounterDisplay.innerText = `: 0`;
  const reps = parseInt(document.getElementById("clapCount").value);
  if(!reps || reps < 1) return;
  local.isolatedBusy = true;
  const currentY = getCurrentHandYOffset();
  const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gesture-duration').trim()) || 385;
  const pause = duration * 0.2;
  
  let next = parseInt(local.bottomValue);
  for(let rep = 0; rep < reps; rep+=next) {
    const animName = `leftIso_${Date.now()}_${rep}`;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ${animName} {
        0% { transform: translateX(-140px) translateY(${currentY}px); }
        50% { transform: translateX(-188px) translateY(${currentY}px); }
        100% { transform: translateX(-140px) translateY(${currentY}px); }
      }
      .iso-left-hand { animation: ${animName} ${duration/1000}s ease-in-out forwards !important; }
    `;
    document.head.appendChild(style);
    local.leftHandElem.classList.add("iso-left-hand");
    await new Promise(r => setTimeout(r, duration));
    local.leftHandElem.classList.remove("iso-left-hand");
    setTimeout(()=>style.remove(), 30);
    local.clapCounterDisplay.innerText = `: ${rep + 1}`;
    if(rep < reps-1) await new Promise(r => setTimeout(r, pause));
  }
  local.running = false;
  local.isolatedBusy = false;
}

async function repeatIsolatedHandRight() {
  if(local.isolatedBusy || local.clapBusy || local.jumpBusy || local.stepsBusy || local.waveBusy) return;
  const reps = parseInt(document.getElementById("clapCount").value);
  if(!reps || reps < 1) return;
  local.isolatedBusy = true;
  const currentY = getCurrentHandYOffset();
  const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gesture-duration').trim()) || 385;
  const pause = duration * 0.4;
  
  let next = parseInt(local.bottomValue);
  for(let rep = 0; rep < reps; rep+=next) {
    const animName = `rightIso_${Date.now()}_${rep}`;
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ${animName} {
        0% { transform: translateX(140px) translateY(${currentY}px); }
        50% { transform: translateX(188px) translateY(${currentY}px); }
        100% { transform: translateX(140px) translateY(${currentY}px); }
      }
      .iso-right-hand { animation: ${animName} ${duration/1000}s ease-in-out forwards !important; }
    `;
    document.head.appendChild(style);
    local.rightHandElem.classList.add("iso-right-hand");
    await new Promise(r => setTimeout(r, duration));
    local.rightHandElem.classList.remove("iso-right-hand");
    setTimeout(()=>style.remove(), 30);
    local.clapCounterDisplay.innerText = `: ${rep + 1}`;
    if(rep < reps-1) await new Promise(r => setTimeout(r, pause));
  }
  local.running = false;
  local.isolatedBusy = false;
}

async function repeatIsolatedStepLeft(showCounter) {
  if((local.isolatedBusy || local.clapBusy || local.jumpBusy || local.stepsBusy || local.waveBusy) && showCounter) return;
  const reps = parseInt(document.getElementById("clapCount").value);
  if(!reps || reps < 1) return;
  local.isolatedBusy = true;
  const stepDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--step-duration').trim()) || 440;
  const pause = stepDuration * 0.4;
  
  let next = parseInt(local.bottomValue);
  for(let rep = 0; rep < reps; rep+=next) {
    local.leftFoot.classList.add('zoom-left');
    await new Promise(r => setTimeout(r, stepDuration));
    if (showCounter) { local.clapCounterDisplay.innerText = `: ${rep + 1}`; }
    local.leftFoot.classList.remove('zoom-left');
    if(rep < reps-1) await new Promise(r => setTimeout(r, pause));
  }
  local.isolatedBusy = false;
}

async function repeatIsolatedStepRight(showCounter) {
  if((local.isolatedBusy || local.clapBusy || local.jumpBusy || local.stepsBusy || local.waveBusy) && showCounter) return;
  const reps = parseInt(document.getElementById("clapCount").value);
  if(!reps || reps < 1) return;
  local.isolatedBusy = true;
  const stepDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--step-duration').trim()) || 440;
  const pause = stepDuration * 0.4;
  
  let next = parseInt(local.bottomValue);
  for(let rep = 0; rep < reps; rep+=next) {
    local.rightFoot.classList.add('zoom-right');
    await new Promise(r => setTimeout(r, stepDuration));
    if (showCounter) { local.clapCounterDisplay.innerText = `: ${rep + 1}`; }
    local.rightFoot.classList.remove('zoom-right');
    if(rep < reps-1) await new Promise(r => setTimeout(r, pause));
  }
  local.running = false;
  local.isolatedBusy = false;
}

function htNewLocalMultiplication() {
    local.steps = 0;
    local.running = false;
    local.topValue = htGetRandomArbitrary(1, 10);
    let topValue = local.topValue;
    local.currentSelection = $("#mtValues").val();
    local.bottomValue = (local.currentSelection == "-1") ? htGetRandomArbitrary(1, 4) : local.currentSelection;
    local.currentSelection = local.bottomValue;
    let bottomValue = local.bottomValue;
    let result = topValue * bottomValue;

    local.result = result;

    $("#topVal").html(topValue);
    $("#bottomVal").html(bottomValue);
    $("#resVal").html((result > 9) ? result : " "+result);

    $("#clapCounter").html(": 0");
    $("#stepsCounter").html(": 0");
    $("#clapCount").val(0);
}

function htExecuteOneMult() {
    let choose = 0;
    if (local.firstGroupOne) {
        choose = htGetRandomArbitrary(1, 3);
        local.firstGroupOne = false;
    } else {
        choose = htGetRandomArbitrary(3, 5);
        local.firstGroupOne = true;
    }
    switch (choose) {
        case 1:
            repeatIsolatedHandLeft();
            break;
        case 2:
            repeatIsolatedHandRight();
            break;
        case 3:
            repeatIsolatedStepLeft(true);
            break;
        default:
            repeatIsolatedStepRight(true);
            break;
    }
    local.running = false;
}

function htExecuteTwoMult() {
    let choose = 0;
    if (local.firstGroupTwo) {
        choose = htGetRandomArbitrary(1, 3);
        local.firstGroupTwo = false;
    } else {
        choose = htGetRandomArbitrary(3, 5);
        local.firstGroupTwo = true;
    }

    switch (choose) {
        case 1:
            startClap();
            break;
        case 2:
            startJump();
            break;
        default:
            startWave();
            break;
    }
}

function htExecuteThreeMult() {
    startWave();
    if (local.firstGroupThree) {
        repeatIsolatedStepLeft(false);
        local.firstGroupThree = false;
    } else {
        repeatIsolatedStepRight(false);
        local.firstGroupThree = true;
    }
}

function htExecuteMult() {
    if (local.running) {
        return;
    }
    local.running = true;

    $("#clapCounter").html(": 0");
    $("#stepsCounter").html(": 0");

    $("#clapCount").val(local.result);

    if (local.currentSelection == "1") {
        htExecuteOneMult();
    }
    else if (local.currentSelection == "2") {
        htExecuteTwoMult();
    } else {
        htExecuteThreeMult();
    }
    local.running = false;
}

function htLoadContent() {
    htWriteNavigation();

    local = { "palette": document.getElementById("palette"), "hands": document.querySelectorAll(".hand-shape"), "leftHandElem": document.getElementById("leftHand"), "rightHandElem": document.getElementById("rightHand"), "feetJumpWrapper": document.getElementById("feetJumpWrapper"), "leftFoot": document.getElementById("leftFoot"), "rightFoot": document.getElementById("rightFoot"), "clapBusy": false, "jumpBusy": false, "stepsBusy": false, "waveBusy": false, "isolatedBusy": false, "handPosCounterSpan": document.getElementById("handPosCounter"), "moveToggleBtn": document.getElementById("moveDownBtn"), "speedSlider": document.getElementById("speedSlider"), "clapCycleTime":  1100, "clapCounterDisplay": document.getElementById("clapCounter"), "topValue": 0, "bottomValue": 0, "result": 0, "currentSelection": -1, "running": false, "firstGroupOne": true, "firstGroupTwo": true, "firstGroupThree": true};

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
        document.documentElement.style.setProperty('--gesture-duration', (local.clapCycleTime * 0.35) + 'ms');
    });
    document.documentElement.style.setProperty('--jump-duration', '550ms');
    document.documentElement.style.setProperty('--step-duration', '440ms');
    document.documentElement.style.setProperty('--gesture-duration', '385ms');

    if ($("#mtValues").length > 0) {
        var data = [
            { text: '1', value: '1' },
            { text: '2', value: '2' },
            { text: '3', value: '3' }
        ];

        $.each(data, function(index, item) {
            $('#mtValues').append($('<option>', {
                value: item.value,
                text: item.text
            }));
        });

        $("#mtValues").on( "change", function() {
            var opt = $(this).val();
            htNewLocalMultiplication(opt);
        });
    }

    htNewLocalMultiplication(-1);

    htSetImageSrc("imgHer", "images/DonsMaps/1590b.jpg");
    htSetImageSrc("imgNean", "images/DonsMaps/img_6801ferrassie.jpg");
    htSetImageSrc("imgHs7", "images/MexicoCityMuseo/HomoSapiens.jpg");

    return false;
}
