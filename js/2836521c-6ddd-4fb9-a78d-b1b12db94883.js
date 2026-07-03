// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
   htWriteNavigation();
   $("#htChinaZhongguo").html(keywords[137]);
   $("#htJapanNipponNihonKoku").html(keywords[139]);

   htWriteMultiplicationTable("#mParent2", 2);

    $(".multexample").hover(function(){
        var id = $(this).attr("id");
        htChangeMultUniqueDigitStyle(id, "red");
    }, function(){
        var id = $(this).attr("id");
        htChangeMultUniqueDigitStyle(id, "black");
    });

   return false;
}
