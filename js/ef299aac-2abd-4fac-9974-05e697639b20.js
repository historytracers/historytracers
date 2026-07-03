// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

async function startClap(){
  if(local.clapBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    local.clapCounterDisplay.innerText = `0 / 0`;
    return;
  }
  local.clapBusy = true;
  let completed = 0;
  local.clapCounterDisplay.innerText = `${completed} / ${count}`;
  const animationDuration = local.clapCycleTime * 0.75;
  const pauseDuration = local.clapCycleTime * 0.25;
  for(let i = 0; i < count; i++){
    local.left.style.animation = `clapLeft ${animationDuration/1000}s ease`;
    local.right.style.animation = `clapRight ${animationDuration/1000}s ease`;
    await new Promise(r => setTimeout(r, animationDuration));
    local.left.style.animation = "";
    local.right.style.animation = "";
    completed++;
    local.clapCounterDisplay.innerText = `${completed} / ${count}`;
    if (i < count - 1) {
      await new Promise(r => setTimeout(r, pauseDuration));
    }
  }
  local.clapBusy = false;
}

async function startJump() {
  if(local.jumpBusy) return;
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    local.jumpCounterDisplay.innerText = `0 / 0`;
    return;
  }
  local.jumpBusy = true;
  let completed = 0;
  local.jumpCounterDisplay.innerText = `${completed} / ${count}`;
  const jumpDuration = local.clapCycleTime * 0.5;
  for(let i = 0; i < count; i++) {
    local.feetJumpWrapper.classList.add('feet-jumping');
    await new Promise(r => setTimeout(r, jumpDuration));
    local.feetJumpWrapper.classList.remove('feet-jumping');
    completed++;
    local.jumpCounterDisplay.innerText = `${completed} / ${count}`;
    if (i < count - 1) {
      await new Promise(r => setTimeout(r, jumpDuration * 0.3));
    }
  }
  local.jumpBusy = false;
}

async function startSteps() {
  if(local.stepsBusy) return;
  
  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    local.stepsCounterDisplay.innerText = `Steps: 0 / 0`;
    return;
  }
  
  local.stepsBusy = true;
  
  let completed = 0;
  local.stepsCounterDisplay.innerText = `${completed} / ${count}`;
  
  const stepDuration = local.clapCycleTime * 0.4;
  
  for(let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      local.leftFoot.classList.add('zoom-left');
      await new Promise(r => setTimeout(r, stepDuration));
      local.leftFoot.classList.remove('zoom-left');
    } else {
      local.rightFoot.classList.add('zoom-right');
      await new Promise(r => setTimeout(r, stepDuration));
      local.rightFoot.classList.remove('zoom-right');
   }
    
    completed++;
    local.stepsCounterDisplay.innerText = `${completed} / ${count}`;
    
    if (i < count - 1) {
      await new Promise(r => setTimeout(r, stepDuration * 0.2));
    }
  }
  
  local.stepsBusy = false;
}

function htLoadContent() {
    htWriteNavigation();

    local = { "palette": document.getElementById("palette"), "hands": document.querySelectorAll(".hand-shape"), "left":  document.getElementById("leftHand"), "right": document.getElementById("rightHand"), "clapCycleTime": 1200, "counterDisplay": document.getElementById("clapCounter"), "feetJumpWrapper": document.getElementById("feetJumpWrapper"), "leftFoot": document.getElementById("leftFoot"), "rightFoot": document.getElementById("rightFoot"), "clapBusy": false, "jumpBusy": false, "stepsBusy": false, "speedSlider": document.getElementById("speedSlider"), "clapCounterDisplay": document.getElementById("clapCounter"), "jumpCounterDisplay": document.getElementById("jumpCounter"), "stepsCounterDisplay": document.getElementById("stepsCounter")}; 

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

        local.palette.appendChild(swatch);
    });

    local.speedSlider.addEventListener("input", function() {
        local.clapCycleTime = parseInt(this.value);
        document.documentElement.style.setProperty('--jump-duration', (local.clapCycleTime * 0.5) + 'ms');
        document.documentElement.style.setProperty('--step-duration', (local.clapCycleTime * 0.4) + 'ms');
    });

    document.documentElement.style.setProperty('--jump-duration', '1200ms');
    document.documentElement.style.setProperty('--step-duration', '1220ms');

    for (let i = 0 ; i< 20; i++) {
        $('#clapCount').append($('<option>', {
            value: i,
            text: i
        }));
    }
    $('#clapCount').val(5);

    htSetImageSrc("imgHe", "images/DonsMaps/img_6776erectusdmanisi.jpg");
    htSetImageSrc("imgHer", "images/DonsMaps/1594.jpg");
    htSetImageSrc("imgHs3", "images/MexicoCityMuseo/HomoSapiens.jpg");

    return false;
}
