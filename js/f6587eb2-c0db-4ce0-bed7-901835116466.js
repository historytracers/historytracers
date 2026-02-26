// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

var palette = undefined;
var hands = undefined;
var left = undefined;
var right = undefined;

let busy = false;

var speedSlider = undefined;
var speedValue = undefined;
let clapCycleTime = 1200;

var counterDisplay = undefined;

async function startClap(){
  if(busy) return;

  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) {
    counterDisplay.innerText = `0 / 0`;
    return;
  }

  busy = true;

  const animationDuration = clapCycleTime * 0.75;
  const pauseDuration = clapCycleTime * 0.25;

  let completed = 0;
  counterDisplay.innerText = `${completed} / ${count}`;

  for(let i=0;i<count;i++){
    left.style.animation = `clapLeft ${animationDuration/1000}s ease`;
    right.style.animation = `clapRight ${animationDuration/1000}s ease`;

    await new Promise(r => setTimeout(r, animationDuration));

    left.style.animation = "";
    right.style.animation = "";

    completed++;
    counterDisplay.innerText = `${completed} / ${count}`;

    if (i < count - 1) {
      await new Promise(r => setTimeout(r, pauseDuration));
    }
  }

  busy = false;
}

function htLoadContent() {
    htWriteNavigation();

    palette = document.getElementById("palette");
    hands = document.querySelectorAll(".hand-shape");
    left = document.getElementById("leftHand");
    right = document.getElementById("rightHand");
    speedSlider = document.getElementById("speedSlider");
    speedValue = document.getElementById("speedValue");
    speedSlider.addEventListener("input", function() {
        clapCycleTime = parseInt(this.value);
        speedValue.textContent = clapCycleTime + " ms";
    });

    counterDisplay = document.getElementById("clapCounter");

    skinTones.forEach((color, index)=>{
        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.background = color;

        if(index === 5) swatch.classList.add("active");

        swatch.onclick = ()=>{
            document.querySelectorAll(".color-swatch").forEach(s=>s.classList.remove("active"));
            swatch.classList.add("active");
            hands.forEach(h=>h.setAttribute("fill", color));
        };

        palette.appendChild(swatch);
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
