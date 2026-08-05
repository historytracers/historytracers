// SPDX-License-Identifier: GPL-3.0-or-later

var localTanPractice2510 = {
    "containerId": "tanpractice2510",
    "ox": 250,
    "oy": 320,
    "r": 120,
    "minTheta": 5,
    "maxTheta": 78,
    "thetaRad": 0,
    "viewW": 960,
    "viewH": 640,
    "svgNS": "http://www.w3.org/2000/svg"
};

function htTanPracticeEl2510(tag, attrs) {
    var el = document.createElementNS(localTanPractice2510.svgNS, tag);
    if (attrs) {
        for (var k in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                el.setAttribute(k, attrs[k]);
            }
        }
    }
    return el;
}

function htTanPracticeText2510(el, value) {
    el.textContent = value;
    return el;
}

function htTanPracticeOnClick2510(evt) {
    var o = localTanPractice2510;
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
    htTanPracticeDraw2510();
}

function htTanPracticeDraw2510() {
    var o = localTanPractice2510;
    var th = o.thetaRad;
    var cos = Math.cos(th);
    var sin = Math.sin(th);
    var sec = 1 / cos;
    var tan = sin / cos;
    var ox = o.ox;
    var oy = o.oy;
    var R = o.r;
    var px = ox + cos * R;
    var py = oy - sin * R;
    var qx = px;
    var qy = oy;
    var rx = ox + sec * R;
    var ry = oy;
    var s = 12;

    o.triFill.setAttribute("points", ox + "," + oy + " " + px + "," + py + " " + qx + "," + qy);

    o.radius.setAttribute("x1", ox);
    o.radius.setAttribute("y1", oy);
    o.radius.setAttribute("x2", px);
    o.radius.setAttribute("y2", py);

    o.cos.setAttribute("x1", ox);
    o.cos.setAttribute("y1", oy);
    o.cos.setAttribute("x2", qx);
    o.cos.setAttribute("y2", qy);

    o.sine.setAttribute("x1", px);
    o.sine.setAttribute("y1", py);
    o.sine.setAttribute("x2", qx);
    o.sine.setAttribute("y2", qy);

    o.tan.setAttribute("x1", px);
    o.tan.setAttribute("y1", py);
    o.tan.setAttribute("x2", rx);
    o.tan.setAttribute("y2", ry);

    var ra = 30;
    o.thetaArc.setAttribute("d", "M " + (ox + ra) + " " + oy + " A " + ra + " " + ra + " 0 0 0 " + (ox + ra * cos) + " " + (oy - ra * sin));

    o.sqQ.setAttribute("points", (qx - s) + "," + qy + " " + (qx - s) + "," + (qy - s) + " " + qx + "," + (qy - s));

    var ux = cos;
    var uy = -sin;
    var vx = sin;
    var vy = cos;
    o.sqP.setAttribute("points",
        px + "," + py + " " +
        (px + s * ux) + "," + (py + s * uy) + " " +
        (px + s * ux + s * vx) + "," + (py + s * uy + s * vy) + " " +
        (px + s * vx) + "," + (py + s * vy));

    o.pP.setAttribute("cx", px);
    o.pP.setAttribute("cy", py);
    o.pQ.setAttribute("cx", qx);
    o.pQ.setAttribute("cy", qy);
    o.pR.setAttribute("cx", rx);
    o.pR.setAttribute("cy", ry);

    o.tOne.setAttribute("x", ox + 0.5 * (px - ox) - sin * 20);
    o.tOne.setAttribute("y", oy + 0.5 * (py - oy) - cos * 20 + 6);

    if (th < Math.PI / 4) {
        o.tSen.setAttribute("x", px - 20);
    } else {
        o.tSen.setAttribute("x", px + 20);
    }
    o.tSen.setAttribute("y", (py + oy) / 2 + 6);

    o.tCos.setAttribute("x", (ox + qx) / 2);
    o.tCos.setAttribute("y", oy + 34);

    var ddx = rx - px;
    var ddy = ry - py;
    var dlen = Math.sqrt(ddx * ddx + ddy * ddy);
    if (dlen === 0) {
        dlen = 1;
    }
    var nxx = -ddy / dlen;
    var nyy = ddx / dlen;
    var midX = (px + rx) / 2;
    var midY = (py + ry) / 2;
    if ((ox - midX) * nxx + (oy - midY) * nyy > 0) {
        nxx = -nxx;
        nyy = -nyy;
    }
    o.tTan.setAttribute("x", midX + nxx * 28);
    o.tTan.setAttribute("y", midY + nyy * 28 + 6);

    var tanLen = Math.sqrt((rx - px) * (rx - px) + (ry - py) * (ry - py));
    var sinLen = sin * R;
    var cosLen = cos * R;
    if (tanLen < 40) {
        o.tTan.setAttribute("opacity", "0");
        o.pR.setAttribute("opacity", "0");
        o.tR.setAttribute("opacity", "0");
    } else {
        o.tTan.setAttribute("opacity", "1");
        o.pR.setAttribute("opacity", "1");
        o.tR.setAttribute("opacity", "1");
    }
    if (tanLen < 56) {
        o.tR.setAttribute("opacity", "0");
    }
    if (sinLen < 2) {
        o.tSen.setAttribute("opacity", "0");
    } else {
        o.tSen.setAttribute("opacity", "1");
    }
    if (cosLen < 34) {
        o.tQ.setAttribute("opacity", "0");
    } else {
        o.tQ.setAttribute("opacity", "1");
    }
    if (th < 8 * Math.PI / 180) {
        o.tTheta.setAttribute("opacity", "0");
    } else {
        o.tTheta.setAttribute("opacity", "1");
    }

    var ta = th / 2;
    o.tTheta.setAttribute("x", ox + (ra + 20) * Math.cos(ta));
    o.tTheta.setAttribute("y", oy - (ra + 20) * Math.sin(ta) + 6);

    o.tP.setAttribute("x", px + 18);
    o.tP.setAttribute("y", py - 14);
    o.tQ.setAttribute("x", qx);
    o.tQ.setAttribute("y", oy + 22);
    o.tR.setAttribute("x", rx + 16);
    o.tR.setAttribute("y", oy - 8);

    var vT = document.getElementById("thetaval2510");
    var vS = document.getElementById("senval2510");
    var vC = document.getElementById("cosval2510");
    var vN = document.getElementById("tanval2510");
    if (vT) {
        vT.innerHTML = (th * 180 / Math.PI).toFixed(1) + "&deg;";
    }
    if (vS) {
        vS.innerHTML = sin.toFixed(3);
    }
    if (vC) {
        vC.innerHTML = cos.toFixed(3);
    }
    if (vN) {
        vN.innerHTML = tan.toFixed(3);
    }
}

