// SPDX-License-Identifier: GPL-3.0-or-later

var localGameVectore2f50f78 = [];
var currentLevel = 0;

function htFillImage() {
    var obj = localGameVectore2f50f78[currentLevel];
    $("#imgGame").attr("src", obj.imagePath);
    $("#imgText").html(obj.imageDesc);
    currentLevel++;
    if (currentLevel == localGameVectore2f50f78.length) {
        currentLevel = 0;
    }
}

function htLoadContent() {
    htWriteNavigation();

    localGameVectore2f50f78 = htLoadGameData();
    htFillImage();

    return false;
}
