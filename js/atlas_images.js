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

    var myURL = 'index.html?page=atlas&atlas_page='+value;
    $("#atlas").val(value);
    window.history.replaceState(null, null, myURL);
}

function htLoadExercise() {

    $("#atlasindex").on( "change", function() {
        var id = parseInt($(this).val());
        var value = id - 1;
        htSelectAtlasMap(value);
        var myURL = 'index.html?page=atlas&atlas_page='+id;
        $("#atlas").val(id);
        window.history.replaceState(null, null, myURL);
    } );
    $("#atlasindex option[value=\"1\"]").prop('selected', true);

    $("#atlas_sn").html(keywords[52]);

    if ($("#atlas").length > 0) {
        var id = parseInt($("#atlas").val());
        if (!isNaN(id)) { 
            if (id > 0 && id < htAtlas.length) {
                htModifyAtlasIndexMap(id - 1);
            } else {
                htModifyAtlasIndexMap(1);
            }
        }
    }

    return false;
}

