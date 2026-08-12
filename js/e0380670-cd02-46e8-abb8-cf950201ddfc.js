// SPDX-License-Identifier: GPL-3.0-or-later

var localMissingNumbers = {};

function htMissingNumFillTable() {
    $("#missingNum tr:not(:first)").remove();
    localMissingNumbers.missing = [];
    localMissingNumbers.revealed = 0;

    var idx = 0;
    for (let r = 0; r < 10; r++) {
        var value = "<tr>";
        for (let c = 0; c < 10; c++, idx++) {
            value += "<td id=\"mng"+idx+"\" data-num=\""+idx+"\" class=\"mngCell\" onclick=\"htMissingNumReveal("+idx+");\"><span class=\"num_to_paint\">"+idx+"</span></td>";
        }
        value += "</tr>";
        $("#missingNum tr:last").after(value);
    }

    for (let r = 0; r < 10; r++) {
        var col = htGetRandomArbitrary(0, 10);
        var num = r * 10 + col;
        localMissingNumbers.missing.push(num);
        $("#mng"+num).addClass("mngEmpty").html("<span class=\"mngQuestion\">?</span>");
    }

    $("#missingCongrats").hide();
}

function htMissingNumReveal(num) {
    if (localMissingNumbers.missing.indexOf(num) === -1) {
        return false;
    }
    if ($("#mng"+num).hasClass("mngRevealed")) {
        return false;
    }
    $("#mng"+num).removeClass("mngEmpty").addClass("mngRevealed");
    $("#mng"+num).html("<span class=\"num_to_paint\">"+num+"</span>");
    localMissingNumbers.revealed++;
    if (localMissingNumbers.revealed === localMissingNumbers.missing.length) {
        $("#missingCongrats").show();
    }
    return false;
}

function htLoadContent() {
    htMissingNumFillTable();

    $("#resetTutorBtn").on("click", function() {
        htMissingNumFillTable();
    });

    htWriteNavigation();

    return false;
}
