// SPDX-License-Identifier: GPL-3.0-or-later

var localCounter687ee328 = 0;

function htAddElementTo687ee328Table(tableID, rowID, rows)
{
    var left = 0;
    var right = 0;
    for (let i = 0 ; i < rows ; i++) {
        $(tableID+" "+rowID+i).html("<td><img id=\"idf"+i+"\" onclick=\"htImageZoom('idf"+i+"', '0%')\" src=\"images/"+left+"Left_Hand_Small.png\" /></td><td><img id=\"ids"+i+"\" onclick=\"htImageZoom('ids"+i+"', '0%')\" src=\"images/"+right+"Right_Hand_Small.png\" /></td><td><img id=\"idt"+i+"\" onclick=\"htImageZoom('idt"+i+"', '0%')\" src=\"images/HistoryTracers/Maya_"+i+".png\" /></td>");
        if (i < 5) {
            right += 1;
        } else {
            left += 1;
        }
    }
}

function htLoadExercise() {
    localCounter687ee328 = 0;
    localCounter687ee328 = htModifyArrow('.htUpArrow', localCounter687ee328);
    localCounter687ee328 = htModifyArrow('.htDownArrow', localCounter687ee328);

    $("#traineeUp0").on("click", function() {
        localCounter687ee328++;
        localCounter687ee328 = htModifyArrow('.htUpArrow', localCounter687ee328);
        localCounter687ee328 = htModifyArrow('.htDownArrow', localCounter687ee328);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCounter687ee328);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounter687ee328, 1, 'red_dot_right_up');
    });

    $("#traineeDown0").on("click", function() {
        localCounter687ee328--;
        localCounter687ee328 = htModifyArrow('.htDownArrow', localCounter687ee328);
        localCounter687ee328 = htModifyArrow('.htUpArrow', localCounter687ee328);

        htSetImageForMembers('#leftHandImg', 'Left_Hand_Small.png', '#rightHandImg', 'Right_Hand_Small.png', localCounter687ee328);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounter687ee328, 1, 'red_dot_right_up');
    });
    htAddElementTo687ee328Table("#tblHandsCounting", "#tr", 11);

    return false;
}


