// SPDX-License-Identifier: GPL-3.0-or-later

var localCounter687ee328 = 0;

function htLoadExercise() {
    localCounter687ee328 = 0;
    localCounter687ee328 = htModifyArrow('.htUpArrow', localCounter687ee328);
    localCounter687ee328 = htModifyArrow('.htDownArrow', localCounter687ee328);

    $(".htUpArrow").on("click", function() {
        localCounter687ee328++;
        localCounter687ee328 = htModifyArrow('.htUpArrow', localCounter687ee328);
        localCounter687ee328 = htModifyArrow('.htDownArrow', localCounter687ee328);

        htSetImageForDigits('#leftHandImg', '#rightHandImg', localCounter687ee328);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounter687ee328, 1, 'red_dot_right_up');
    });

    $(".htDownArrow").on("click", function() {
        localCounter687ee328--;
        localCounter687ee328 = htModifyArrow('.htDownArrow', localCounter687ee328);
        localCounter687ee328 = htModifyArrow('.htUpArrow', localCounter687ee328);

        htSetImageForDigits('#leftHandImg', '#rightHandImg', localCounter687ee328);
        htCleanYupanaDecimalValues('#yupana0', 5);
        htFillYupanaDecimalValues('#yupana0', localCounter687ee328, 1, 'red_dot_right_up');
    });

    return false;
}

function htCheckAnswers()
{
    return false;
}

