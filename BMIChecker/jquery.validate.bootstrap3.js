function initializeValidator() {
    "use strict";
    // Validatorの初期値を変更します
    $.validator.setDefaults({
        // NG項目のclass
        errorClass: 'has-error',
        // OK項目のclass
        validClass: 'has-success',
        // 入力チェックNGの場合、項目のform-groupにerrorClassを設定します
        highlight: function (element, errorClass, validClass) {
            $(element).closest('.form-group').addClass(errorClass).removeClass(validClass);
        },
        // 入力チェックOKの場合、項目のform-groupにvalidClassを設定します
        unhighlight: function (element, errorClass, validClass) {
            $(element).closest('.form-group').removeClass(errorClass).addClass(validClass);
        }
    });
}

function setValidator(rules, messages) {
    "use strict";


    // ページ内のすべてのフォームにValidatorを設定します
    $('form').each(function (index, element) {
        var $form = $(element);
        //var validator = $form.validate();
        var validator = $form.validate({
            rules: rules,
            messages: messages
        });

        // フォームがresetされたときの処理
        $form.bind('reset', function () {
            // Validatorをリセットします
            validator.resetForm();
            // フォーム内のすべてのform-groupからerrorClassとvalidClassを削除します
            $form.find('.form-group').each(function (index, element) {
                $(element).removeClass($.validator.defaults.errorClass).removeClass($.validator.defaults.validClass);
            });
        });
    });
}

//// 初期化処理
//(function($) {
//    initializeValidator();
//}(jQuery));

//// DOM構築後の処理
//$(function () {
//    setValidator();
//});

$(document).ready(function() {
    initializeValidator();

    var numbers =[111, 222, 333];
    $.validator.addMethod("uniqueNumber",
        function (value, element) {
            return $.inArray(Number(value), numbers) < 0;
        },
        "既に使われている番号です"
    );

    var rules = {
        //name: { required: true, digits: true, minlength: 2, uniqueNumber: true }
        //email: { required: true, email: true },
        //url: { url: true }
        name: { uniqueNumber: true }
    };

    var messages = {
        name: {
            required: '名前は必須入力です',
            digits: '数字で入力してください',
                    minlength: $.validator.format('{0}文字以上で入力してください')
        },
        email: {
            required: 'メールアドレスは必須入力です',
            email: '有効なメールアドレスを入力してください'
        },
        url: {
            url: '有効なURLを入力してください'
        },
        comment: {
            required: 'コメントは必須入力です'
        }
    };
    setValidator(rules, messages);
});
