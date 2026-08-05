// SPDX-License-Identifier: GPL-3.0-or-later

var localCscPractice4e1d = {
    "containerId": "cscpractice4e1d",
    "ox": 300,
    "oy": 730,
    "r": 120,
    "minTheta": 10,
    "maxTheta": 90,
    "thetaRad": Math.PI / 2,
    "viewW": 640,
    "viewH": 880,
    "svgNS": "http://www.w3.org/2000/svg"
};

function htCscPracticeEl4e1d(tag, attrs) {
    var el = document.createElementNS(localCscPractice4e1d.svgNS, tag);
    if (attrs) {
        for (var k in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                el.setAttribute(k, attrs[k]);
            }
        }
    }
    return el;
}

function htCscPracticeText4e1d(el, value) {
    el.textContent = value;
    return el;
}

function htCscPracticeOnClick4e1d(evt) {
    var o = localCscPractice4e1d;
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
    htCscPracticeDraw4e1d();
}

function htCscPracticeDraw4e1d() {
    var o = localCscPractice4e1d;
    var th = o.thetaRad;
    var cos = Math.cos(th);
    var sin = Math.sin(th);
    var csc = 1 / sin;
    var ox = o.ox;
    var oy = o.oy;
    var R = o.r;
    var px = ox + cos * R;
    var py = oy - sin * R;
    var qx = px;
    var qy = oy;
    var tx = ox;
    var ty = oy - csc * R;
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

    o.cos.setAttribute("x1", ox);
    o.cos.setAttribute("y1", oy);
    o.cos.setAttribute("x2", qx);
    o.cos.setAttribute("y2", qy);

    o.csc.setAttribute("x1", ox);
    o.csc.setAttribute("y1", oy);
    o.csc.setAttribute("x2", tx);
    o.csc.setAttribute("y2", ty);

    o.cot.setAttribute("x1", px);
    o.cot.setAttribute("y1", py);
    o.cot.setAttribute("x2", tx);
    o.cot.setAttribute("y2", ty);

    var ra = 30;
    o.thetaArc.setAttribute("d", "M " + (ox + ra) + " " + oy + " A " + ra + " " + ra + " 0 0 0 " + (ox + ra * cos) + " " + (oy - ra * sin));

    o.sqQ.setAttribute("points", (qx - s) + "," + qy + " " + (qx - s) + "," + (qy - s) + " " + qx + "," + (qy - s));

    var su = cos;
    var sv = -sin;
    var pu = -sin;
    var pv = -cos;
    o.sqP.setAttribute("points",
        px + "," + py + " " +
        (px + s * su) + "," + (py + s * sv) + " " +
        (px + s * su + s * pu) + "," + (py + s * sv + s * pv) + " " +
        (px + s * pu) + "," + (py + s * pv));

    o.pP.setAttribute("cx", px);
    o.pP.setAttribute("cy", py);
    o.pQ.setAttribute("cx", qx);
    o.pQ.setAttribute("cy", qy);
    o.pT.setAttribute("cx", tx);
    o.pT.setAttribute("cy", ty);

    o.tOne.setAttribute("x", ox + 0.4 * (px - ox) - sin * 18);
    o.tOne.setAttribute("y", oy + 0.4 * (py - oy) - cos * 18 + 6);

    o.tSen.setAttribute("x", (px + qx) / 2 + 20);
    o.tSen.setAttribute("y", (py + qy) / 2 + 6);

    o.tCos.setAttribute("x", (ox + qx) / 2);
    o.tCos.setAttribute("y", oy + 24);

    o.tCsc.setAttribute("x", ox - 20);
    o.tCsc.setAttribute("y", oy - 0.65 * csc * R + 6);

    var ddx = tx - px;
    var ddy = ty - py;
    var dlen = Math.sqrt(ddx * ddx + ddy * ddy);
    if (dlen === 0) {
        dlen = 1;
    }
    var nxx = -ddy / dlen;
    var nyy = ddx / dlen;
    var midX = (px + tx) / 2;
    var midY = (py + ty) / 2;
    if ((ox - midX) * nxx + (oy - midY) * nyy > 0) {
        nxx = -nxx;
        nyy = -nyy;
    }
    o.tCot.setAttribute("x", midX + nxx * 24);
    o.tCot.setAttribute("y", midY + nyy * 24 + 6);
    if (dlen < 2) {
        o.tCot.setAttribute("opacity", "0");
    } else {
        o.tCot.setAttribute("opacity", "1");
    }

    var ta = th / 2;
    o.tTheta.setAttribute("x", ox + (ra + 20) * Math.cos(ta));
    o.tTheta.setAttribute("y", oy - (ra + 20) * Math.sin(ta) + 6);

    o.tP.setAttribute("x", px + 14);
    o.tP.setAttribute("y", py - 8);
    o.tQ.setAttribute("x", qx + 16);
    o.tQ.setAttribute("y", qy - 10);
    o.tT.setAttribute("x", tx - 16);
    o.tT.setAttribute("y", ty - 8);

    var vT = document.getElementById("thetaval4e1d");
    var vS = document.getElementById("senval4e1d");
    var vC = document.getElementById("cscval4e1d");
    if (vT) {
        vT.innerHTML = (th * 180 / Math.PI).toFixed(1) + "&deg;";
    }
    if (vS) {
        vS.innerHTML = sin.toFixed(3);
    }
    if (vC) {
        vC.innerHTML = csc.toFixed(3);
    }
}

