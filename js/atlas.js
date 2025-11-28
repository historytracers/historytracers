// SPDX-License-Identifier: GPL-3.0-or-later

$(document).ready(function(){
    htLoadPage('atlas','json', '', false);
});

/*
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
        let id = $(this).attr('id');
        let htmlSVG = "<svg viewbox=\"0 0 600 300\" id=\"svg"+id+"\">";
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
             html += "<style>.circle-draw circle, .circle-draw line {stroke: #71a6d2; stroke-width: 4; stroke-linecap: round; fill: none;} .circle-draw circle { stroke-dasharray: 942; stroke-dashoffset: 942; animation: drawCircle 2s linear forwards;} .radius-line { transform-origin: 300px 150px; animation: rotateRadius 2s linear forwards;} .radius-45 { opacity: 0; animation: showRadius45 0.3s ease-out forwards; animation-delay: 2s; } .vertical45 { opacity: 0; animation: showVertical45 0.3s ease-out forwards; animation-delay: 2.5s; } .atlasTextRadius { opacity: 0; animation: atlasTextRadiusMov 0.3s ease-out forwards; animation-delay: 2.8s; }</style><style>@keyframes drawCircle { to {stroke-dashoffset: 0; } } @keyframes rotateRadius { from { transform: rotate(0deg); } to   { transform: rotate(-360deg); } } @keyframes showRadius45 { from { opacity: 0; } to { opacity: 1; } }  @keyframes showVertical45 { from { opacity: 0; } to { opacity: 1; } }  @keyframes atlasTextRadiusMov { from { opacity: 0; } to { opacity: 1; } }</style>";
            first = false;
        }
        let id = $(this).attr('id');
        html += "<div class=\"atlasCircleContainer\"><svg viewbox=\"0 0 600 300\" class=\"circle-draw\" id=\"svg"+id+"\"> <circle cx=\"300\" cy=\"150\" r=\"148\" transform=\"scale(-1 1) translate(-600 0)  rotate(180 300 150)\" /> <line class=\"radius-line\" x1=\"300\" y1=\"148\" x2=\"448\" y2=\"148\" /> <line class=\"radius-45\" x1=\"300\" y1=\"148\" x2=\"406\" y2=\"46\" />  <line class=\"vertical45\" x1=\"406\" y1=\"46\" x2=\"406\" y2=\"146\" /> <text class=\"atlasTextRadius\" x=\"360\" y=\"168\" font-size=\"1.3em\" font-weight=\"bold\">a</text> <text class=\"atlasTextRadius\" x=\"360\" y=\"68\" font-size=\"1.3em\" font-weight=\"bold\">a</text> </svg></div>";
        $("#"+id).html(html);
    });
}
*/

function htLoadContent() {
    var divRadius = parseInt($(".htCircle[name='fig2']").width());

    $(".htCircle").mouseenter(function(){
        $(this).animate({ width: divRadius/4, height: divRadius/4 }, 'slow');
    }).mouseleave(function(){
        $(this).animate({ width: divRadius, height: divRadius }, 'slow');
    });

 // Calling during loading was not working.   
 //   htMakePythagorasTriangle();
 //   htMakeCircleWithTriangle();

    return false;
}
