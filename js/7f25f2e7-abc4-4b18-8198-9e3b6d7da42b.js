// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Initializes the lesson page when the content is loaded.
 * @returns {boolean} Always false to stop the default content handler.
 */
function htLoadContent() {
    htAddTreeReflection("#myFirstReflection", 55);

    htWriteNavigation();

    htSetImageSrc("imgKhaldunBook1", "images/Archive/16173_0242.jpg");

    return false;
}

