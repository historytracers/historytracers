// SPDX-License-Identifier: GPL-3.0-or-later

var localBoneGame = {
    level: 1,
    target: 0,
    marks: 0,
    won: false
};

var boneLevels = 4;

function htBoneHandSides(level) {
    var sides = [];
    for (let i = 0; i < level; i++) {
        sides.push((i % 2 === 0) ? "Left" : "Right");
    }
    return sides;
}

function htBoneDrawChallenge(level) {
    var min = level * 5 - 4;
    var max = level * 5;
    localBoneGame.level = level;
    localBoneGame.marks = 0;
    localBoneGame.won = false;
    localBoneGame.target = htGetRandomArbitrary(min, max + 1);
    $("#htBoneLevelBadge").text(htBoneLevelLabel() + " " + level);
    htBoneRenderHands();
    htBoneRender();
}

function htBoneLevelLabel() {
    var label = $("#htBoneLevelLabel");
    return label.length ? label.text() : "";
}

function htBoneIsLastLevel() {
    return localBoneGame.level >= boneLevels;
}

function htBoneNextLevel() {
    if (htBoneIsLastLevel()) {
        htBoneDrawChallenge(1);
    } else {
        htBoneDrawChallenge(localBoneGame.level + 1);
    }
}

function htBoneRenderHands() {
    var level = localBoneGame.level;
    var digits = [];
    var sides = htBoneHandSides(level);
    var i;
    for (i = 0; i < level; i++) {
        digits.push(5);
    }
    digits[level - 1] = localBoneGame.target - 5 * (level - 1);

    var prefix = htGetImgSrcPrefix();
    var altTpl = $("#htBoneHandAltTpl").text() || "Hand with {n} raised fingers";
    var html = "";
    for (i = 0; i < level; i++) {
        var alt = altTpl.split("{n}").join(digits[i]);
        html += "<img id=\"htBoneHandImg" + i + "\" class=\"htBoneHandImg\" alt=\"" + alt +
            "\" onclick=\"htImageZoom('htBoneHandImg" + i + "', '0%')\" src=\"" + prefix +
            "images/HistoryTracers/" + digits[i] + sides[i] + "_Hand_Small.png\" />";
    }
    $("#htBoneHands").html(html);
}

function htBoneRender() {
    var container = $("#htBoneMarks");
    container.empty();
    var total = localBoneGame.marks;
    for (let i = 0; i < total; i++) {
        var left = 5 + i * (90 / 19);
        container.append("<span class=\"htBoneMark\" style=\"left:" + left + "%\"></span>");
    }

    var up = $("#htBoneAdd");
    var down = $("#htBoneRemove");
    up.removeClass("htBoneArrowDisabled");
    down.removeClass("htBoneArrowDisabled");
    if (localBoneGame.won || total >= localBoneGame.target) {
        up.addClass("htBoneArrowDisabled");
    }
    if (localBoneGame.won || total <= 0) {
        down.addClass("htBoneArrowDisabled");
    }

    if (localBoneGame.won) {
        $("#htBoneCongrats").show();
    } else {
        $("#htBoneCongrats").hide();
    }
}

function htBoneAddMark() {
    if (localBoneGame.won) {
        return false;
    }
    if (localBoneGame.marks < localBoneGame.target) {
        localBoneGame.marks++;
    }
    if (localBoneGame.marks === localBoneGame.target) {
        localBoneGame.won = true;
    }
    htBoneRender();
    return false;
}

function htBoneRemoveMark() {
    if (localBoneGame.won) {
        return false;
    }
    if (localBoneGame.marks > 0) {
        localBoneGame.marks--;
    }
    htBoneRender();
    return false;
}

function htLoadContent() {
    $("#htBoneAdd").on("click", htBoneAddMark);
    $("#htBoneRemove").on("click", htBoneRemoveMark);
    $("#htBoneNewNumber").on("click", function() {
        htBoneDrawChallenge(localBoneGame.level);
    });
    $("#htBoneNextLevel").on("click", htBoneNextLevel);

    htBoneDrawChallenge(1);
    htSetImageSrc("imgBone", "images/GonzalesRedondo/Figura-9-Hueso-de-Lebombo.png");
    htWriteNavigation();

    return false;
}
