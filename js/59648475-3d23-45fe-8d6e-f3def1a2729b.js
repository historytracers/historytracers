// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htNewLocalMultiplication() {
    if (local.handsAreDown) {
        local.leftHandElem.classList.remove("hand-down");
        local.rightHandElem.classList.remove("hand-down");
        local.handsAreDown = false;
    }

    local.steps = 0;
    local.topValue = htGetRandomArbitrary(1, 9);
    let topValue = local.topValue;
    local.bottomValue = ($("#mtValues").val() == "-1") ? htGetRandomArbitrary(1, 3) : $("#mtValues").val();
    let bottomValue = local.bottomValue;
    let result = topValue * bottomValue;

    local.result = result;
    local.lastStep = (result > 9) ? 6: 5;

    $("#topVal").html(topValue);
    $("#bottomVal").html(bottomValue);
    $("#resVal").html((result > 9) ? result : " "+result);

    $("#clapCounter").html(": 0");
    $("#jumpCounter").html(": 0");
    $("#stepsCounter").html(": 0");
    $("#clapCount").val(0);
}

async function startClap(){
  if(local.clapBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) { local.clapCounterDisplay.innerText = ` 0`; return; }
  local.clapBusy = true;
  let completed = 0;
  local.clapCounterDisplay.innerText = ` ${completed}`;
  const currentY = getCurrentHandYOffset();
  const animationDuration = clapCycleTime * 0.75;
  const pauseDuration = clapCycleTime * 0.25;
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
  for(let i=0;i<count;i++){
    local.leftHandElem.classList.add("temp-clap-left");
    local.rightHandElem.classList.add("temp-clap-right");
    await new Promise(r=>setTimeout(r, animationDuration));
    local.leftHandElem.classList.remove("temp-clap-left");
    local.rightHandElem.classList.remove("temp-clap-right");
    completed++;
    local.clapCounterDisplay.innerText = ` ${completed}`;
    if(i<count-1) await new Promise(r=>setTimeout(r, pauseDuration));
  }
  setTimeout(()=>styleSheet.remove(),200);
  local.clapBusy=false;
}

async function startJump(){
  if(local.jumpBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count||count<1){ jumpCounterDisplay.innerText = ` 0`; return; }
  local.jumpBusy=true; let completed=0;
  jumpCounterDisplay.innerText = ` ${completed}`;
  const jumpDuration = clapCycleTime * 0.5;
  for(let i=0;i<count;i++){
    local.feetJumpWrapper.classList.add('feet-jumping');
    await new Promise(r=>setTimeout(r, jumpDuration));
    local.feetJumpWrapper.classList.remove('feet-jumping');
    completed++;
    jumpCounterDisplay.innerText = ` ${completed}`;
    if(i<count-1) await new Promise(r=>setTimeout(r, jumpDuration*0.3));
  }
  local.jumpBusy=false;
}

async function startSteps(){
  if(local.stepsBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count||count<1){ stepsCounterDisplay.innerText = ` 0`; return; }
  local.stepsBusy=true; let completed=0;
  stepsCounterDisplay.innerText = ` ${completed}`;
  const stepDuration = clapCycleTime * 0.4;
  for(let i=0;i<count;i++){
    if(i%2===0){ local.leftFoot.classList.add('zoom-left'); await new Promise(r=>setTimeout(r, stepDuration)); local.leftFoot.classList.remove('zoom-left'); }
    else{ local.rightFoot.classList.add('zoom-right'); await new Promise(r=>setTimeout(r, stepDuration)); local.rightFoot.classList.remove('zoom-right'); }
    completed++;
    stepsCounterDisplay.innerText = ` ${completed}`;
    if(i<count-1) await new Promise(r=>setTimeout(r, stepDuration*0.2));
  }
  local.stepsBusy=false;
}

async function startWave(){
  if(local.waveBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count||count<1){ waveCounterDisplay.innerText = ` 0`; return; }
  local.waveBusy=true; let completed=0;
  waveCounterDisplay.innerText = ` ${completed}`;
  const currentY = getCurrentHandYOffset();
  const waveMoveDuration = clapCycleTime * 0.45;
  const rest = waveMoveDuration * 0.25;
  for(let i=0;i<count;i++){
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
    waveCounterDisplay.innerText = ` ${completed}`;
    if(i<count-1) await new Promise(r=>setTimeout(r, rest));
  }
  local.waveBusy=false;
}

