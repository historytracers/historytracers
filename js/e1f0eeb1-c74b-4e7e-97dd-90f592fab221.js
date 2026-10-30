// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("imgShona", "images/UniversityJohannesburg/ShonaJohannnesburg.jpg");
    htSetImageSrc("c0", "images/HistoryTracers/TortillaFinal1.png");
    htSetImageSrc("img1", "images/CahalPech/ChocolatPot.jpg");
    htSetImageSrc("c1", "images/HistoryTracers/TortillaFinal2.png");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector != undefined) {
        for (let i = 0; i < localAnswerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}

var htLongDivisionFormat = "below";
var htLongDivisionTables = [];
var htLongDivisionReady = false;

function htLongDivisionParseCell(html) {
    var minus = false;
    var matchMinus = /^(?:\s|&nbsp;)*-(?:\s|&nbsp;)*/.exec(html);

    if (matchMinus) {
        minus = true;
        html = html.substring(matchMinus[0].length);
    }

    var tokens = [];
    var tokenRegex = /<span[^>]*>([\s\S]*?)<\/span>|([^<]+)/g;
    var match;

    while ((match = tokenRegex.exec(html)) !== null) {
        var text = (match[1] !== undefined) ? match[1] : match[2];
        var highlight = (match[1] !== undefined);
        text = text.replace(/&nbsp;/g, " ");

        for (var i = 0; i < text.length; i++) {
            var character = text.charAt(i);
            if (character === " " || character === "\u00a0") {
                continue;
            }
            tokens.push({ "character": character, "highlight": highlight });
        }
    }

    return { "minus": minus, "tokens": tokens };
}

function htLongDivisionTokensHtml(tokens) {
    var html = "";

    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].highlight) {
            html += '<span class="htLongDivisionHighlight">' + tokens[i].character + "</span>";
        } else {
            html += tokens[i].character;
        }
    }

    return html;
}

function htLongDivisionQuotientStart(dividendDigits, divisor) {
    var value = 0;

    for (var i = 0; i < dividendDigits.length; i++) {
        value = value * 10 + Number(dividendDigits[i]);
        if (value >= divisor) {
            return i;
        }
    }

    return Math.max(0, dividendDigits.length - 1);
}

function htLongDivisionBuildTop(belowHtml, isParts) {
    var container = document.createElement("div");
    container.innerHTML = belowHtml;

    var table = container.querySelector("table");
    if (!table || !table.rows || table.rows.length === 0) {
        return belowHtml;
    }

    if (isParts) {
        var labels = [];
        for (var r = 0; r < table.rows.length; r++) {
            for (var c = 0; c < table.rows[r].cells.length; c++) {
                labels.push(table.rows[r].cells[c].textContent.replace(/^\s+|\s+$/g, ""));
            }
        }
        // "Below" layout order: dividend, divisor, remainder, quotient.
        return '<table class="htLongDivisionTop htLongDivisionPartsTable" role="presentation">' +
            '<tr><td></td><td class="htLongDivisionQuotient">' + labels[3] + "</td></tr>" +
            '<tr><td class="htLongDivisionDivisor">' + labels[1] + '</td><td class="htLongDivisionDividend">' + labels[0] + "</td></tr>" +
            '<tr><td></td><td class="htLongDivisionStep">' + labels[2] + "</td></tr>" +
            "</table>";
    }

    var dividend = htLongDivisionParseCell(table.rows[0].cells[0].innerHTML);
    var divisor = htLongDivisionParseCell(table.rows[0].cells[1].innerHTML);
    var quotient = [];
    var steps = [];

    for (var i = 1; i < table.rows.length; i++) {
        var right = htLongDivisionParseCell(table.rows[i].cells[1].innerHTML);
        if (right.tokens.length > 0) {
            quotient = quotient.concat(right.tokens);
        }

        var left = htLongDivisionParseCell(table.rows[i].cells[0].innerHTML);
        if (left.tokens.length > 0) {
            steps.push(left);
        }
    }

    var html = '<table class="htLongDivisionTop" role="presentation">';

    if (quotient.length > 0) {
        var dividendDigits = [];
        for (var d = 0; d < dividend.tokens.length; d++) {
            dividendDigits.push(dividend.tokens[d].character);
        }

        var divisorDigits = "";
        for (var e = 0; e < divisor.tokens.length; e++) {
            divisorDigits += divisor.tokens[e].character;
        }

        var quotientStart = htLongDivisionQuotientStart(dividendDigits, Number(divisorDigits));
        var quotientPadding = dividendDigits.length - quotientStart - quotient.length;
        if (quotientPadding < 0) {
            quotientPadding = 0;
        }

        var quotientHtml = htLongDivisionTokensHtml(quotient);
        for (var q = 0; q < quotientPadding; q++) {
            quotientHtml += '<span class="htLongDivisionPad">0</span>';
        }

        html += '<tr><td></td><td class="htLongDivisionQuotient">' + quotientHtml + "</td></tr>";
    }

    html += '<tr><td class="htLongDivisionDivisor">' + htLongDivisionTokensHtml(divisor.tokens) +
        '</td><td class="htLongDivisionDividend">' + htLongDivisionTokensHtml(dividend.tokens) + "</td></tr>";

    for (var s = 0; s < steps.length; s++) {
        var step = steps[s];
        html += '<tr><td></td><td class="htLongDivisionStep' + (step.minus ? " htLongDivisionLine" : "") + '">' +
            (step.minus ? "-" : "") + htLongDivisionTokensHtml(step.tokens) + "</td></tr>";
    }

    html += "</table>";

    return html;
}

function htLongDivisionApply(format) {
    htLongDivisionFormat = (format === "top") ? "top" : "below";

    for (var i = 0; i < htLongDivisionTables.length; i++) {
        var item = htLongDivisionTables[i];
        var html = (htLongDivisionFormat === "top") ? htLongDivisionBuildTop(item.below, item.isParts) : item.below;
        item.container.innerHTML = html;
    }

    $(".htLongDivisionFormatBtn").each(function () {
        $(this).toggleClass("active", $(this).attr("data-htldformat") === htLongDivisionFormat);
    });
}

function htLongDivisionInit() {
    if (htLongDivisionReady) {
        return;
    }
    htLongDivisionReady = true;
    htLongDivisionTables = [];

    $("table.htLongDivision").each(function () {
        var table = this;
        var container = document.createElement("div");
        container.className = "htLongDivisionContainer";
        table.parentNode.insertBefore(container, table);
        container.appendChild(table);

        htLongDivisionTables.push({
            "container": container,
            "below": table.outerHTML,
            "isParts": $(table).hasClass("htLongDivisionParts")
        });
    });

    $(document).off("click.htLongDivisionFormat").on("click.htLongDivisionFormat", ".htLongDivisionFormatBtn", function (event) {
        event.preventDefault();
        htLongDivisionApply($(this).attr("data-htldformat"));
        return false;
    });

    htLongDivisionApply("below");
}

function htLoadContent() {
    htWriteMultiplicationTable("#mParent5", 5);
    htWriteMultiplicationTable("#mParent6", 6);
    htWriteMultiplicationTable("#mParent4", 4);
    htWriteMultiplicationTable("#mParent2", 2);
    htWriteNavigation();

    htLongDivisionInit();

    return false;
}
