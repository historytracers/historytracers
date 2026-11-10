// SPDX-License-Identifier: GPL-3.0-or-later

// "Sequence game (Families)" (content 32aac9d1-f0ec-491b-9e4d-b32c10be4296).
// Analogous to "Sequence game (Orders)" (570ee074): pair each number with the
// name of its family, but the families are those of the second column of
// Table 1 of "Naming" (3bcce27b), from Quintillion down to Trillionths, and
// the game is divided into three levels. Level 1 draws six numbers greater
// than zero among the seven families from Quintillion down to Units. Level 2
// mixes three numbers greater than zero with three numbers smaller than zero.
// Level 3 draws only numbers smaller than zero among the six families from
// Tenths down to Trillionths. Numbers are built from significant digits times
// a power of ten, so every drawn value is an exact double and the localized
// formatter never shows rounding artifacts. Localized texts live in the class
// JSON, so this file only wires the behavior.

var localOrderFamGame = {};

var htOrderFamGameRoundSize = 6;

var htOrderFamGameOverMax = 7;

// Family bases from Table 1 of "Naming": indexes 0-6 are the families
// greater than zero (Quintillion 10^18 to Units 10^0) and indexes 7-12 are
// the families smaller than zero (Tenths 10^-1 to Trillionths 10^-12).
var htOrderFamGameBases = [
    1000000000000000000, 1000000000000000, 1000000000000, 1000000000,
    1000000, 1000, 1, 0.1, 0.01, 0.001, 0.000001, 0.000000001,
    0.000000000001
];

function htOrderFamGameShuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items;
}

function htOrderFamGameDraw(level) {
    let over = [0, 1, 2, 3, 4, 5, 6];
    let under = [7, 8, 9, 10, 11, 12];
    if (level === 0) {
        return htOrderFamGameShuffle(over.slice()).slice(0, htOrderFamGameRoundSize);
    }
    if (level === 1) {
        return htOrderFamGameShuffle(over.slice()).slice(0, 3).concat(htOrderFamGameShuffle(under.slice()).slice(0, 3));
    }
    return under.slice();
}

/**
 * Returns a random value for a family index, as { value, decimals }.
 * Families greater than zero draw integers in [base, 10 * base): up to the
 * Trillion family the full integer range stays exact in a double, while the
 * Quadrillion and Quintillion families use steps of base / 10 so the drawn
 * integer keeps at most three significant digits. Families smaller than zero
 * draw one single significant digit over the family base.
 */
function htOrderFamGameRandomValue(orderIndex) {
    let base = htOrderFamGameBases[orderIndex];
    if (base < 1) {
        let decimals = Math.round(-Math.log10(base));
        let digit = Math.floor(Math.random() * 9) + 1;
        return { "value": digit * base, "decimals": decimals };
    }
    if (base < 1000000000000) {
        return { "value": Math.floor(Math.random() * (base * 9) + base), "decimals": 0 };
    }
    let step = base / 10;
    let digits = Math.floor(Math.random() * 90) + 10;
    return { "value": digits * step, "decimals": 0 };
}

function htOrderFamGameFormat(value, decimals) {
    let localLang = $("#site_language").val();
    try {
        if (decimals > 0) {
            return new Intl.NumberFormat(localLang, { "minimumFractionDigits": decimals, "maximumFractionDigits": decimals }).format(value);
        }
        return new Intl.NumberFormat(localLang, { "maximumFractionDigits": 0 }).format(value);
    } catch (e) {
        return String(value);
    }
}

function htOrderFamGameRenderColumn(target, items, side) {
    let html = "";
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        html += "<button type=\"button\" class=\"orderGameBtn\" id=\"orderFam" + side + item.id + "\" data-order=\"" + item.id + "\" onclick=\"htOrderFamGameSelect('" + side + "', " + item.id + ");\">" + item.text + "</button>";
    }
    $(target).html(html);
}

function htOrderFamGameShowFeedback(message) {
    $("#orderFamFeedback").text(message).show();
}

function htOrderFamGameClearFeedback() {
    $("#orderFamFeedback").hide().text("");
}

