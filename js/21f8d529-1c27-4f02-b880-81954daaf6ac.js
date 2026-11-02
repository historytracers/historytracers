// SPDX-License-Identifier: GPL-3.0-or-later

// "Multiplying the Findings with Groups" (content 21f8d529-1c27-4f02-b880-81954daaf6ac).
// An analogous game to "Multiplying the Findings" (4f0474ba-3c05-43cd-8528-d3f383eae556),
// with the same controls (times-table selector, operation and arrows). Instead of the
// chart of the selected multiplication table, the groups of the same UTF-8 characters
// shown in f641941e-55f0-40dd-a05f-81392b23cacd are displayed: the first factor is the
// number of characters inside each rectangle and the second factor is how many times
// that group is repeated, so 6 x 3 is drawn as six characters repeated three times.

var localMultGroups = {};

var HT_MULT_GROUPS_ICONS = [ "🐶", "🐱", "🍎", "⭐", "🔺" ];
var HT_MULT_GROUPS_MAX = 10;

function htMultGroupsCloseDiv() {
    $("#history").css("display","none").css("visibility","hidden");
}

function htMultGroupsFillImage() {
    var obj = localMultGroups.gameVector[localMultGroups.currentLevel];
    var prefix = htGetImgSrcPrefix();
    $("#imgSeqGame").attr("src", prefix+obj.imagePath);
    $("#desc").html(obj.imageDesc);
    localMultGroups.currentLevel++;
    if (localMultGroups.currentLevel == localMultGroups.gameVector.length) {
        localMultGroups.currentLevel = 0;
    }
}

// The current operation is drawn as groups of the same UTF-8 character, like
// in "Multiplying with Groups" (f641941e-55f0-40dd-a05f-81392b23cacd): the
// first factor is the number of characters inside each rectangle and the
// second factor is how many times that group is repeated, so 6 x 3 is drawn
// as six characters repeated three times.
function htMultGroupsDrawBoard() {
    var icon = HT_MULT_GROUPS_ICONS[htGetRandomArbitrary(0, HT_MULT_GROUPS_ICONS.length)];

    var board = "";
    if (localMultGroups.first > 0 && localMultGroups.second > 0) {
        for (let g = 0; g < localMultGroups.second; g++) {
            var content = "";
            for (let i = 0; i < localMultGroups.first; i++) {
                content += "<span class=\"htMultGroupIcon\">" + icon + "</span>";
            }
            board += "<span class=\"htMultGroupBox\" aria-hidden=\"true\">" + content + "</span>";
        }
    }
    $("#groupsBoard").html(board);
}

function htMultGroupsUpdateValue(add) {
    if (localMultGroups.stopMe) {
        return;
    }
    localMultGroups.selector += add ;

    if (localMultGroups.selector < 0) {
        localMultGroups.selector = 0;
    } else if ( localMultGroups.selector > HT_MULT_GROUPS_MAX) {
        localMultGroups.selector = HT_MULT_GROUPS_MAX;
    }

    const test = (localMultGroups.first == 0 || localMultGroups.second == 0 ) ? 0 : localMultGroups.selector * localMultGroups.first;
    var result = "";
    if (test < 10) {
        result += "&nbsp;";
    }
    result += test;

    if (test) {
        htDrawMultiplicationTable("#visual", localMultGroups.first, localMultGroups.selector);
    }
    if (test == localMultGroups.total) {
        htMultGroupsFillImage();
        let current = $('#mtValues').val();
        result += "<br /><i class=\"fa-solid fa-chevron-right\" style=\"font-size:1.0em;\" onclick=\"htMultGroupsFillExercise("+current+");\"></i>";
        localMultGroups.stopMe = true;
        $("#history").css("display","block").css("visibility","visible");
    }
    $("#finalResult").html(result);

}

function htMultGroupsFillExercise(test) {
    localMultGroups.first = htGetRandomArbitrary(0, 9);
    localMultGroups.second = (test == "-1") ? htGetRandomArbitrary(0, 9) : test;
    localMultGroups.total = localMultGroups.first * localMultGroups.second;
    localMultGroups.selector = 0;

    $("#exercise").html("<span class=\"text_to_paint\">&nbsp;&nbsp;&nbsp;"+localMultGroups.first+"</span><br /><span class=\"text_to_paint\">× "+localMultGroups.second+"</span>");
    htMultGroupsDrawBoard();
    $("#finalResult").html("");
    $("#visual").html("");
    localMultGroups.stopMe = false;
    htMultGroupsCloseDiv();
}

function htLoadContent() {
    localMultGroups = { "gameVector": [], "currentLevel": 0, "first": 0, "second": 0, "total": 0, "selector": 0, "stopMe": false, "answerVector": undefined };

    htWriteNavigation();

    htMultGroupsFillExercise(-1);
    localMultGroups.gameVector = htLoadGameData();

    if ($("#mtValues").length > 0) {
        var data = [
            { text: '0', value: '0' },
            { text: '1', value: '1' },
            { text: '2', value: '2' },
            { text: '3', value: '3' },
            { text: '4', value: '4' },
            { text: '5', value: '5' },
            { text: '6', value: '6' },
            { text: '7', value: '7' },
            { text: '8', value: '8' },
            { text: '9', value: '9' }
        ];

        $.each(data, function(index, item) {
            $('#mtValues').append($('<option>', {
                value: item.value,
                text: item.text
            }));
        });

        $("#mtValues").on( "change", function() {
            var opt = $(this).val();
            htMultGroupsFillExercise(opt);
        });
    }
    return false;
}
