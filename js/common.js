// SPDX-License-Identifier: GPL-3.0-or-later

// https://stackoverflow.com/questions/11182924/how-to-check-if-javascript-object-is-json
var stringConstructor = "gth".constructor;
var vectorConstructor = [].constructor;
var objectConstructor = ({}).constructor;
let keywords = [ ];
var lastTreeLoaded = { "page" : null, "arg" : '' };

var personNameMap = new Map();
var familyMap = new Map();

var contentMap = new Map();

var primarySourceMap = new Map();
var refSourceMap = new Map();
var holyRefSourceMap = new Map();

function sgLoadPage(page, ext, arg, reload) {
    $("#messages").html("&nbsp;");
    if (ext == "html") {
        if (page == "tree" || page == "genealogical_map_list" || page == "indigenous_who_content") {
            if (reload == true && lastTreeLoaded.arg.length > 0) {
                arg = lastTreeLoaded.arg;
            } else {
                lastTreeLoaded.page = page;
                lastTreeLoaded.arg = arg;
            }
        } else if (page == "families") {
            lastTreeLoaded.page = null;
            lastTreeLoaded.arg = null
            $("#loading").val("");
            $("#selector").val("");
        }
    }

    var pages = arg.split('&person_id=') ;
    var appendPage = "";
    if (pages.length != 2) {
        $("#loading").val(arg);
    } else {
        appendPage = pages[0];
        if (ext == "html") {
            $("#loading").val(pages[0]);
            $("#selector").val(pages[1]);
        }
    }

    if (ext.length > 0 &&  ext == "html") {
        $("#html_loaded").val(page);
    }

    var lang = $("#site_language").val();
    // Use default language
    if (lang.length == 0) {
        lang = navigator.language;
        if (lang == undefined || lang.length == 0) {
            lang = "en-US";
        } else {
            // address browsers that stores only lower case values.
            var country = lang.substring(3,2).toUpperCase();
            var llang =  lang.substring(0, 2)
            lang = llang+'-'+country;
        }
    }

    var unixEpoch = Date.now();
    if (ext != "json") {
        var additional = (appendPage.length == 0) ? '&' : appendPage+'&';
        $("#genealogical_data").load("bodies/"+page+"."+ext+"?load="+additional+'nocache='+unixEpoch);

        if (page == 'tree' && reload == true) {
            sgLoadPage('tree','json', arg, false);
            sgLoadPage($("#loading").val(),'json', '', false);
        }

        return false;
    } 

    $("#loading_msg").show();
    $.ajax({
        type: 'GET',
        url: (arg != 'source' ) ?"lang/"+lang+"/"+page+".json" : "lang/sources/"+page+".json",
        contentType: 'application/json; charset=utf-8',
        data: 'nocache='+unixEpoch,
        async: true,
        dataType: 'json',
        success: function(data) {
            if (data.length == 0) {
                $("#loading_msg").hide();
                return false;
            }

            htLoadSources(data, arg, page);

            htFillWebPage(data);

            return false;
        },
    });
}

