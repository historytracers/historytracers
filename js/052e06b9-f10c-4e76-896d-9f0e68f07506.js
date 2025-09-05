// SPDX-License-Identifier: GPL-3.0-or-later

var htGameUseTranslationImages = [];
var localGameVector052e06b9 = [];
var localGameUseVector052e06b9 = [];

var gameVectorVowel052e06b9 = [null, false, false];
var textOnScreen = "";
// Y ignored in this example due compexity for initial texts
var vowels = [65, 69, 73, 79, 85];
var consonants = [ 66, 67, 68, 70, 71, 72, 74, 75, 76, 77, 78, 80, 81, 82, 83, 84, 86, 88, 90];
var combinations = [ "CH", "SH", "PR", "TR", "TH", "FL", "LH", "NH", "WH" ];
var doubleVowel = false;
var doubleConsonant = false;
var level052e06b9 = 0;
var idxOnScreen052e06b9 = 0;

function htTestVowel(value) {
    switch (value) {
        case 65:
        case 69:
        case 73:
        case 79:
        case 85:
            return true;
    }
    return false;
}

function htGetVowel(value, idx) {
    var intPrevious = parseInt(value);

    var selector = 0;
    if (value < 0) {
        selector = getRandomArbitrary(0, 4);
    } else {
        if (intPrevious < 70) {
            selector = getRandomArbitrary(2, 4);
        } else {
            selector = getRandomArbitrary(0, 1);
        }
    }

    gameVectorVowel052e06b9[idx] = true;
    var v =  vowels[selector];
    return String.fromCharCode(v);
}

function htGetConsonant(min, max, idx) {
    var vidx = getRandomArbitrary(min, max);

    gameVectorVowel052e06b9[idx] = false;
    var c =  consonants[vidx];
    return String.fromCharCode(c);
}

function htGetLetter(idx)
{
    var value = getRandomArbitrary(65, 90);
    var ch = String.fromCharCode(value);

    var isVowel = htTestVowel(value);
    gameVectorVowel052e06b9[idx] = isVowel;

    return ch;
}

function htThreeLetters()
{
    var local_lang = $("#site_language").val();

    gameVectorVowel052e06b9[0] = gameVectorVowel052e06b9[1] = false;
    gameVectorVowel052e06b9[2] = true;
    var idx = getRandomArbitrary(0, combinations.length - 1);

    return combinations[idx] + htGetVowel(-1, 2);
}

function htSetValues() {
    textOnScreen = "";
    var previousValue = gameVectorVowel052e06b9[0];

    if (level052e06b9 < 2) {
        textOnScreen += htGetLetter(0);
        if (previousValue == null) {
            return;
        }

        if (previousValue == false && gameVectorVowel052e06b9[0] == false) {
            textOnScreen = htGetVowel(-1, 0);
        } else if (previousValue == true && gameVectorVowel052e06b9[0] == true) {
            textOnScreen = htGetConsonant(0, consonants.length - 1, 0);
        }
    } else if (level052e06b9 < 4) {
        textOnScreen = htGetConsonant(0, 10, 0) + htGetVowel(-1, 1);
    } else if (level052e06b9 < 7) {
        textOnScreen = htGetConsonant(11, consonants.length - 1, 0) + htGetVowel(-1, 1);
    } else {
        textOnScreen = htThreeLetters();
    }
}

function htWriteValuesOnScreen()
{
    idxOnScreen052e06b9 = 0;
    $("#cvtop").html(textOnScreen);
    $("#cv0").html("__");
    if (level052e06b9 < 2) {
        $("#cv1").html("");
        $("#cv2").html("");
        return;
    }

    $("#cv1").html("__");
    if (level052e06b9 < 7) {
        return;
    }
    $("#cv2").html("__");
}

function htSetAnswer() {
    var idx = Math.floor(getRandomArbitrary(0, localGameUseVector052e06b9.length -1));
    if (level052e06b9 < 9) { 
        var imgName = htGameUseTranslationImages[idx];
        var obj = localGameUseVector052e06b9[idx];
        $("#gameImage").html("<img class=\"imgGameSize\" id=\"imgCorrect\" onclick=\"htImageZoom('imgCorrect', '0%')\" src=\"images/"+imgName+"\"/><br /><span class=\"desc\">"+obj.imageDesc+"</span>");

        htGameUseTranslationImages.splice(idx, 1);
        localGameUseVector052e06b9.splice(idx, 1);
    } else {
        $("#gameImage").html("<i class=\"fa-solid fa-medal\" style=\"font-size:240px;color:gold;\"></i>");
        idxOnScreen052e06b9 = 0;
        level052e06b9 = -1;
    }

    if (htGameUseTranslationImages.length == 0) {
        htGameUseTranslationImages = [].concat(htGameImages);
        localGameUseVector052e06b9 = [].concat(localGameVector05e06b9);
    }
    $("#nextLevel").show();
    idxOnScreen052e06b9 = 0;
    level052e06b9++;
}

function htCheckAnswer(startValue) {
    var val = $("#cv"+idxOnScreen052e06b9).html();

    if ($("#nextLevel").is(":visible") || level052e06b9 > 9) {
        return;
    }

    if (val == "__") {
        $("#cv"+idxOnScreen052e06b9).html(startValue);
        val = startValue;
    } else {
        val = (val == "V")? "C": "V";
        $("#cv"+idxOnScreen052e06b9).html(val);
    }

    if ((val == "V" && gameVectorVowel052e06b9[idxOnScreen052e06b9] == false) ||
        (val == "C" && gameVectorVowel052e06b9[idxOnScreen052e06b9] == true)) {
            return;
    }

    idxOnScreen052e06b9++;
    if (level052e06b9 > 1) {
        if (level052e06b9 < 7 && idxOnScreen052e06b9 < 2) { 
            return;
        } else if (level052e06b9 > 6 && idxOnScreen052e06b9 < 3) { 
            return;
        }
    }
    htSetAnswer();
}

function htLoadExercise() {
    $("#nextLevel").hide();
    htWriteNavigation();

    htSetValues();
    htWriteValuesOnScreen();

    $("#nextLevel").on("click", function() {
        htSetValues();
        htWriteValuesOnScreen();

        $("#nextLevel").hide();
        $("#gameImage").html("");
    });

    $("#selectUp").on("click", function() {
        htCheckAnswer("C");
    });

    $("#selectDown").on("click", function() {
        htCheckAnswer("V");
    });

    localGameVector052e06b9 = htLoadGameData();
    htGameUseTranslationImages = [].concat(htGameImages);
    localGameUseVector052e06b9 = [].concat(localGameVector052e06b9);

    var local_lang = $("#site_language").val();
    switch(local_lang) {
        case "es-ES":
            combinations.pop();
            combinations[6] = "ll";
        case "pt-BR":
            combinations.pop();
            break;
        default:
            break;
    }

    return false;
}
