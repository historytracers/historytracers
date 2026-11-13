// SPDX-License-Identifier: GPL-3.0-or-later

// "Multiplying the Findings with Groups" (content 21f8d529-1c27-4f02-b880-81954daaf6ac).
// An analogous game to "Multiplying the Findings" (4f0474ba-3c05-43cd-8528-d3f383eae556),
// with the same controls (times-table selector, operation and arrows). Instead of the
// chart of the selected multiplication table, the groups of the same UTF-8 characters
// shown in f641941e-55f0-40dd-a05f-81392b23cacd are displayed: the first factor is the
// number of characters inside each rectangle. The groups are not shown at once; each
// arrow press adds one group, so 6 x 3 is drawn as six characters per group, revealed
// one group at a time until the three groups are counted.

var localMultGroups = {};

// The group images are exactly the ones used by the multiplication tables
// (see htMultiplicationTableObjects in ht_math.js), so the "Group image"
// selector offers the same set as the times-table pages (8bbd4fa3 and the
// other multiplication contents) instead of a short local list.
var HT_MULT_GROUPS_ICONS = htMultiplicationTableObjects.map(function(obj) {
    return obj.option;
});
var HT_MULT_GROUPS_MAX = 10;

function htMultGroupsCloseDiv() {
    $("#history").css("display","none").css("visibility","hidden");
}

function htMultGroupsFillImage() {
    var obj = localMultGroups.gameVector[localMultGroups.currentLevel];
    var prefix = htGetImgSrcPrefix();

    // Keep the reward popup inside the game table: once the image is loaded,
    // its height is capped with "table height - popup chrome" (the Close link,
    // spacing and caption), so the whole popup fits inside the table without
    // growing the page scrollbar. The popup itself is also capped by CSS to
    // the table height, so long captions scroll inside it instead of the page.
    var img = document.getElementById("imgSeqGame");
    img.onload = function() {
        var popup = $("#history");
        var tableH = $("#yupana0").outerHeight();
        var chrome = Math.max(0, popup.outerHeight() - img.getBoundingClientRect().height);
        var maxH = Math.max(120, Math.round(Math.min(tableH - chrome, window.innerHeight * 0.4)));
        img.style.maxHeight = maxH.toString() + "px";
    };
    $("#imgSeqGame").attr("src", prefix+obj.imagePath);
    $("#desc").html(obj.imageDesc);
    localMultGroups.currentLevel++;
    if (localMultGroups.currentLevel == localMultGroups.gameVector.length) {
        localMultGroups.currentLevel = 0;
    }
}

// The icon shown inside every group. It is either a random one (when the
// "Group image" selector is left on Randomly) or the one chosen by the user.
function htMultGroupsPickIcon() {
    var choice = localMultGroups.imageChoice;
    if (isNaN(choice) || choice < 0 || choice >= HT_MULT_GROUPS_ICONS.length) {
        choice = htGetRandomArbitrary(0, HT_MULT_GROUPS_ICONS.length);
    }
    return HT_MULT_GROUPS_ICONS[choice];
}

// Like in "Learning Multiplication Table (6 and 7)" (600c0c57-4120-478f-b5fa-
// 66e7ecb6372d) and in "Complete the Multiplication Table" (19b00e11-1e70-
// 4e76-808c-673a0cc71af4), the chosen group image is remembered in the same
// local storage key used by every times table (htMultiplicationObjectPrefKey
// in ht_math.js), so the last image chosen anywhere becomes the default here
// as well. htSavedMultiplicationObjectIndex also honors shared links ("mtobj"
// URL parameter) and the viewer injection, exactly like in the times tables.
function htMultGroupsSavedIconIndex() {
    if (typeof htSavedMultiplicationObjectIndex === "function") {
        var idx = parseInt(htSavedMultiplicationObjectIndex(), 10);
        if (!isNaN(idx) && idx >= 0 && idx < HT_MULT_GROUPS_ICONS.length) {
            return idx;
        }
    }
    return -1;
}

// Stores the newly chosen image. Choosing "Randomly" does not erase the
// stored image, so it remains the default of the next visits.
function htMultGroupsStoreIconIndex(choice) {
    if (isNaN(choice) || choice < 0 || choice >= HT_MULT_GROUPS_ICONS.length) {
        return;
    }
    if (typeof htPrefsWrite === "function") {
        htPrefsWrite(htMultiplicationObjectPrefKey, String(choice));
    }
}

