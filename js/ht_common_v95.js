var stringConstructor="gth".constructor;var vectorConstructor=[].constructor;var objectConstructor=({}).constructor;let keywords=[];let mathKeywords=[];var lastTreeLoaded={"page":null,"arg":''};var personNameMap=new Map();var familyMap=new Map();var contentMap=new Map();var primarySourceMap=new Map();var refSourceMap=new Map();var holyRefSourceMap=new Map();function htAddTreeReflection(id)
{if($(id).length>0){$(id).html(keywords[55]);}}
function htAddPaperDivs(generalID,id,text,before,later,i)
{var div=before+"<div id=\"paper-";div+=(id!=undefined)?id:i;div+="\">";div+=text;div+="</div>"+later;$(generalID).append(div);}
function htUpdateCurrentDateOnIndex()
{var current_time=Math.floor(Date.now()/1000);var local_lang=$("#site_language").val();var local_calendar=$("#site_calendar").val();var text=htConvertDate(local_calendar,local_lang,current_time,undefined,undefined);$("#current_day").html(keywords[42]+" "+text);}
function htFillSourceContentToPrint(text,map,id)
{if(map.size==0||text.size==0){return text;}
var mention="";for(let[key,value]of map){var dateValue="";if(value.date!=undefined&&value.date!=null&&value.date.length>0){var dateVector=value.date.split("-");var textDate=htFillHTDate(dateVector);dateValue=". [ "+keywords[22]+" "+textDate+" ].";}
var urlValue="";if(value.url!=undefined&&value.url!=null&&value.url.length>0){urlValue=keywords[23]+"  "+value.url;}
mention+="<p>"+value.citation+" "+dateValue+" "+urlValue+"</p>";}
text=text.replace("<div id=\""+id+"\" class=\"cited-text\"></div>","<div id=\""+id+"\" class=\"cited-text\">"+mention+"</div>");return text;}
function htPrintContent(header,body)
{var pageHeader=$(header).html();var pageBody=$(body).html();var pageCitation=$(".right-sources").html();pageCitation=htFillSourceContentToPrint(pageCitation,primarySourceMap,'tree-source');pageCitation=htFillSourceContentToPrint(pageCitation,refSourceMap,'tree-ref');pageCitation=htFillSourceContentToPrint(pageCitation,holyRefSourceMap,'tree-holy-ref');var printMe="<p><h1><center>"+pageHeader+"</center></h1></p><p>"+pageBody+"</p><p>"+pageCitation+"</p>";var printScreen=window.open('','PRINT');printScreen.document.write(printMe);printScreen.document.close();printScreen.window.focus();printScreen.window.print();}
function htAdjustGregorianZeroYear(text)
{var parsed=text.split(" ");var finalText=parsed[0]+" ";var end=parsed.length-1;for(let i=1;i<end;i++){finalText+=parsed[i]+" ";}
return finalText+"0";}
function htConvertDate(test,locale,unixEpoch,julianEpoch,gregorianDate)
{var ct=undefined;var intEpoch=undefined;var jd=undefined;if(unixEpoch!=undefined){intEpoch=parseInt(unixEpoch);ct=new Date(0);jd=calcUnixTime(intEpoch);}else if(julianEpoch!=undefined){intEpoch=parseInt(julianEpoch);jd=calcJulian(julianEpoch);ct=new Date(jd[0],jd[1],jd[2]);}else if(gregorianDate!=undefined){intEpoch=gregorian_to_jd(gregorianDate[0],gregorianDate[1],gregorianDate[2]);jd=calcJulian(intEpoch);ct=new Date(gregorianDate[0],gregorianDate[1]-1,gregorianDate[2],0,0,0);ct.setFullYear(gregorianDate[0],gregorianDate[1]-1,gregorianDate[2]);}else{return;}
ct.toLocaleString(locale,{timeZone:'UTC'})
var julianDays=gregorian_to_jd(jd[0],jd[1],jd[2]);var text="";var year=" "+keywords[43];var mesoamericanPeriod=0;switch(test){case"gregory":case"hebrew":case"islamic":case"persian":break;case"julian":text=julianDays+" "+keywords[41];return text;case"emesoamerican":mesoamericanPeriod=jd_to_extended_mayan_count(julianDays);case"mesoamerican":if(mesoamericanPeriod==0){mesoamericanPeriod=jd_to_mayan_count(julianDays);}
var haab=jd_to_mayan_haab(julianDays);var tzolkin=jd_to_mayan_tzolkin(julianDays);text=mesoamericanPeriod[0]+"."+mesoamericanPeriod[1]+"."+mesoamericanPeriod[2]+"."+mesoamericanPeriod[3]+"."+mesoamericanPeriod[4]+"."+mesoamericanPeriod[5]+"."+mesoamericanPeriod[6]+"."+mesoamericanPeriod[7]+" ( Haab: "+haab[1]+" "+MAYAN_HAAB_MONTHS[haab[0]-1]+", Tzolkin: "+tzolkin[1]+" "+MAYAN_TZOLKIN_MONTHS[tzolkin[0]-1]+" )";return text;case"french":var frCals=jd_to_french_revolutionary(julianDays);year=(frCals[0]<0)?Math.abs(frCals[0])+" "+keywords[43]:frCals[0];text="Année "+year+" Mois "+frMonth[frCals[1]-1]+" Décade "+frDecade[frCals[2]-1]+" Jour "+frDay[((frCals[1]<=12)?frCals[3]:(frCals[3]+11))];return text;case"shaka":var indianCal=jd_to_indian_civil(julianDays);year=(indianCal[0]<0)?Math.abs(indianCal[0])+" "+keywords[43]:indianCal[0];text=indianCal[2]+"."+indianMonths[indianCal[1]-1]+"."+year;return text;case"hispanic":intEpoch+=1199188800;default:test="gregory";break;}
if(unixEpoch!=undefined){ct.setUTCSeconds(intEpoch);}
text=new Intl.DateTimeFormat(locale,{dateStyle:'medium',calendar:test}).format(ct);if(test=="gregory"){var yearValue=ct.getFullYear();if(yearValue<0){text+=" "+keywords[43];}else if(yearValue==0){text=htAdjustGregorianZeroYear(text);}}
return text;}
function htConvertGregorianYearToJD(gregoryYear)
{var year=parseInt(gregoryYear);var ct=new Date();ct.setYear(year);return gregorian_to_jd(gregoryYear,ct.getMonth(),ct.getDate());}
function htConvertGregorianYear(test,gregoryYear)
{var year=parseInt(gregoryYear);var jd=htConvertGregorianYearToJD(year);var text="";if(test=="gregory"){if(year>=0){text+=gregoryYear;}else{text+=Math.abs(year)+" "+keywords[43];}}else{var coverted=undefined;var mesoamericanPeriod=0;switch(test){case"hebrew":converted=jd_to_hebrew(jd);break;case"islamic":converted=jd_to_islamic(jd);break;case"persian":converted=jd_to_persian(jd);break;case"julian":text=jd+" "+keywords[41];return text;case"emesoamerican":mesoamericanPeriod=jd_to_extended_mayan_count(jd);case"mesoamerican":if(mesoamericanPeriod==0){var mesoamericanPeriod=jd_to_mayan_count(jd);}
var haab=jd_to_mayan_haab(jd);var tzolkin=jd_to_mayan_tzolkin(jd);text=mesoamericanPeriod[0]+"."+mesoamericanPeriod[1]+"."+mesoamericanPeriod[2]+"."+mesoamericanPeriod[3]+"."+mesoamericanPeriod[4]+"."+mesoamericanPeriod[5]+"."+mesoamericanPeriod[6]+"."+mesoamericanPeriod[7]+" ( Haab: "+haab[1]+" "+MAYAN_HAAB_MONTHS[haab[0]-1]+", Tzolkin: "+tzolkin[1]+" "+MAYAN_TZOLKIN_MONTHS[tzolkin[0]-1]+" )";return text;case"french":var frCals=jd_to_french_revolutionary(jd);year=(frCals[0]<0)?mod(frCals[0])+keywords[43]:frCals[0];text=""+year;return text;case"shaka":var indianCal=jd_to_indian_civil(jd);year=(indianCal[0]<0)?mod(indianCal[0])+year:indianCal[0];text=""+year;return text;case"hispanic":converted=new Array(""+(parseInt(year)+38));break;default:return undefined;}
if(converted[0]>=0){text+=converted[0];}else{text+=Math.abs(converted[0])+" "+keywords[43];}}
return text;}
function htConvertGregorianDate(test,locale,year,month,day)
{var dateArr=new Array(year,month,day);return htConvertDate(test,locale,undefined,undefined,dateArr);}
function htConvertUnixDate(test,locale,unixEpoch)
{return htConvertDate(test,locale,unixEpoch,undefined,undefined);}
function htConvertJulianDate(test,locale,julianEpoch)
{return htConvertDate(test,locale,undefined,julianEpoch,undefined);}
function htFillDivAuthorsContent(target,last_update,authors,reviewers){if(last_update<=0){return;}
if($("#paper-date").length>0){return;}
var dateDiv="<p><div id=\"paper-title\" class=\"paper-title-style\"><div id=\"paper-date\" class=\"paper-date-style\">";var local_lang=$("#site_language").val();var local_calendar=$("#site_calendar").val();var text=htConvertDate(local_calendar,local_lang,last_update,undefined,undefined);if(keywords.length>33){dateDiv+=keywords[34]+" : "+authors+".<br />";}
if(keywords.length>35){dateDiv+=keywords[36]+" : "+reviewers+".<br />";}
dateDiv+=keywords[33]+" : "+text;dateDiv+=". "+keywords[38];dateDiv+="</div><div id=\"paper-print\" class=\"paper-print-style\"><a href=\"#\" class=\"fa-solid fa-print\" onclick=\"htPrintContent('#header', '#page_data'); return false;\"></a></div></div></p>";$(target).append(dateDiv);}
function htLoadPage(page,ext,arg,reload){$("#messages").html("&nbsp;");if(ext=="html"){if(page!="tree"){$('.right-tree').css('display','none');$('.right-tree').css('visibility','hidden');}
switch(page){case"tree":case"genealogical_map_list":case"class_content":if(reload==true&&lastTreeLoaded.arg!=null&&lastTreeLoaded.arg.length>0){arg=lastTreeLoaded.arg;}else{lastTreeLoaded.page=page;lastTreeLoaded.arg=arg;}
if(page=="tree"){$('.right-tree').css('display','block');$('.right-tree').css('visibility','visible');}
var myURL=(arg!=undefined&&arg!=null)?'index.html?page='+page+'&arg='+arg:'index.html?page='+page;window.history.replaceState(null,null,myURL);break;case"families":lastTreeLoaded.page=null;lastTreeLoaded.arg=null
$("#loading").val("");$("#selector").val("");default:window.history.replaceState(null,null,'index.html?page='+page);break;}
$("#tree-source").html("");$("#tree-ref").html("");$("#tree-holy-ref").html("");}
var pages=arg.split('&person_id=');var appendPage="";if(pages.length!=2){$("#loading").val(arg);}else{appendPage=pages[0];if(ext=="html"){$("#loading").val(pages[0]);$("#selector").val(pages[1]);}}
if(ext.length!=null&&ext.length>0&&ext=="html"){$("#html_loaded").val(page);}
var lang=$("#site_language").val();if(lang==null||lang==undefined){lang=htDetectLanguage();}
var unixEpoch=Date.now();if(ext=="html"){primarySourceMap.clear();refSourceMap.clear();holyRefSourceMap.clear();var additional=(appendPage.length==0)?'&':appendPage+'&';$("#page_data").load("bodies/"+page+"."+ext+"?load="+additional+'nocache='+unixEpoch);return false;}
$("#loading_msg").show();$.ajax({type:'GET',url:(arg!='source')?"lang/"+lang+"/"+page+".json":"lang/sources/"+page+".json",contentType:'application/json; charset=utf-8',data:'nocache='+unixEpoch,async:true,dataType:'json',success:function(data){if(data.length==0){$("#loading_msg").hide();return false;}
htLoadSources(data,arg,page);htFillWebPage(page,data);return false;},});}
function htDetectLanguage()
{var lang=navigator.language||navigator.userLanguage;if(lang==undefined||lang==null||lang.length==0){lang="en-US";}else{var llang=lang.substring(0,2).toLowerCase();if(($("#site_language option[value='"+lang+"']").length>0)==false){if(llang=="pt"){lang="pt-BR";}else if(llang=="es"){lang="es-ES";}else{lang="en-US";}}
var country=lang.substring(3).toUpperCase();llang=lang.substring(0,2).toLowerCase();lang=llang+'-'+country;}
return lang;}
function htFillHTDate(vector)
{var localLang=$("#site_language").val();var localCalendar=$("#site_calendar").val();for(const j in vector){var w=vector[j];var updateText="";switch(w.type){case"gregory":if(w.day>0){updateText=htConvertGregorianDate(localCalendar,localLang,w.year,w.month,w.day);}else{updateText=htConvertGregorianYear(localCalendar,w.year);}
break;case"unix":updateText=htConvertUnixDate(localCalendar,localLang,w.epoch);break;case"julian":updateText=htConvertJulianDate(localCalendar,localLang,w.day);break;}
if($("#htdate"+j).length>0){$("#htdate"+j).html(updateText);}}}
function htFillWebPage(page,data)
{if(data.title!=undefined&&data.title!=null&&data.title.length>0){$(document).prop('title',data.title);}
if(data.header!=undefined&&data.header!=null&&data.header.length>0){$("#header").html(data.header);}else if(data.nothing!=undefined&&data.nothing!=null&&data.nothing.length>0){$(document).prop('title',data.nothing);$("#header").html(data.nothing);return;}
if(data.common!=undefined&&data.common!=null&&data.common.length>0){for(const i in data.common){$("#common").append(data.common[i]);}}
var last_update=0;if(data.last_update!=undefined&&data.last_update!=null){last_update=data.last_update;}
var page_authors=(keywords.length>34)?keywords[35]:"Editors of History Tracers";var page_reviewers=(keywords.length>36)?keywords[37]:"Reviewers of History Tracers";if(data.authors!=undefined&&data.authors!=null){page_authors=data.authors;}
if(data.reviewers!=undefined&&data.reviewers!=null){page_reviewers=data.reviewers;}
if($("#extpaper").length>0&&last_update>0){htFillDivAuthorsContent("#extpaper",last_update,page_authors,page_reviewers);}
if(data.languages!=undefined){htFillIndexSelector(data.languages,"#site_language");$("#loading_msg").hide();$(':focus').blur()
return;}
else if(data.calendars!=undefined){htFillIndexSelector(data.calendars,"#site_calendar");$("#loading_msg").hide();$(':focus').blur()
return;}
if(data.families!=undefined){htFillFamilies(page,data);}else if(data.keywords!=undefined){htFillKeywords(data.keywords);$("#loading_msg").hide();}else if(data.math_keywords!=undefined){htFillMathKeywords(data.math_keywords);$("#loading_msg").hide();}else{for(const i in data.content){if(data.content[i].value==undefined||data.content[i].value==null){if(data.content[i].id!=undefined&&data.content[i].id=="fill_dates"){htFillHTDate(data.content[i].text);}
continue;}
if(data.content[i].value.constructor===stringConstructor){$("#"+data.content[i].id).html(data.content[i].value);}else if(data.content[i].value.constructor===vectorConstructor&&data.content[i].target!=undefined){if(data.content[i].value_type==undefined){continue;}else if(data.content[i].value_type=="family-list"){var table=data.content[i].value;htFillFamilyList(table,data.content[i].target);}else if(data.content[i].value_type=="group-list"){if(data.content[i].id!=undefined&&data.content[i].id!=null&&data.content[i].id.length>0&&data.content[i].desc!=undefined&&data.content[i].desc.length>0){$("#"+data.content[i].id).html(data.content[i].desc);}
htFillMapList(data.content[i].value,data.content[i].target,data.content[i].page);}else if(data.content[i].value_type=="subgroup"){htFillSubMapList(data.content[i].value,data.content[i].target);}else if(data.content[i].value_type=="paper"){htFillPaperContent(data.content[i].value,last_update,page_authors,page_reviewers);}}else if(data.content[i].value.constructor===vectorConstructor&&data.content[i].id!=undefined){if(data.content[i].id!="fill_dates"){for(const j in data.content[i].value){$("#"+data.content[i].id).append(data.content[i].value[j]);}}else{if(data.content[i].value.constructor===vectorConstructor){htFillHTDate(data.content[i].value);}}}}
if($("#tree-sources-lbl").length>0){$("#tree-sources-lbl").html(keywords[5]);}
if($("#tree-references-lbl").length>0){$("#tree-references-lbl").html(keywords[6]);}
if($("#tree-holy_references-lbl").length>0){$("#tree-holy_references-lbl").html(keywords[7]);}
if($("#tree-description").length>0){$("#tree-description").html(keywords[24]+" "+keywords[38]+" <p>"+keywords[52]+"</p>");}}
if(data.scripts!=undefined&&data.scripts!=null){for(const i in data.scripts){var jsURL="js/"+data.scripts[i]+".js";$.getScript(jsURL,function(){htLoadExercise();$("#btncheck").on("click",function(){htCheckAnswers();return false;});$("#btnnew").on("click",function(){htLoadExercise();return false;});});}}
if(page=="families"&&$("#family_common_sn").length>0){$("#family_common_sn").html(keywords[52]);}}
function htLoadSources(data,arg,page)
{if(data.sources!=undefined){for(const i in data.sources){htLoadPage(data.sources[i],'json','source',false);}}else{if(arg!='source'){return true;}
htFillMapSource(primarySourceMap,data.primary_sources)
htFillMapSource(refSourceMap,data.reference_sources)
htFillMapSource(holyRefSourceMap,data.religious_sources)
if(page=='tree'){$("#loading_msg").hide();return false;}}
return true;}
function htFillIndexSelector(table,target){var current=$(target).val();$(target).find("option").remove();for(const i in table){$(target).append(new Option(table[i].text,table[i].dir));}
$(target).val(current);}
function htFillKeywords(table){keywords=[];for(const i in table){keywords.push(table[i]);}
if(keywords.length<40)
return;$("#index_lang").html(keywords[39]);$("#index_calendar").html(keywords[40]);htUpdateCurrentDateOnIndex();}
function htFillMathKeywords(table){mathKeywords=[];for(const i in table){mathKeywords.push(table[i]);}}
function htFillFamilyList(table,target){for(const i in table){if(table[i].target==undefined){if(table[i].id!=undefined&&table[i].id=="fill_dates"){if(table[i].text.constructor===vectorConstructor){htFillHTDate(table[i].text);}}
continue;}
$("#"+table[i].target).append("<div id=\"bottom"+table[i].id+"\"><h3>"+table[i].id+"</h3></div>");if(table[i].value.constructor===vectorConstructor){var rows=table[i].value;$("#bottom"+table[i].id).append("<ul id=\"bottomList"+table[i].id+"\"></ul>");for(const k in rows){$("#bottomList"+table[i].id).append("<li id=\""+rows[k].id+"\"><a href=\"index.html?page=tree&arg="+rows[k].id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+rows[k].id+"', false); return false;\" >"+rows[k].value+"</a></li>");}}}}
function htFillMapList(table,target,page){for(const i in table){if(table[i].id!="fill_dates"){$("#"+target).append("<li id=\""+table[i].id+"\"><a href=\"index.html?page="+page+"&arg="+table[i].id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('"+page+"', 'html', '"+table[i].id+"', false); return false;\" >"+table[i].name+"</a> "+table[i].desc+"</li>");}else{if(table[i].text.constructor===vectorConstructor){htFillHTDate(table[i].text);}}}}
function htFillSubMapList(table,target){for(const i in table){switch(table[i].page){case"class_content":if(table[i].id!=undefined&&table[i].name!=undefined&&table[i].desc!=undefined){$("#"+target).append("<li id=\""+i+"\"><a href=\"index.html?page=class_content&arg="+table[i].id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('class_content', 'html', '"+table[i].id+"', false); return false;\" >"+table[i].name+"</a> "+table[i].desc+"</li>");}
break;case"tree":default:if(table[i].person_id!=undefined&&table[i].family_id!=undefined&&table[i].name!=undefined&&table[i].desc!=undefined){$("#"+target).append("<li id=\""+i+"\"><a href=\"index.html?page=tree&arg="+table[i].family_id+"&person_id="+table[i].person_id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+table[i].family_id+"&person_id="+table[i].person_id+"', false); return false;\" >"+table[i].name+"</a> "+table[i].desc+"</li>");}}}}
function htCheckExerciseAnswer(val0,val1,answer,explanation){var ans=parseInt($("input[name="+val0+"]:checked").val());var text="";var format="";if(ans==val1){text=keywords[27];format="green";}else{text=keywords[28];format="red";}
if($(answer).length>0){$(answer).text(text);$(answer).css("color",format);}
if($(explanation).length>0){$(explanation).css("color",format);$(explanation).css("display","block");$(explanation).css("visibility","visible");}
return false;}
function htResetAnswers(vector)
{for(let i=0;i<vector.length;i++){$("#answer"+i).text("");$("input[name=exercise"+i+"]").prop("checked",false);$("#explanation"+i).css("display","none");$("#explanation"+i).css("visibility","hidden");}}
function htWriteQuestions(table,later,idx)
{var questions="<p><h3>"+keywords[50]+"</h3><ol>";var tmpAnswers="<p class=\"ht_description\"><span id=\"htAnswersToBeUsed\">";var total=0;for(const i in table){questions+="<li>"+table[i].question+" <input type=\"radio\" id=\"ans"+i+"yes\" name=\"exercise"+i+"\" value=\"1\" /> <b><label>"+keywords[31]+"</label></b> <input type=\"radio\" id=\"ans"+i+"no\" name=\"exercise"+i+"\" value=\"0\" /> <b><label>"+keywords[32]+"</label></b>. <span class=\"ht_description\" id=\"explanation"+i+"\"><span id=\"answer"+i+"\"></span> "+table[i].additionalInfo+"</span></li>";tmpAnswers+=(table[i].yesNoAnswer=="Yes")?1+";":0+";";total=i;}
if(total>0){total++;}
questions+="</ol><input id=\"btncheck\" type=\"button\" onclick=\"return false;\" value=\""+keywords[29]+"\" /> <input id=\"btnnew\" type=\"button\" onclick=\"return false;\" value=\""+keywords[30]+"\" /></p>";tmpAnswers+="</span><span id=\"htTotalQuestions\">"+total+"</span></p>";htAddPaperDivs("#paper","exercises0",questions,"",later,idx);htAddPaperDivs("#paper","exercises1",tmpAnswers,"",later,idx+1000);}
function htLoadAnswersFromExercise()
{var ret=[];var end=parseInt($("#htTotalQuestions").html());if(end==undefined){return end;}
var htmlValues=$("#htAnswersToBeUsed").html();if(htmlValues==undefined){return end;}
var values=htmlValues.split(";");for(let i=0;i<end;i++){ret.push(parseInt(values[i]));}
$("#htAnswersToBeUsed").html("");return ret;}
function htFillPaperContent(table,last_update,page_authors,page_reviewers){for(const i in table){if(i==1){htFillDivAuthorsContent("#paper",last_update,page_authors,page_reviewers);}
var later=(i==0&&last_update>0&&table[i].id=="navigation")?"<hr class=\"limit\" />":"";if(table[i].text.constructor===stringConstructor){htAddPaperDivs("#paper",table[i].id,table[i].text,"",later,i);}else if(table[i].text.constructor===vectorConstructor){if(table[i].id=="exercise_v2"){htWriteQuestions(table[i].text,later,i);}else if(table[i].id!="fill_dates"){for(const j in table[i].text){htAddPaperDivs("#paper",table[i].id+"_"+j,table[i].text[j],"",later,i);}}else{htFillHTDate(table[i].text);}}}
if(table[0].id=="navigation"){htAddPaperDivs("#paper","repeat-index",table[0].text,"<hr class=\"limit\" />","",100000);}}
function htFillFamilies(page,table){if(table.title!=undefined){$(document).prop('title',table.title);}
if(table.common!=undefined){$("#tree-common-lbl").html(keywords[25]);$("#common").html("");for(const i in table.common){$("#common").append("<div id=\"hist-comm-"+i+"\">"+table.common[i]+"</div>");}}
if(table.documentsInfo!=undefined&&table.documentsInfo!=null&&$("#overallInfo").length>0){$("#overallInfo").html("<p><h3>"+keywords[53]+"</h3>"+table.documentsInfo+"</p>");}
if(table.prerequisites!=undefined&&table.prerequisites!=null&&$("#pre_requisites").length>0){var preRequisites="";for(const i in table.prerequisites){preRequisites+=(i==0)?"<p><ul><li>"+table.prerequisites[i]+"</li>":"<li>"+table.prerequisites[i]+"</li>";}
preRequisites+="</ul></p>";$("#pre_requisites").html(preRequisites);}
if($("#contribution").length>0){$("#contribution").html(keywords[54]);}
$("#sources-lbl").html(keywords[5]);$("#tree-sources-lbl").html(keywords[5]);$("#tree-references-lbl").html(keywords[6]);$("#references-lbl").html(keywords[6]);$("#tree-holy_references-lbl").html(keywords[7]);$("#holy_references-lbl").html(keywords[7]);$("#child").html(keywords[9]);$("#father").html(keywords[2]);$("#mother").html(keywords[3]);$("#grandfather01").html(keywords[11]);$("#grandmother01").html(keywords[12]);$("#grandfather02").html(keywords[13]);$("#grandmother02").html(keywords[14]);for(const i in table.families){if(table.families[i].id==undefined||table.families[i].name==undefined){continue;}
var family_id=table.families[i].id;$("#index_list").append("<li id=\"lnk-"+family_id+"\"><a href=\"javascript:void(0);\" onclick=\"htScroolTree('#hist-"+family_id+"');\">"+keywords[8]+" : "+table.families[i].name+"</a></li>");$("#trees").append("<div id=\"hist-"+family_id+"\"></div>");var family=table.families[i];htAppendData("hist",family_id,undefined,family.name,family,page);if(family.people==undefined){continue;}
var people=family.people;for(const j in people){if(people[j].id==undefined||people[j].name==undefined){continue;}
var person_id=people[j].id;$("#hist-"+family_id).append("<div id=\"tree-"+person_id+"\" class=\"tree-person-text\"></div>");personNameMap.set(people[j].id,people[j].name);htAppendData("tree",person_id,family_id,people[j].name,people[j],page);}}
var destination=$("#selector").val();if(destination!=undefined&&destination!=null&&destination.length>1){var localObject=$("#name-"+destination).val();if(localObject!=undefined){$('html, body').scrollTop($("#name-"+destination).offset().top);htFillTree(destination);}}
htLoadPage('tree','json','',false);if(table.exercise_v2!=undefined&&table.exercise_v2.constructor===vectorConstructor){htWriteQuestions(table.exercise_v2,"",0);}
if(table.fill_dates!=undefined&&table.fill_dates.constructor===vectorConstructor){htFillHTDate(table.fill_dates);}
$("#loading_msg").hide();}
function htSetMapFamily(id,father,mother,type)
{if(father==null&&mother==null){familyMap.set(id,"null&null&t");return;}
var parent_idx="";if(father!=undefined&&father!=null){parent_idx+=father;}else{parent_idx+="null";}
if(mother!=undefined&&mother!=null){parent_idx+="&"+mother;}else{parent_idx+="&null";}
parent_idx+=(type=="theory")?"&t":"&h";familyMap.set(id,parent_idx);}
function htMountCurrentLinkBasis(familyID,id)
{var url=window.location.href;var remove=url.search("#");if(remove<0){remove=url.search("\\?");}
var userURL=(remove>0)?url.substring(0,remove):url;userURL+="?page=tree&arg="+familyID;if(id!=undefined){var myTree=url.search("page=tree");if(myTree>=0){userURL+="&person_id="+id;}}
return userURL;}
function htSetCurrentLinkBasis(familyID,id,finalURL)
{var myURL=(finalURL==undefined)?htMountCurrentLinkBasis(familyID,id):finalURL;window.history.replaceState(null,null,myURL);return false;}
function htCopyLink(familyID,id)
{var userURL=htMountCurrentLinkBasis(familyID,id);htSetCurrentLinkBasis(familyID,id,userURL);userURL+="&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val();var temp=$("<input>");$("body").append(temp);temp.val(userURL).select();document.execCommand("copy");temp.remove();return false;}
function htAppendData(prefix,id,familyID,name,table,page){var history=table.history;var parents=table.parents;var marriages=table.marriages;if(history!=undefined){var title;var localHeader;if(parents==undefined||marriages==undefined){title=keywords[8];localHeader="3";}else{title=keywords[9];localHeader="4";}
$("#"+prefix+"-"+id).append("<p><h"+localHeader+" id=\"name-"+id+"\" onclick=\"htFillTree('"+id+"'); htSetCurrentLinkBasis('"+page+"', '"+id+"',"+undefined+");\">"+title+" : "+name+" (<a href=\"javascript:void(0);\" onclick=\"htCopyLink('"+page+"', '"+id+"'); return false;\" >"+keywords[26]+"</a>)</h"+localHeader+"></p>");}
var primary_source=table.primary_source;var references=table.references;var holy_references=table.holy_references;htFillHistorySources(id,"#"+prefix+"-"+id,history,primary_source,references,holy_references,"tree-default-align",id);var global_father=null;if(parents!=undefined){for(const i in parents){var couple=parents[i];var parents_id=prefix+"-parents-"+id;if(couple.father==null&&couple.mother==null){$("#"+prefix+"-"+id).append("<div id=\""+parents_id+"\" class=\"tree-real-family-text\"><p><b>"+keywords[0]+"</b>: "+keywords[10]+"</p></div>");familyMap.set(id,"null&null&t");}else{var parentsLink="";var name="";if(couple.father!=undefined&&couple.father!=null){global_father=couple.father;parents_id+=couple.father+"-";name=personNameMap.get(couple.father);if(name!=undefined){parentsLink+="<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+couple.father+"'); htFillTree('"+couple.father+"'); htSetCurrentLinkBasis('"+page+"', '"+couple.father+"',"+undefined+");\">"+name+"</a> ";}else if(couple.father_name!=undefined&&couple.father_family!=undefined&&couple.father_family!=familyID){parentsLink+="<a href=\"index.html?page=tree&arg="+couple.father_family+"&person_id="+couple.father+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.father_family+"&person_id="+couple.father+"', false); return false;\">"+couple.father_name+"</a> & ";}}
parents_id+="-";if(couple.mother!=null&&couple.mother!=undefined){parents_id+=couple.mother+"-";name=personNameMap.get(couple.mother);if(name!=undefined){if(couple.mother_family!=undefined){if(couple.mother_family==familyID){parentsLink+=" & <a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+couple.mother+"'); htFillTree('"+couple.mother+"'); htSetCurrentLinkBasis('"+page+"', '"+couple.mother+"',"+undefined+");\">"+name+"</a>";}else{parentsLink+="<a href=\"index.html?page=tree&arg="+couple.mother_family+"&person_id="+couple.mother+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.mother_family+"&person_id="+couple.mother+"', false); return false;\">"+name+"</a>";}}else{parentsLink+=" & "+name;}}else if(couple.mother_name!=undefined&&couple.mother_family!=undefined&&couple.mother_family!=familyID){parentsLink+="<a href=\"index.html?page=tree&arg="+couple.mother_family+"&person_id="+couple.mother+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+couple.mother_family+"&person_id="+couple.mother+"', false); return false;\">"+couple.mother_name+"</a>";}}
var use_keyword;var use_class;if(couple.type=="theory"){use_keyword=keywords[0];use_class="tree-real-family-text";}else{use_keyword=keywords[1];use_class="tree-hipothetical-family-text";}
if(parentsLink.length==0){parentsLink+=couple.father_name+" & "+couple.mother_name;}
$("#"+prefix+"-"+id).append("<div id=\""+parents_id+"\" class=\""+use_class+"\"><p><b>"+use_keyword+"</b>: "+parentsLink+"</p></div>");}}}
if(marriages!=undefined){for(const i in marriages){var marriage=marriages[i];var rel_id=prefix+"-relationship-"+marriage.id;var marriage_class;var type=marriage.type;var marriage_keyword;if(type=="theory"){marriage_class="tree-real-family-text";marriage_keyword=keywords[17];}else{marriage_class="tree-hipothetical-family-text";marriage_keyword=keywords[18];}
if(marriage.id==undefined){$("#"+prefix+"-"+id).append("<div id=\""+rel_id+"\" class=\""+marriage_class+"\"><p><b>"+keywords[17]+"</b>: "+keywords[19]+"</p></div>");}else{var marriageLink="";if(marriage.family_id==undefined){marriageLink=marriage.name;}else if(familyID==marriage.family_id){marriageLink="<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+marriage.id+"'); htFillTree('"+marriage.id+"'); htSetCurrentLinkBasis('"+page+"', '"+marriage.id+"',"+undefined+");\">"+marriage.name+"</a>";}else{marriageLink="<a href=\"index.html?page=tree&arg="+marriage.family_id+"&person_id="+marriage.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+marriage.family_id+"&person_id="+marriage.id+"', false); return false;\">"+marriage.name+"</a>";}
$("#"+prefix+"-"+id).append("<div id=\""+rel_id+"\" class=\""+marriage_class+"\"><p><b>"+marriage_keyword+"</b>: "+marriageLink+".</p></div>");htFillHistorySources(marriage.id,"#"+rel_id,marriage.history,marriage.primary_source,marriage.references,marriage.holy_references,"tree-default-align",marriage.id);var showTree=personNameMap.has(marriage.id);if(showTree==false){personNameMap.set(marriage.id,marriage.name);}}}}
var children=table.children;if(children!=undefined){for(const i in children){var child=children[i];var child_id=prefix+"-children-"+child.id;var relationship_id=prefix+"-relationship-";if(child.marriage_id!=undefined){relationship_id+=child.marriage_id;}
var child_class;var type=child.type;var child_keyword;if(type=="theory"){child_class="tree-real-child-text";child_keyword=keywords[20];}else{child_class="tree-hipothetical-child-text";child_keyword=keywords[21];}
var childLink="";if(child.family_id==undefined){childLink=child.name;}else if(familyID==child.family_id){childLink="<a href=\"javascript:void(0);\" onclick=\"htScroolTree('#name-"+child.id+"'); htFillTree('"+child.id+"'); htSetCurrentLinkBasis('"+page+"', '"+child.id+"',"+undefined+");\">"+child.name+"</a>";}else{childLink="<a href=\"index.html?page=tree&arg="+child.family_id+"&person_id="+child.id+"&lang="+$('#site_language').val()+"&cal="+$('#site_calendar').val()+"\" onclick=\"htLoadPage('tree', 'html', '"+child.family_id+"&person_id="+child.id+"', false);\">"+child.name+"</a>";}
$("#"+relationship_id).append("<div id=\""+child_id+"\" class=\""+child_class+"\"><p><b>"+child_keyword+"</b>: </p></div>");$("#"+child_id).append("<div id=\"with-parent-"+child.id+"\" class=\""+child_class+"\"><p><b>"+childLink+"</b>: </p></div>");htFillHistorySources("parent-"+child.id,"#with-parent-"+child.id,child.history,child.primary_source,child.references,child.holy_references,"",child.id);htSetMapFamily(child.id,id,child.marriage_id,child.type);personNameMap.set(child.id,child.name);}}}
function htFillHistorySources(divId,histID,history,primary_source,references,holy_references,useClass,personID)
{if(history!=undefined){for(const i in history){$(histID).append("<p class=\""+useClass+"\" onclick=\"htFillTree('"+personID+"'); \">"+history[i]+"</p>");}}}
function htFillMapSource(myMap,data)
{if(data==undefined){return;}
var currentLanguage=$("#site_language").val();var currentCalendar=$("#site_calendar").val();for(const i in data){var ids=myMap.has(data[i].id);if(ids==false){var finalDate="";if(data[i].date!=undefined){var dateVector=data[i].date.split('-');if(dateVector.length!=3){continue;}
finalDate=htConvertGregorianDate(currentCalendar,currentLanguage,dateVector[0],dateVector[1],dateVector[2]);}
myMap.set(data[i].id,{"citation":data[i].citation,"date":finalDate,"url":data[i].url});}}}
function htLoadSource(divID,sourceMap,listMap,theID)
{$(divID).html("");var ps=listMap.has(theID);if(ps){var localMap=listMap.get(theID);var arr=localMap.split(';');if(arr.length>0){for(let i=0;i<arr.length;i++){htFillSource(divID,sourceMap,arr[i]);}}}}
function loadSources(personID)
{htLoadSource("#tree-source",primarySourceMap,personPrimarySourceMap,personID);htLoadSource("#tree-ref",refSourceMap,personRefSourceMap,personID);htLoadSource("#tree-holy-ref",holyRefSourceMap,personHolyRefSourceMap,personID);}
function htCleanSources()
{$("#tree-source").html("");$("#tree-ref").html("");$("#tree-holy-ref").html("");}
function htFillSource(divID,sourceMap,id)
{var src=sourceMap.get(id);if(src!=undefined){var dateValue="";if(src.date!=undefined&&src.date!=null&&src.date.length>0){dateValue=". [ "+keywords[22]+" "+src.date+" ].";}
var urlValue="";if(src.url!=undefined&&src.url!=null&&src.url.length>0){urlValue=keywords[23]+" <a target=\"_blank\" href=\""+src.url+"\"> "+src.url+"</a>";}
$(divID).append("<p>"+src.citation+" "+dateValue+" "+urlValue+"</p>");}}
function htFillPrimarySource(id)
{htFillSource("#tree-source",primarySourceMap,id);}
function htFillReferenceSource(id)
{htFillSource("#tree-ref",refSourceMap,id);}
function htFillHolySource(id)
{htFillSource("#tree-holy-ref",holyRefSourceMap,id);}
function htHideTree(level,grandpaLevel){if(level>1){$("#child").hide();}
if(level>0){$("#father").hide();$("#mother").hide();}
if(level>-1){if(level>1){$("#grandfather01").hide();$("#grandmother01").hide();}
if(level>0){$("#grandfather02").hide();$("#grandmother02").hide();}}}
function htScroolTree(id)
{var destination=$(id).val();if(destination!=undefined){$('html, body').scrollTop($(id).offset().top);}}
function htFillTree(personID)
{htHideTree(2,2);if(personID==undefined){return;}
var type="theory";var parents=htFillDivTree("#child",personID,type);if(parents==undefined){htHideTree(1,2);return;}
var parentsId=parents.split('&');if(parentsId.length==0){htHideTree(1,2);return;}
type=(parentsId[2]=='t')?'theory':'hypothetical';var grandparents0=htFillDivTree("#father",parentsId[0],type);if(grandparents0==undefined){htHideTree(0,1);}else{var grandParentsId0=grandparents0.split('&');if(grandParentsId0.length!=3){htHideTree(0,1);}else{var grandpatype=(grandParentsId0[2]=='t')?'theory':'hypothetical';var secgrandparents0=htFillDivTree("#grandfather01",grandParentsId0[0],grandpatype);var secgrandparents1=htFillDivTree("#grandmother01",grandParentsId0[1],grandpatype);}}
var grandparents1=htFillDivTree("#mother",parentsId[1],type);if(grandparents1==undefined){htHideTree(0,2);}else{var grandParentsId1=grandparents1.split('&');if(grandParentsId1.length!=3){htHideTree(0,2);}else{type=(grandParentsId1[2]=='t')?'theory':'hypothetical';var secgrandparents2=htFillDivTree("#grandmother02",grandParentsId1[0],type);var secgrandparents3=htFillDivTree("#grandfather02",grandParentsId1[1],type);}}}
function htFillDivTree(divID,personID,type)
{if(personID==undefined||personID=="null"){$(divID).hide();return undefined;}
var name=personNameMap.get(personID);if(name==undefined){return undefined;}
$(divID).html("");var value=name;$(divID).append(value.substring(0,32));if(type=="theory"){$(divID).css('border-style','solid');$(divID).css('font-style','normal');}else{$(divID).css('border-style','dashed');$(divID).css('font-style','italic');}
$(divID).show();return familyMap.get(personID);}
function getRandomArbitrary(min,max){min=Math.ceil(min);max=Math.floor(max);return Math.floor(Math.random()*(max-min)+min);}