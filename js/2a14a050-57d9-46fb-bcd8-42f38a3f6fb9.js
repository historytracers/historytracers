// SPDX-License-Identifier: GPL-3.0-or-later

var local = {};

function htTranslationShowAmericanVector() {
    var end = htTranslationDefineEnd();
    if (end < 0) {
        return;
    }
    
    for (let i = 0, j = 1 ; i < end; i++, j++) {
        htTranslationLoadIndigenous("#yupana1", "#tc"+j+"f1", 100, local.gameTranslationRandomVector[i]);
    }
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

function htLoadRandomTranslation() {
    local.gameTranslationCurrentLevel++;

    let min = 1, max = 9;
    if (local.gameTranslationCurrentLevel > 2) {
        min = 10, max = 99;
    }

    console.log(local.gameTranslationCurrentLevel+", "+min+", "+max);
    $("#gameImage").html("<div class=\"first_steps_reflection question_mark\">?</div>");

    for (let i = 0; i < 2; i++) {
        if ($("#numberFieldnum"+i).length > 0) {
            $("#numberFieldnum"+i).val("");
        }
    }

    var lvalues = [];
    switch (local.gameTranslationCurrentLevel) {
        case 0:
            $("#yupana1 #tc1f1").html(htYupanaDrawFirstSquare());
            $("#yupana1 #tc2f1").html(htYupanaDrawSecondSquare());
            $("#yupana1 #tc3f1").html(htYupanaDrawThirdSquare());
            $("#yupana1 #tc4f1").html(htYupanaDrawFourthSquare());

            $("#yupana1 #tc1f2").html(htYupanaDrawFirstSquare());
            $("#yupana1 #tc2f2").html(htYupanaDrawSecondSquare());
            $("#yupana1 #tc3f2").html(htYupanaDrawThirdSquare());
            $("#yupana1 #tc4f2").html(htYupanaDrawFourthSquare());

            $("#num0").hide();
            $("#nextLevel").hide();

            htCleanYupanaDecimalValues('#yupana1', 2);
            local.gameTranslationRandomVector = htTranslationFillRandomVector(min, max, 2);
            //lvalues = htFillYupanaDecimalValues('#yupana1', local.gameTranslationRandomVector, 2, 'red_dot_right_up');
            return;
        case 1:
        case 2:
        case 3:
        case 4:
            htCleanYupanaDecimalValues('#yupana1', 1);
            //lvalues = htFillYupanaDecimalValues('#yupana1', local.gameTranslationRandomVector[0], 1, 'blue_dot_right_bottom');
            return;
        case 5:
            htResetRandomGame();
            break;
/*
        case 2:
            htResetRandomGame();
            //$("#num1").show();
            break;
        case 4:
            //$("#num2").show();
            break;
        case 6:
            //$("#num3").show();
            break;
*/
        case 9:
            htTranslationShowAmericanVector();
            break;
    }

    htTranslationShowAmericanVector();
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

    htLoadRandomTranslation();

    return false;
}
