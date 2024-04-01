// SPDX-License-Identifier: GPL-3.0-or-later

var yupanaSelectors = [ -1,  4,  3,  2,  4,  1,  1,  1, 1,  1,
                        -1, -1, -1, -1,  2, -1,  4,  3, 2,  2,
                        -1, -1, -1, -1, -1, -1, -1, -1, -1, 4];

var yupanArr = [ ];


function htSplitDecimalDigit(output, maxIdx, value, base)
{
    while (value != 0) {
        var rest = value % base;
        value = Math.trunc(value / base);
        $(output+""+maxIdx).html(rest);
        maxIdx--;
    }
}

function htFillYupanaDecimalValues(dividend, rows, outputColumn)
{
    if (dividend > 99999 || dividend < 0) {
        dividend = 0;
    }

    var start = 10 ** (rows - 1);
    var top2bottom = 1;
    while (start > dividend) {
        $("#tc"+outputColumn+"f"+top2bottom).html("0");
        start /= 10;
        top2bottom++;
    }

    var bottom2top = rows;
    while (dividend != 0) {
        var rest = dividend % 10;
        dividend = Math.trunc(dividend / 10);
        $("#tc"+outputColumn+"f"+bottom2top).html(rest);
        

        for (let sel = rest ; sel < 30; sel += 10) {
            if (yupanaSelectors[sel] < 0 ) {
                continue;
            }

            var idx = yupanaSelectors[sel];
            $("#tc"+idx+"f"+bottom2top).append("<span id=\"marktc"+sel+"\" class=\"dot red_dot_center_up\"></span>");
            yupanArr.push(sel);
        }
        bottom2top--;
    }
}

function htCleanYupanaDecimalValues(rows, outputColumn)
{
    for (let i = 1; i <= rows; i++) {
        $("#tc"+outputColumn+"f"+i).html(" ");
    }

    for (let i = 0; i < yupanArr.length; i++ ) {
        $("#marktc"+yupanArr[i]).remove();
    }

    yupanArr = [ ];
}

function htFillMesoamericanVigesimalValues(dividend, rows, outputColumn)
{
    if (dividend > 3199999 || dividend < 0) {
        dividend = 0;
    }

    var start = 20 ** (rows - 1);
    var top2bottom = 1;
    while (start > dividend) {
        $("#tmc"+outputColumn+"l"+top2bottom).html("0");
        $("#tmc1l"+top2bottom).attr('src', 'images/Maya_0.png');
        start /= 20;
        top2bottom++;
    }

    var bottom2top = rows;
    while (dividend != 0) {
        var rest = dividend % 20;
        dividend = Math.trunc(dividend / 20);
        $("#tmc"+outputColumn+"l"+bottom2top).html(rest);

        $("#tmc1l"+bottom2top).attr('src', 'images/Maya_'+rest+'.png');
        
        bottom2top--;
    }
}

function htCleanMesoamericanVigesimalValues(rows, outputColumn)
{
    for (let i = 1; i <= rows; i++) {
        $("#tmc"+outputColumn+"l"+i).html(" ");
        $("#tmc1l"+i).attr('src', '');
    }
}

