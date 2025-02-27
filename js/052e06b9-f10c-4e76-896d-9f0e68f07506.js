// SPDX-License-Identifier: GPL-3.0-or-later

var htGameUseTranslationImages = [];
var localGameVector052e06b9 = [];
var localGameUseVector052e06b9 = [];

var gameVectorVowel052e06b9 = [null, false, false];
var textOnScreen = "";
var vowels = [65, 69, 73, 79, 85];
var consonants = [ 66, 67, 68, 70, 71, 72, 74, 75, 76, 77, 78, 80, 81, 82, 83, 84, 86, 87, 88, 89, 90];
var doubleVowel = false;
var doubleConsonant = false;
var level052e06b9 = 0;
var idxOnScreen052e06b9 = 0;

function htAdjustSyallableLang()
{
}

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

function htGetConsonant() {
    var idx = getRandomArbitrary(0, consonants.length - 1);

    gameVectorVowel052e06b9[idx] = false;
    var c =  consonants[idx];
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
            textOnScreen = htGetConsonant();
        }

        return;
    }

    /*
    if (!isVowel) {
        value = htGetVowel(-1, 1);
    } else {
        value = htGetVowel(value, 1);
    }

    gameVectorVowel052e06b9[1] = htTestVowel(value);
    ch = String.fromCharCode(value);
    textOnScreen += ch;
    */
}

function htWriteValuesOnScreen()
{
    idxOnScreen052e06b9 = 0;
    $("#cvtop").html(textOnScreen);
    $("#cv0").html("__");
    if (level052e06b9 < 2) {
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
        level052e06b9 = 0;
    }

    if (htGameUseTranslationImages.length == 0) {
        htGameUseTranslationImages = [].concat(htGameImages);
        localGameUseVector052e06b9 = [].concat(localGameVector05e06b9);
    }
    $("#nextLevel").show();
    idxOnScreen052e06b9 = 0;
}

function htCheckAnswer() {
    var val = $("#cv"+idxOnScreen052e06b9).html();

    if (val == "__") {
        $("#cv"+idxOnScreen052e06b9).html("C");
        if (gameVectorVowel052e06b9[idxOnScreen052e06b9] != false) {
            return;
        }
    } else {
        if (val == "C" && gameVectorVowel052e06b9[idxOnScreen052e06b9] == true) {
            $("#cv"+idxOnScreen052e06b9).html("V");
        } else if (val == "V" && gameVectorVowel052e06b9[idxOnScreen052e06b9] == false) {
            $("#cv"+idxOnScreen052e06b9).html("C");
        }
    }

    idxOnScreen052e06b9++;
    if (level052e06b9 < 2) {
        htSetAnswer();
    }
}

function htLoadExercise() {
    $("#nextLevel").hide();
    htWriteNavigation("literature");

    htSetValues();
    htWriteValuesOnScreen();

    $("#nextLevel").on("click", function() {
        htSetValues();
        htWriteValuesOnScreen();

        $("#nextLevel").hide();
        $("#gameImage").html("");
    });

    $("#selectUp").on("click", function() {
        htCheckAnswer();
    });

    $("#selectDown").on("click", function() {
        htCheckAnswer();
    });

    localGameVector052e06b9 = htLoadGameData();
    htGameUseTranslationImages = [].concat(htGameImages);
    localGameUseVector052e06b9 = [].concat(localGameVector052e06b9);

    return false;
}
