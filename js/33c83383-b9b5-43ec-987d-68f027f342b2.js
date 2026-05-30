// SPDX-License-Identifier: GPL-3.0-or-later

var localAnswerVector = undefined;

function htLoadExercise() {
    if (localAnswerVector == undefined) {
        localAnswerVector = htLoadAnswersFromExercise();
    } else {
        htResetAnswers(localAnswerVector);
    }

    htSetImageSrc("catsCirusUrraca", "images/HistoryTracers/CatsCirusUrraca.jpg");
    htSetImageSrc("dogFadinha", "images/HistoryTracers/CadelaOwner.jpg");
    htSetImageSrc("img1", "images/Copan/Temple16Copan.png");
    htSetImageSrc("imgChimp", "images/TaiChimpanzeeProject/c4b711_0ebd581742a8483e90a28c521cadd3cb~mv2.jpeg");
    htSetImageSrc("imgDNA", "images/HistoryTracers/DNA.png");
    htSetImageSrc("imgDon", "images/DonsMaps/img_6463willendorf.jpg");
    htSetImageSrc("imgFlore", "images/DonsMaps/dsc03345flores.jpg");
    htSetImageSrc("imgHe", "images/DonsMaps/img_6776erectusdmanisi.jpg");

    htSetImageSrc("imgHh", "images/DonsMaps/img_6652habilissm.jpg");
    htSetImageSrc("imgHh1", "images/DonsMaps/img_6652habilissm.jpg");
    htSetImageSrc("imgHNaledi", "images/eLife/elife-09560-fig1-v1.jpg");
    htSetImageSrc("imgHr", "images/DonsMaps/img_6647rudolfensis.jpg");
    htSetImageSrc("imgHr0", "images/DonsMaps/img_6647rudolfensis.jpg");
    htSetImageSrc("imgHr1", "images/DonsMaps/img_6647rudolfensis.jpg");
    htSetImageSrc("imgHs0", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs1", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs2", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs3", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs4", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs5", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs6", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs7", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs9", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("imgNean", "images/DonsMaps/img_6801ferrassie.jpg");
    htSetImageSrc("imgPb", "images/DonsMaps/img_6709boisei406.jpg");
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png");
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

function htLoadContent() {
    htWriteNavigation();
    htAddTreeReflection("#myFirstReflection", 55);
    $("#htChinaZhongguo").html(keywords[137]);

    htSetImageSrc("catsCirusUrraca", "images/HistoryTracers/CatsCirusUrraca.jpg");
    htSetImageSrc("dogFadinha", "images/HistoryTracers/CadelaOwner.jpg");
    htSetImageSrc("img1", "images/Copan/Temple16Copan.png");
    htSetImageSrc("imgChimp", "images/TaiChimpanzeeProject/c4b711_0ebd581742a8483e90a28c521cadd3cb~mv2.jpeg");
    htSetImageSrc("imgDNA", "images/HistoryTracers/DNA.png");
    htSetImageSrc("imgDon", "images/DonsMaps/img_6463willendorf.jpg");
    htSetImageSrc("imgFlore", "images/DonsMaps/dsc03345flores.jpg");
    htSetImageSrc("imgHe", "images/DonsMaps/img_6776erectusdmanisi.jpg");

    htSetImageSrc("imgHh", "images/DonsMaps/img_6652habilissm.jpg");
    htSetImageSrc("imgHh1", "images/DonsMaps/img_6652habilissm.jpg");
    htSetImageSrc("imgHNaledi", "images/eLife/elife-09560-fig1-v1.jpg");
    htSetImageSrc("imgHr", "images/DonsMaps/img_6647rudolfensis.jpg");
    htSetImageSrc("imgHr0", "images/DonsMaps/img_6647rudolfensis.jpg");
    htSetImageSrc("imgHr1", "images/DonsMaps/img_6647rudolfensis.jpg");
    htSetImageSrc("imgHs0", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs1", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs2", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs3", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs4", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs5", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs6", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs7", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgHs9", "images/MexicoCityMuseo/HomoSapiens.jpg");
    htSetImageSrc("imgLH", "images/HistoryTracers/Left_Hand.png");
    htSetImageSrc("imgNean", "images/DonsMaps/img_6801ferrassie.jpg");
    htSetImageSrc("imgPb", "images/DonsMaps/img_6709boisei406.jpg");
    htSetImageSrc("imgRH", "images/HistoryTracers/Right_Hand.png");
    return false;
}