async function repeatIsolatedHandLeft() {
  if(local.isolatedBusy || local.clapBusy || local.jumpBusy || local.stepsBusy || local.waveBusy) return;
  const reps = parseInt(document.getElementById("clapCount").value);
  if(!reps || reps < 1) return;
  local.isolatedBusy = true;
  const currentY = getCurrentHandYOffset();
  const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gesture-duration').trim()) || 385;
  const pause = duration * 0.2;
  
  for(let rep = 0; rep < reps; rep++) {
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
    if(rep < reps-1) await new Promise(r => setTimeout(r, pause));
  }
  local.isolatedBusy = false;
}

async function repeatIsolatedHandRight() {
  if(local.isolatedBusy || local.clapBusy || local.jumpBusy || local.stepsBusy || local.waveBusy) return;
  const reps = parseInt(document.getElementById("clapCount").value);
  if(!reps || reps < 1) return;
  local.isolatedBusy = true;
  const currentY = getCurrentHandYOffset();
  const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gesture-duration').trim()) || 385;
  const pause = duration * 0.2;
  
  for(let rep = 0; rep < reps; rep++) {
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
    if(rep < reps-1) await new Promise(r => setTimeout(r, pause));
  }
  local.isolatedBusy = false;
}

async function repeatIsolatedStepLeft() {
  if(local.isolatedBusy || local.clapBusy || local.jumpBusy || local.stepsBusy || local.waveBusy) return;
  const reps = parseInt(document.getElementById("clapCount").value);
  if(!reps || reps < 1) return;
  local.isolatedBusy = true;
  const stepDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--step-duration').trim()) || 440;
  const pause = stepDuration * 0.2;
  
  for(let rep = 0; rep < reps; rep++) {
    local.leftFoot.classList.add('zoom-left');
    await new Promise(r => setTimeout(r, stepDuration));
    local.leftFoot.classList.remove('zoom-left');
    if(rep < reps-1) await new Promise(r => setTimeout(r, pause));
  }
  local.isolatedBusy = false;
}

async function repeatIsolatedStepRight() {
  if(local.isolatedBusy || local.clapBusy || local.jumpBusy || local.stepsBusy || local.waveBusy) return;
  const reps = parseInt(document.getElementById("clapCount").value);
  if(!reps || reps < 1) return;
  local.isolatedBusy = true;
  const stepDuration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--step-duration').trim()) || 440;
  const pause = stepDuration * 0.2;
  
  for(let rep = 0; rep < reps; rep++) {
    local.rightFoot.classList.add('zoom-right');
    await new Promise(r => setTimeout(r, stepDuration));
    local.rightFoot.classList.remove('zoom-right');
    if(rep < reps-1) await new Promise(r => setTimeout(r, pause));
  }
  local.isolatedBusy = false;
}

function htLoadContent() {
    htWriteNavigation();

    local = { "palette": document.getElementById("palette"), "hands": document.querySelectorAll(".hand-shape"), "leftHandElem": document.getElementById("leftHand"), "rightHandElem": document.getElementById("rightHand"), "feetJumpWrapper": document.getElementById("feetJumpWrapper"), "leftFoot": document.getElementById("leftFoot"), "rightFoot": document.getElementById("rightFoot"), "clapBusy": false, "jumpBusy": false, "stepsBusy": false, "waveBusy": false, "isolatedBusy": false, "handPosCounterSpan": document.getElementById("handPosCounter"), "moveToggleBtn": document.getElementById("moveDownBtn"), "speedSlider": document.getElementById("speedSlider"), "clapCycleTime":  1100, "clapCounterDisplay": document.getElementById("clapCounter"), "jumpCounterDisplay": document.getElementById("jumpCounter"), "stepsCounterDisplay": document.getElementById("stepsCounter"), "waveCounterDisplay": document.getElementById("waveCounter")};

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
        document.documentElement.style.setProperty('--jump-duration', (clapCycleTime * 0.5) + 'ms');
        document.documentElement.style.setProperty('--step-duration', (clapCycleTime * 0.4) + 'ms');
        document.documentElement.style.setProperty('--gesture-duration', (clapCycleTime * 0.35) + 'ms');
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
            htFillExercise(opt);
        });
    }

    htNewLocalMultiplication();
    return false;
}
