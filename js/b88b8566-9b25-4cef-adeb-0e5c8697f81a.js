// SPDX-License-Identifier: GPL-3.0-or-later

function htAddElementTob88b8566Table(tableID, rowID, rows)
{
    var left = 0;
    var right = 0;
    var htImgSrcPrefix = htGetImgSrcPrefix();
    for (let i = 0 ; i < rows ; i++) {
        $(tableID+" tbody").append("<tr><td><img id=\"idf"+i+"\" onclick=\"htImageZoom('idf"+i+"', '0%')\" src=\"images/HistoryTracers/"+left+"Left_Hand_Small.png\" /></td><td><img id=\"ids"+i+"\" onclick=\"htImageZoom('ids"+i+"', '0%')\" src=\"images/HistoryTracers/"+right+"Right_Hand_Small.png\" /></td><td><span class=\"text_to_paint\">"+i+"</span></td></tr>");
        if (i < 5) {
            right += 1;
        } else {
            left += 1;
        }
    }
}

function htLoadContent() {
    htWriteNavigation();
    htAddElementTob88b8566Table("#tblHandsCounting", "#tr", 10);
    return false;
}

