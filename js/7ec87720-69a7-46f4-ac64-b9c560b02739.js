// SPDX-License-Identifier: GPL-3.0-or-later

var htGameTranslationVector = [];
var htGameTranslationAns = [0, 0, 0, 0];
var htGameTranslationModify = -1;
var htGameTranslationCurrentValue = -1;
var htGameTranslationModel = "";
var htGameEnd = false;
var htGameChecking = false;

var htGameTranslationRandomVector = [];
var htGameTranslationCurrentLevel = -1;
var htGameRandomEnd = false;

var htGameUseTranslationImages = [];

var localGameVector7ec87720 = [];
var localGameUseVector7ec87720 = [];

function htTranslationFillVector(value, max)
{
    var vector = [];

    for (let i = 0; i < max; i++, value++) {
        vector.push(value);
    }

    return vector;
}

function htTranslationSelectIndex(max) {
    for (let i = 0; i < max; i++) {
        if (htGameTranslationAns[i] == 1) {
            return i;
        }
    }
}

function htTranslationLoadHA(tableID, field, selector, value)
{
   $(tableID+" "+field).html((selector > 50) ? "<span class=\"text_to_paint\">"+value+"<span>" : "&nbsp;");
}

function htTranslationLoadIndigenous(tableID, field, selector, value)
{
   $(tableID+" "+field).html((selector > 50) ? "<img src=\"images/Maya_"+value+".png\" />" : "&nbsp;");
}

function htTranslationFillData(type, max)
{
    var selector = getRandomArbitrary(0, 100);
    for (let i = 0, j = 1; j <= max; i++, j++) {
        if (htGameTranslationModel == "ha") {
            htTranslationLoadHA("#yupana0", "#tc"+j+"f1", selector, htGameTranslationVector[i]);
            htTranslationLoadIndigenous("#yupana0", "#tc"+j+"f2", 100, htGameTranslationVector[i]);
        } else {
            htTranslationLoadIndigenous("#yupana0", "#tc"+j+"f1", selector, htGameTranslationVector[i]);
            htTranslationLoadHA("#yupana0", "#tc"+j+"f2", 100, htGameTranslationVector[i]);
        }

        if (selector > 50) {
            htGameTranslationAns[i] = 0;
            selector = 10;
        } else {
            htGameTranslationAns[i] = 1;
            selector = 60;
        }
    }
}

function htTranslationSetFirstStepValues(max)
{
    $("#gameMessage").html("");
    if (htGameTranslationModify == -1) {
        htGameTranslationModify = htTranslationSelectIndex(4);
    }

    if (htGameTranslationModel == "ha") {
        htTranslationLoadHA("#yupana0", "#tc"+(htGameTranslationModify+1)+"f1", 100, htGameTranslationCurrentValue);
    } else {
        htTranslationLoadIndigenous("#yupana0", "#tc"+(htGameTranslationModify+1)+"f1", 100, htGameTranslationCurrentValue);
    }

    if (htGameTranslationVector[htGameTranslationModify] == htGameTranslationCurrentValue) {
        htGameTranslationCurrentValue = -1;
        htGameTranslationModify += 2;
        $("#gameMessage").html("<i class=\"fas fa-thumbs-up\" style=\"font-size:60px;color:lightblue;\"></i>");
    }

    if (htGameTranslationModify >= max) {
        htGameEnd = true;
    }
}

function htTranslationFillRandomVector(min, max, end)
{
    var vector = [];

    for (let i = 0; i < end; i++) {
        var value = Math.floor(getRandomArbitrary(min, max));
        vector.push(value);
    }

    return vector;
}

function htTranslationDefineEnd() {
    var end;
    switch (htGameTranslationCurrentLevel) {
        case 0:
        case 1:
            end = -1;
            break;
        case 2:
        case 3:
            end = 2;
            break;
        case 4:
        case 5:
            end = 3;
            break;
        default:
            end = 4;
            break;
    }

    return end;
}

function htTranslationShowAmericanVector() {
    var end = htTranslationDefineEnd();
    if (end < 0) {
        return;
    }
    
    for (let i = 0, j = 1 ; i < end; i++, j++) {
        htTranslationLoadIndigenous("#yupana1", "#tc"+j+"f1", 100, htGameTranslationRandomVector[i]);
    }
}

function htTranslationCheckRandomAnswer() {
    var end = htTranslationDefineEnd();
    if (end < 0) {
        end = 1;
    }
    
    var showImage = true;
    for (let i = 0; i < end; i++) {
        var val = parseInt($("#numberFieldnum"+i).val());
        if (val != htGameTranslationRandomVector[i]) {
            showImage = false;
        }
    }

    if (showImage == false) {
        return;
    }

    var idx = Math.floor(getRandomArbitrary(0, localGameUseVector7ec87720.length -1));
                  
    if (htGameTranslationCurrentLevel < 9) { 
        var imgName = htGameUseTranslationImages[idx];
        var obj = localGameUseVector7ec87720[idx];
        $("#gameImage").html("<img class=\"imgGameSize\"  src=\"images/"+imgName+"\"/><br /><span class=\"desc\">"+obj.imageDesc+"</span>");

        htGameUseTranslationImages.splice(idx, 1);
        localGameUseVector7ec87720.splice(idx, 1);
    } else {
        $("#gameImage").html("<i class=\"fa-solid fa-medal\" style=\"font-size:240px;color:gold;\"></i>");
        htGameTranslationCurrentLevel = -1;
    }


    if (htGameUseTranslationImages.length == 0) {
        htGameUseTranslationImages = [].concat(htGameImages);
        localGameUseVector7ec87720 = [].concat(localGameVector7ec87720);
    }

    htGameRandomEnd = true;
    htGameChecking = true;
    $("#nextLevel").show();
}