function htFillWebPage(data)
{
    if (data.title != undefined && data.title.length > 0) {
        $(document).prop('title', data.title);
    }

    if (data.header != undefined && data.header.length > 0) {
        $("#header").html(data.header);
    }

    if (data.common != undefined && data.common.length > 0) {
        for (const i in data.common) {
            $("#common").append(data.common[i]);
        }
    }

    if (data.languages != undefined) {
//-------------------- Load languages
        htFillLanguageSelector(data.languages, "#site_language");
        $("#loading_msg").hide();
        $(':focus').blur()
    }
    else if (data.families != undefined) {
//-------------------- Load Families
        htFillFamilies(data);
//-------------------- Load groups
    } else if (data.keywords != undefined) {
//-------------------- Load Keywords
        htFillKeywords(data.keywords);
        $("#loading_msg").hide();
    } else {
//-------------------- Normal content
        for (const i in data.content) {
            if (data.content[i].value.constructor === stringConstructor) {
                $("#"+data.content[i].id).html(data.content[i].value);
            } else if (data.content[i].value.constructor === vectorConstructor && data.content[i].target != undefined) {
                if (data.content[i].value_type == undefined) {
                    continue;
                } else if (data.content[i].value_type == "family-list") {
                    var table = data.content[i].value;
                    htFillFamilyList(table, data.content[i].target);
                } else if (data.content[i].value_type == "group-list") {
                    if (data.content[i].id.length > 0 ) {
                        $("#"+data.content[i].id).html(data.content[i].desc);
                    }
                    htFillMapList(data.content[i].value, data.content[i].target, data.content[i].page);
                } else if (data.content[i].value_type == "subgroup") {
                    htFillSubMapList(data.content[i].value, data.content[i].target);
                } else if (data.content[i].value_type == "paper") {
                    htFillPaperContent(data.content[i].value);
                }
            } else if (data.content[i].value.constructor === vectorConstructor && data.content[i].id != undefined) {
                for (const j in data.content[i].value) {
                    $("#"+data.content[i].id).append(data.content[i].value[j]);
                }
            }
        }

        if ($("#tree-sources-lbl").length > 0) {
            $("#tree-sources-lbl").html(keywords[5]);
        }

        if ($("#tree-references-lbl").length > 0) {
            $("#tree-references-lbl").html(keywords[6]);
        }

        if ($("#tree-holy_references-lbl").length > 0) {
            $("#tree-holy_references-lbl").html(keywords[7]);
        }

        if ($("#tree-descripton").length > 0) {
            $("#tree-descripton").html(keywords[24]);
        }
    }
}

function htLoadSources(data, arg, page)
{
    if (data.sources != undefined) {
        for (const i in data.sources) {
            sgLoadPage(data.sources[i], 'json', 'source', false);
        }
    } else {
        if (arg != 'source') {
            return true;
        }

        htFillMapSource(primarySourceMap, data.primary_sources)
        htFillMapSource(refSourceMap, data.reference_sources)
        htFillMapSource(holyRefSourceMap, data.religious_sources)

        if (page == 'tree') {
            $("#loading_msg").hide();
            return false;
        }
    }
    return true;
}

function htFillLanguageSelector(table, target) {
    // Avoid duplication
    $(target).find("option").remove();

    // Fill selector
    for (const i in table) {
        $(target).append(new Option(table[i].text, table[i].dir));
    }
}

function htFillKeywords(table) {
    keywords = [];
    // Fill keyword
    for (const i in table) {
        keywords.push(table[i]);
    }
}

function htFillFamilyList(table, target) {
    for (const i in table) {
        if (table[i].target == undefined) {
            continue;
        }

        $("#"+target).append("<a href=\"#bottom"+table[i].id+"\">"+table[i].id+"</a> ");
        $("#"+table[i].target).append("<div id=\"bottom"+table[i].id+"\"><h4>"+table[i].id+"</h4></div>");
        if (table[i].value.constructor === vectorConstructor) {
            var rows = table[i].value;
            $("#bottom"+table[i].id).append("<ul id=\"bottomList"+table[i].id+"\"></ul>");
            for (const k in rows) {
                $("#bottomList"+table[i].id).append("<li id=\""+rows[k].id+"\"><a href=\"#\" onclick=\"sgLoadPage('tree', 'html', '"+rows[k].id+"', false);\" >"+rows[k].value+"</a></li>");
            }
        }
    }
}

function htFillMapList(table, target, page) {
    for (const i in table) {
        $("#"+target).append("<li id=\""+table[i].id+"\"><a href=\"#\" onclick=\"sgLoadPage('"+page+"', 'html', '"+table[i].id+"', false);\" >"+table[i].name+"</a> "+table[i].desc+"</li>");
    }
}

function htFillSubMapList(table, target) {
    for (const i in table) {
        $("#"+target).append("<li id=\""+i+"\"><a href=\"#\" onclick=\"sgLoadPage('tree', 'html', '"+table[i].family_id+"&person_id="+table[i].person_id+"', false);\" >"+table[i].name+"</a> "+table[i].desc+"</li>");
    }
}

