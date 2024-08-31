// SPDX-License-Identifier: GPL-3.0-or-later

var currentSelector = "";
var currentLevel = 0;
var updatingIdx = -1;
var workingValue = 0;
var currentStartPoint = 0;
var currentEndPoint = 0;
var stopValue = 0;
var gameBegin = true;
var localGameVectorfb9dca2c = [];

var width = 1;
var startValue = 1;
var currentSelection = 1;

function htSequenceRemoveRows()
{
    $(".trCanBeRemoved").remove();
}

function htSequenceSetFactor()
{
    if ($("#sequenceOrder").length != 0) {
        var range = $("#sequenceOrder").val();
        var arr = range.split(":");
        startValue = parseInt(arr[1]);
        width = (startValue == 0) ? 10 : startValue;
        currentSelection = parseInt(arr[0]);
    } else {
        currentSelection = 2;
        startValue = 0;
        width = 10;
    }
}

function htSequenceSetBegin(n)
{
    var value = (n > 0) ? workingValue : currentEndPoint;
    if (currentSelector == "ha") {
        var useClass = (currentSelection < 4) ? "text_to_paint" : "text_to_paint_small";
        var localLang = $("#site_language").val();
        var valueFormat = new Intl.NumberFormat(localLang).format(value);
        $("#tc"+updatingIdx+"f1").html("<span class=\""+useClass+"\">"+valueFormat+"</span>");
    } else if (currentSelector == "mesoamerican") {
        htFillMesoamericanVigesimalValues(value, currentSelection, updatingIdx, undefined);
    } else {
        htCleanYupanaDecimalValues('#yupana'+updatingIdx, currentSelection);
        htFillYupanaDecimalValues('#yupana'+updatingIdx, value, currentSelection, 'red_dot_right_up');
    }
    workingValue = value;
}

function htSequenceSetCurrValue(again)
{
    var imgIdx = 0;
    if (currentSelector == "ha") {
        var useClass = (currentSelection < 4) ? "text_to_paint" : "text_to_paint_small";
        var localLang = $("#site_language").val();
        var valueFormat = new Intl.NumberFormat(localLang).format(workingValue);
        $("#tc"+updatingIdx+"f1").html("<span class=\""+useClass+"\">"+valueFormat+"</span>");
    } else if (currentSelector == "mesoamerican") {
        htFillMesoamericanVigesimalValues(workingValue, currentSelection, updatingIdx, undefined);
    } else {
        imgIdx = updatingIdx;
        htCleanYupanaDecimalValues('#yupana'+updatingIdx, currentSelection);
        htFillYupanaDecimalValues('#yupana'+updatingIdx, workingValue, currentSelection, 'red_dot_right_up');
    }

    if (workingValue == stopValue && again == 0) {
        var imgName = htSequenceGame[currentLevel];
        var obj = localGameVectorfb9dca2c[currentLevel];
        $("#gameImage"+imgIdx).html("<img class=\"imgGameSize\" src=\"images/"+imgName+"\"/><br /><span class=\"desc\">"+obj.imageDesc+"</span>");

        currentLevel++;
        return false;
    }
}

function htSequenceUpdateValue(n)
{
    if (gameBegin) {
        htSequenceSetBegin(n);
        gameBegin = false;
        if (workingValue == stopValue) {
            htSequenceSetCurrValue(0);
        }
        return false;
    }

    if (workingValue == stopValue) {
        htSequenceSetCurrValue(1);
        return false;
    }

    workingValue += n;

    if (workingValue < currentStartPoint) {
        workingValue = currentStartPoint;
    }  else if (workingValue > currentEndPoint) {
        workingValue = currentEndPoint;
    }  

    htSequenceSetCurrValue(0);

    return false;
}

function htSequenceGoNext()
{
    if (workingValue == stopValue && gameBegin == false) {
        htLoadTest(currentSelector);
    }
}

