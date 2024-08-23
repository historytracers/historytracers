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

function htSequenceRemoveRows() {
    $(".trCanBeRemoved").remove();
}

function htSequenceSetBegin(n)
{
    var value = (n > 0) ? workingValue : currentEndPoint;
    if (currentSelector == "ha") {
        $("#tc"+updatingIdx+"f1").html("<span class=\"text_to_paint\">"+value+"</span>");
    } else if (currentSelector == "mesoamerican") {
        htFillMesoamericanVigesimalValues(value, 2, updatingIdx, undefined);
    } else {
        htCleanYupanaDecimalValues('#yupana'+updatingIdx, 2);
        htFillYupanaDecimalValues('#yupana'+updatingIdx, value, 2, 'red_dot_right_up');
    }
    workingValue = value;
}

function htSequenceSetCurrValue(again)
{
    var imgIdx = 0;
    if (currentSelector == "ha") {
        $("#tc"+updatingIdx+"f1").html("<span class=\"text_to_paint\">"+workingValue+"</span>");
    } else if (currentSelector == "mesoamerican") {
        htFillMesoamericanVigesimalValues(workingValue, 2, updatingIdx, undefined);
    } else {
        imgIdx = updatingIdx;
        htCleanYupanaDecimalValues('#yupana'+updatingIdx, 2);
        htFillYupanaDecimalValues('#yupana'+updatingIdx, workingValue, 2, 'red_dot_right_up');
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

function htSequenceGoNext() {
    if (workingValue == stopValue && gameBegin == false) {
        htLoadTest(currentSelector);
    }
}

function htSequenceAddCommonTable(id)
{
    $("#yupana"+id+" tr:last").after("<tr id=\"tf1\" class=\"trCanBeRemoved\"><td id=\"tc1f1\">&nbsp;</td> <td id=\"tc2f1\">&nbsp;</td> <td id=\"tc3f1\">&nbsp;</td> <td id=\"tc4f1\">&nbsp;</td><td id=\"tc5f1\" rowspan=\"2\"><i class=\"fa-solid fa-caret-up upArrowWithFA\" id=\"traineeUp"+id+"\" onclick=\"htSequenceUpdateValue(+1);\"></i> </td><td id=\"tc6f1\" rowspan=\"2\"><i class=\"fa-solid fa-caret-down downArrowWithFA\" id=\"traineeDown"+id+"\" onclick=\"htSequenceUpdateValue(-1);\"></i></td></tr> <tr id=\"tf2\" class=\"trCanBeRemoved\"><td id=\"tc1f2\">&nbsp;</td> <td id=\"tc2f2\">&nbsp;</td> <td id=\"tc3f2\">&nbsp;</td> <td id=\"tc4f2\">&nbsp;</td></tr>");
}

function htSequenceAddImageRow(id)
{
    $("#yupana"+id+" tr:last").after("<tr id=\"tf3\" class=\"trCanBeRemoved\"><td id=\"tc1f3\" colspan=\"4\"><span id=\"gameImage"+id+"\"></span></td><td id=\"tc5f3\" style=\"background-color: white;\" colspan=\"2\"><i class=\"fa-solid fa-chevron-right\" style=\"font-size:3.0em;\" onclick=\"htSequenceGoNext();\"></i></td></tr>");
}

function htUpdateHAValues()
{
    for (let i = 1, j = workingValue; i < 4; i++, j++) {
        if (i == updatingIdx) {
            stopValue = j;
            continue;
        }

        $("#tc"+i+"f1").html("<span class=\"text_to_paint\">"+j+"</span>");
    }
    workingValue = currentStartPoint;
}

function htUpdateMesoamericanValues()
{
    for (let i = 1; i < 4; i++) {
        $("#tc"+i+"f1").html("<img src=\"\" id=\"tmc"+i+"l1\" />");
        $("#tc"+i+"f2").html("<img src=\"\" id=\"tmc"+i+"l2\" />");
    }

    for (let i = 1, j = workingValue; i < 4; i++, j++) {
        if (i == updatingIdx) {
            stopValue = j;
            continue;
        }

        htFillMesoamericanVigesimalValues(j, 2, i, undefined);
    }
    workingValue = currentStartPoint;
}

function htUpdateYupanaValues()
{
    for (let i = 0, j = workingValue; i < 3; i++, j++) {
        if (i == updatingIdx) {
            stopValue = j;
            continue;
        }

        htCleanYupanaDecimalValues('#yupana'+i, 2);
        htFillYupanaDecimalValues('#yupana'+i, j, 2, 'red_dot_right_up');
        $("#yupana"+i+" #tc5f1").html("");
        $("#yupana"+i+" #tc6f1").html("");
        $("#yupana"+i+" #tf3").remove();
    }
    workingValue = currentStartPoint;
}

function htSequenceFillHAMesoamerican() {
    htSequenceRemoveRows();
    $("#yupana1").addClass("htSlideGameMenuHidden");
    $("#yupana2").addClass("htSlideGameMenuHidden");
    htSequenceAddCommonTable(0);
    htSequenceAddImageRow(0);

    if (currentSelector == "ha") {
        htUpdateHAValues();
    } else if (currentSelector == "mesoamerican") {
        htUpdateMesoamericanValues();
    }
}

function htSequenceFillYupana() {
    htSequenceRemoveRows();
    $("#yupana1").removeClass("htSlideGameMenuHidden");
    $("#yupana2").removeClass("htSlideGameMenuHidden");

    for (let i = 0; i < 3; i++) {
        htSequenceAddCommonTable(i);
        for (let j = 1; j < 3; j++) {
            $("#yupana"+i+" #tc1f"+j).html(htYupanaDrawFirstSquare());
            $("#yupana"+i+" #tc2f"+j).html(htYupanaDrawSecondSquare());
            $("#yupana"+i+" #tc3f"+j).html(htYupanaDrawThirdSquare());
            $("#yupana"+i+" #tc4f"+j).html(htYupanaDrawFourthSquare());
        }

        htSequenceAddImageRow(i);
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
    var min = currentLevel * 10;
    var max = min + 9;
    workingValue = getRandomArbitrary(min, max);
    currentStartPoint = min;
    currentEndPoint = max;

    if (workingValue > (max - 2)) {
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

function htLoadExercise() {

    $("input[name='htNumericalSystem']").on( "change", function() {
        var sel = $(this).val();
        currentSelector = sel;
        currentLevel = 0;
        htLoadTest(sel);
    });

    localGameVectorfb9dca2c = htLoadGameData();
    return false;
}