function htFillPaperContent(table) {
    for (const i in table) {
        var div = "<div id=\"paper-";
        div += (table[i].id != undefined) ? table[i].id : i;
        div += "\">";

        div += table[i].text;

        div += "</div>";
        $("#paper").append(div);
    }
}

function htFillFamilies(table) {
    if (table.title != undefined) {
        $(document).prop('title', table.title);
    }

    if (table.common != undefined) {
        $("#tree-common-lbl").html(keywords[25]);
        for (const i in table.common) {
            $("#common").html(table.common[i]);
        }
    }

    $("#sources-lbl").html(keywords[5]);
    $("#tree-sources-lbl").html(keywords[5]);
    $("#tree-references-lbl").html(keywords[6]);
    $("#references-lbl").html(keywords[6]);
    $("#tree-holy_references-lbl").html(keywords[7]);
    $("#holy_references-lbl").html(keywords[7]);

    $("#child").html(keywords[9]);
    $("#father").html(keywords[2]);
    $("#mother").html(keywords[3]);
    $("#grandfather01").html(keywords[11]);
    $("#grandmother01").html(keywords[12]);
    $("#grandfather02").html(keywords[13]);
    $("#grandmother02").html(keywords[14]);

    for (const i in table.families) {
        if (table.families[i].id == undefined ||
            table.families[i].name == undefined) {
            continue;
        }

        var family_id = table.families[i].id;
        $("#index_list").append("<li id=\"lnk-"+family_id+"\"><a href=\"#hist-"+family_id+"\">"+keywords[8] + " : " +table.families[i].name+"</a></li>");

        $("#trees").append("<div id=\"hist-"+family_id+"\"></div>");

        var family = table.families[i];
        htAppendData("hist",
                   family_id,
                   undefined,
                   family.name,
                   family);

        if (family.people == undefined) {
            continue;
        }

        var people = family.people;
        for (const j in people) {
            if (people[j].id == undefined ||
                people[j].name == undefined) {
                continue;
            }

            var person_id = people[j].id;
            $("#hist-"+family_id).append("<div id=\"tree-"+person_id+"\" class=\"tree-person-text\"></div>");

            personNameMap.set(people[j].id, people[j].name);
            htAppendData("tree",
                       person_id,
                       family_id,
                       people[j].name,
                       people[j]);
        }
    }

    var destination = $("#selector").val();
    if (destination.length > 1) {
        var localObject = $("#name-"+destination).val();
        if (localObject != undefined) {
            $('html, body').scrollTop($("#name-"+destination).offset().top);
            fillTree(destination);
        }
    }
    sgLoadPage('tree','json', '', false);
    $("#loading_msg").hide();
}

function htSetMapFamily(id, father, mother, type)
{
    if (father == null && mother == null) {
        familyMap.set(id, "null&null&t");
        return;
    }

    var parent_idx = "";
    if (father != undefined && father != null) {
        parent_idx += father;
    } else {
        parent_idx += "null";
    }

    if (mother != undefined && mother != null) {
        parent_idx += "&"+mother;
    } else {
        parent_idx += "&null";
    }

    parent_idx += (type == "theory") ? "&t" : "&h";

    familyMap.set(id, parent_idx);
}