// The current operation is drawn as groups of the same UTF-8 character, like
// in "Multiplying with Groups" (f641941e-55f0-40dd-a05f-81392b23cacd): each
// group holds as many characters as the first factor. The board starts empty
// and the groups are added one by one as the user presses the arrows, so the
// result is found by counting the groups instead of having them shown at once.
function htMultGroupsDrawBoard() {
    // A multiplication by zero has no group to repeat, so nothing is drawn even
    // if the arrow counter was pressed: the number of groups can never exceed
    // the second factor (5 x 0 keeps the board empty).
    var groups = Math.min(localMultGroups.selector, localMultGroups.second);

    var board = "";
    if (localMultGroups.first > 0) {
        for (let g = 0; g < groups; g++) {
            var content = "";
            for (let i = 0; i < localMultGroups.first; i++) {
                content += "<span class=\"htMultGroupIcon\">" + localMultGroups.icon + "</span>";
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
    var $result = $("#finalResult").empty();
    $result.text((test < 10 ? "\u00a0" : "") + test);

    htMultGroupsDrawBoard();
    if (test == localMultGroups.total) {
        htMultGroupsFillImage();
        var current = parseInt($("#mtValues").val(), 10);
        if (isNaN(current)) {
            current = -1;
        }
        var nextLabel = $("#htMultGroupsNext").text() || "Next calculation";
        var $arrow = $("<button>", {
            "type": "button",
            "class": "fa-solid fa-chevron-right",
            "aria-label": nextLabel
        })
            .css({
                "font-size": "1.0em",
                "background": "none",
                "border": "none",
                "padding": "0",
                "cursor": "pointer"
            })
            .on("click", function() {
                htMultGroupsFillExercise(current);
            });
        $result.append("<br />").append($arrow);
        localMultGroups.stopMe = true;
        $("#history").css("display","block").css("visibility","visible");
    }

}

function htMultGroupsFillExercise(test) {
    test = parseInt(test, 10);
    localMultGroups.first = htGetRandomArbitrary(0, 10);
    localMultGroups.second = (isNaN(test) || test == -1) ? htGetRandomArbitrary(0, 10) : test;
    localMultGroups.total = localMultGroups.first * localMultGroups.second;
    localMultGroups.selector = 0;
    localMultGroups.icon = htMultGroupsPickIcon();

    $("#exercise").empty()
        .append($("<span>", { "class": "text_to_paint" }).text("\u00a0\u00a0\u00a0" + localMultGroups.first))
        .append("<br />")
        .append($("<span>", { "class": "text_to_paint" }).text("× " + localMultGroups.second));
    htMultGroupsDrawBoard();
    $("#finalResult").html("");
    localMultGroups.stopMe = false;
    htMultGroupsCloseDiv();
}

function htLoadContent() {
    localMultGroups = { "gameVector": [], "currentLevel": 0, "first": 0, "second": 0, "total": 0, "selector": 0, "icon": HT_MULT_GROUPS_ICONS[0], "imageChoice": -1, "stopMe": false, "answerVector": undefined };

    // The default group image is the one saved in the local storage, falling
    // back to "Randomly" on the first visit. It must be resolved before the
    // first exercise is drawn.
    localMultGroups.imageChoice = htMultGroupsSavedIconIndex();

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

    if ($("#groupValues").length > 0) {
        $.each(HT_MULT_GROUPS_ICONS, function(index, icon) {
            $('#groupValues').append($('<option>', {
                value: index,
                text: icon
            }));
        });

        // The selector starts on the saved image, so the default shown here
        // matches the image already used to draw the groups.
        $("#groupValues").val(String(localMultGroups.imageChoice));

        $("#groupValues").on( "change", function() {
            localMultGroups.imageChoice = parseInt($(this).val(), 10);
            if (isNaN(localMultGroups.imageChoice)) {
                localMultGroups.imageChoice = -1;
            }
            htMultGroupsStoreIconIndex(localMultGroups.imageChoice);
            localMultGroups.icon = htMultGroupsPickIcon();
            htMultGroupsDrawBoard();
        });
    }
    return false;
}