function htSelectRows()
{
    var selected = $("input[name='htNumericalSystem']:checked").val();
    if (selected == "ha") {
        return 1;
    }

    return currentSelection;
}

function htSequenceAddCommonTable(id, hasLevels, isHA)
{
    var end = htSelectRows();
    for (let i =1; i <= end; i++) {
        var controls = "";
        if (i == 1) {
            controls = "<td id=\"tc5f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-up upArrowWithFA\" id=\"traineeUp"+id+"\" onclick=\"htSequenceUpdateValue(+1);\"></i> </td><td id=\"tc6f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-down downArrowWithFA\" id=\"traineeDown"+id+"\" onclick=\"htSequenceUpdateValue(-1);\"></i></td>";
        }
        $("#yupana"+id+" tr:last").after("<tr id=\"tf"+i+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+i+"\">&nbsp;</td> <td id=\"tc2f"+i+"\">&nbsp;</td> <td id=\"tc3f"+i+"\">&nbsp;</td> <td id=\"tc4f"+i+"\">&nbsp;</td>"+controls+"</tr>");
    }
}

function htSequenceAddImageRow(id, hasLevels)
{
    var imgID = htSelectRows() + 1;
    $("#yupana"+id+" tr:last").after("<tr id=\"tf"+imgID+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+imgID+"\" colspan=\"4\"><span id=\"gameImage"+id+"\"></span></td><td id=\"tc5f"+imgID+"\" style=\"background-color: white;\" colspan=\"2\"><i class=\"fa-solid fa-chevron-right\" style=\"font-size:3.0em;\" onclick=\"htSequenceGoNext();\"></i></td></tr>");
}

function htUpdateHAValues()
{
    var localLang = $("#site_language").val();
    var useClass = (currentSelection < 4) ? "text_to_paint" : "text_to_paint_small";
    for (let i = 1, j = workingValue; i < 4; i++, j++) {
        if (i == updatingIdx) {
            stopValue = j;
            continue;
        }

        var valueFormat = new Intl.NumberFormat(localLang).format(j);
        $("#tc"+i+"f1").html("<span class=\""+useClass+"\">"+valueFormat+"</span>");
    }
    workingValue = currentStartPoint;
}

function htUpdateMesoamericanValues()
{
    var rows = htSelectRows();
    for (let i = 1; i < 4; i++) {
        for (let j = 1; j <= rows; j++) {
            $("#tc"+i+"f"+j).html("<img src=\"\" id=\"tmc"+i+"l"+j+"\" />");
        }
    }

    for (let i = 1, j = workingValue; i < 4; i++, j++) {
        if (i == updatingIdx) {
            stopValue = j;
            continue;
        }

        htFillMesoamericanVigesimalValues(j, rows, i, undefined);
    }
    workingValue = currentStartPoint;
}

function htUpdateYupanaValues()
{
    var end = currentSelection + 1;
    for (let i = end - 1, j = workingValue; i >= 0; i--, j++) {
        if (i == updatingIdx) {
            stopValue = j;
            continue;
        }

        htCleanYupanaDecimalValues('#yupana'+i, currentSelection);
        htFillYupanaDecimalValues('#yupana'+i, j, currentSelection, 'red_dot_right_up');
        $("#yupana"+i+" #tc5f1").html("");
        $("#yupana"+i+" #tc6f1").html("");
        $("#yupana"+i+" #tf"+end).remove();
    }
    workingValue = currentStartPoint;
}

function htSequenceFillHAMesoamerican()
{
    htSequenceRemoveRows();
    $("#yupana1").addClass("htSlideGameMenuHidden");
    $("#yupana2").addClass("htSlideGameMenuHidden");

    var hasLevel = ($("#sequenceOrder").length > 0) ? true: false;
    var selected = $("input[name='htNumericalSystem']:checked").val();
    var isHA = (selected == "ha");
    htSequenceAddCommonTable(0, hasLevel, isHA);
    htSequenceAddImageRow(0, hasLevel, isHA);

    if (currentSelector == "ha") {
        htUpdateHAValues();
    } else if (currentSelector == "mesoamerican") {
        htUpdateMesoamericanValues();
    }
}

