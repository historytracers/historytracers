// SPDX-License-Identifier: GPL-3.0-or-later

function htSelectLabels() {
    var localLang = $("#site_language").val();
    if (localLang == "pt-BR") {
        return [ "Verbal", "Lógica", "Visual", "Musical", "Corporal", "Intrapessoal", "Interpessoal", "Naturalista", "Existencial"];
    } else if (localLang == "es-ES") {
        return [ "Verbal", "Lógica", "Visual", "Musical", "Corporal", "'Intrapersonal'", "Interpersonal", "Naturalista", "Existencial"];
    }
    
    return [ "Verbal", "Logical", "Visual", "Musical", "Bodily", "Intrapersonal", "Interpersonal", "Naturalistic", "Existential"];
}

function htPlotPie() {
    var htLabels = htSelectLabels();

    const ctx = document.getElementById("chart0").getContext("2d");
    var chartId = new Chart(ctx, {
        type : 'pie',
        data : {
            labels : htLabels,
            datasets: [{
                label: 'Inteligences',
                data: [1, 1, 1, 1, 1, 1, 1, 1, 1],
                backgroundColor: [
                  'rgb(255, 102, 102)',
                  'rgb(255, 178, 102)',
                  'rgb(255, 255, 102)',
                  'rgb(178, 255, 102)',
                  'rgb(0, 255, 255)',
                  'rgb(178, 102, 255)',
                  'rgb(255, 102, 178)',
                  'rgb(224, 224, 224)',
                  'rgb(204, 0, 102)'
                ],
            }],
            hoverOffset: 4
        } 
    });

}

function htLoadExercise() {
    $(document).ready(function() {
        htPlotPie();
        var divRadius = parseInt($(".htCircle").width());

        $(".htCircle").mouseenter(function(){
            $(this).animate({ width: 2*divRadius, height: 2*divRadius });
        }).mouseleave(function(){
            $(this).animate({ width: divRadius, height: divRadius });
        });
    });
    return false;
}

