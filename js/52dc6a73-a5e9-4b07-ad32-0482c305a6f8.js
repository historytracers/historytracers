// SPDX-License-Identifier: GPL-3.0-or-later

var firstLoad = true;
var totalCards = 0;

var htMemDefaultVector = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17 ];
var htMemSelectedVector = new Map();
var htMonitoring = false;

function htWriteMemoryData(line, column, name)
{
    $("#tc"+column+"f"+line).html("<div class=\"scene sceneCard\" ><div class=\"card\" id=\"memCard"+name+"\" thisDone=\""+name+"\"><div class=\"cardFace cardFaceFront\">?</div><div class=\"cardFace cardFaceBack\" id=\"memCard"+name+"Back\"></div></div></div>");
}

function htSelectValue(selector)
{
    var ret = "";
    var value = 0;
    switch (selector) {
        case 2:
            return htYupanaDrawFirstSquare();
        case 6:
            return "<div class=\"htCircle\"></div>";
        case 8:
            value = getRandomArbitrary(0, 3);
            break;
        case 10:
            return htYupanaDrawSecondSquare();
        case 12:
            return htYupanaDrawThirdSquare();
        case 14:
            value = getRandomArbitrary(4, 6);
            break;
        case 16:
            value = getRandomArbitrary(7, 9);
            break;
        default:
            value = getRandomArbitrary(selector, selector + 3);
            return ""+value;
    }

    ret = "<img src=\"images/HistoryTracers/Maya_"+value+".png\" style=\"width:60%;height:auto;\"/>";

    return ret;
}

function htMemoryFillBack()
{
    var htMemUseVector = [].concat(htMemDefaultVector);

    var useThis = "";
    for (let i = 0; i < htMemDefaultVector.length; i++) {
        var fill = Math.floor(getRandomArbitrary(0, htMemUseVector.length));
        var idx = htMemUseVector[fill];
        if ((i % 2) == 0) {
            useThis =  htSelectValue(i)
        }
        $("#memCard"+idx+"Back").html(useThis);

        htMemUseVector.splice(fill, 1);
    }
}

function htFillMemoryGame()
{
    var idx = 0;
    for (let i = 1 ; i < 5; i++) {
        for (let j = 1; j < 5; j++) {
            htWriteMemoryData(i, j, idx);
            idx++;
        }
    }
    htWriteMemoryData(5, 2, idx++);
    htWriteMemoryData(5, 3, idx++);

    htMemoryFillBack();
}

function htMemorySetRepresentation(value)
{
    var left, right;
    if (value < 5) {
        left = 0;
        right = value;
    } else { 
        left = value - 5;
        right = 5;
    }
    $("#tc6f1").html("<img id=\"imgtc6f1\" onclick=\"htImageZoom('imgtc6f1', '0%')\" src=\"images/HistoryTracers/"+left+"Left_Hand_Small.png\" />");
    $("#tc7f1").html("<img id=\"imgtc7f1\" onclick=\"htImageZoom('imgtc7f1', '0%')\" src=\"images/HistoryTracers/"+right+"Right_Hand_Small.png\" />");

    $("#tc6f2").html("<img id=\"imgtc6f2\" onclick=\"htImageZoom('imgtc6f2', '0%')\" src=\"images/HistoryTracers/Maya_"+value+".png\" />");

    $("#tc6f4").html("<span class=\"text_to_paint\">"+value+"</span>");
}

function htMemoryClickEvents() {
    $(".card").on("click", function() {
        var value = $(this).attr('thisDone');
        if (value.length > 2) {
            return false;
        }

        var id = $(this).attr('id');
        $("#"+id).addClass('is-flipped');

        if (htMemSelectedVector.has(id)) {
            return false;
        }

        htMemSelectedVector.set(id, id);
    });

    $(".card").on('transitionend webkitTransitionEnd oTransitionEnd', function () {
        if (htMonitoring == true) {
            return false;
        }
        htMonitoring = true;

        var end = htMemSelectedVector.size;
        if (((end % 2) != 0) || (totalCards == 9)) {
            htMonitoring = false;
            return false;
        }

        var fID = "";
        var sID = "";
        htMemSelectedVector.forEach((value, key) => {
            if (fID.length == 0) {
                fID = value;
            } else  if (sID.length == 0) {
                sID = value;
            }

            if (fID.length > 0 && sID.length > 0 && totalCards != 9) {
                var firstData = $("#"+fID+"Back").html();
                var secondData = $("#"+sID+"Back").html();

                if (firstData == secondData) {
                    $("#"+fID).attr('thisDone', fID);
                    $("#"+sID).attr('thisDone', sID);
                    htMemorySetRepresentation(++totalCards);
    
                    if (totalCards == 9) {
                        var medals = "<i class=\"fa-solid fa-medal\" style=\"font-size:4vw;color:gold;\"></i>";
                        $("#tc1f5").html(medals);
                        $("#tc4f5").html(medals);
                    }
                } else {
                    $("#"+fID).removeClass('is-flipped');
                    $("#"+sID).removeClass('is-flipped');
                }

                htMemSelectedVector.delete(fID);
                htMemSelectedVector.delete(sID);
                fID = "";
                sID = "";
            }
        });
        htMonitoring = false;
    });

}

function htLoadExercise() {
    if (firstLoad) {
        $("#playButton").val(mathKeywords[10]);
        htMemorySetRepresentation(totalCards);

        htFillMemoryGame();
        firstLoad = false;
        htMemoryClickEvents();
    }

    $("#playButton").on("click", function() {
        totalCards = 0;
        htMemorySetRepresentation(totalCards);

        htFillMemoryGame();
        htMemSelectedVector = new Map();
        $("#tc1f5").html("");
        $("#tc4f5").html("");
        htMonitoring = false;
        htMemoryClickEvents();
    });
    htWriteNavigation("first_steps");

    return false;
}

