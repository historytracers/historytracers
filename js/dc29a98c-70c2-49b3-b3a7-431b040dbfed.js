// SPDX-License-Identifier: GPL-3.0-or-later

var localSenPracticeDc29 = {
    "containerId": "senpracticedc29",
    "ox": 300,
    "oy": 210,
    "r": 120,
    "minTheta": 0,
    "maxTheta": 90,
    "thetaRad": Math.PI / 2,
    "viewW": 640,
    "viewH": 400,
    "svgNS": "http://www.w3.org/2000/svg"
};

function htSenPracticeElDc29(tag, attrs) {
    var el = document.createElementNS(localSenPracticeDc29.svgNS, tag);
    if (attrs) {
        for (var k in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                el.setAttribute(k, attrs[k]);
            }
        }
    }
    return el;
}

function htSenPracticeTextDc29(el, value) {
    el.textContent = value;
    return el;
}

function htSenPracticeOnClickDc29(evt) {
    var o = localSenPracticeDc29;
    var rect = evt.currentTarget.getBoundingClientRect();
    var x = (evt.clientX - rect.left) * (o.viewW / rect.width);
    var y = (evt.clientY - rect.top) * (o.viewH / rect.height);
    var dx = x - o.ox;
    var dy = o.oy - y;
    if (dx <= 0 || dy <= 0) {
        return;
    }
    var deg = Math.atan2(dy, dx) * 180 / Math.PI;
    if (deg < o.minTheta) {
        deg = o.minTheta;
    } else if (deg > o.maxTheta) {
        deg = o.maxTheta;
    }
    o.thetaRad = deg * Math.PI / 180;
    htSenPracticeDrawDc29();
}

function htSenPracticeDrawDc29() {
    var o = localSenPracticeDc29;
    var th = o.thetaRad;
    var cos = Math.cos(th);
    var sin = Math.sin(th);
    var ox = o.ox;
    var oy = o.oy;
    var R = o.r;
    var px = ox + cos * R;
    var py = oy - sin * R;
    var qx = px;
    var qy = oy;
    var s = 12;

    o.triFill.setAttribute("points", ox + "," + oy + " " + qx + "," + qy + " " + px + "," + py);

    o.radius.setAttribute("x1", ox);
    o.radius.setAttribute("y1", oy);
    o.radius.setAttribute("x2", px);
    o.radius.setAttribute("y2", py);

    o.sine.setAttribute("x1", px);
    o.sine.setAttribute("y1", py);
    o.sine.setAttribute("x2", qx);
    o.sine.setAttribute("y2", qy);

    var ra = 30;
    o.thetaArc.setAttribute("d", "M " + (ox + ra) + " " + oy + " A " + ra + " " + ra + " 0 0 0 " + (ox + ra * cos) + " " + (oy - ra * sin));

    o.sqQ.setAttribute("points", (qx - s) + "," + qy + " " + (qx - s) + "," + (qy - s) + " " + qx + "," + (qy - s));

    o.pP.setAttribute("cx", px);
    o.pP.setAttribute("cy", py);
    o.pQ.setAttribute("cx", qx);
    o.pQ.setAttribute("cy", qy);

    o.tOne.setAttribute("x", ox + 0.4 * (px - ox) - sin * 18);
    o.tOne.setAttribute("y", oy + 0.4 * (py - oy) - cos * 18 + 6);

    o.tSen.setAttribute("x", (px + qx) / 2 + 20);
    o.tSen.setAttribute("y", (py + qy) / 2 + 6);

    var ta = th / 2;
    o.tTheta.setAttribute("x", ox + (ra + 20) * Math.cos(ta));
    o.tTheta.setAttribute("y", oy - (ra + 20) * Math.sin(ta) + 6);

    o.tP.setAttribute("x", px + 14);
    o.tP.setAttribute("y", py - 8);
    o.tQ.setAttribute("x", qx + 16);
    o.tQ.setAttribute("y", qy - 10);

    var vT = document.getElementById("thetavaldc29");
    var vS = document.getElementById("senvaldc29");
    if (vT) {
        vT.innerHTML = (th * 180 / Math.PI).toFixed(1) + "&deg;";
    }
    if (vS) {
        vS.innerHTML = sin.toFixed(3);
    }
}