function htOrderFamGameBuild() {
    $("#orderFamCongrats").html(localOrderFamGame.congratsHtml).hide();
    $("#orderFamNextBtn").addClass("hidden").text($("#orderFamNextLabel").text());
    htOrderFamGameClearFeedback();
    let orderIds = htOrderFamGameDraw(localOrderFamGame.level);
    let familyNames = [];
    for (let i = 0; i < htOrderFamGameBases.length; i++) {
        familyNames.push($("#htOrderFamName" + i).text());
    }

    localOrderFamGame.orderIds = orderIds;
    localOrderFamGame.matched = {};
    localOrderFamGame.selectedLeft = null;
    localOrderFamGame.selectedRight = null;
    localOrderFamGame.firstSide = null;

    let leftItems = [];
    let rightItems = [];
    for (let i = 0; i < orderIds.length; i++) {
        let drawn = htOrderFamGameRandomValue(orderIds[i]);
        leftItems.push({ "id": orderIds[i], "text": htOrderFamGameFormat(drawn.value, drawn.decimals) });
        rightItems.push({ "id": orderIds[i], "text": familyNames[orderIds[i]] });
    }

    htOrderFamGameShuffle(leftItems);
    htOrderFamGameShuffle(rightItems);

    $("#orderFamLevel").text($("#orderFamLevelTemplate").text().replace("{n}", localOrderFamGame.level + 1));
    htOrderFamGameRenderColumn("#orderFamLeftCol", leftItems, "Left");
    htOrderFamGameRenderColumn("#orderFamRightCol", rightItems, "Right");
}

function htOrderFamGameSelect(side, orderId) {
    if (localOrderFamGame.matched[orderId]) {
        return false;
    }

    if (localOrderFamGame.firstSide == null) {
        htOrderFamGameClearFeedback();
        localOrderFamGame.firstSide = side;
    }

    if (side == "Left") {
        if (localOrderFamGame.selectedLeft != null) {
            $("#orderFamLeft" + localOrderFamGame.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localOrderFamGame.selectedLeft = orderId;
    } else {
        if (localOrderFamGame.selectedRight != null) {
            $("#orderFamRight" + localOrderFamGame.selectedRight).removeClass("orderGameBtnSelected");
        }
        localOrderFamGame.selectedRight = orderId;
    }

    $("#orderFam" + side + orderId).addClass("orderGameBtnSelected");

    htOrderFamGameEvaluatePair();
    return false;
}

function htOrderFamGameEvaluatePair() {
    let leftId = localOrderFamGame.selectedLeft;
    let rightId = localOrderFamGame.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId == rightId) {
        localOrderFamGame.matched[leftId] = true;
        $("#orderFamLeft" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#orderFamRight" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localOrderFamGame.selectedLeft = null;
        localOrderFamGame.selectedRight = null;
        localOrderFamGame.firstSide = null;
        htOrderFamGameCheckComplete();
    } else {
        if (localOrderFamGame.firstSide == "Left") {
            let numberText = $("#orderFamLeft" + leftId).text();
            let numberDesc = $("#htOrderFamNumberDesc" + leftId).text();
            htOrderFamGameShowFeedback(numberText + " " + numberDesc + ".");
        } else {
            let nameDesc = $("#htOrderFamNameDesc" + rightId).text();
            htOrderFamGameShowFeedback(nameDesc + ".");
        }
        $("#orderFamLeft" + leftId).removeClass("orderGameBtnSelected");
        $("#orderFamRight" + rightId).removeClass("orderGameBtnSelected");
        localOrderFamGame.selectedLeft = null;
        localOrderFamGame.selectedRight = null;
        localOrderFamGame.firstSide = null;
    }
}

function htOrderFamGameCheckComplete() {
    if (Object.keys(localOrderFamGame.matched).length != localOrderFamGame.orderIds.length) {
        return;
    }
    if (localOrderFamGame.level < 2) {
        $("#orderFamCongrats").show();
        $("#orderFamNextBtn").removeClass("hidden");
        return;
    }
    $("#orderFamCongrats").html("<i class=\"fa-solid fa-medal\" style=\"color: gold;\"></i> " + $("#orderFamMsgFinal").text()).show();
    $("#orderFamNextBtn").text($("#orderFamPlayAgain").text()).removeClass("hidden");
}

function htOrderFamGameNext() {
    if (localOrderFamGame.level < 2) {
        localOrderFamGame.level = localOrderFamGame.level + 1;
    } else {
        localOrderFamGame.level = 0;
    }
    htOrderFamGameBuild();
}

function htLoadContent() {
    htWriteNavigation();

    localOrderFamGame = { "level": 0 };
    localOrderFamGame.congratsHtml = $("#orderFamCongrats").html();
    htOrderFamGameBuild();

    $(document).off("click.htOrderFamGameNext", "#orderFamNextBtn").on("click.htOrderFamGameNext", "#orderFamNextBtn", function() {
        htOrderFamGameNext();
        return false;
    });

    $(document).off("click.htOrderFamGameReset", "#orderFamResetBtn").on("click.htOrderFamGameReset", "#orderFamResetBtn", function() {
        htOrderFamGameBuild();
        return false;
    });

    return false;
}
