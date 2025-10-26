// SPDX-License-Identifier: GPL-3.0-or-later

var index0ac0098b = 0;
var opt0ac0098b = { "requestType" : "splash", "target" : ".htSlidesGame", "maxID": 0 };
var totalSMScore = 0;

var recognizedLevels =  [
    { "id": "326445ab-e030-4375-9557-ada06b6ef88f" },
    { "id": "f866455d-713d-4e3c-b25a-c151f1a05296" },
    { "id": "f952fb69-fcf9-4980-9b31-38be2ecfe971" },
    { "id": "c450185c-7bcf-45c4-b93c-9f5ae10a126a" }
] ;

function htSMUpdateScore(val) {
    totalSMScore += val;

    $("#currentSMScore").html(totalSMScore);
}

function htSMCheckAnswer(ans)
{
    if (smGame.length > index0ac0098b) {
        var currentSlide = smGame[index0ac0098b];
        var ansTest = (ans == currentSlide.answer);
        htSMUpdateScore( (ansTest) ? currentSlide.score : 1);

        $("#smGameNext").removeClass("htSlideGameMenuHidden");
        $("#smGameLike").addClass("htSlideGameMenuHidden");
        $("#smGameUnlike").addClass("htSlideGameMenuHidden");

        $("#smGameDesc").html(currentSlide.desc);
        $("#smGameDesc").css("color", (ansTest) ? "green" :"red");
        $("#smGameDesc").removeClass("htSlideGameMenuHidden");
    }
}

function htPlusSMGameDivs(n) {
    if (!$("#smGameDesc").hasClass("htSlideGameMenuHidden")) {
        $("#smGameDesc").addClass("htSlideGameMenuHidden");
    }

    var x = document.getElementsByClassName("htSlide");
    index0ac0098b += n;

    if (index0ac0098b == x.length || index0ac0098b < 0) {

        $("#smGameNext").addClass("htSlideGameMenuHidden");
        $("#smGamePrev").addClass("htSlideGameMenuHidden");
        $("#smGameLike").addClass("htSlideGameMenuHidden");
        $("#smGameUnlike").addClass("htSlideGameMenuHidden");
        if (x.length != 0) {
            $(".htSlide").remove();
        }
        index0ac0098b = 0;
        $("#smGameMenu").removeClass("htSlideGameMenuHidden");
        return;
    }

    if (smGame.length > index0ac0098b) {
        var currentSlide = smGame[index0ac0098b];
        if (currentSlide.prev != undefined && currentSlide.prev != null) {
            $("#smGamePrev").removeClass("htSlideGameMenuHidden");
        } else {
            $("#smGamePrev").addClass("htSlideGameMenuHidden");
        }

        if (currentSlide.desc != undefined && currentSlide.desc != null) {
            $("#smGameLike").removeClass("htSlideGameMenuHidden");
            $("#smGameUnlike").removeClass("htSlideGameMenuHidden");

            $("#smGamePrev").addClass("htSlideGameMenuHidden");
            $("#smGameNext").addClass("htSlideGameMenuHidden");
        } else {
            if (!$("#smGameLike").hasClass("htSlideGameMenuHidden")) {
                $("#smGameLike").addClass("htSlideGameMenuHidden");
                $("#smGameUnlike").addClass("htSlideGameMenuHidden");
            }
        }

        if (n > 0 && currentSlide.played == false) {
            currentSlide.played = true;
            htSMUpdateScore((currentSlide.score > 1) ? 0 :currentSlide.score);
        }
        htShowSlideDivs(x, index0ac0098b);
    }
}

function htJumpSMGame() {
    switch (opt0ac0098b.requestType) {
        case "splash":
            if (smGameTimeoutID) {
                clearTimeout(smGameTimeoutID);
                smGameTimeoutID = 0;
            }
            $(".htSlide").remove();
            $("#smGameMenu").removeClass("htSlideGameMenuHidden");
            $("#smGameJump").addClass("htSlideGameMenuHidden");
            $("#smGameLike").addClass("htSlideGameMenuHidden");
            $("#smGameUnlike").addClass("htSlideGameMenuHidden");
            opt0ac0098b.requestType = "game";

            if ($("#smGameScore").hasClass("htSlideGameMenuHidden")) {
                $("#smGameScore").removeClass("htSlideGameMenuHidden");
            }

            break;
    }
}

function htStartSMGame() {
    $("#smGamePlay").addClass("htSlideGameMenuHidden");
    var x = document.getElementsByClassName("htSlide");
    smGameTimeoutID = htShowSlideDivsAuto(x, 0, true);
    $(opt0ac0098b.target).append("<div id=\"smGameJump\"><i class=\"fa-solid fa-angle-double-right htSlideJumpGame\" onclick=\"htJumpSMGame();\"></i></div>");
}

function htSMLoadID()
{
    var localID = $("#ScientificGameLevel").val();
    if (localID.length > 0) {
        var sel = recognizedLevels.findIndex(x => x.id === localID);
        if (sel != undefined) {
            return localID;
        }
    }

    return "9a153e38-d7eb-41ef-aea8-d7a3019ece2e";
}

function htLoadExercise() {
    var loadID = htSMLoadID();
    htLoadPageV1(loadID, "json", "", false, "smGame", opt0ac0098b);
    return false;
}

