// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    htLoadPage('atlas','json', '', false);
});

function htAddAngleToTriangle(x, y, text) {
    return "<text x=\""+x+"\" y=\""+y+"\" font-size=\"1.3em\" font-weight=\"bold\">"+text+"</text>";
}

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
        htmlSVG += htMakePythagorasSideTriangle(210, 190, 4, "blue", 0);
        htmlSVG += htMakePythagorasSideTriangle(318, 109, 3, "red", 0);
        htmlSVG += htMakePythagorasSideTriangle(236, 0, 5, "green", 53);
        htmlSVG += htAddAngleToTriangle(240, 186, "θ");
        htmlSVG += "</svg>";
        $("#"+id).html(htmlSVG);
    });
}

function htMakeCircleWithTriangle() {
    var first = true;
    $(".unitaryCircle").each(function() {
        let html = "";
        if (first) {
             html += "<style>.circle-draw circle, .circle-draw line {stroke: #e74c3c; stroke-width: 4; stroke-linecap: round; fill: none;}</style><style> .circle-draw circle { stroke-dasharray: 302; stroke-dashoffset: 302; animation: drawCircle 2s linear forwards;}</style><style>.radius-line { transform-origin: 50px 50px; animation: rotateRadius 2s linear forwards;}</style><style>@keyframes drawCircle { to {stroke-dashoffset: 0; } } @keyframes rotateRadius { from { transform: rotate(0deg); } to   { transform: rotate(-360deg); } }</style>";
            first = false;
        }
        html += "<div class=\"atlasCircleContainer\"><svg viewbox=\"0 0 600 300\" class=\"circle-draw\"> <circle cx=\"50\" cy=\"50\" r=\"48\" transform=\"scale(-1 1) translate(-100 0)  rotate(180 50 50)\" /> <line class=\"radius-line\" x1=\"50\" y1=\"50\" x2=\"98\" y2=\"50\" /></svg></div>";
        let id = $(this).attr('id');
        $("#"+id).html(html);
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
    htMakeCircleWithTriangle();

    return false;
}
