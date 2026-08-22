// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
    htWriteNavigation();

    htSetImageSrc('imgGeo14', 'images/Mapswire/mapswire-continent_na-printable-map-north-america-robinson-269_mesoamerica2.jpg');
		htSetImageSrc('imgGiza', 'images/BritishMuseum/mid_00539475_001.jpg');
		htSetImageSrc('imgSaqqara', 'images/BritishMuseum/mid_EPF1915.jpg');
    htSetImageSrc("img0", "images/SanJoseCRMuseo/SanJoseCRAntropologia.jpg");
    htSetImageSrc("img1", "images/ElSalvadorMuseo/SanSalvadorESAntropologia.jpg");
    htSetImageSrc("img2", "images/HistoryTracers/pyramid.jpg");
    htSetImageSrc("img3", "images/HistoryTracers/pentagonal_pyramid.jpg");
    htSetImageSrc("img4", "images/Xunantunich/WitzXunantunich.jpg");

    const shape = document.getElementById('shape');
    const radiusSlider = document.getElementById('radiusSlider');
    
    // Update shape when slider moves
    radiusSlider.addEventListener('input', function() {
        const radius = this.value;
        shape.style.borderRadius = `${radius}%`;
    });
    
    return false;
}
