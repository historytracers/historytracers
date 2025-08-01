// SPDX-License-Identifier: GPL-3.0-or-later
// These functions need Chart JS to work

// https://stackoverflow.com/questions/11182924/how-to-check-if-javascript-object-is-json
var chartVectorConstructor = [].constructor;

function htPlotDefaultFiveConstantArray(value)
{
    return {
               data: [{
                     x: 1,
                     y: value
 //                    z: 8
                  },
                  {
                     x: 2,
                     y: value
                  },
                  {
                     x: 3,
                     y: value
                  },
                  {
                     x: 4,
                     y: value
                  },
                  {
                     x: 5,
                     y: value
                  }
               ],
               radius: 4,
            };
}

function htPlotConstantChart(dest, yValue, xLable, yLable)
{
    var values = [];
    if (yValue.constructor === chartVectorConstructor) {
        for (let i = 0 ; i < yValue.length; i++) {
            values.push( htPlotDefaultFiveConstantArray(yValue[i]) );
        }
    } else {
        values.push( htPlotDefaultFiveConstantArray(yValue) );
    }

    if ($("#"+dest).length < 0) {
        return;
    }

    const ctx = document.getElementById(dest).getContext("2d");
    var chartId = new Chart(ctx, {
         maintainAspectRatio: false,
         type: 'bubble',
         data: {
            labels: [xLable+" 1", xLable+" 2", xLable+" 3", xLable+" 4", xLable+" 5"],
            datasets: values,
         },
         options: {
            responsive: false,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: yLable
                    }
                },
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: xLable
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

function htPlotCallBack(val) {
    if (val < 0.99999 || val > 9999) {
        var local_lang = $("#site_language").val();
        return new Intl.NumberFormat(local_lang, { notation: "scientific" }).format(val);
    }

    return new Intl.NumberFormat(local_lang, { maximumFractionDigits: 2 }).format(val);
}

function htPlotConstantContinuousChart(options)
{
    if (options.datasets == undefined || options.xVector == undefined ) {
        return;
    }

    if (options.datasets.constructor !== chartVectorConstructor || options.xVector.constructor !== chartVectorConstructor) {
        return;
    }

    if ($("#"+options.chartId).length < 0) {
        return;
    }

    const ctx = document.getElementById(options.chartId).getContext("2d");
    var chartId = new Chart(ctx, {
        maintainAspectRatio: false,
        type : 'line',
        data : {
            labels : options.xVector,
            datasets : options.datasets,
                    radius: 4
        },
        options : {
            responsive: true,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: options.yLable
                    },
                    type: options.yType,
                    min: options.ymin,
                    max: options.ymax,
                    ticks: {
                        callback: (val) => {
                            return options.useCallBack ? htPlotCallBack(val) : val;
                        },
                    },
                },
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: options.xLable
                    },
                    type: options.xType,
                    ticks: {
                        callback: (val) => {
                            return options.useCallBack ? htPlotCallBack(val) : val;
                        },
                    },
                }
            },
            plugins: {
               legend: {
                    display: true
                }
            } 
        },
    });
}
