var chartVectorConstructor=[].constructor;function htPlotDefaultFiveConstantArray(value)
{return{data:[{x:1,y:value},{x:2,y:value},{x:3,y:value},{x:4,y:value},{x:5,y:value}],radius:4,};}
function htPlotConstantChart(dest,yValue,xLable,yLable)
{var values=[];if(yValue.constructor===chartVectorConstructor){for(let i=0;i<yValue.length;i++){values.push(htPlotDefaultFiveConstantArray(yValue[i]));}}else{values.push(htPlotDefaultFiveConstantArray(yValue));}
if($("#"+dest).length<0){return;}
const ctx=document.getElementById(dest).getContext("2d");var chartId=new Chart(ctx,{type:'bubble',data:{labels:[xLable+" 1",xLable+" 2",xLable+" 3",xLable+" 4",xLable+" 5"],datasets:values,},options:{responsive:false,scales:{y:{title:{display:true,text:yLable}},x:{beginAtZero:true,title:{display:true,text:xLable}}},plugins:{legend:{display:false}}},});}
function htPlotCallBack(val){if(val<0.99999||val>9999){var local_lang=$("#site_language").val();return new Intl.NumberFormat(local_lang,{notation:"scientific"}).format(val);}
return new Intl.NumberFormat(local_lang,{maximumFractionDigits:2}).format(val);}
function htPlotConstantContinuousChart(options)
{if(options.yVector==undefined||options.xVector==undefined){return;}
if(options.yVector.constructor!==chartVectorConstructor||options.xVector.constructor!==chartVectorConstructor){return;}
if($("#"+options.chartId).length<0){return;}
const ctx=document.getElementById(options.chartId).getContext("2d");var chartId=new Chart(ctx,{type:'line',data:{labels:options.xVector,datasets:[{data:options.yVector,label:options.yLable,fill:false}],radius:4},options:{responsive:false,scales:{y:{title:{display:true,text:options.yLable},type:options.yType,ticks:{callback:(val)=>{return htPlotCallBack(val);},},},x:{beginAtZero:true,title:{display:true,text:options.xLable},type:options.xType,ticks:{callback:(val)=>{return htPlotCallBack(val);},},}},plugins:{legend:{display:false}}},});}