function htAppendData(prefix, id, familyID, name, table) {
    var history = table.history;
    var parents = table.parents;
    if (history != undefined) {
        var title = (parents == undefined) ? keywords[8] : keywords[9];
        $("#"+prefix+"-"+id).append("<p><h4 id=\"name-"+id+"\" onclick=\"fillTree('"+id+"');\">"+title + " : " +name+"</h4></p>");
    }

    var primary_source = table.primary_source;
    var references = table.references;
    var holy_references = table.holy_references;
    htFillHistorySources(id, "#"+prefix+"-"+id, history, primary_source, references, holy_references, "tree-default-align", id);

    var global_father = null;
    if (parents != undefined) {
        for (const i in parents) {
            var couple = parents[i];
            var parents_id = prefix+"-parents-"+id;
            if (couple.father == null && couple.mother == null) {
                $("#"+prefix+"-"+id).append("<div id=\""+parents_id+"\" class=\"tree-real-family-text\"><p><b>"+keywords[0] + "</b>: " + keywords[10]+"</p></div>");

                familyMap.set(id, "null&null&t");
            } else {
                var parentsLink = "";
                var name = "";
                if (couple.father != undefined && couple.father != null) {
                    global_father = couple.father;
                    parents_id += couple.father + "-";

                    name = personNameMap.get(couple.father);
                    if (name != undefined) {
                        parentsLink += "<a href=\"#name-"+couple.father+"\" onclick=\"fillTree('"+couple.father+"');\">" +name+"</a> ";
                    } else if (couple.father_name != undefined && couple.father_family != undefined && couple.father_family != familyID) {
                        parentsLink += "<a href=\"#\" onclick=\"sgLoadPage('tree', 'html', '"+couple.father_family+"&person_id="+couple.father+"', false);\">"+couple.father_name+"</a> & ";
                    }
                }
                parents_id += "-";

                if (couple.mother != null && couple.mother != undefined) {
                    parents_id += couple.mother + "-";

                    name = personNameMap.get(couple.mother);
                    if (name != undefined) {
                        if (couple.mother_family != undefined) {
                            if (couple.mother_family == familyID) {
                                parentsLink += " & <a href=\"#name-"+couple.mother+"\" onclick=\"fillTree('"+couple.mother+"');\">" +name+"</a>";
                            } else {
                                parentsLink += "<a href=\"#\" onclick=\"sgLoadPage('tree', 'html', '"+couple.mother_family+"&person_id="+couple.mother+"', false);\">"+name+"</a>";
                            }
                        } else {
                            parentsLink += " & " +name;
                        }
                    } else if (couple.mother_name != undefined && couple.mother_family != undefined && couple.mother_family != familyID) {
                        parentsLink += "<a href=\"#\" onclick=\"sgLoadPage('tree', 'html', '"+couple.mother_family+"&person_id="+couple.mother+"', false);\">"+couple.mother_name+"</a>";
                    }
                }

                var use_keyword;
                var use_class;
                //var type = couple.type;
                if (couple.type == "theory") {
                    use_keyword = keywords[0];
                    use_class = "tree-real-family-text";
                } else {
                    use_keyword = keywords[1];
                    use_class = "tree-hipothetical-family-text";
                }

                $("#"+prefix+"-"+id).append("<div id=\""+parents_id+"\" class=\""+use_class+"\"><p><b>"+use_keyword + "</b>: " +parentsLink+"</p></div>");
            }
        }
    }

    var marriages = table.marriages;
    if (marriages != undefined) {
        for (const i in marriages) {
            var marriage = marriages[i];
            var rel_id = prefix+"-relationship-"+marriage.id;

            var marriage_class;
            var type = marriage.type; 
            var marriage_keyword;
            if (type == "theory") {
                marriage_class = "tree-real-family-text";
                marriage_keyword = keywords[17];
            } else {
                marriage_class = "tree-hipothetical-family-text";
                marriage_keyword = keywords[18];
            }


            if (marriage.id == undefined) {
                $("#"+prefix+"-"+id).append("<div id=\""+rel_id+"\" class=\""+marriage_class+"\"><p><b>"+keywords[17]+"</b>: "+keywords[19]+"</p></div>");
            } else {
                var marriageLink = "";
                if (marriage.family_id == undefined) {
                    marriageLink = marriage.name;
                } else if (familyID == marriage.family_id) {
                    marriageLink = "<a href=\"#name-"+marriage.id+"\">"+marriage.name+"</a>";
                } else {
                    marriageLink = "<a href=\"#\" onclick=\"sgLoadPage('tree', 'html', '"+marriage.family_id+"&person_id="+marriage.id+"', false);\">"+marriage.name+"</a>";
                }

                $("#"+prefix+"-"+id).append("<div id=\""+rel_id+"\" class=\""+marriage_class+"\"><p><b>"+marriage_keyword+"</b>: "+marriageLink+".</p></div>");
               htFillHistorySources(marriage.id, "#"+rel_id, marriage.history, marriage.primary_source, marriage.references, marriage.holy_references, "tree-default-align", marriage.id);

                var showTree = personNameMap.has(marriage.id);
                if (showTree == false) {
                    personNameMap.set(marriage.id, marriage.name);
                }
            }

        }
    }

    var children = table.children;
    if (children != undefined) {
        for (const i in children) {
            var child = children[i];
            var child_id = prefix+"-children-"+child.id;
            var relationship_id = prefix+"-relationship-";
            if (child.marriage_id != undefined) {
                relationship_id += child.marriage_id;
            }

            var child_class;
            var type = child.type; 
            var child_keyword;
            if (type == "theory") {
                child_class = "tree-real-child-text";
                child_keyword = keywords[20];
            } else {
                child_class = "tree-hipothetical-child-text";
                child_keyword = keywords[21];
            }

            var childLink = "";
            if (child.family_id == undefined) {
                childLink = child.name ;
            } else if (familyID == child.family_id) {
                childLink = "<a href=\"#name-"+child.id+"\"  onclick=\"fillTree('"+child.id+"');\">"+child.name+"</a>";
            } else { 
                childLink = "<a href=\"#\" onclick=\"sgLoadPage('tree', 'html', '"+child.family_id+"&person_id="+child.id+"', false);\">"+child.name+"</a>";
            }

            $("#"+relationship_id).append("<div id=\""+child_id+"\" class=\""+child_class+"\"><p><b>"+child_keyword+"</b>: </p></div>");
            $("#"+child_id).append("<div id=\"with-parent-"+child.id+"\" class=\""+child_class+"\"><p><b>"+childLink+"</b>: </p></div>");
            htFillHistorySources("parent-"+child.id, "#with-parent-"+child.id, child.history, child.primary_source, child.references, child.holy_references, "", child.id);
            htSetMapFamily(child.id, id, child.marriage_id, child.type);
            personNameMap.set(child.id, child.name);
        }
    }
}