function htResetRandomGame()
{
    for (let i = 1; i < 5; i++) {
        $("#yupana1 #tc"+i+"f1").html("");
    }
}

function htLoadRandomTranslation() {
    htGameTranslationCurrentLevel++;

    htGameTranslationRandomVector = htTranslationFillRandomVector(0, 9, 4);
    $("#gameImage").html("<div class=\"first_steps_reflection question_mark\">?</div>");

    for (let i = 0; i < 4; i++) {
        $("#numberFieldnum"+i).val("");
    }

    var lvalues = [];
    switch (htGameTranslationCurrentLevel) {
        case 0:
            $("#yupana1 #tc1f1").html(htYupanaDrawFirstSquare());
            $("#yupana1 #tc2f1").html(htYupanaDrawSecondSquare());
            $("#yupana1 #tc3f1").html(htYupanaDrawThirdSquare());
            $("#yupana1 #tc4f1").html(htYupanaDrawFourthSquare());

            $("#num1").hide();
            $("#num2").hide();
            $("#num3").hide();
            $("#nextLevel").hide();

            htCleanYupanaDecimalValues('#yupana1', 1);
            lvalues = htFillYupanaDecimalValues('#yupana1', htGameTranslationRandomVector[0], 1, 'red_dot_right_up');
            return;
        case 1:
            htCleanYupanaDecimalValues('#yupana1', 1);
            lvalues = htFillYupanaDecimalValues('#yupana1', htGameTranslationRandomVector[0], 1, 'blue_dot_right_bottom');
            return;
        case 2:
            htResetRandomGame();
            $("#num1").show();
            break;
        case 4:
            $("#num2").show();
            break;
        case 6:
            $("#num3").show();
            break;
        case 9:
            htTranslationShowAmericanVector();
            break;
    }

    htTranslationShowAmericanVector();
    htTranslationCheckRandomAnswer();
}

function htLoadExercise() {
    $("#firstMethod").html(mathKeywords[8]);
    $("#secondMethod").html(mathKeywords[9]);
    $("#playButton").val(mathKeywords[10]);

    var maxValue = 4;

    for (let i = 0, j = 1; i < maxValue; i++, j++) {
        $("#yupana1 #tc"+j+"f2").html(htInsertNumberField("num"+i, 0, 9));
    }

    $( "input[name='selModel']" ).on( "change", function() {
        htGameTranslationModel = $(this).val();
        var ra = getRandomArbitrary(0, 600);
        ra = Math.floor(ra / 100);

        htGameTranslationVector = htTranslationFillVector(ra, maxValue);
        htTranslationFillData(htGameTranslationModel, maxValue);
        htGameTranslationModify = -1;
        htGameTranslationCurrentValue = -1;
        $('input[name=selModel]').attr("disabled", true);
    });

    $( "#playButton" ).on("click", function() {
        $('input[name=selModel]').removeAttr("disabled");
        $('input[name=selModel]').prop("checked", false);
        $("#gameMessage").html("");
        htGameEnd = false;
    });

    $(".upArrowWithFA").on("click", function() {
        var name = $(this).attr('name');
        if (name == "traineeUp") {
            if (htGameEnd == false ) {
                htGameTranslationCurrentValue++;
                htTranslationSetFirstStepValues(maxValue);
            }
        } else {
            if (htGameRandomEnd == false && htGameChecking == false) {
                htGameChecking = true;
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
                htGameChecking = false;
            }
        }
    });

    $(".downArrowWithFA").on("click", function() {
        if (htGameTranslationCurrentValue == -1){
            htGameTranslationCurrentValue = 10;
        }

        var name = $(this).attr('name');
        if (name == "traineeDown") {
            if (htGameEnd == false ) {
                htGameTranslationCurrentValue--;
                htTranslationSetFirstStepValues(maxValue);
            }
        } else {
            if (htGameRandomEnd == false && htGameChecking == false) {
                htGameChecking = true;
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
                htGameChecking = false;
            }
        }
    });

    $("#nextLevel").on("click", function() {
        $("#nextLevel").hide();
        htLoadRandomTranslation();
        htGameRandomEnd = false;
        htGameChecking = false;
    });

    localGameVector7ec87720 = htLoadGameData();
    htGameUseTranslationImages = [].concat(htGameImages);
    localGameUseVector7ec87720 = [].concat(localGameVector7ec87720);

    htLoadRandomTranslation();

    return false;
}

