// SPDX-License-Identifier: GPL-3.0-or-later
//
// JScript custom action used by the HistoryTracers MSI installer.
//
// Purpose
// -------
// Prepare the "content only" installation mode driven by these public
// properties (documented in historytracers.wxs):
//
//   INSTALLTYPE   - "Full" (default when unset): viewer binary + web content
//                   installed under ProgramFiles64Folder\HistoryTracers\www.
//                   "ContentOnly": no binary and no shortcuts; the web
//                   content is installed flat into
//                   <CONTENTROOT>\historytracers\.
//   CONTENTROOT   - Target root folder of the content-only install. Both
//                   "D:\Sites" and "D:\Sites\" (also forward slashes) are
//                   accepted and normalized; must be an absolute path.
//   INSTALLIMAGES - "0" skips the museum image payload (default "1").
//
// Behavior
// --------
// - INSTALLTYPE=ContentOnly: CONTENTROOT is normalized, validated as an
//   absolute rooted path (drive or UNC), and two properties are set:
//     CONTENTROOTCLEAN = <CONTENTROOT>            (remembered in registry)
//     WWWDIR           = <CONTENTROOT>\historytracers\  (flat web content)
//   MSI resolves the whole path of a Directory table entry from a property
//   named exactly like that Directory id, so all web components (usually
//   rooted at [INSTALLDIR]www) are relocated inside <CONTENTROOT>.
// - INSTALLTYPE unset on a repair/modify of an already installed product:
//   the content root remembered in HKLM\Software\HistoryTracers\Installer
//   (written at install time by component CONTENTROOT_reg) is restored so
//   the content stays in its original location. Requires the registry
//   search HTREMEMBEREDCONTENTROOT scheduled before CostFinalize (AppSearch).
// - Any other case (plain Full install, uninstall): nothing happens.
//
// This action must be scheduled immediately, before CostFinalize, and must
// be executed in both the InstallUISequence and InstallExecuteSequence.

// msiDoActionStatus values for script custom actions.
var HT_MSI_DO_ACTION_STATUS_SUCCESS = 1;
var HT_MSI_DO_ACTION_STATUS_FAILURE = 3;

// A rooted absolute path (drive letter or UNC) with backslash separators.
function HtIsValidRootedPath(path) {
    return /^[A-Za-z]:\\/.test(path) || /^\\\\[^\\]/.test(path);
}

// Report a friendly failure message and abort the installation.
function HtFailContentRoot(reason) {
    var record = Session.Installer.CreateRecord(1);
    record.StringData(0) = "HistoryTracers: " + reason;
    Session.Message(0x04000000 /* msiMessageTypeError */, record);
    return HT_MSI_DO_ACTION_STATUS_FAILURE;
}

// MSI property names are case-sensitive in some hosts; "Installed" is a
// system property, try both casings defensively.
function HtGetProperty(name) {
    var value = Session.Property(name);
    if (value === "" && name !== name.toUpperCase()) {
        value = Session.Property(name.toUpperCase());
    }
    return String(value);
}

// Sets the directory-override property and the remembered content root from
// a user-provided CONTENTROOT value.
function HtApplyContentRoot(cleanRoot) {
    // Content is installed inside a "historytracers" directory created
    // within the folder chosen by the user. The directory-override property
    // must be an absolute rooted path ending with a backslash; the remembered
    // value keeps just the root (re-joined here on later repairs).
    Session.Property("CONTENTROOTCLEAN") = cleanRoot;
    Session.Property("WWWDIR") = cleanRoot + "\\historytracers\\";
}

function NormalizeContentRoot() {
    var installType = String(Session.Property("INSTALLTYPE"));

    if (installType === "ContentOnly") {
        var raw = String(Session.Property("CONTENTROOT"));
        // Accept forward slashes and strip all trailing separators.
        var root = raw.replace(/\//g, "\\").replace(/\\+$/, "");

        if (root === "") {
            return HtFailContentRoot(
                'INSTALLTYPE=ContentOnly requires CONTENTROOT, ' +
                'e.g. CONTENTROOT="D:\\Sites".');
        }
        if (!HtIsValidRootedPath(root)) {
            return HtFailContentRoot(
                'CONTENTROOT must be an absolute path ' +
                '(e.g. CONTENTROOT="D:\\Sites"), got: "' + raw + '".');
        }
        HtApplyContentRoot(root);
        return HT_MSI_DO_ACTION_STATUS_SUCCESS;
    }

    // Repairs/modifications without properties: restore the remembered
    // content root so a content-only product stays in its original folder.
    if (installType === "" && HtGetProperty("Installed") === "1") {
        var remembered = String(Session.Property("HTREMEMBEREDCONTENTROOT"));
        if (remembered !== "" && HtIsValidRootedPath(remembered)) {
            HtApplyContentRoot(remembered);
        }
    }

    // Plain Full install or nothing to restore: use the default layout.
    return HT_MSI_DO_ACTION_STATUS_SUCCESS;
}