function htFillHistorySources(divId, histID, history, primary_source, references, holy_references, useClass, personID)
{
    if (history != undefined) {
        for (const i in history) {
            $(histID).append("<p class=\""+useClass+"\" onclick=\"fillTree('"+personID+"'); \">"+history[i]+"</p>");
        }
    }
}

function htFillMapSource(myMap, data)
{
    if (data == undefined) {
        return;
    }

    var currentLanguage = $("#site_language").val();
    for (const i in data) {
        var ids = myMap.has(data[i].id);
        if (ids == false) {
            var finalDate = "";
            if (data[i].date != undefined ) {
                var ct = data[i].date.split('-');
                finalDate = (currentLanguage == "en-US" ) ? ct[1]+"/"+ct[2]+"/"+ct[0] : ct[2]+"/"+ct[1]+"/"+ct[0];
            }
            myMap.set(data[i].id, {"citation" : data[i].citation, "date" : finalDate, "url" : data[i].url});
        }
    }
}

function htLoadSource(divID, sourceMap, listMap, theID)
{
    $(divID).html("");
    var ps = listMap.has(theID);
    if (ps) {
        var localMap = listMap.get(theID);
        var arr = localMap.split(';');
        if (arr.length > 0 ) {
            for (let i = 0 ; i < arr.length; i++) {
                htFillSource(divID, sourceMap, arr[i]);
            }
        }
    }
}

function loadSources(personID)
{
    htLoadSource("#tree-source", primarySourceMap, personPrimarySourceMap, personID);
    htLoadSource("#tree-ref", refSourceMap, personRefSourceMap, personID);
    htLoadSource("#tree-holy-ref", holyRefSourceMap, personHolyRefSourceMap, personID);
}

