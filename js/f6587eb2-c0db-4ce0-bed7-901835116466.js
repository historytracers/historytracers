// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

const skinTones = [
  "#FFE5D9", "#FCE5D5", "#FAD5C0", "#F8D5B0", "#F5D0A9",
  "#F4C2A1", "#EEC9A3", "#E0AC69", "#DEB887", "#D9A066",
  "#D99A6C", "#C68642", "#B97A56", "#B36B3C", "#A5672C",
  "#8D5524", "#7E4E2B", "#784421", "#6A3E1E", "#5C3B1E",
  "#4E2E1B", "#4A2A1A", "#3F2A1A", "#362115", "#2E1C12",
  "#26170F", "#1F130B", "#1A0F08", "#140B06", "#0C0704"
];

var palette = undefined;
var hands = undefined;
var left = undefined;
var right = undefined;

let busy = false;

var speedSlider = undefined;
var speedValue = undefined;
let clapCycleTime = 800; // default ms (0.8s total per clap)

async function startClap(){
  if(busy) return;

  const count = parseInt(document.getElementById("clapCount").value);
  if(!count || count < 1) return;

  busy = true;

  const animationDuration = clapCycleTime * 0.75; // ms
  const pauseDuration = clapCycleTime * 0.25;    // ms

  for(let i=0;i<count;i++){
    left.style.animation = `clapLeft ${animationDuration/1000}s ease`;
    right.style.animation = `clapRight ${animationDuration/1000}s ease`;

    await new Promise(r => setTimeout(r, animationDuration));

    left.style.animation = "";
    right.style.animation = "";

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

    return false;
}
