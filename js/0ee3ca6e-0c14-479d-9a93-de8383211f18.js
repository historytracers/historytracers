// SPDX-License-Identifier: GPL-3.0-or-later

// Print-and-play version of "Counting with the bone"
// (content 7d2fd4de-5c10-4811-957c-8233bc8d21de).

function htBoardPrintHTML(html) {
    var iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    iframe.style.top = "0";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
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
            console.error("Printing the board game failed:", error);
            cleanup();
        }
    }, 300);

    window.setTimeout(cleanup, 60000);

    return false;
}

function htBoardPrintBone() {
    var svg = document.querySelector(".htBoardBoneSvg");

    if (!svg) {
        return false;
    }

    var css =
        '<style>' +
        '@page { size: A4 landscape; margin: 10mm; }' +
        'html, body { margin: 0; padding: 0; }' +
        'body { box-sizing: border-box; height: 190mm; display: flex; ' +
        'align-items: center; justify-content: center; ' +
        '-webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
        'svg { display: block; width: 277mm; height: auto; max-width: 100%; }' +
        '.htBoardBoneShape { fill: #f4ead7; stroke: #6b4f35; stroke-width: 4; }' +
        '.htBoardBoneSlots rect { fill: none; stroke: #8a6a4a; ' +
        'stroke-dasharray: 6 5; stroke-width: 2.5; }' +
        '</style>';

    var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' + css +
        '</head><body>' + svg.outerHTML + '</body></html>';

    return htBoardPrintHTML(html);
}

function htBoardPrintParts() {
    var bone = document.querySelector(".htBoardBoneSheet");
    var marks = document.querySelector(".htBoardMarksSheet");
    var cards = document.querySelector(".htBoardCardsSheet");

    if (!bone || !marks || !cards) {
        return false;
    }

    var boneClone = bone.cloneNode(true);
    boneClone.querySelectorAll(
        ".htBoardSheetTitle, .htBoardSheetIntro, .htBoardSheetNote, .htBoardPrintBar"
    ).forEach(function (element) {
        element.remove();
    });

    var marksClone = marks.cloneNode(true);
    var cardsClone = cards.cloneNode(true);

    [boneClone, marksClone, cardsClone].forEach(function (sheet) {
        sheet.querySelectorAll(".htBoardPrintBar").forEach(function (element) {
            element.remove();
        });
    });

    var css =
        '<style>' +
        '@page { size: A4 landscape; margin: 10mm; }' +
        'html, body { margin: 0; padding: 0; }' +
        'body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }' +
        '.htBoardSheet { box-sizing: border-box; width: 277mm; height: 190mm; ' +
        'margin: 0 auto; padding: 0; border: 0; box-shadow: none; ' +
        'break-after: page; break-inside: avoid; display: flex; ' +
        'flex-direction: column; }' +
        '.htBoardSheet:last-child { break-after: auto; }' +
        '.htBoardBoneSheet { align-items: center; justify-content: center; }' +
        '.htBoardBoneSvg { display: block; width: 277mm; height: auto; max-width: 100%; }' +
        '.htBoardBoneShape { fill: #f4ead7; stroke: #6b4f35; stroke-width: 4; }' +
        '.htBoardBoneSlots rect { fill: none; stroke: #8a6a4a; ' +
        'stroke-dasharray: 6 5; stroke-width: 2.5; }' +
        '.htBoardSheetTitle { font-family: Arial, sans-serif; font-weight: bold; ' +
        'font-size: 14pt; text-align: center; margin: 0 0 3mm; }' +
        '.htBoardSheetIntro { font-family: Arial, sans-serif; font-size: 11pt; ' +
        'line-height: 1.4; text-align: center; margin: 0 0 4mm; }' +
        '.htBoardSheetNote { font-family: Arial, sans-serif; font-size: 10pt; ' +
        'line-height: 1.4; text-align: center; margin-top: 3mm; }' +
        '.htBoardMarkGrid { display: grid; grid-template-columns: repeat(10, 14mm); ' +
        'gap: 4mm; justify-content: center; margin: 0 auto; }' +
        '.htBoardMarkToken { box-sizing: border-box; width: 14mm; height: 21mm; ' +
        'border: 2px dashed #8a6a4a; border-radius: 4px; background: #fffdf8; ' +
        'display: flex; align-items: center; justify-content: center; }' +
        '.htBoardMarkGlyph { display: block; width: 28%; height: 62%; ' +
        'background: #3b2a1d; }' +
        '.htBoardDeck { break-inside: avoid; }' +
        '.htBoardDeck + .htBoardDeck { margin-top: 4mm; }' +
        '.htBoardDeckTitle { font-family: Arial, sans-serif; font-weight: bold; ' +
        'font-size: 11pt; text-align: center; margin: 0 0 2mm; }' +
        '.htBoardCardGrid { display: grid; grid-template-columns: ' +
        'repeat(10, minmax(0, 1fr)); gap: 2mm; }' +
        '.htBoardCard { box-sizing: border-box; height: 35mm; ' +
        'border: 2px dashed #8a6a4a; border-radius: 6px; background: #fffdf8; ' +
        'display: flex; align-items: center; justify-content: center; ' +
        'position: relative; }' +
        '.htBoardCardLabel { position: absolute; top: 2mm; left: 2mm; ' +
        'font-family: Arial, sans-serif; font-size: 8pt; font-weight: bold; ' +
        'color: #8a6a4a; }' +
        '.htBoardCardNumber { font-family: Arial, sans-serif; font-size: 20pt; ' +
        'font-weight: bold; color: #3b2a1d; line-height: 1; }' +
        '</style>';

    var html = '<!DOCTYPE html><html><head><meta charset="utf-8">' + css +
        '</head><body>' + boneClone.outerHTML + marksClone.outerHTML +
        cardsClone.outerHTML + '</body></html>';

    return htBoardPrintHTML(html);
}

function htLoadContent() {
    htSetImageSrc("imgBoardBoneFigure", "images/GonzalesRedondo/Figura-9-Hueso-de-Lebombo.png");

    // The markdown/HTML renderer wraps block content in <p> elements, which
    // leaves empty paragraphs around each printable sheet and adds unwanted
    // space and page breaks when printing. Remove them for the sheets only.
    $("#page_data .htBoardSheet").each(function () {
        $(this).parent().children("p:empty").remove();
    });

    htWriteNavigation();

    return false;
}
