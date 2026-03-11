// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

async function startClap(){
  if(local.busy) return;

  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    local.counterDisplay.innerText = `0 / 0`;
    return;
  }

  local.busy = true;

  const animationDuration = local.clapCycleTime * 0.75;
  const pauseDuration = local.clapCycleTime * 0.25;

  let completed = 0;
  local.counterDisplay.innerText = `${completed} / ${count}`;

  for(let i=0;i<count;i++){
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

function htLoadContent() {
    htWriteNavigation();

    local = { "palette": document.getElementById("palette"), "hands": document.querySelectorAll(".hand-shape"), "left":  document.getElementById("leftHand"), "right": document.getElementById("rightHand"), "busy": false, "clapCycleTime": 1200, "counterDisplay": document.getElementById("clapCounter") }; 
    const speedSlider = document.getElementById("speedSlider");
    const speedValue = document.getElementById("speedValue");
    speedSlider.addEventListener("input", function() {
        local.clapCycleTime = parseInt(this.value);
        speedValue.textContent = local.clapCycleTime + " ms";
    });

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

    for (let i = 0 ; i< 9; i++) {
        $('#clapCount').append($('<option>', {
            value: i,
            text: i
        }));
    }
    $('#clapCount').val(5);

    return false;
}
