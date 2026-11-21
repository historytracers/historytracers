// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }
}

function htLoadContent() {
    htWriteNavigation();

    var symbolLabels = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ];
    var symbolValues = [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ];

    if ($("#chart1").length > 0) {
        var canvas1 = document.getElementById("chart1");
        var existingChart1 = Chart.getChart(canvas1);
        if (existingChart1) {
            existingChart1.destroy();
        }

        new Chart(canvas1.getContext("2d"), {
            type : "bar",
            data : {
                labels : symbolLabels,
                datasets : [{
                    data : symbolValues,
                    label : mathKeywords[19],
                    backgroundColor : "#E67E22",
                    borderColor : "#A85B1E",
                    borderWidth : 1
                }]
            },
            options : {
                responsive : true,
                maintainAspectRatio : true,
                aspectRatio : 1.5,
                scales : {
                    y : {
                        min : 0,
                        max : 2,
                        ticks : {
                            stepSize : 1
                        },
                        title : {
                            display : true,
                            text : mathKeywords[19]
                        }
                    },
                    x : {
                        title : {
                            display : true,
                            text : mathKeywords[18]
                        }
                    }
                },
                plugins : {
                    legend : {
                        display : false
                    }
                }
            }
        });
    }

    var verseLabels = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ];
    var verseDatasets = [];
    for (var square = 0; square < 5; square++) {
        var squareValues = [];
        for (var verse = 0; verse < verseLabels.length; verse++) {
            squareValues.push(1);
        }
        verseDatasets.push({
            data : squareValues,
            label : mathKeywords[21],
            backgroundColor : (square % 2 == 0) ? "#E67E22" : "#F5B041",
            borderColor : "#5A2D0C",
            borderWidth : 1,
            borderSkipped : false
        });
    }

    if ($("#chart2").length > 0) {
        var canvas2 = document.getElementById("chart2");
        var existingChart2 = Chart.getChart(canvas2);
        if (existingChart2) {
            existingChart2.destroy();
        }

        new Chart(canvas2.getContext("2d"), {
            type : "bar",
            data : {
                labels : verseLabels,
                datasets : verseDatasets
            },
            options : {
                responsive : true,
                maintainAspectRatio : true,
                aspectRatio : 1.5,
                scales : {
                    y : {
                        stacked : true,
                        min : 0,
                        max : 10,
                        ticks : {
                            stepSize : 1
                        }
                    },
                    x : {
                        stacked : true,
                        title : {
                            display : true,
                            text : mathKeywords[20]
                        }
                    }
                },
                plugins : {
                    legend : {
                        display : false
                    }
                }
            }
        });
    }

    var lineLabels = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    var lineDatasets = [];
    for (var hieroglyph = 0; hieroglyph < 2; hieroglyph++) {
        var hieroglyphValues = [];
        for (var line = 0; line < lineLabels.length; line++) {
            hieroglyphValues.push(1);
        }
        lineDatasets.push({
            data : hieroglyphValues,
            label : mathKeywords[22],
            backgroundColor : (hieroglyph % 2 == 0) ? "#E67E22" : "#F5B041",
            borderColor : "#5A2D0C",
            borderWidth : 1,
            borderSkipped : false
        });
    }

    if ($("#chart3").length > 0) {
        var canvas3 = document.getElementById("chart3");
        var existingChart3 = Chart.getChart(canvas3);
        if (existingChart3) {
            existingChart3.destroy();
        }

        new Chart(canvas3.getContext("2d"), {
            type : "bar",
            data : {
                labels : lineLabels,
                datasets : lineDatasets
            },
            options : {
                responsive : true,
                maintainAspectRatio : true,
                aspectRatio : 1.5,
                scales : {
                    y : {
                        stacked : true,
                        min : 0,
                        max : 10,
                        ticks : {
                            stepSize : 1
                        }
                    },
                    x : {
                        stacked : true,
                        title : {
                            display : true,
                            text : mathKeywords[23]
                        }
                    }
                },
                plugins : {
                    legend : {
                        display : false
                    }
                }
            }
        });
    }



    htSetImageSrc("imgCopanStelaA", "images/Copan/StelaACopan.jpg");
    return false;
}

function htCheckAnswers()
{
    if (localAnswerVector != undefined) {
        for (let i = 0; i < localAnswerVector.length; i++) {
            htCheckExerciseAnswer("exercise"+i, localAnswerVector[i], "#answer"+i, "#explanation"+i);
        }
    }
}