function htSequenceFillYupana()
{
    htSequenceRemoveRows();
    $("#yupana1").removeClass("htSlideGameMenuHidden");
    $("#yupana2").removeClass("htSlideGameMenuHidden");

    var hasLevel = ($("#sequenceOrder").length > 0) ? true: false;
    var end = currentSelection + 1;
    for (let i = 0; i < 3; i++) {
        htSequenceAddCommonTable(i, hasLevel, false);
        for (let j = 1; j <= end; j++) {
            $("#yupana"+i+" #tc1f"+j).html(htYupanaDrawFirstSquare());
            $("#yupana"+i+" #tc2f"+j).html(htYupanaDrawSecondSquare());
            $("#yupana"+i+" #tc3f"+j).html(htYupanaDrawThirdSquare());
            $("#yupana"+i+" #tc4f"+j).html(htYupanaDrawFourthSquare());
        }

        htSequenceAddImageRow(i, hasLevel, false);
    }
    htUpdateYupanaValues();
}

function htSetUpdateIdx(min, max)
{
    if (updatingIdx == -1) {
        updatingIdx = getRandomArbitrary(min, max);
    } else {
        updatingIdx++;
        if (updatingIdx > max) {
            updatingIdx = min;
        }
    }
}

function htLoadTest(opt)
{
    if (currentLevel > 9) {
        var imgIdx = 0;
        if (currentSelector == "ha" || currentSelector == "mesoamerican") {
            imgIdx = 0;
        } else {
            imgIdx = updatingIdx;
        }
        currentLevel = 0;
        $("#gameImage"+imgIdx).html("<i class=\"fa-solid fa-medal\" style=\"color:gold;font-size: 5em;\"></i>");
        return false;
    }

    gameBegin = true;
    var min = startValue + currentLevel * width;
    var max = min + width;
    workingValue = getRandomArbitrary(min, max);

    var adjust = workingValue % 10;
    currentStartPoint = workingValue - adjust;
    currentEndPoint = currentStartPoint + 10;

    if (workingValue > (currentEndPoint - 2)) {
        workingValue -= 2;
    }

    if ((opt == "ha") || (opt == "mesoamerican")) {
        htSetUpdateIdx(1, 3);
        htSequenceFillHAMesoamerican();
    } else {
        htSetUpdateIdx(0, 2);
        htSequenceFillYupana();
    }

}

function htUpdateSequenceOrder()
{
    if ($("#sequenceOrder").length != 0) {
        var begin = 0
        var end = 99;
        var localLang = $("#site_language").val();
        for (let i = 1; i < 10; i++) {
            var tBegin = new Intl.NumberFormat(localLang).format(begin);
            var tEnd = new Intl.NumberFormat(localLang).format(end);
            $("#sequenceOrder").append($('<option>', {
                value: (i + 1)+":"+begin,
                text: tBegin+" - "+tEnd 
            }));
            begin = end + 1;
            end = 10**(i + 2) - 1;
        }
    }
}

function htLoadExercise()
{

    $("input[name='htNumericalSystem']").on( "change", function() {
        var sel = $(this).val();
        currentSelector = sel;
        currentLevel = 0;
        htLoadTest(sel);
    });

    localGameVectorfb9dca2c = htLoadGameData();

    htUpdateSequenceOrder();
    htSequenceSetFactor();

    if ($("#sequenceOrder").length != 0) {
        $("#sequenceOrder").on( "change", function() {
            var sel = $("input[name='htNumericalSystem']:checked").val();
            if (sel != undefined) {
                currentSelector = sel;
                currentLevel = 0;
                htSequenceSetFactor();
                htLoadTest(sel);
            }
        });
    }

    return false;
}

