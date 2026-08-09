// SPDX-License-Identifier: GPL-3.0-or-later

var localCosPractice8fcc = {
    "containerId": "cospractice8fcc",
    "ox": 300,
    "oy": 210,
    "r": 120,
    "minTheta": 0,
    "maxTheta": 90,
    "thetaRad": 0,
    "viewW": 640,
    "viewH": 400,
    "svgNS": "http://www.w3.org/2000/svg"
};

function htCosPracticeEl8fcc(tag, attrs) {
    var el = document.createElementNS(localCosPractice8fcc.svgNS, tag);
    if (attrs) {
        for (var k in attrs) {
            if (Object.prototype.hasOwnProperty.call(attrs, k)) {
                el.setAttribute(k, attrs[k]);
            }
        }
    }
    return el;
}

function htCosPracticeText8fcc(el, value) {
    el.textContent = value;
    return el;
}

function htCosPracticeOnClick8fcc(evt) {
    var o = localCosPractice8fcc;
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
    htCosPracticeDraw8fcc();
}

function htCosPracticeDraw8fcc() {
    var o = localCosPractice8fcc;
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

    o.cos.setAttribute("x1", ox);
    o.cos.setAttribute("y1", oy);
    o.cos.setAttribute("x2", qx);
    o.cos.setAttribute("y2", qy);

    var ra = 30;
    o.thetaArc.setAttribute("d", "M " + (ox + ra) + " " + oy + " A " + ra + " " + ra + " 0 0 0 " + (ox + ra * cos) + " " + (oy - ra * sin));

    o.sqQ.setAttribute("points", (qx - s) + "," + qy + " " + (qx - s) + "," + (qy - s) + " " + qx + "," + (qy - s));

    o.pP.setAttribute("cx", px);
    o.pP.setAttribute("cy", py);
    o.pQ.setAttribute("cx", qx);
    o.pQ.setAttribute("cy", qy);

    o.tOne.setAttribute("x", ox + 0.4 * (px - ox) - sin * 18);
    o.tOne.setAttribute("y", oy + 0.4 * (py - oy) - cos * 18 + 6);

    o.tCos.setAttribute("x", (ox + qx) / 2);
    o.tCos.setAttribute("y", oy + 24);

    var ta = th / 2;
    o.tTheta.setAttribute("x", ox + (ra + 20) * Math.cos(ta));
    o.tTheta.setAttribute("y", oy - (ra + 20) * Math.sin(ta) + 6);

    o.tP.setAttribute("x", px + 14);
    o.tP.setAttribute("y", py - 8);
    o.tQ.setAttribute("x", qx + 16);
    o.tQ.setAttribute("y", qy - 10);

    var vT = document.getElementById("thetaval8fcc");
    var vC = document.getElementById("cosval8fcc");
    if (vT) {
        vT.innerHTML = (th * 180 / Math.PI).toFixed(1) + "&deg;";
    }
    if (vC) {
        vC.innerHTML = cos.toFixed(3);
    }
}