function htCscPracticeBuild4e1d() {
    var o = localCscPractice4e1d;
    var container = document.getElementById(o.containerId);
    if (!container) {
        return;
    }

    var svg = htCscPracticeEl4e1d("svg", {
        "viewBox": "0 0 " + o.viewW + " " + o.viewH,
        "id": "cscpracticeSvg4e1d",
        "style": "width:100%; max-width:620px; height:auto; display:block; margin:0 auto; cursor:pointer; background:#ffffff; touch-action:manipulation;"
    });

    var defs = htCscPracticeEl4e1d("defs", {});
    var marker = htCscPracticeEl4e1d("marker", {
        "id": "cscarrow4e1d",
        "viewBox": "0 0 10 10",
        "refX": "5",
        "refY": "5",
        "markerWidth": "3",
        "markerHeight": "3",
        "orient": "auto-start-reverse"
    });
    marker.appendChild(htCscPracticeEl4e1d("path", { "d": "M 0 0 L 10 5 L 0 10 z" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    svg.appendChild(htCscPracticeEl4e1d("line", {
        "x1": "20", "y1": String(o.oy), "x2": "625", "y2": String(o.oy),
        "stroke": "black", "stroke-width": "3", "fill": "none",
        "marker-start": "url(#cscarrow4e1d)", "marker-end": "url(#cscarrow4e1d)"
    }));
    svg.appendChild(htCscPracticeEl4e1d("line", {
        "x1": String(o.ox), "y1": "870", "x2": String(o.ox), "y2": "15",
        "stroke": "black", "stroke-width": "3", "fill": "none",
        "marker-start": "url(#cscarrow4e1d)", "marker-end": "url(#cscarrow4e1d)"
    }));
    svg.appendChild(htCscPracticeEl4e1d("circle", {
        "cx": String(o.ox), "cy": String(o.oy), "r": String(o.r),
        "fill": "none", "stroke": "#71a6d2", "stroke-width": "4", "stroke-linecap": "round"
    }));

    o.triFill = htCscPracticeEl4e1d("polygon", { "fill": "rgba(113,166,210,0.15)", "stroke": "none" });
    svg.appendChild(o.triFill);

    o.sqQ = htCscPracticeEl4e1d("polygon", { "fill": "#b3cfdd", "stroke": "#346f82", "stroke-width": "1.5" });
    svg.appendChild(o.sqQ);
    o.sqP = htCscPracticeEl4e1d("polygon", { "fill": "#b3cfdd", "stroke": "#346f82", "stroke-width": "1.5" });
    svg.appendChild(o.sqP);

    o.radius = htCscPracticeEl4e1d("line", { "stroke": "#71a6d2", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.radius);
    o.sine = htCscPracticeEl4e1d("line", { "stroke": "#c44536", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.sine);
    o.cos = htCscPracticeEl4e1d("line", { "stroke": "#2e7d64", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.cos);
    o.csc = htCscPracticeEl4e1d("line", { "stroke": "#1e3a8a", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.csc);
    o.cot = htCscPracticeEl4e1d("line", { "stroke": "#8d99ae", "stroke-width": "3", "stroke-linecap": "round" });
    svg.appendChild(o.cot);

    o.thetaArc = htCscPracticeEl4e1d("path", { "fill": "none", "stroke": "black", "stroke-width": "2.5" });
    svg.appendChild(o.thetaArc);

    o.pP = htCscPracticeEl4e1d("circle", { "r": "5", "fill": "#71a6d2" });
    svg.appendChild(o.pP);
    o.pQ = htCscPracticeEl4e1d("circle", { "r": "4", "fill": "#2e7d64" });
    svg.appendChild(o.pQ);
    o.pT = htCscPracticeEl4e1d("circle", { "r": "4", "fill": "#1e3a8a" });
    svg.appendChild(o.pT);

    function label(text, x, y, color) {
        var t = htCscPracticeEl4e1d("text", {
            "x": String(x),
            "y": String(y),
            "font-size": "1.2em",
            "font-weight": "bold",
            "text-anchor": "middle"
        });
        if (color) {
            t.setAttribute("fill", color);
        }
        htCscPracticeText4e1d(t, text);
        svg.appendChild(t);
        return t;
    }

    o.tOne = label("1", 0, 0);
    o.tSen = label("sen θ", 0, 0, "#c44536");
    o.tCos = label("cos θ", 0, 0, "#2e7d64");
    o.tCsc = label("csc θ", 0, 0, "#1e3a8a");
    o.tCot = label("cot θ", 0, 0, "#8d99ae");
    o.tTheta = label("θ", 0, 0);
    o.tO = label("O", o.ox - 34, o.oy + 26);
    o.tX = label("x", 612, o.oy + 24);
    o.tY = label("y", o.ox + 22, 30);
    o.tP = label("P", 0, 0, "#71a6d2");
    o.tQ = label("Q", 0, 0, "#2e7d64");
    o.tT = label("T", 0, 0, "#1e3a8a");

    container.appendChild(svg);

    var panel = document.createElement("div");
    panel.style.cssText = "text-align:center; font-size:1.1em; margin-top:0.6em; font-weight:bold;";
    panel.innerHTML = '<span style="color:#1e3a8a;">csc θ = <span id="cscval4e1d">1.000</span></span> &nbsp;&nbsp;&nbsp; <span style="color:#c44536;">sen θ = <span id="senval4e1d">1.000</span></span> &nbsp;&nbsp;&nbsp; <span style="color:#000;">θ = <span id="thetaval4e1d">90.0&deg;</span></span>';
    container.appendChild(panel);

    svg.addEventListener("click", htCscPracticeOnClick4e1d);
    htCscPracticeDraw4e1d();
}

function htLoadContent() {
    htCscPracticeBuild4e1d();
    htWriteNavigation();
    return false;
}
