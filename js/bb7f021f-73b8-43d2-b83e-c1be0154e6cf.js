// SPDX-License-Identifier: GPL-3.0-or-later

// Print-and-play Soroban / Suanpan abacus
// (content bb7f021f-73b8-43d2-b83e-c1be0154e6cf).
// The abacus boards follow js/ht_abacus.js (9 columns), but are static SVGs
// with empty bead positions: one Suanpan board (two upper, five lower) and one
// Soroban board (one upper, four lower). The interactive tutor panel is not included.

function htAbacusPrintablePrintHTML(html) {
    var iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    iframe.style.top = "0";
    iframe.style.width = "1123px";
    iframe.style.height = "794px";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    var win = iframe.contentWindow;
    var doc = win.document;
    doc.open();
    doc.write(html);
    doc.close();

    var cleanup = function () {
        if (iframe.parentNode) {
            iframe.remove();
        }
    };

    win.onafterprint = cleanup;

    window.setTimeout(function () {
        try {
            win.focus();
            win.print();
        } catch (error) {
            console.error("Printing the printable abacus failed:", error);
            cleanup();
        }
    }, 300);

    window.setTimeout(cleanup, 60000);

    return false;
}

function htAbacusPrintablePrintParts() {
    var selectors = [
        ".htBoardAbacusSheet",
        ".htBoardSorobanSheet",
        ".htBoardCountersSheet",
        ".htBoardCardsUnitsSheet",
        ".htBoardCardsTensSheet",
        ".htBoardCardsHundredsSheet",
        ".htBoardCardsLargeSheet"
    ];

    var clones = [];
    for (var i = 0; i < selectors.length; i++) {
        var sheet = document.querySelector(selectors[i]);
        if (!sheet) {
            return false;
        }
        clones.push(sheet.cloneNode(true));
    }

    // The printed abacus boards are only the boards: no titles or explanations.
    [0, 1].forEach(function (index) {
        clones[index].querySelectorAll(
            ".htBoardSheetTitle, .htBoardSheetIntro, .htBoardSheetNote, .htBoardPrintBar"
        ).forEach(function (element) {
            element.remove();
        });
    });

    clones.forEach(function (sheet) {
        sheet.querySelectorAll(".htBoardPrintBar").forEach(function (element) {
            element.remove();
        });
    });

    var css =
        '<style>' +
        '@page { size: A4 landscape; margin: 10mm; }' +
        'html, body { margin: 0; padding: 0; }' +
        'body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
        '.htBoardSheet { box-sizing: border-box; width: 277mm; height: 185mm; ' +
        'margin: 0 auto; padding: 0; border: 0; box-shadow: none; ' +
        'break-after: page; break-inside: avoid; display: flex; ' +
        'flex-direction: column; }' +
        '.htBoardSheet:last-child { break-after: auto; }' +
        '.htBoardAbacusSheet, .htBoardSorobanSheet { align-items: center; justify-content: center; }' +
        '.htBoardAbacusSvg { display: block; width: 277mm; height: 185mm; max-width: none; }' +
        '.htBoardSheetTitle { font-family: Arial, sans-serif; font-weight: bold; ' +
        'font-size: 14pt; text-align: center; margin: 0 0 3mm; }' +
        '.htBoardSheetIntro { font-family: Arial, sans-serif; font-size: 11pt; ' +
        'line-height: 1.4; text-align: center; margin: 0 0 4mm; }' +
        '.htBoardSheetNote { font-family: Arial, sans-serif; font-size: 10pt; ' +
        'line-height: 1.4; text-align: center; margin-top: 3mm; }' +
        '.htBoardCounterSection { margin: 0 0 4mm; break-inside: avoid; }' +
        '.htBoardCounterTitle { font-family: Arial, sans-serif; font-weight: bold; ' +
        'font-size: 10pt; text-align: center; margin: 0 0 2mm; }' +
        '.htBoardCounterGrid { display: grid; grid-template-columns: repeat(9, 8mm); ' +
        'gap: 4mm; justify-content: center; margin: 0 auto; }' +
        '.htBoardCounter { box-sizing: border-box; width: 8mm; height: 8mm; ' +
        'border-radius: 50%; border: 2px dashed #444444; }' +
        '.htBoardCounterRed { background: #d94a38; border-color: #8a271c; }' +
        '.htBoardCounterBlue { background: #4c7f90; border-color: #1a3a3a; }' +
        '.htBoardCounterBlack { background: #0a0a12; border-color: #2a2a3a; }' +
        '.htBoardDeck { break-inside: avoid; }' +
        '.htBoardDeck + .htBoardDeck { margin-top: 5mm; }' +
        '.htBoardDeckTitle { font-family: Arial, sans-serif; font-weight: bold; ' +
        'font-size: 11pt; text-align: center; margin: 0 0 2mm; }' +
        '.htBoardCardGrid { display: grid; grid-template-columns: ' +
        'repeat(10, minmax(0, 1fr)); gap: 2mm; }' +
        '.htBoardCard { box-sizing: border-box; height: 30mm; ' +
        'border: 2px dashed #8a6a4a; border-radius: 6px; background: #fffdf8; ' +
        'display: flex; align-items: center; justify-content: center; ' +
        'position: relative; }' +
        '.htBoardCardLabel { position: absolute; top: 2mm; left: 2mm; ' +
        'font-family: Arial, sans-serif; font-size: 8pt; font-weight: bold; ' +
        'color: #8a6a4a; }' +
        '.htBoardCardNumber { font-family: Arial, sans-serif; font-size: 20pt; ' +
        'font-weight: bold; color: #3b2a1d; line-height: 1; }' +
        '.htBoardCardGridLong .htBoardCardNumber { font-size: 11pt; line-height: 1.05; ' +
        'max-width: 100%; overflow-wrap: anywhere; text-align: center; word-break: break-all; }' +
        '</style>';

    var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' + css +
        '</head><body>' + clones.map(function (sheet) {
            return sheet.outerHTML;
        }).join('') + '</body></html>';

    return htAbacusPrintablePrintHTML(html);
}

function htLoadContent() {
    // The renderer wraps block content in <p> elements, which leaves empty
    // paragraphs around each printable sheet; remove them for the sheets only.
    $("#page_data .htBoardSheet").each(function () {
        $(this).parent().children("p:empty").remove();
    });

    htWriteNavigation();

    return false;
}