function htCosPracticeBuild8fcc() {
    var o = localCosPractice8fcc;
    var container = document.getElementById(o.containerId);
    if (!container) {
        return;
    }

    var svg = htCosPracticeEl8fcc("svg", {
        "viewBox": "0 0 " + o.viewW + " " + o.viewH,
        "id": "cospracticeSvg8fcc",
        "style": "width:100%; max-width:620px; height:auto; display:block; margin:0 auto; cursor:pointer; background:#ffffff; touch-action:manipulation;"
    });

    var defs = htCosPracticeEl8fcc("defs", {});
    var marker = htCosPracticeEl8fcc("marker", {
        "id": "cosarrow8fcc",
        "viewBox": "0 0 10 10",
        "refX": "5",
        "refY": "5",
        "markerWidth": "3",
        "markerHeight": "3",
        "orient": "auto-start-reverse"
    });
    marker.appendChild(htCosPracticeEl8fcc("path", { "d": "M 0 0 L 10 5 L 0 10 z" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    svg.appendChild(htCosPracticeEl8fcc("line", {
        "x1": "20", "y1": String(o.oy), "x2": "625", "y2": String(o.oy),
        "stroke": "black", "stroke-width": "3", "fill": "none",
        "marker-start": "url(#cosarrow8fcc)", "marker-end": "url(#cosarrow8fcc)"
    }));
    svg.appendChild(htCosPracticeEl8fcc("line", {
        "x1": String(o.ox), "y1": String(o.oy + o.r + 60), "x2": String(o.ox), "y2": String(o.oy - o.r - 60),
        "stroke": "black", "stroke-width": "3", "fill": "none",
        "marker-start": "url(#cosarrow8fcc)", "marker-end": "url(#cosarrow8fcc)"
    }));
    svg.appendChild(htCosPracticeEl8fcc("circle", {
        "cx": String(o.ox), "cy": String(o.oy), "r": String(o.r),
        "fill": "none", "stroke": "#71a6d2", "stroke-width": "4", "stroke-linecap": "round"
    }));

    o.triFill = htCosPracticeEl8fcc("polygon", { "fill": "rgba(113,166,210,0.15)", "stroke": "none" });
    svg.appendChild(o.triFill);

    o.sqQ = htCosPracticeEl8fcc("polygon", { "fill": "#b3cfdd", "stroke": "#346f82", "stroke-width": "1.5" });
    svg.appendChild(o.sqQ);

    o.radius = htCosPracticeEl8fcc("line", { "stroke": "#71a6d2", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.radius);
    o.cos = htCosPracticeEl8fcc("line", { "stroke": "#2e7d64", "stroke-width": "4", "stroke-linecap": "round" });
    svg.appendChild(o.cos);

    o.thetaArc = htCosPracticeEl8fcc("path", { "fill": "none", "stroke": "black", "stroke-width": "2.5" });
    svg.appendChild(o.thetaArc);

    o.pP = htCosPracticeEl8fcc("circle", { "r": "5", "fill": "#71a6d2" });
    svg.appendChild(o.pP);
    o.pQ = htCosPracticeEl8fcc("circle", { "r": "4", "fill": "#2e7d64" });
    svg.appendChild(o.pQ);

    function label(text, x, y, color) {
        var t = htCosPracticeEl8fcc("text", {
            "x": String(x),
            "y": String(y),
            "font-size": "1.2em",
            "font-weight": "bold",
            "text-anchor": "middle"
        });
        if (color) {
            t.setAttribute("fill", color);
        }
        htCosPracticeText8fcc(t, text);
        svg.appendChild(t);
        return t;
    }

    o.tOne = label("1", 0, 0);
    o.tCos = label("cos θ", 0, 0, "#2e7d64");
    o.tTheta = label("θ", 0, 0);
    o.tO = label("O", o.ox - 34, o.oy + 26);
    o.tX = label("x", 612, o.oy + 24);
    o.tY = label("y", o.ox + 22, o.oy - o.r - 45);
    o.tP = label("P", 0, 0, "#71a6d2");
    o.tQ = label("Q", 0, 0, "#2e7d64");

    container.appendChild(svg);

    var panel = document.createElement("div");
    panel.style.cssText = "text-align:center; font-size:1.1em; margin-top:0.6em; font-weight:bold;";
    panel.innerHTML = '<span style="color:#2e7d64;">cos θ = <span id="cosval8fcc">1.000</span></span> &nbsp;&nbsp;&nbsp; <span style="color:#000;">θ = <span id="thetaval8fcc">0.0&deg;</span></span>';
    container.appendChild(panel);

    svg.addEventListener("click", htCosPracticeOnClick8fcc);
    htCosPracticeDraw8fcc();
}

function htLoadContent() {
    htCosPracticeBuild8fcc();
    htWriteNavigation();
    return false;
}
