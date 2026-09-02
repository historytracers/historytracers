// SPDX-License-Identifier: GPL-3.0-or-later
(function() {
    var CURRENT_FALLBACK = "1.0.0";
    var RELEASES_URL = "https://github.com/historytracers/historytracers/releases";
    var API_URL = "https://api.github.com/repos/historytracers/historytracers/releases/latest";
    var STORAGE_DISMISSED = "ht_update_dismissed";
    var STORAGE_LATEST = "ht_update_latest";
    var STORAGE_LAST_CHECK = "ht_update_last_check";
    var CHECK_INTERVAL = 3600000;

    function normalize(v) {
        return String(v).trim().replace(/^v/i, "");
    }

    function compareVersions(a, b) {
        function parseSemVer(v) {
            var s = String(v).trim().replace(/^v/i, "");
            var plusIdx = s.indexOf("+");
            if (plusIdx !== -1) s = s.substring(0, plusIdx);
            var dashIdx = s.indexOf("-");
            var core = dashIdx === -1 ? s : s.substring(0, dashIdx);
            var pre = dashIdx === -1 ? "" : s.substring(dashIdx + 1);
            var coreParts = core.split(".").map(function(x) { var n = parseInt(x, 10); return isNaN(n) ? 0 : n; });
            while (coreParts.length < 3) coreParts.push(0);
            var preIds = pre ? pre.split(".") : [];
            return {core: coreParts, pre: pre, preIds: preIds};
        }
        var pa = parseSemVer(a);
        var pb = parseSemVer(b);
        var len = Math.max(pa.core.length, pb.core.length);
        for (var i = 0; i < len; i++) {
            var av = pa.core[i] || 0;
            var bv = pb.core[i] || 0;
            if (av > bv) return 1;
            if (av < bv) return -1;
        }
        var aHasPre = pa.pre !== "";
        var bHasPre = pb.pre !== "";
        if (!aHasPre && !bHasPre) return 0;
        if (!aHasPre && bHasPre) return 1;
        if (aHasPre && !bHasPre) return -1;
        var max = Math.max(pa.preIds.length, pb.preIds.length);
        for (var i = 0; i < max; i++) {
            var ai = pa.preIds[i];
            var bi = pb.preIds[i];
            if (ai === undefined) return -1;
            if (bi === undefined) return 1;
            var an = /^\d+$/.test(ai);
            var bn = /^\d+$/.test(bi);
            if (an && bn) {
                var av = parseInt(ai, 10);
                var bv = parseInt(bi, 10);
                if (av > bv) return 1;
                if (av < bv) return -1;
            } else if (an && !bn) {
                return -1;
            } else if (!an && bn) {
                return 1;
            } else {
                if (ai > bi) return 1;
                if (ai < bi) return -1;
            }
        }
        return 0;
    }

    async function getLocalVersion() {
        var endpoints = ["/api/version", "/api/editor/version"];
        for (var i = 0; i < endpoints.length; i++) {
            try {
                var r = await fetch(endpoints[i], {cache: "no-store"});
                if (r.ok) {
                    var j = await r.json();
                    if (j && j.version) return String(j.version);
                }
            } catch (e) {}
        }
        return CURRENT_FALLBACK;
    }

    async function getLatest() {
        try {
            var last = parseInt(localStorage.getItem(STORAGE_LAST_CHECK) || "0", 10);
            if (last && Date.now() - last < CHECK_INTERVAL) {
                var cached = localStorage.getItem(STORAGE_LATEST);
                if (cached) return {tag_name: cached, html_url: RELEASES_URL};
            }
        } catch (e) {}
        try {
            var r = await fetch(API_URL, {headers: {"Accept": "application/vnd.github.v3+json"}, cache: "no-store"});
            if (!r.ok) return null;
            var j = await r.json();
            if (j && (j.tag_name || j.name)) {
                var tag = j.tag_name || j.name;
                try {
                    localStorage.setItem(STORAGE_LATEST, normalize(tag));
                    localStorage.setItem(STORAGE_LAST_CHECK, String(Date.now()));
                } catch (e) {}
                return j;
            }
        } catch (e) {}
        return null;
    }

    function getLang() {
        var siteLang = "";
        try {
            var sel = document.getElementById("site_language");
            if (sel && sel.value) siteLang = sel.value;
        } catch (e) {}
        if (siteLang) {
            if (siteLang.indexOf("pt") === 0) return "pt-BR";
            if (siteLang.indexOf("es") === 0) return "es-ES";
            return "en-US";
        }
        var l = navigator.language || "en-US";
        if (l.indexOf("pt") === 0) return "pt-BR";
        if (l.indexOf("es") === 0) return "es-ES";
        return "en-US";
    }

    function showBanner(latest, url) {
        if (document.getElementById("ht-update-banner")) return;
        var lang = getLang();
        var msgs = {
            "en-US": {text: "A new version " + latest + " is available.", action: "Update", dismiss: "Dismiss"},
            "pt-BR": {text: "Uma nova versao " + latest + " esta disponivel.", action: "Atualizar", dismiss: "Dispensar"},
            "es-ES": {text: "Una nueva version " + latest + " esta disponible.", action: "Actualizar", dismiss: "Descartar"}
        };
        // Use proper accents via unicode escapes to keep file LF-safe
        msgs["pt-BR"].text = "Uma nova vers\u00e3o " + latest + " est\u00e1 dispon\u00edvel.";
        msgs["es-ES"].text = "Una nueva versi\u00f3n " + latest + " est\u00e1 disponible.";
        var m = msgs[lang] || msgs["en-US"];
        var top = 0;
        try {
            var addr = document.getElementById("__ht_addr");
            if (addr) {
                var h = addr.offsetHeight || 32;
                var tabs = document.getElementById("__ht_tabs");
                if (tabs) top = h + (tabs.offsetHeight || 22);
                else top = h;
            }
        } catch (e) {}
        var div = document.createElement("div");
        div.id = "ht-update-banner";
        div.setAttribute("role", "alert");
        div.style.cssText = "position:fixed;left:0;right:0;top:" + top + "px;background:#ff9800;color:#000;padding:10px 36px 10px 16px;text-align:center;z-index:2147483646;font:13px/1.4 verdana,arial,helvetica,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.2);";
        var span = document.createElement("span");
        span.textContent = m.text + " ";
        div.appendChild(span);
        var a = document.createElement("a");
        a.href = url || RELEASES_URL;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = m.action;
        a.style.cssText = "color:#000;font-weight:bold;text-decoration:underline;margin-left:6px;";
        a.onclick = function() {
            try { localStorage.setItem(STORAGE_DISMISSED, normalize(latest)); } catch (e) {}
        };
        div.appendChild(a);
        var close = document.createElement("span");
        close.textContent = "\u00d7";
        close.title = m.dismiss;
        close.style.cssText = "position:absolute;right:10px;top:50%;transform:translateY(-50%);cursor:pointer;font:bold 20px/1 monospace;color:#000;padding:0 4px;";
        close.onclick = function() {
            try { localStorage.setItem(STORAGE_DISMISSED, normalize(latest)); } catch (e) {}
            div.remove();
        };
        div.appendChild(close);
        if (document.body) document.body.appendChild(div);
        else document.addEventListener("DOMContentLoaded", function() { try { document.body.appendChild(div); } catch (e) {} });
    }

    async function check() {
        try {
            var localVerRaw = await getLocalVersion();
            var gh = await getLatest();
            if (!gh) {
                var cached = null;
                try { cached = localStorage.getItem(STORAGE_LATEST); } catch (e) {}
                if (cached) {
                    var normLocal = normalize(localVerRaw);
                    if (compareVersions(cached, normLocal) > 0) {
                        var dismissed = null;
                        try { dismissed = localStorage.getItem(STORAGE_DISMISSED); } catch (e) {}
                        if (dismissed !== cached) showBanner(cached, RELEASES_URL);
                    }
                }
                return;
            }
            var latestRaw = gh.tag_name || gh.name || "";
            var latest = normalize(latestRaw);
            if (!latest) return;
            var local = normalize(localVerRaw);
            if (compareVersions(latest, local) <= 0) return;
            var dismissed = null;
            try { dismissed = localStorage.getItem(STORAGE_DISMISSED); } catch (e) {}
            if (dismissed === latest) return;
            showBanner(latest, gh.html_url || RELEASES_URL);
        } catch (e) {}
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() { setTimeout(check, 800); });
    } else {
        setTimeout(check, 800);
    }
    window.addEventListener("load", function() { setTimeout(check, 500); });
    setTimeout(check, 2000);
})();
