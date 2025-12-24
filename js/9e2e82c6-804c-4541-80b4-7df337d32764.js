// SPDX-License-Identifier: GPL-3.0-or-later

//         "additionalInfo": "À medida que diminuímos a quantidade final de tortilhas, estamos fazendo tortilhas maiores, pois todas possuem a mesma quantidade inicial de massa. Dessa forma, 320 dividido por 2 é igual a 160, que por sua vez é o dobro do tamanho obtido quando dividimos por 4, o qual é o dobro de 2.<br />Além disso, ressaltamos que, pela primeira vez, efetuamos a divisão das unidades, pois elas não foram utilizadas junto com as dezenas.<br />Por último, destacamos que, como temos resto zero, isso indica que 320 é múltiplo de 2, assim como de 4 e de 5.<br /><p><table style=\"width: 30%; margin-left: auto; margin-right: auto; font-weight: none; border-collapse: collapse;\"><tr><td>&nbsp; 320 </td><td style=\"border-bottom: 2px solid black; border-left: 2px solid black;\"> 2 </td></tr><tr><td style=\"border-bottom: 2px solid black;\">- 200 </td><td>160</td></tr><tr><td>&nbsp; 120 </td><td> &nbsp; </td></tr><tr><td style=\"border-bottom: 2px solid black;\">- 120 </td><td> &nbsp; </td></tr> <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 0</td><td> &nbsp; </td></tr> <tr><td style=\"border-bottom: 2px solid black;\">- &nbsp;&nbsp;&nbsp; 0 </td><td> &nbsp; </td></tr>  <tr><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 0</td><td> &nbsp; </td></tr></table></p>"

var working = 0;
var stopValue = 0;
var workingValue = 0;

var divisor = 1;
var use = "";
var idx = 2;
var results = "";

var dividend = 0;
var strDividendValue = "";

function htUpdateView(end) {
    var localUse = divisor * workingValue;

    var sign = "&nbsp; ";
    if (end) {
        for (let i = localUse.toString().length; i < strDividendValue.length; i++) {
            localUse *= 10;
        }
        sign = "- ";
    }

    $("#tc1f"+idx).html(sign+""+localUse);
    if (end) {
        var res = idx + 1;
        $("#tc1f"+res).html("&nbsp; "+(dividend - localUse));
    }
}

function htMoveDivAhead() {
    results = results + stopValue.toString();
    idx += 2;
}

function htDivisionUpdateValue(n)
{
    if (workingValue == stopValue) {
        htUpdateView(true);
        htMoveDivAhead();
        return false;
    }

    workingValue += parseInt(n);
    if (workingValue > 9) {
        workingValue = 9;
    } else if (workingValue < 0) {
        workingValue = 0;
    }

    
    $("#tc2f2").html(results+workingValue);

    if (workingValue == stopValue) {
        htUpdateView(true);
        htMoveDivAhead();
        return false;
    }

    htUpdateView(false);

    return false;
}

function htNewDivision() {
    workingValue = 0;
    working = dividend = htGetRandomArbitrary(10, 999);
    strDividendValue = dividend.toString();

    divisor = htGetRandomArbitrary(1, 9);

    use = (parseInt(strDividendValue[0]) < divisor) ? strDividendValue[0]+""+strDividendValue[1] : strDividendValue[0];
    stopValue = parseInt(parseInt(use) / divisor);

    $("#tc1fd1").html("&nbsp; "+dividend);
    $("#tc2fds1").html("&nbsp; "+divisor);

    $("#tc2f2").html(workingValue);


    $("#tc1f8").html(mathKeywords[35]+" <b>"+use+" ÷ "+divisor+"</b><br />"+mathKeywords[36]);
}

function htDivisionAddCommonTable(id) {
    var end = 7;
    for (let i =1; i <= end; i++) {
        var controls = "";
        if (i == 1) {
            controls = "<td id=\"tc5f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-up upArrowWithFA\" id=\"traineeUp"+id+"\" onclick=\"htDivisionUpdateValue(+1);\"></i> </td><td id=\"tc6f"+i+"\" rowspan=\""+end+"\"><i class=\"fa-solid fa-caret-down downArrowWithFA\" id=\"traineeDown"+id+"\" onclick=\"htDivisionUpdateValue(-1);\"></i></td>";
        }
        var border = ((i % 2)) ? "style=\"border:none;\"" : "style=\"border:none;border-bottom: 2pt solid black;\"";
        var border2 = (i != 1) ? "style=\"border:none;\"" : "style=\"border:none;border-bottom: 2pt solid black; border-left: 2px solid black;\"";
        $("#yupana"+id+" tr:last").after("<tr id=\"tf"+i+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+i+"\" "+border+"><span id=\"tc1fd"+i+"\">&nbsp;</span></td> <td id=\"tc2f"+i+"\" "+border2+" ><span id=\"tc2fds"+i+"\">&nbsp;</span></td>"+controls+"</tr>");
    }
}

function htDivisionDescRow(id) {
    var imgID = 8;
    $("#yupana"+id+" tr:last").after("<tr id=\"tf"+imgID+"\" class=\"trCanBeRemoved\"><td id=\"tc1f"+imgID+"\" colspan=\"2\"></td><td id=\"tc5f"+imgID+"\" style=\"background-color: white;\" colspan=\"2\"><i class=\"fa-solid fa-chevron-right\" style=\"font-size:3.0em;\" onclick=\"htNewDivision();\"></i></td></tr>");
}

function htLoadContent() {
    htWriteNavigation();

    htDivisionAddCommonTable("0");
    htDivisionDescRow("0");

    htNewDivision();
    return false;
}
