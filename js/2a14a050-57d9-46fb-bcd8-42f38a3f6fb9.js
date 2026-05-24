// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htTranslationDefineEnd() {
    var end;
    switch (local.gameTranslationCurrentLevel) {
        case 0:
        case 1:
            end = -1;
            break;
        default:
            end = 1;
            break;
    }

    return end;
}

function htTranslationLoadIndigenous(tableID, field, selector, value)
{
   var htImgSrcPrefix = htGetImgSrcPrefix();
   $(tableID+" "+field).html((selector > 50) ? "<img id=\"imgMIMG"+value+"\" onclick=\"htImageZoom('imgMIMG"+value+"', '0%')\" src=\""+htImgSrcPrefix+"images/HistoryTracers/Maya_"+value+".png\" />" : "&nbsp;");
}

function htTranslationShowAmericanVector() {
    const localVal = htGetRandomArbitrary(1, 9);
    local.gameTranslationRandomVector = [ localVal ];
    htTranslationLoadIndigenous("#yupana1", "#tc2f2", 100, localVal);
}

function htResetRandomGame()
{
    for (let i = 1; i < 5; i++) {
        $("#yupana1 #tc"+i+"f1").html("");
        $("#yupana1 #tc"+i+"f2").html("");
    }
}

function htTranslationFillRandomVector(minVal, maxVal, end)
{
    const localVal = htGetRandomArbitrary(minVal, maxVal);
    $("#num2").html(localVal);
    htFillYupanaValues('#yupana1', localVal, 2, '#tc5f', 'red_dot_right_up');

    var vector = [];

    while (localVal != 0) {
        let rest = localVal % 10;
        localVal = Math.trunc(localVal / 10);
        vector.push(rest);
    }

    return vector;
}

function htTranslationCheckRandomAnswer() {
    var end = htTranslationDefineEnd();
    var begin = 0;
    
    var showImage = true;
    let val = 0;
    if (end > 0) {
        for (let i = begin; i < end; i++) {
            val = parseInt($("#numberFieldnum"+i).val());
            if (val != local.gameTranslationRandomVector[i]) {
                showImage = false;
            }
        }
    } else {
        val = parseInt($("#numberFieldnum1").val());
        if (val != local.gameTranslationRandomVector[0]) {
            showImage = false;
        }
    }

    if (showImage == false) {
        return;
    }

    if (local.gameTranslationCurrentLevel == 9) { 
        local.gameTranslationCurrentLevel = -1;
    }


    $("#num2").html("<i class=\"fa-solid fa-medal\" style=\"color:gold;\"></i>");
    local.gameRandomEnd = true;
    local.gameChecking = true;
    $("#nextLevel").show();
}

function htLoadRandomTranslation() {
    local.gameTranslationCurrentLevel++;

    let min = 1, max = 9;
    if (local.gameTranslationCurrentLevel > 3) {
        min = 10, max = 99;
    }

    for (let i = 0; i < 2; i++) {
        if ($("#numberFieldnum"+i).length > 0) {
            $("#numberFieldnum"+i).val("");
        }
    }

    var lvalues = [];
    switch (local.gameTranslationCurrentLevel) {
        case 0:
            htTranslationShowAmericanVector();
            $("#num0").hide();
            $("#nextLevel").hide();
            break;
        case 1:
            htCleanYupanaDecimalValues('#yupana1', 2);

            $("#yupana1 #tc1f1").html(htYupanaDrawFirstSquare());
            $("#yupana1 #tc2f1").html(htYupanaDrawSecondSquare());
            $("#yupana1 #tc3f1").html(htYupanaDrawThirdSquare());
            $("#yupana1 #tc4f1").html(htYupanaDrawFourthSquare());

            $("#yupana1 #tc1f2").html(htYupanaDrawFirstSquare());
            $("#yupana1 #tc2f2").html(htYupanaDrawSecondSquare());
            $("#yupana1 #tc3f2").html(htYupanaDrawThirdSquare());
            $("#yupana1 #tc4f2").html(htYupanaDrawFourthSquare());

            local.gameTranslationRandomVector = htTranslationFillRandomVector(min, max, 2);

            break;
/*
        case 0:

            //lvalues = htFillYupanaDecimalValues('#yupana1', local.gameTranslationRandomVector, 2, 'red_dot_right_up');
            return;
        case 1:
        case 2:
        case 3:
        case 4:
            htCleanYupanaDecimalValues('#yupana1', 2);
            //lvalues = htFillYupanaDecimalValues('#yupana1', local.gameTranslationRandomVector[0], 1, 'blue_dot_right_bottom');
            return;
        case 5:
            htResetRandomGame();
            break;
        case 6:
        case 7:
        case 8:
        case 9:
            htTranslationShowAmericanVector();
            break;
*/
    }

    htTranslationCheckRandomAnswer();
}