function htCleanSources()
{
    $("#tree-source").html("");
    $("#tree-ref").html("");
    $("#tree-holy-ref").html("");
}

function htFillSource(divID, sourceMap, id)
{
    var src = sourceMap.get(id);
    if (src != undefined) {
        var dateValue = "";
        if (src.date != undefined && src.date.length > 0) {
            dateValue = ". [ "+keywords[22]+" "+src.date+" ].";
        }
        var urlValue = "";
        if (src.url != undefined && src.url.length > 0) {
            urlValue = keywords[23]+" <a target=\"_blank\" href=\""+src.url+"\"> "+src.url+"</a>";
        }
        $(divID).append("<p>"+src.citation+" "+dateValue +" "+urlValue+"</p>");
    }
}

function htFillPrimarySource(id)
{
    htFillSource("#tree-source", primarySourceMap, id);
}

function htFillReferenceSource(id)
{
    htFillSource("#tree-ref", refSourceMap, id);
}

function htFillHolySource(id)
{
    htFillSource("#tree-holy-ref", holyRefSourceMap, id);
}

function htHideTree(level, grandpaLevel) {
    if (level > 1 ) {
        $("#child").hide();
    }

    if (level > 0) {
        $("#father").hide();
        $("#mother").hide();
    }

    if (level > -1) {
        if (level > 1 ) {
            $("#grandfather01").hide();
            $("#grandmother01").hide();
        }

        if (level > 0 ) {
            $("#grandfather02").hide();
            $("#grandmother02").hide();
        }
    }
}

function fillTree(personID)
{
    htHideTree(2, 2);
    if (personID == undefined) {
        return;
    }
    
    var type = "theory";
    var parents = htFillDivTree("#child", personID, type);
    if (parents == undefined) {
        htHideTree(1, 2);
        return;
    }

    var parentsId = parents.split('&');
    if (parentsId.length == 0) {
        htHideTree(1, 2);
        return;
    }

    type = (parentsId[2] == 't') ? 'theory' : 'hypothetical';
    var grandparents0 = htFillDivTree("#father", parentsId[0], type);
    if (grandparents0 == undefined) {
        htHideTree(0, 1);
    } else {
        var grandParentsId0 = grandparents0.split('&');
        if (grandParentsId0.length != 3) {
            htHideTree(0, 1);
        } else {
            var grandpatype = (grandParentsId0[2] == 't') ? 'theory' : 'hypothetical';
            var secgrandparents0 = htFillDivTree("#grandfather01", grandParentsId0[0], grandpatype);
            var secgrandparents1 = htFillDivTree("#grandmother01", grandParentsId0[1], grandpatype);
        }
    }

    var grandparents1 = htFillDivTree("#mother", parentsId[1], type);
    if (grandparents1 == undefined) {
        htHideTree(0, 2);
    } else {
        var grandParentsId1 = grandparents1.split('&');
        if (grandParentsId1.length != 3) {
            htHideTree(0, 2);
        } else {

            type = (grandParentsId1[2] == 't') ? 'theory' : 'hypothetical';
            var secgrandparents2 = htFillDivTree("#grandmother02", grandParentsId1[0], type);
            var secgrandparents3 = htFillDivTree("#grandfather02", grandParentsId1[1], type);
        }
    }
}

function htFillDivTree(divID, personID, type)
{
    if (personID == undefined || personID == "null") {
        $(divID).hide();
        return undefined;
    }

    var name = personNameMap.get(personID);
    if (name == undefined) {
        return undefined;
    }

    $(divID).html("");
    var value = name.split(' ');
    
    $(divID).append((value.length > 0) ? value[0].substring(0,14) : value.substring(0,14));
    if (type == "theory") {
        $(divID).css('border-style', 'solid');
        $(divID).css('font-style', 'normal');
    } else {
        $(divID).css('border-style', 'dashed');
        $(divID).css('font-style', 'italic');
    }
    $(divID).show();

    return familyMap.get(personID);
}

