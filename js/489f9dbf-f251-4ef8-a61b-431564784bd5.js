// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();
    $("#htImgCopyright").html(keywords[83]);
    
    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png")
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png")
    return false;
}

