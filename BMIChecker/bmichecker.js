/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="scripts/typings/jquery.validation/jquery.validation.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Helper = (function () {
    function Helper() {
    }
    Helper.parseToNaturalNumber = function (text) {
        if (text == null)
            return null;
        var result = Number(text);
        return result < 0 ? null : result;
    };
    Helper.average = function (value1, value2) {
        return (value1 + value2) / 2.0;
    };
    return Helper;
})();
var BootstrapValidator = (function () {
    function BootstrapValidator(rules, messages) {
        this.initialize();
        this.set(rules, messages);
    }
    BootstrapValidator.prototype.initialize = function () {
        "use strict";
        $.validator.setDefaults({
            errorClass: 'has-error',
            validClass: 'has-success',
            highlight: function (element, errorClass, validClass) {
                $(element).closest('.form-group').addClass(errorClass).removeClass(validClass);
            },
            unhighlight: function (element, errorClass, validClass) {
                $(element).closest('.form-group').removeClass(errorClass).addClass(validClass);
            }
        });
    };
    BootstrapValidator.prototype.set = function (rules, messages) {
        "use strict";
        $('form').each(function (_, element) {
            var $form = $(element);
            var validator = $form.validate({
                rules: rules,
                messages: messages
            });
            $form.bind('reset', function () {
                validator.resetForm();
                $form.find('.form-group').each(function (_, element) {
                    return $(element).removeClass($.validator.defaults.errorClass)
                        .removeClass($.validator.defaults.validClass);
                });
            });
        });
    };
    return BootstrapValidator;
})();
var IndexDetail = (function () {
    function IndexDetail(level, from, to, description) {
        this.level = level;
        this.from = from;
        this.to = to;
        this.description = description;
    }
    Object.defineProperty(IndexDetail.prototype, "centerValue", {
        get: function () {
            return this.from == null ? this.to
                : ((this.to == null) ? this.from
                    : Helper.average(this.from, this.to));
        },
        enumerable: true,
        configurable: true
    });
    IndexDetail.prototype.toTableRow = function () {
        return $('<tr>').attr("class", this.classText)
            .append('<td>' + this.fromText + " " + this.toText + '</td>')
            .append('<td>' + this.description + '</td>');
    };
    Object.defineProperty(IndexDetail.prototype, "classText", {
        get: function () {
            return IndexDetail.classTexts[this.ordinalNumber];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexDetail.prototype, "fromText", {
        get: function () {
            return this.from == null ? " " : this.from.toString() + "以上";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexDetail.prototype, "toText", {
        get: function () {
            return this.to == null ? " " : this.to.toString() + "未満";
        },
        enumerable: true,
        configurable: true
    });
    IndexDetail.levelToOrdinalNumber = function (level) {
        return level + 2;
    };
    Object.defineProperty(IndexDetail.prototype, "ordinalNumber", {
        get: function () {
            return IndexDetail.levelToOrdinalNumber(this.level);
        },
        enumerable: true,
        configurable: true
    });
    IndexDetail.classTexts = [
        "thinWeight2",
        "thinWeight1",
        "normalWeight",
        "overWeight1",
        "overWeight2",
        "overWeight3",
        "overWeight4"
    ];
    return IndexDetail;
})();
var IndexKind;
(function (IndexKind) {
    IndexKind[IndexKind["Kaup"] = 0] = "Kaup";
    IndexKind[IndexKind["Rohrer"] = 1] = "Rohrer";
    IndexKind[IndexKind["BodyMass"] = 2] = "BodyMass";
})(IndexKind || (IndexKind = {}));
var Index = (function () {
    function Index(kind, name, description, details) {
        this.kind = kind;
        this.name = name;
        this.description = description;
        this.details = details;
    }
    Object.defineProperty(Index.prototype, "normalValue", {
        get: function () {
            return this.details[IndexDetail.levelToOrdinalNumber(0)].centerValue;
        },
        enumerable: true,
        configurable: true
    });
    Index.prototype.getDescription = function (indexValue) {
        var ordinalNumber = this.getOrdinalNumber(indexValue);
        return ordinalNumber == null ? "" : this.details[ordinalNumber].description;
    };
    Index.prototype.getClassText = function (indexValue) {
        var ordinalNumber = this.getOrdinalNumber(indexValue);
        return ordinalNumber == null ? "" : this.details[ordinalNumber].classText;
    };
    Index.prototype.toOption = function (value) {
        return $("<option>").val(value).text(this.description);
    };
    Index.prototype.toTable = function (visible) {
        if (visible === void 0) { visible = false; }
        var table = $('<table>').attr("id", this.tableID).attr("class", "table - bordered");
        var caption = $('<caption>').html(this.captionText);
        table.append(caption);
        var th = $('<tr>').append('<th>指標</th>').append('<th>判定</th>');
        table.append($('<thead>').append(th));
        var tbody = $('<tbody>');
        $.each(this.details, function (ordinalNumber, indexDetail) { return tbody.append(indexDetail.toTableRow()); });
        table.append(tbody);
        visible ? table.show() : table.hide();
        return table;
    };
    Index.calculateKaupIndex = function (height, weight) {
        return this.calculateBodyMassIndex(height, weight);
    };
    Index.calculateRohrerIndex = function (height, weight) {
        return weight * 10.0 / height / height / height;
    };
    Index.calculateBodyMassIndex = function (height, weight) {
        return weight / height / height;
    };
    Index.calculateKaupStandardWeight = function (height, normalValue) {
        return this.calculateBodyMassStandardWeight(height, normalValue);
    };
    Index.calculateRohrerStandardWeight = function (height, normalValue) {
        return normalValue * height * height * height / 10.0;
    };
    Index.calculateBodyMassStandardWeight = function (height, normalValue) {
        return normalValue * height * height;
    };
    Object.defineProperty(Index.prototype, "tableID", {
        get: function () {
            return this.name + "Table";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Index.prototype, "captionText", {
        get: function () {
            return this.linkText + ' &mdash; ' + this.description;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Index.prototype, "linkText", {
        get: function () {
            return '<a href="' + this.url() + '" target="_top">' + this.kindText() + '</a>';
        },
        enumerable: true,
        configurable: true
    });
    Index.prototype.getOrdinalNumber = function (indexValue) {
        for (var ordinalNumber = 0; ordinalNumber < this.details.length; ordinalNumber++) {
            var from = this.details[ordinalNumber].from;
            var to = this.details[ordinalNumber].to;
            if ((from == null && indexValue < to) ||
                (from <= indexValue && to == null) ||
                (from <= indexValue && indexValue < to))
                return ordinalNumber;
        }
        return null;
    };
    return Index;
})();
var KaupIndex = (function (_super) {
    __extends(KaupIndex, _super);
    function KaupIndex(name, description, details) {
        _super.call(this, IndexKind.Kaup, name, description, details);
    }
    KaupIndex.prototype.calculate = function (height, weight) {
        return Index.calculateKaupIndex(height, weight);
    };
    KaupIndex.prototype.calculateStandardWeight = function (height) {
        return Index.calculateKaupStandardWeight(height, this.normalValue);
    };
    KaupIndex.prototype.kindText = function () {
        return "カウプ指数";
    };
    KaupIndex.prototype.url = function () {
        return "https://ja.wikipedia.org/wiki/%E3%83%8E%E3%83%BC%E3%83%88:%E3%82%AB%E3%82%A6%E3%83%97%E6%8C%87%E6%95%B0";
    };
    return KaupIndex;
})(Index);
var RohrerIndex = (function (_super) {
    __extends(RohrerIndex, _super);
    function RohrerIndex(name, description, details) {
        _super.call(this, IndexKind.Rohrer, name, description, details);
    }
    RohrerIndex.prototype.calculate = function (height, weight) {
        return Index.calculateRohrerIndex(height, weight);
    };
    RohrerIndex.prototype.calculateStandardWeight = function (height) {
        return Index.calculateRohrerStandardWeight(height, this.normalValue);
    };
    RohrerIndex.prototype.kindText = function () {
        return "ローレル指数";
    };
    RohrerIndex.prototype.url = function () {
        return "https://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%AC%E3%83%AB%E6%8C%87%E6%95%B0";
    };
    return RohrerIndex;
})(Index);
var BodyMassIndex = (function (_super) {
    __extends(BodyMassIndex, _super);
    function BodyMassIndex(name, description, details) {
        _super.call(this, IndexKind.BodyMass, name, description, details);
    }
    Object.defineProperty(BodyMassIndex.prototype, "normalValue", {
        get: function () {
            return 22.0;
        },
        enumerable: true,
        configurable: true
    });
    BodyMassIndex.prototype.calculate = function (height, weight) {
        return Index.calculateBodyMassIndex(height, weight);
    };
    BodyMassIndex.prototype.calculateStandardWeight = function (height) {
        return Index.calculateBodyMassStandardWeight(height, this.normalValue);
    };
    BodyMassIndex.prototype.kindText = function () {
        return "BMI (ボディマス指数)";
    };
    BodyMassIndex.prototype.url = function () {
        return "https://ja.wikipedia.org/wiki/%E3%83%9C%E3%83%87%E3%82%A3%E3%83%9E%E3%82%B9%E6%8C%87%E6%95%B0";
    };
    return BodyMassIndex;
})(Index);
var IndexData = (function () {
    function IndexData() {
        this._selected = IndexData.defaultOrdinalNumber;
    }
    Object.defineProperty(IndexData.prototype, "captionText", {
        get: function () {
            return this.selectedIndex.captionText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexData.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        set: function (value) {
            this._selected = value;
            this.showTable(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexData.prototype, "selectedIndex", {
        get: function () {
            return IndexData.indexes[this.selected];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(IndexData.prototype, "normalValue", {
        get: function () {
            return this.selectedIndex.normalValue;
        },
        enumerable: true,
        configurable: true
    });
    IndexData.prototype.calculate = function (height, weight) {
        return this.selectedIndex.calculate(height, weight);
    };
    IndexData.prototype.calculateStandardWeight = function (height) {
        return this.selectedIndex.calculateStandardWeight(height);
    };
    IndexData.prototype.getDescription = function (indexValue) {
        return this.selectedIndex.getDescription(indexValue);
    };
    IndexData.prototype.getClassText = function (indexValue) {
        return this.selectedIndex.getClassText(indexValue);
    };
    IndexData.prototype.initializeAgeDropdownList = function (ageDropdownList, ordinalNumber) {
        $.each(IndexData.indexes, function (ordinalNumber, index) { return ageDropdownList.append(index.toOption(ordinalNumber)); });
        ageDropdownList.val(IndexData.getOrdinalNumber(ordinalNumber));
    };
    IndexData.prototype.createTables = function (element, ordinalNumber) {
        var selectedOrdinalNumber = IndexData.getOrdinalNumber(ordinalNumber);
        $.each(IndexData.indexes, function (ordinalNumber, index) { return element.append(index.toTable(ordinalNumber == selectedOrdinalNumber)); });
    };
    IndexData.prototype.showTable = function (ageIndex) {
        $.each(IndexData.indexes, function (ordinalNumber, index) {
            var table = $("#" + index.tableID);
            ordinalNumber == ageIndex ? table.show() : table.hide();
        });
    };
    Object.defineProperty(IndexData, "defaultOrdinalNumber", {
        get: function () {
            return IndexData.indexes.length - 1;
        },
        enumerable: true,
        configurable: true
    });
    IndexData.getOrdinalNumber = function (ordinalNumber) {
        return ordinalNumber == null ? IndexData.defaultOrdinalNumber : ordinalNumber;
    };
    IndexData.indexes = [
        new KaupIndex("kaup1", "乳児 (3か月以上)", [new IndexDetail(-2, null, 14.5, "やせすぎ"),
            new IndexDetail(-1, 14.5, 16.0, "やせぎみ"),
            new IndexDetail(0, 16.0, 18.0, "普通"),
            new IndexDetail(1, 18.0, 20.0, "太りぎみ"),
            new IndexDetail(2, 20.0, null, "太りすぎ")]),
        new KaupIndex("kaup2", "幼児 (1歳以上 1歳6か月未満)", [new IndexDetail(-2, null, 14.5, "やせすぎ"),
            new IndexDetail(-1, 14.5, 15.5, "やせぎみ"),
            new IndexDetail(0, 15.5, 17.5, "普通"),
            new IndexDetail(1, 17.5, 19.5, "太りぎみ"),
            new IndexDetail(2, 19.5, null, "太りすぎ")]),
        new KaupIndex("kaup3", "幼児 (1歳6か月以上 2歳未満)", [new IndexDetail(-2, null, 14.0, "やせすぎ"),
            new IndexDetail(-1, 14.0, 15.0, "やせぎみ"),
            new IndexDetail(0, 15.0, 17.0, "普通"),
            new IndexDetail(1, 17.0, 19.0, "太りぎみ"),
            new IndexDetail(2, 19.0, null, "太りすぎ")]),
        new KaupIndex("kaup4", "幼児 (満2歳)", [new IndexDetail(-2, null, 13.5, "やせすぎ"),
            new IndexDetail(-1, 13.5, 15.0, "やせぎみ"),
            new IndexDetail(0, 15.0, 17.0, "普通"),
            new IndexDetail(1, 17.0, 18.5, "太りぎみ"),
            new IndexDetail(2, 18.5, null, "太りすぎ")]),
        new KaupIndex("kaup5", "幼児 (満3歳)", [new IndexDetail(-2, null, 13.5, "やせすぎ"),
            new IndexDetail(-1, 13.5, 14.5, "やせぎみ"),
            new IndexDetail(0, 14.5, 16.5, "普通"),
            new IndexDetail(1, 16.5, 18.0, "太りぎみ"),
            new IndexDetail(2, 18.0, null, "太りすぎ")]),
        new KaupIndex("kaup6", "幼児 (満4歳)", [new IndexDetail(-2, null, 13.0, "やせすぎ"),
            new IndexDetail(-1, 13.0, 14.5, "やせぎみ"),
            new IndexDetail(0, 14.5, 16.5, "普通"),
            new IndexDetail(1, 16.5, 18.0, "太りぎみ"),
            new IndexDetail(2, 18.0, null, "太りすぎ")]),
        new KaupIndex("kaup7", "幼児 (満5歳)", [new IndexDetail(-2, null, 13.0, "やせすぎ"),
            new IndexDetail(-1, 13.0, 14.5, "やせぎみ"),
            new IndexDetail(0, 14.5, 16.5, "普通"),
            new IndexDetail(1, 16.5, 18.5, "太りぎみ"),
            new IndexDetail(2, 18.5, null, "太りすぎ")]),
        new RohrerIndex("rohrer", "学童 (小・中学生)", [new IndexDetail(-2, null, 100, "やせすぎ"),
            new IndexDetail(-1, 100, 115, "やせぎみ"),
            new IndexDetail(0, 115, 145, "普通"),
            new IndexDetail(1, 145, 160, "肥満ぎみ"),
            new IndexDetail(2, 160, null, "肥満")]),
        new BodyMassIndex("bmi", "成人 (高校生以上)", [new IndexDetail(-1, null, 18.5, "低体重 (痩せ型)"),
            new IndexDetail(0, 18.5, 25.0, "普通体重"),
            new IndexDetail(1, 25.0, 30.0, "肥満 (1度)"),
            new IndexDetail(2, 30.0, 35.0, "肥満 (2度)"),
            new IndexDetail(3, 35.0, 40.0, "肥満 (3度)"),
            new IndexDetail(4, 40.0, null, "肥満 (4度)")])
    ];
    return IndexData;
})();
var ApplicationData = (function () {
    function ApplicationData() {
        this.set(IndexData.defaultOrdinalNumber, null, null);
        this.load();
    }
    ApplicationData.prototype.store = function (ageOrdinalNumber, height, weight) {
        this.set(ageOrdinalNumber, height, weight);
        return this.save();
    };
    ApplicationData.prototype.set = function (ageOrdinalNumber, height, weight) {
        this.ageOrdinalNumber = ageOrdinalNumber;
        this.height = height;
        this.weight = weight;
    };
    ApplicationData.prototype.load = function () {
        if (!window.localStorage)
            return false;
        var jsonText = window.localStorage.getItem(ApplicationData.key);
        if (jsonText == null)
            return false;
        var data = JSON.parse(jsonText);
        if (data == null)
            return false;
        this.set(data.ageOrdinalNumber, data.height, data.weight);
        return true;
    };
    ApplicationData.prototype.save = function () {
        if (!window.localStorage)
            return false;
        var data = {
            ageOrdinalNumber: this.ageOrdinalNumber,
            height: this.height,
            weight: this.weight
        };
        var jsonText = JSON.stringify(data);
        window.localStorage.setItem(ApplicationData.key, jsonText);
        return true;
    };
    ApplicationData.key = "ShoBmiChecker";
    return ApplicationData;
})();
var Application = (function () {
    function Application() {
        var _this = this;
        this.indexData = new IndexData();
        this.applicationData = new ApplicationData();
        this.indexData.createTables($("#indexTables"), this.applicationData.ageOrdinalNumber);
        var rules = {
            height: { required: true, number: true },
            weight: { required: true, number: true }
        };
        var messages = {
            height: {
                required: '身長は必須入力です',
                number: '身長は数で入力してください',
                min: $.validator.format('{0}以上の値を入力してください')
            },
            weight: {
                required: '体重は必須入力です',
                number: '体重は数で入力してください'
            }
        };
        new BootstrapValidator(rules, messages);
        this.initializeAgeDropdownList();
        this.initializeHeightAndWeight();
        this.initializeIndexKindLabel();
        $('#calculateButton').click(function () { return _this.onCalculate(); });
        $('#clearButton').click(function () { return _this.onClear(); });
    }
    Application.prototype.initializeHeightAndWeight = function () {
        $('#height').val(Application.toFixedString(this.applicationData.height * 100.0));
        $('#weight').val(Application.toFixedString(this.applicationData.weight));
    };
    Application.prototype.initializeAgeDropdownList = function () {
        var _this = this;
        var ageDropdownList = $('#ageDropdownList');
        this.indexData.initializeAgeDropdownList(ageDropdownList, this.applicationData.ageOrdinalNumber);
        ageDropdownList.change(function () {
            var ageIndex = Helper.parseToNaturalNumber(ageDropdownList.val());
            _this.indexData.selected = ageIndex;
            _this.initializeIndexKindLabel();
            _this.calculate();
        });
    };
    Application.prototype.initializeIndexKindLabel = function () {
        $("#indexKind").html(this.indexData.captionText + ": ");
    };
    Application.prototype.calculate = function () {
        var height = parseFloat($("#height").val()) / 100.0;
        var weight = parseFloat($("#weight").val());
        this.setCalculated(this.indexData.selected, height, weight);
    };
    Application.prototype.setCalculated = function (ageOrdinalNumber, height, weight) {
        if (height <= 0.0)
            return;
        var indexValue = this.indexData.calculate(height, weight);
        var classText = this.indexData.getClassText(indexValue);
        $("#indexValue").text(indexValue.toFixed(2).toString()).attr("class", classText);
        $("#indexDescription").text(this.indexData.getDescription(indexValue)).attr("class", classText);
        var standardWeight = this.indexData.calculateStandardWeight(height);
        $("#standardWeight").text(Application.toFixedString(standardWeight));
        $("#deferenceFromStandardWeight").text(Application.toFixedString(weight - standardWeight));
        this.applicationData.store(ageOrdinalNumber, height, weight);
    };
    Application.prototype.onCalculate = function () {
        if (!$('#registerForm').valid())
            return false;
        this.calculate();
        return true;
    };
    Application.prototype.onClear = function () {
        $("#indexValue").text("");
        $("#indexDescription").text("");
        $("#standardWeight").text("");
        $("#deferenceFromStandardWeight").text("");
        return true;
    };
    Application.toFixedString = function (value) {
        return value == null ? "" : value.toFixed(2).toString();
    };
    return Application;
})();
$(document).ready(function () { return new Application(); });
//# sourceMappingURL=bmichecker.js.map