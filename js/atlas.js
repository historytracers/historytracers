// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    htLoadPage('atlas','json', '', false);
});

function htMakePythagorasSideTriangle(x, y, end, color, angle) {
    let counter = 1;
    var html = "";
    for (let i = 0, yv = y, tyv = y + 18; i < end; i++, yv += 27, tyv += 27) {
        for (let j = 0, xv = x, txv = x + 2 ; j < end ; j++, xv += 27, txv += 27) {
            let additional = (angle != 0) ? "transform=\"rotate("+angle+", "+x+", "+y+")\"" : "";
            html += "<rect x=\""+xv+"\" y=\""+yv+"\" width=\"27\" height=\"27\" stroke=\""+color+"\" fill=\"white\""+additional+" /><text x=\""+txv+"\" y=\""+tyv+"\" font-size=\"1.3em\" font-weight=\"bold\" "+additional+">"+counter+"</text>";
            counter++;
        }
    }
    return html;
}

function htMakePythagorasTriangle() {
    $(".pythagorasTriangle").each(function() {
        let htmlSVG = "<svg viewbox=\"0 0 600 300\">";
        let id = $(this).attr('id');
        htmlSVG +=  htMakePythagorasSideTriangle(210, 190, 4, "blue", 0);
        htmlSVG +=  htMakePythagorasSideTriangle(318, 109, 3, "red", 0);
        htmlSVG +=  htMakePythagorasSideTriangle(236, 0, 5, "green", 53);
        htmlSVG += "</svg>";
        $("#"+id).html(htmlSVG);
    });
}

function htLoadContent() {
    var divRadius = parseInt($(".htCircle[name='fig2']").width());

    $(".htCircle").mouseenter(function(){
        $(this).animate({ width: divRadius/4, height: divRadius/4 }, 'slow');
    }).mouseleave(function(){
        $(this).animate({ width: divRadius, height: divRadius }, 'slow');
    });
    htMakePythagorasTriangle();

    return false;
}