function htTanPracticeBuild2510() {
    var o = localTanPractice2510;
    var container = document.getElementById(o.containerId);
    if (!container) {
        return;
    }

    var svg = htTanPracticeEl2510("svg", {
        "viewBox": "0 0 " + o.viewW + " " + o.viewH,
        "id": "tanpracticeSvg2510",
        "style": "width:100%; max-width:820px; height:auto; display:block; margin:0 auto; cursor:pointer; background:#ffffff; touch-action:manipulation;"
    });

    var defs = htTanPracticeEl2510("defs", {});
    var marker = htTanPracticeEl2510("marker", {
        "id": "tanarrow2510",
        "viewBox": "0 0 10 10",
        "refX": "5",
        "refY": "5",
        "markerWidth": "3",
        "markerHeight": "3",
        "orient": "auto-start-reverse"
    });
    marker.appendChild(htTanPracticeEl2510("path", { "d": "M 0 0 L 10 5 L 0 10 z" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    svg.appendChild(htTanPracticeEl2510("line", {
        "x1": "20", "y1": String(o.oy), "x2": "940", "y2": String(o.oy),
        "stroke": "black", "stroke-width": "3", "fill": "none",
        "marker-start": "url(#tanarrow2510)", "marker-end": "url(#tanarrow2510)"
    }));
    svg.appendChild(htTanPracticeEl2510("line", {
        "x1": String(o.ox), "y1": "625", "x2": String(o.ox), "y2": "15",
        "stroke": "black", "stroke-width": "3", "fill": "none",
        "marker-start": "url(#tanarrow2510)", "marker-end": "url(#tanarrow2510)"
    }));
    svg.appendChild(htTanPracticeEl2510("circle", {
        "cx": String(o.ox), "cy": String(o.oy), "r": String(o.r),
        "fill": "none", "stroke": "#71a6d2", "stroke-width": "4", "stroke-linecap": "round"
    }));

    o.triFill = htTanPracticeEl2510("polygon", { "fill": "rgba(113,166,210,0.15)", "stroke": "none" });
    svg.appendChild(o.triFill);

    o.sqQ = htTanPracticeEl2510("polygon", { "fill": "#b3cfdd", "stroke": "#346f82", "stroke-width": "1.5" });
    svg.appendChild(o.sqQ);
    o.sqP = htTanPracticeEl2510("polygon", { "fill": "#b3cfdd", "stroke": "#346f82", "stroke-width": "1.5" });
    svg.appendChild(o.sqP);

    o.radius = htTanPracticeEl2510("line", { "stroke": "#71a6d2", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.radius);
    o.cos = htTanPracticeEl2510("line", { "stroke": "#2e7d64", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.cos);
    o.sine = htTanPracticeEl2510("line", { "stroke": "#c44536", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.sine);
    o.tan = htTanPracticeEl2510("line", { "stroke": "#8e44ad", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.tan);

    o.thetaArc = htTanPracticeEl2510("path", { "fill": "none", "stroke": "black", "stroke-width": "2.5" });
    svg.appendChild(o.thetaArc);

    o.pP = htTanPracticeEl2510("circle", { "r": "5", "fill": "#71a6d2" });
    svg.appendChild(o.pP);
    o.pQ = htTanPracticeEl2510("circle", { "r": "4", "fill": "#2e7d64" });
    svg.appendChild(o.pQ);
    o.pR = htTanPracticeEl2510("circle", { "r": "4", "fill": "#8e44ad" });
    svg.appendChild(o.pR);

    function label(text, x, y, color) {
        var t = htTanPracticeEl2510("text", {
            "x": String(x),
            "y": String(y),
            "font-size": "1.2em",
            "font-weight": "bold",
            "text-anchor": "middle"
        });
        if (color) {
            t.setAttribute("fill", color);
        }
        htTanPracticeText2510(t, text);
        svg.appendChild(t);
        return t;
    }

    o.tOne = label("1", 0, 0);
    o.tSen = label("sen θ", 0, 0, "#c44536");
    o.tCos = label("cos θ", 0, 0, "#2e7d64");
    o.tTan = label("tan θ", 0, 0, "#8e44ad");
    o.tTheta = label("θ", 0, 0);
    o.tO = label("O", o.ox - 34, o.oy + 26);
    o.tX = label("x", 930, o.oy + 24);
    o.tY = label("y", o.ox + 22, 30);
    o.tP = label("P", 0, 0, "#71a6d2");
    o.tQ = label("Q", 0, 0, "#2e7d64");
    o.tR = label("R", 0, 0, "#8e44ad");

    container.appendChild(svg);

    var panel = document.createElement("div");
    panel.style.cssText = "text-align:center; font-size:1.1em; margin-top:0.6em; font-weight:bold;";
    panel.innerHTML = '<span style="color:#c44536;">sen θ = <span id="senval2510">0.000</span></span> &nbsp;&nbsp;&nbsp; <span style="color:#2e7d64;">cos θ = <span id="cosval2510">1.000</span></span> &nbsp;&nbsp;&nbsp; <span style="color:#8e44ad;">tan θ = <span id="tanval2510">0.000</span></span> &nbsp;&nbsp;&nbsp; <span style="color:#000;">θ = <span id="thetaval2510">0.0&deg;</span></span>';
    container.appendChild(panel);

    svg.addEventListener("click", htTanPracticeOnClick2510);
    htTanPracticeDraw2510();
}

function htLoadContent() {
    htTanPracticeBuild2510();
    htWriteNavigation();
    return false;
}