function htSenPracticeBuildDc29() {
    var o = localSenPracticeDc29;
    var container = document.getElementById(o.containerId);
    if (!container) {
        return;
    }

    var svg = htSenPracticeElDc29("svg", {
        "viewBox": "0 0 " + o.viewW + " " + o.viewH,
        "id": "senpracticeSvgDc29",
        "style": "width:100%; max-width:620px; height:auto; display:block; margin:0 auto; cursor:pointer; background:#ffffff; touch-action:manipulation;"
    });

    var defs = htSenPracticeElDc29("defs", {});
    var marker = htSenPracticeElDc29("marker", {
        "id": "senarrowDc29",
        "viewBox": "0 0 10 10",
        "refX": "5",
        "refY": "5",
        "markerWidth": "3",
        "markerHeight": "3",
        "orient": "auto-start-reverse"
    });
    marker.appendChild(htSenPracticeElDc29("path", { "d": "M 0 0 L 10 5 L 0 10 z" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    svg.appendChild(htSenPracticeElDc29("line", {
        "x1": "20", "y1": String(o.oy), "x2": "625", "y2": String(o.oy),
        "stroke": "black", "stroke-width": "3", "fill": "none",
        "marker-start": "url(#senarrowDc29)", "marker-end": "url(#senarrowDc29)"
    }));
    svg.appendChild(htSenPracticeElDc29("line", {
        "x1": String(o.ox), "y1": String(o.oy + o.r + 60), "x2": String(o.ox), "y2": String(o.oy - o.r - 60),
        "stroke": "black", "stroke-width": "3", "fill": "none",
        "marker-start": "url(#senarrowDc29)", "marker-end": "url(#senarrowDc29)"
    }));
    svg.appendChild(htSenPracticeElDc29("circle", {
        "cx": String(o.ox), "cy": String(o.oy), "r": String(o.r),
        "fill": "none", "stroke": "#71a6d2", "stroke-width": "4", "stroke-linecap": "round"
    }));

    o.triFill = htSenPracticeElDc29("polygon", { "fill": "rgba(113,166,210,0.15)", "stroke": "none" });
    svg.appendChild(o.triFill);

    o.sqQ = htSenPracticeElDc29("polygon", { "fill": "#b3cfdd", "stroke": "#346f82", "stroke-width": "1.5" });
    svg.appendChild(o.sqQ);

    o.radius = htSenPracticeElDc29("line", { "stroke": "#71a6d2", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.radius);
    o.sine = htSenPracticeElDc29("line", { "stroke": "#c44536", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.sine);

    o.thetaArc = htSenPracticeElDc29("path", { "fill": "none", "stroke": "black", "stroke-width": "2.5" });
    svg.appendChild(o.thetaArc);

    o.pP = htSenPracticeElDc29("circle", { "r": "5", "fill": "#71a6d2" });
    svg.appendChild(o.pP);
    o.pQ = htSenPracticeElDc29("circle", { "r": "4", "fill": "#c44536" });
    svg.appendChild(o.pQ);

    function label(text, x, y, color) {
        var t = htSenPracticeElDc29("text", {
            "x": String(x),
            "y": String(y),
            "font-size": "1.2em",
            "font-weight": "bold",
            "text-anchor": "middle"
        });
        if (color) {
            t.setAttribute("fill", color);
        }
        htSenPracticeTextDc29(t, text);
        svg.appendChild(t);
        return t;
    }

    o.tOne = label("1", 0, 0);
    o.tSen = label("sen θ", 0, 0, "#c44536");
    o.tTheta = label("θ", 0, 0);
    o.tO = label("O", o.ox - 34, o.oy + 26);
    o.tX = label("x", 612, o.oy + 24);
    o.tY = label("y", o.ox + 22, o.oy - o.r - 45);
    o.tP = label("P", 0, 0, "#71a6d2");
    o.tQ = label("Q", 0, 0, "#c44536");

    container.appendChild(svg);

    var panel = document.createElement("div");
    panel.style.cssText = "text-align:center; font-size:1.1em; margin-top:0.6em; font-weight:bold;";
    panel.innerHTML = '<span style="color:#c44536;">sen θ = <span id="senvaldc29">1.000</span></span> &nbsp;&nbsp;&nbsp; <span style="color:#000;">θ = <span id="thetavaldc29">90.0&deg;</span></span>';
    container.appendChild(panel);

    svg.addEventListener("click", htSenPracticeOnClickDc29);
    htSenPracticeDrawDc29();
}

function htLoadContent() {
    htSenPracticeBuildDc29();
    htWriteNavigation();
    return false;
}
