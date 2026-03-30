// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htLoadContent() {
    htWriteNavigation();

    local = { "palette":  document.getElementById("palette"), "hands": document.querySelectorAll(".hand-shape"), "leftHandElem": document.getElementById("leftHand"), "rightHandElem": document.getElementById("rightHand"), "feetJumpWrapper": document.getElementById("feetJumpWrapper"), "leftFoot": document.getElementById("leftFoot"), "rightFoot": document.getElementById("rightFoot"), "clapBusy": false, "jumpBusy": false, "stepsBusy": false, "handsAreDown": false, "handPosCounterSpan": document.getElementById("handPosCounter"), "moveToggleBtn": document.getElementById("moveDownBtn"), "speedSlider": document.getElementById("speedSlider"), "clapCycleTime": 1100, "clapCounterDisplay": document.getElementById("clapCounter"), "jumpCounterDisplay": document.getElementById("jumpCounter"), "stepsCounterDisplay": document.getElementById("stepsCounter")};

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

    return false;
}
