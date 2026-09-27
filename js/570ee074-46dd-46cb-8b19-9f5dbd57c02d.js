// SPDX-License-Identifier: GPL-3.0-or-later

var localOrderGame = {};

var htOrderGameValues = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];
var htOrderGameRoundSize = 6;

function htOrderGameShuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
    }
    return items;
}

function htOrderGameRandomOrders() {
    let indexes = [];
    for (let i = 0; i < htOrderGameValues.length; i++) {
        indexes.push(i);
    }
    htOrderGameShuffle(indexes);
    return indexes.slice(0, htOrderGameRoundSize);
}

function htOrderGameRandomValue(orderIndex) {
    let min = htOrderGameValues[orderIndex];
    let max = min * 10;
    return Math.floor(Math.random() * (max - min) + min);
}

function htOrderGameFormat(value) {
    let localLang = $("#site_language").val();
    return new Intl.NumberFormat(localLang).format(value);
}

function htOrderGameOrderNames() {
    let names = [];
    for (let i = 0; i < htOrderGameValues.length; i++) {
        names.push($("#htOrderName" + i).text());
    }
    return names;
}

function htOrderGameRenderColumn(target, items, side) {
    let html = "";
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        html += "<button type=\"button\" class=\"orderGameBtn\" id=\"order" + side + item.id + "\" data-order=\"" + item.id + "\" onclick=\"htOrderGameSelect('" + side + "', " + item.id + ");\">" + item.text + "</button>";
    }
    $(target).html(html);
}

function htOrderGameBuild() {
    $("#orderCongrats").hide();
    let orderIds = htOrderGameRandomOrders();
    let orderNames = htOrderGameOrderNames();

    localOrderGame.orderIds = orderIds;
    localOrderGame.matched = {};
    localOrderGame.selectedLeft = null;
    localOrderGame.selectedRight = null;

    let leftItems = [];
    let rightItems = [];
    for (let i = 0; i < orderIds.length; i++) {
        leftItems.push({ "id": orderIds[i], "text": htOrderGameFormat(htOrderGameRandomValue(orderIds[i])) });
        rightItems.push({ "id": orderIds[i], "text": orderNames[orderIds[i]] });
    }

    htOrderGameShuffle(leftItems);
    htOrderGameShuffle(rightItems);

    htOrderGameRenderColumn("#orderLeftCol", leftItems, "Left");
    htOrderGameRenderColumn("#orderRightCol", rightItems, "Right");
}

function htOrderGameSelect(side, orderId) {
    if (localOrderGame.matched[orderId]) {
        return false;
    }

    if (side == "Left") {
        if (localOrderGame.selectedLeft != null) {
            $("#orderLeft" + localOrderGame.selectedLeft).removeClass("orderGameBtnSelected");
        }
        localOrderGame.selectedLeft = orderId;
    } else {
        if (localOrderGame.selectedRight != null) {
            $("#orderRight" + localOrderGame.selectedRight).removeClass("orderGameBtnSelected");
        }
        localOrderGame.selectedRight = orderId;
    }

    $("#order" + side + orderId).addClass("orderGameBtnSelected");

    htOrderGameEvaluatePair();
    return false;
}

function htOrderGameEvaluatePair() {
    let leftId = localOrderGame.selectedLeft;
    let rightId = localOrderGame.selectedRight;
    if (leftId == null || rightId == null) {
        return;
    }

    if (leftId == rightId) {
        localOrderGame.matched[leftId] = true;
        $("#orderLeft" + leftId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        $("#orderRight" + rightId).removeClass("orderGameBtnSelected").addClass("orderGameBtnMatched").prop("disabled", true);
        localOrderGame.selectedLeft = null;
        localOrderGame.selectedRight = null;
        htOrderGameCheckComplete();
    } else {
        $("#orderLeft" + leftId).removeClass("orderGameBtnSelected");
        $("#orderRight" + rightId).removeClass("orderGameBtnSelected");
        localOrderGame.selectedLeft = null;
        localOrderGame.selectedRight = null;
    }
}

function htOrderGameCheckComplete() {
    if (Object.keys(localOrderGame.matched).length == localOrderGame.orderIds.length) {
        $("#orderCongrats").show();
    }
}

function htLoadContent() {
    htOrderGameBuild();

    $("#orderResetBtn").off("click").on("click", function() {
        htOrderGameBuild();
    });

    htWriteNavigation();

    return false;
}
