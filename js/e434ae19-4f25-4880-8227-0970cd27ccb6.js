// SPDX-License-Identifier: GPL-3.0-or-later

var localCountere434ae19 = 0;
var local = { };

function htAddElementTo687ee328Table(tableID, rowID, rows)
{
    var left = 0;
    var right = 0;
    var htImgSrcPrefix = htGetImgSrcPrefix();
    for (let i = 0 ; i < rows ; i++) {
        $(tableID+" "+rowID+i).html("<td><img id=\"idf"+i+"\" onclick=\"htImageZoom('idf"+i+"', '0%')\" src=\"images/HistoryTracers/"+left+"Left_Hand_Small.png\" /></td><td><img id=\"ids"+i+"\" onclick=\"htImageZoom('ids"+i+"', '0%')\" src=\"images/HistoryTracers/"+right+"Right_Hand_Small.png\" /></td><td><img id=\"idt"+i+"\" onclick=\"htImageZoom('idt"+i+"', '0%')\" src=\""+htImgSrcPrefix+"images/HistoryTracers/Maya_"+i+".png\" /></td><td><span class=\"text_to_paint\">"+i+"</span></td>");
        if (i < 5) {
            right += 1;
        } else {
            left += 1;
        }
    }
}

function htLoadContent() {

    htWriteNavigation();
    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);

    htSetImageSrc("imgTohoku", "images/Tohoku/Soroban.png");

    localCountere434ae19 = 0;
    localCountere434ae19 = htModifyArrow('.htUpArrow', localCountere434ae19);
    localCountere434ae19 = htModifyArrow('.htDownArrow', localCountere434ae19);

    $("#traineeUp0").on("click", function() {
        localCountere434ae19++;
        localCountere434ae19 = htModifyArrow('.htUpArrow', localCountere434ae19);
        localCountere434ae19 = htModifyArrow('.htDownArrow', localCountere434ae19);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCountere434ae19);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCountere434ae19, 1, 'red_dot_right_up');
    });

    $("#traineeDown0").on("click", function() {
        localCountere434ae19--;
        localCountere434ae19 = htModifyArrow('.htDownArrow', localCountere434ae19);
        localCountere434ae19 = htModifyArrow('.htUpArrow', localCountere434ae19);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCountere434ae19);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCountere434ae19, 1, 'red_dot_right_up');
    });
    htAddElementTo687ee328Table("#tblHandsCounting", "#tr", 10);

    return false;
}