function htLoadContent() {
    htWriteNavigation();
    $("#htChinaZhongguo").html(keywords[137]);
    $("#htJapanNipponNihonKoku").html(keywords[139]);

    local = { "gameTranslationVector": [], "gameTranslationAns": [0, 0, 0, 0], "gameTranslationModify": -1, "gameTranslationCurrentValue": -1, "gameTranslationModel": "", "gameEnd": false, "gameChecking": false, "gameTranslationRandomVector": [], "gameTranslationCurrentLevel": -1, "gameRandomEnd": false, "gameUseTranslationImages": [], "gameVector": [], "gameUseVector": [], "maxValue": 2 }; 

    for (let i = 0, j = 1; i < local.maxValue; i++, j++) {
        $("#yupana1 #tc"+j+"f3").html(htInsertNumberField("num"+i, 0, 9));
    }
    $("#yupana1 #tc3f3").html("<span id=\"num"+local.maxValue+"\" class=\"text_to_paint\"><span>");

    $( "#playButton" ).on("click", function() {
        $('input[name=selModel]').removeAttr("disabled");
        $('input[name=selModel]').prop("checked", false);
        $("#gameMessage").html("");
        local.gameEnd = false;
    });

    $("#nextLevel").on("click", function() {
        $("#nextLevel").hide();
        htLoadRandomTranslation();
        local.gameRandomEnd = false;
        local.gameChecking = false;
    });

    $(".upArrowWithFA").on("click", function() {
        var name = $(this).attr('name');
        if (name == "traineeUp") {
            if (local.gameEnd == false ) {
                local.gameTranslationCurrentValue++;
            }
        } else {
            if (local.gameRandomEnd == false && local.gameChecking == false) {
                local.gameChecking = true;
                var fieldName = "#numberFieldnum"+name[11];
                var value = $(fieldName).val();
                if (value.length == 0) {
                    value = 0;
                } else {
                    value++;
                }

                if (value >= 9) {
                    value = 9;
                }

                $(fieldName).val(value);
                htTranslationCheckRandomAnswer();
                local.gameChecking = false;
            }
        }
    });

    $(".downArrowWithFA").on("click", function() {
        if (local.gameTranslationCurrentValue == -1){
            local.gameTranslationCurrentValue = 10;
        }

        var name = $(this).attr('name');
        if (name == "traineeDown") {
            if (local.gameEnd == false ) {
                local.gameTranslationCurrentValue--;
            }
        } else {
            if (local.gameRandomEnd == false && local.gameChecking == false) {
                local.gameChecking = true;
                var fieldName = "#numberFieldnum"+name[13];
                var value = $(fieldName).val();
                if (value.length == 0) {
                    value = 9;
                } else {
                    value--;
                }

                if (value <= 0) {
                    value = 0;
                }

                $(fieldName).val(value);
                htTranslationCheckRandomAnswer();
                local.gameChecking = false;
            }
        }
    });

    htLoadRandomTranslation();

    return false;
}
