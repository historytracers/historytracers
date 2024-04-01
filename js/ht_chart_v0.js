// SPDX-License-Identifier: GPL-3.0-or-later

// https://stackoverflow.com/questions/11182924/how-to-check-if-javascript-object-is-json
var chartVectorConstructor = [].constructor;

// This function needs Chart JS to work
function htPlotPoemChart(dest, yValue)
{
    var lang = htDetectLanguage();
    var verse = (lang == "en-US" )? "verse" : "verso";
    var syllable = (lang == "en-US" )? "syllable" : "sílaba";

    var values = [];
    if (yValue.constructor === chartVectorConstructor) {
        for (let i = 0 ; i < yValue.length; i++) {
            values.push( htPlotPoemChartElement(yValue[i]) );
        }
    } else {
        values.push( htPlotPoemChartElement(yValue) );
    }

    const ctx = document.getElementById(dest).getContext("2d");
    var chartId = new Chart(ctx, {
         type: 'bubble',
         data: {
            labels: [verse+" 1", verse+" 2", verse+" 3", verse+" 4", verse+" 5"],
            datasets: values,
         },
         options: {
            responsive: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: syllable
                    }
                },
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: verse
                    }
                }
            },
            plugins: {
               legend: {
                    display: false
                }
            } 
         },
    });
}
