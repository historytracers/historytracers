function htPlotPoemChart(dest, yValue)
{
    var lang = htDetectLanguage();
    var verse = (lang == "en-US" )? "verse" : "verso";
    var syllable = (lang == "en-US" )? "syllable" : "sílaba";

    const ctx = document.getElementById(dest).getContext("2d");
    var chartId = new Chart(ctx, {
         type: 'bubble',
         data: {
            labels: [verse+" 1", verse+" 2", verse+" 3", verse+" 4", verse+" 5"],
            datasets: [{
               data: [{
                     x: 1,
                     y: yValue,
                     z: 20
                  },
                  {
                     x: 2,
                     y: yValue,
                     z: 20
                  },
                  {
                     x: 3,
                     y: yValue,
                     z: 20
                  },
                  {
                     x: 4,
                     y: yValue,
                     z: 20
                  },
                  {
                     x: 5,
                     y: yValue,
                     z: 20
                  }
               ],
               backgroundColor: ['lightblue'],
               borderColor: ['lightblue'],
               radius: 8,
            }],
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

function htLoadExercise() {
    $("#btncheck").val(keywords[29]);
    $("#btnnew").val(keywords[30]);

    for (let i = 0; i < 14; i += 2) {
        $("#lblans"+i).text(keywords[31]);
        $("#lblans"+(i+1)).text(keywords[32]);
    }

    for (let i = 0; i < 7; i++) {
        $("#answer"+i).text("");
        $("input[name=exercise"+i+"]").prop("checked", false);
    }


    htPlotPoemChart('chart0', 10);
    htPlotPoemChart('chart1', 7);

    return false;
}

function htCheckExercise(val0, val1, answer) {
    var ans = parseInt($("input[name="+val0+"]:checked").val());
    var text = "";
    var format = "";
    if (ans == val1) {
        text = keywords[27];
        format = "green";
    } else {
        text = keywords[28];
        format = "red";
    }
    $(answer).text(text);
    $(answer).css("color", format);

    return false;
}

function htCheckAnswers()
{
    var vector = [ 1, 1, 1, 1, 1, 1, 1 ];
    for (let i = 0; i < vector.length; i++) {
        htCheckExercise("exercise"+i, vector[i], "#answer"+i);
    }
}
