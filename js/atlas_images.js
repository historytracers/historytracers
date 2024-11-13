// SPDX-License-Identifier: GPL-3.0-or-later

function htSelectAtlas(direction) {
    var value = $("#atlasindex").find(":selected").val();
    value = (value == undefined) ? 0 : parseInt(value);

    var max = $("#atlasindex").find("option").length;
    value += direction;
    if (value < 1) {
        value = 1;
    } else if (value > max) {
        value = max;
    }

    $("#atlasindex option[value="+value+"]").prop('selected', true);
    htSelectAtlasMap(value - 1);
}

function htLoadExercise() {

    $("#atlasindex").on( "change", function() {
        var value = parseInt($(this).val()) - 1;
        htSelectAtlasMap(value);
    } );
    $("#atlasindex option[value=\"1\"]").prop('selected', true);

    $("#atlas_sn").html(keywords[52]);

    return false;
}

