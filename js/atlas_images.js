// SPDX-License-Identifier: GPL-3.0-or-later

function htSelectAtlas(direction) {
    const pos = $("#atlasindex").find(":selected");
    var value = (direction > 0) ? pos.next().val() : pos.prev().val();

    $("#atlasindex option[value="+value+"]").prop('selected', true);
    htSelectAtlasMap(value);

    var myURL = 'index.html?page=atlas&atlas_page='+value;
    $("#atlas").val(value);
    window.history.replaceState(null, null, myURL);
}

function htLoadContent() {

    $("#atlasindex").on( "change", function() {
        var id = $(this).val();
        htSelectAtlasMap(id);
        var myURL = 'index.html?page=atlas&atlas_page='+id;
        $("#atlas").val(id);
        window.history.replaceState(null, null, myURL);
    } );

    $("#atlas_sn").html(keywords[52]);

    var id = $("#atlas").val();
    if (!isNaN(id)) { 
        $("#atlasindex option[value=\""+id+"\"]").prop('selected', true);
    }

    return false;
}

