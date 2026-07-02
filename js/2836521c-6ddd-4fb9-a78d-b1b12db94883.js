// SPDX-License-Identifier: GPL-3.0-or-later

function htLoadContent() {
   htWriteNavigation();
   $("#htChinaZhongguo").html(keywords[137]);
   $("#htJapanNipponNihonKoku").html(keywords[139]);

   htWriteMultiplicationTable("#mParent2", 2);

   return false;
}
