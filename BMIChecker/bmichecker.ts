/// <reference path="scripts/typings/jquery/jquery.d.ts" />
/// <reference path="scripts/typings/jquery.validation/jquery.validation.d.ts" />

class Helper {
    public static parseToNaturalNumber(text: string): number {
        if (text == null)
            return null;
        var result = Number(text);
        return result < 0 ? null : result;
    }

    public static average(value1: number, value2: number): number {
        return (value1 + value2) / 2.0;
    }
}

class BootstrapValidator {
    public constructor(rules: any, messages: any) {
        this.initialize();
        this.set(rules, messages);
    }

    private initialize(): void {
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
    }

    private set(rules: any, messages: any): void {
        "use strict";

        $('form').each((_, element) => {
            var $form = $(element);
            var validator = $form.validate({
                rules   : rules,
                messages: messages
            });

            $form.bind('reset', () => {
                validator.resetForm();
                $form.find('.form-group').each((_, element) => 
                    $(element).removeClass((<any>$.validator).defaults.errorClass)
                              .removeClass((<any>$.validator).defaults.validClass)
                );
            });
        });
    }
}

class IndexDetail {
    private static classTexts: string[] = [
        "thinWeight2" ,
        "thinWeight1" ,
        "normalWeight",
        "overWeight1" ,
        "overWeight2" ,
        "overWeight3" ,
        "overWeight4"
    ];

    level      : number;
    from       : number;
    to         : number;
    description: string;

    public get centerValue(): number {
        return this.from == null ? this.to
                                 : ((this.to == null) ? this.from
                                                      : Helper.average(this.from, this.to));
    }

    public constructor(level: number, from: number, to: number, description: string) {
        this.level       = level      ;
        this.from        = from       ;
        this.to          = to         ;
        this.description = description;
    }

    public toTableRow(): JQuery {
        return $('<tr>').attr  ("class", this.classText)
                        .append('<td>' + this.fromText + " " + this.toText + '</td>')
                        .append('<td>' + this.description                  + '</td>');
    }

    public get classText(): string {
        return IndexDetail.classTexts[this.ordinalNumber];
    }

    public get fromText(): string {
        return this.from == null ? " " : this.from.toString() + "以上";
    }

    public get toText(): string {
        return this.to == null ? " " : this.to.toString() + "未満";
    }

    public static levelToOrdinalNumber(level: number): number {
        return level + 2;
    }

    private get ordinalNumber(): number {
        return IndexDetail.levelToOrdinalNumber(this.level);
    }
}

enum IndexKind {
    Kaup     = 0,
    Rohrer   = 1,
    BodyMass = 2
}

abstract class Index {
    kind        : IndexKind;
    name        : string;
    description : string;
    details     : IndexDetail[];

    public get normalValue(): number {
        return this.details[IndexDetail.levelToOrdinalNumber(0)].centerValue;
    }

    public constructor(kind: IndexKind, name: string, description: string, details: IndexDetail[]) {
        this.kind         = kind       ;
        this.name         = name       ;
        this.description  = description;
        this.details      = details    ;
    }

    public abstract calculate(height: number, weight: number): number;
    public abstract calculateStandardWeight(height: number): number;

    public getDescription(indexValue: number): string {
        var ordinalNumber = this.getOrdinalNumber(indexValue);
        return ordinalNumber == null ? "" : this.details[ordinalNumber].description;
    }

    public toOption(value: number): JQuery {
        return $("<option>").val(value).text(this.description);
    }

    public toTable(visible: boolean = false): JQuery {
        var table = $('<table>').attr("id", this.tableID).attr("class", "table - bordered");
        var caption = $('<caption>').html(this.captionText);
        table.append(caption);

        var th = $('<tr>').append('<th>指標</th>').append('<th>判定</th>');
        table.append($('<thead>').append(th));

        var tbody = $('<tbody>');
        $.each(this.details, (ordinalNumber, indexDetail) => tbody.append(indexDetail.toTableRow()));
        table.append(tbody);
        visible ? table.show() : table.hide();
        return table;
    }

    protected static calculateKaupIndex(height: number, weight: number): number {
        return this.calculateBodyMassIndex(height, weight);
    }

    protected static calculateRohrerIndex(height: number, weight: number): number {
        return weight * 10.0 / height / height / height;
    }

    protected static calculateBodyMassIndex(height: number, weight: number): number {
        return weight / height / height;
    }

    protected static calculateKaupStandardWeight(height: number, normalValue: number): number {
        return this.calculateBodyMassStandardWeight(height, normalValue);
    }

    protected static calculateRohrerStandardWeight(height: number, normalValue: number): number {
        return normalValue * height * height * height / 10.0;
    }

    protected static calculateBodyMassStandardWeight(height: number, normalValue: number): number {
        return normalValue * height * height;
    }

    public get tableID() {
        return this.name + "Table";
    }

    public get captionText(): string {
        return this.linkText + ' &mdash; ' + this.description;
    }
    
    protected abstract kindText(): string;
    protected abstract url(): string;

    private get linkText(): string {
        return '<a href="' + this.url() + '" target="_top">' + this.kindText() + '</a>';
    }

    private getOrdinalNumber(indexValue: number): number {
        for (var ordinalNumber = 0; ordinalNumber < this.details.length; ordinalNumber++) {
            var from = this.details[ordinalNumber].from;
            var to   = this.details[ordinalNumber].to  ;
            if ((from == null       && indexValue < to) ||
                (from <= indexValue && to == null     ) ||
                (from <= indexValue && indexValue < to))
                return ordinalNumber;
        }
        return null;
    }
}

class KaupIndex extends Index {
    public constructor(name: string, description: string, details: IndexDetail[]) {
        super(IndexKind.Kaup, name, description, details);
    }

    public calculate(height: number, weight: number): number {
        return Index.calculateKaupIndex(height, weight);
    }

    public calculateStandardWeight(height: number): number {
        return Index.calculateKaupStandardWeight(height, this.normalValue);
    }

    protected kindText(): string {
        return "カウプ指数";
    }

    protected url(): string {
        return "https://ja.wikipedia.org/wiki/%E3%83%8E%E3%83%BC%E3%83%88:%E3%82%AB%E3%82%A6%E3%83%97%E6%8C%87%E6%95%B0";
    }
}

class RohrerIndex extends Index {
    public constructor(name: string, description: string, details: IndexDetail[]) {
        super(IndexKind.Rohrer, name, description, details);
    }

    public calculate(height: number, weight: number): number {
        return Index.calculateRohrerIndex(height, weight);
    }

    public calculateStandardWeight(height: number): number {
        return Index.calculateRohrerStandardWeight(height, this.normalValue);
    }

    protected kindText(): string {
        return "ローレル指数";
    }

    protected url(): string {
        return "https://ja.wikipedia.org/wiki/%E3%83%AD%E3%83%BC%E3%83%AC%E3%83%AB%E6%8C%87%E6%95%B0";
    }
}

class BodyMassIndex extends Index {
    public get normalValue(): number {
        return 22.0;
    }

    public constructor(name: string, description: string, details: IndexDetail[]) {
        super(IndexKind.BodyMass, name, description, details);
    }

    public calculate(height: number, weight: number): number {
        return Index.calculateBodyMassIndex(height, weight);
    }

    public calculateStandardWeight(height: number): number {
        return Index.calculateBodyMassStandardWeight(height, this.normalValue);
    }

    protected kindText(): string {
        return "BMI (ボディマス指数)";
    }

    protected url(): string {
        return "https://ja.wikipedia.org/wiki/%E3%83%9C%E3%83%87%E3%82%A3%E3%83%9E%E3%82%B9%E6%8C%87%E6%95%B0";
    }
}

class IndexData {
    static indexes: Index[] = [
        new KaupIndex    ("kaup1", "乳児 (3か月以上)",
                          [new IndexDetail(-2, null, 14.5, "やせすぎ"),
                           new IndexDetail(-1, 14.5, 16.0, "やせぎみ"),
                           new IndexDetail( 0, 16.0, 18.0, "普通"),
                           new IndexDetail( 1, 18.0, 20.0, "太りぎみ"),
                           new IndexDetail( 2, 20.0, null, "太りすぎ")]),
        new KaupIndex    ("kaup2", "幼児 (1歳以上 1歳6か月未満)",
                          [new IndexDetail(-2, null, 14.5, "やせすぎ"),
                           new IndexDetail(-1, 14.5, 15.5, "やせぎみ"),
                           new IndexDetail( 0, 15.5, 17.5, "普通"),
                           new IndexDetail( 1, 17.5, 19.5, "太りぎみ"),
                           new IndexDetail( 2, 19.5, null, "太りすぎ")]),
        new KaupIndex    ("kaup3", "幼児 (1歳6か月以上 2歳未満)",
                          [new IndexDetail(-2, null, 14.0, "やせすぎ"),
                           new IndexDetail(-1, 14.0, 15.0, "やせぎみ"),
                           new IndexDetail( 0, 15.0, 17.0, "普通"),
                           new IndexDetail( 1, 17.0, 19.0, "太りぎみ"),
                           new IndexDetail( 2, 19.0, null, "太りすぎ")]),
        new KaupIndex    ("kaup4", "幼児 (満2歳)",
                          [new IndexDetail(-2, null, 13.5, "やせすぎ"),
                           new IndexDetail(-1, 13.5, 15.0, "やせぎみ"),
                           new IndexDetail( 0, 15.0, 17.0, "普通"),
                           new IndexDetail( 1, 17.0, 18.5, "太りぎみ"),
                           new IndexDetail( 2, 18.5, null, "太りすぎ")]),
        new KaupIndex    ("kaup5", "幼児 (満3歳)",
                          [new IndexDetail(-2, null, 13.5, "やせすぎ"),
                           new IndexDetail(-1, 13.5, 14.5, "やせぎみ"),
                           new IndexDetail( 0, 14.5, 16.5, "普通"),
                           new IndexDetail( 1, 16.5, 18.0, "太りぎみ"),
                           new IndexDetail( 2, 18.0, null, "太りすぎ")]),
        new KaupIndex    ("kaup6", "幼児 (満4歳)",
                          [new IndexDetail(-2, null, 13.0, "やせすぎ"),
                           new IndexDetail(-1, 13.0, 14.5, "やせぎみ"),
                           new IndexDetail( 0, 14.5, 16.5, "普通"),
                           new IndexDetail( 1, 16.5, 18.0, "太りぎみ"),
                           new IndexDetail( 2, 18.0, null, "太りすぎ")]),
        new KaupIndex    ("kaup7", "幼児 (満5歳)",
                          [new IndexDetail(-2, null, 13.0, "やせすぎ"),
                           new IndexDetail(-1, 13.0, 14.5, "やせぎみ"),
                           new IndexDetail( 0, 14.5, 16.5, "普通"),
                           new IndexDetail( 1, 16.5, 18.5, "太りぎみ"),
                           new IndexDetail( 2, 18.5, null, "太りすぎ")]),
        new RohrerIndex  ("rohrer", "学童 (小・中学生)",
                          [new IndexDetail(-2, null,  100, "やせすぎ"),
                           new IndexDetail(-1,  100,  115, "やせぎみ"),
                           new IndexDetail( 0,  115,  145, "普通"),
                           new IndexDetail( 1,  145,  160, "肥満ぎみ"),
                           new IndexDetail( 2,  160, null, "肥満")]),
        new BodyMassIndex("bmi", "成人 (高校生以上)",
                          [new IndexDetail(-1, null, 18.5, "低体重 (痩せ型)"),
                           new IndexDetail( 0, 18.5, 25.0, "普通体重"),
                           new IndexDetail( 1, 25.0, 30.0, "肥満 (1度)"),
                           new IndexDetail( 2, 30.0, 35.0, "肥満 (2度)"),
                           new IndexDetail( 3, 35.0, 40.0, "肥満 (3度)"),
                           new IndexDetail( 4, 40.0, null, "肥満 (4度)")]
        )
    ];

    public get captionText(): string {
        return this.selectedIndex.captionText;
    }

    private _selected: number;

    public get selected(): number {
        return this._selected;
    }

    public set selected(value: number) {
        this._selected = value;
        this.showTable(value);
    }

    private get selectedIndex(): Index {
        return IndexData.indexes[this.selected];
    }

    private get normalValue(): number {
        return this.selectedIndex.normalValue;
    }

    public constructor() {
        this._selected = IndexData.defaultOrdinalNumber;
    }

    public calculate(height: number, weight: number): number {
        return this.selectedIndex.calculate(height, weight);
    }

    public calculateStandardWeight(height: number): number {
        return this.selectedIndex.calculateStandardWeight(height);
    }

    public getDescription(indexValue: number): string {
        return this.selectedIndex.getDescription(indexValue);
    }

    public initializeAgeDropdownList(ageDropdownList: JQuery, ordinalNumber: number): void {
        $.each(IndexData.indexes, (ordinalNumber, index) => ageDropdownList.append(index.toOption(ordinalNumber)));
        ageDropdownList.val(IndexData.getOrdinalNumber(ordinalNumber));
    }

    public createTables(element: JQuery, ordinalNumber: number): void {
        var selectedOrdinalNumber = IndexData.getOrdinalNumber(ordinalNumber);
        $.each(IndexData.indexes, (ordinalNumber, index) => element.append(index.toTable(ordinalNumber == selectedOrdinalNumber)));
    }

    public showTable(ageIndex: number): void {
        $.each(IndexData.indexes, (ordinalNumber, index) => {
            var table = $("#" + index.tableID);
            ordinalNumber == ageIndex ? table.show() : table.hide();
        });
    }

    public static get defaultOrdinalNumber(): number {
        return IndexData.indexes.length - 1;
    }

    private static getOrdinalNumber(ordinalNumber: number): number {
        return ordinalNumber == null ? IndexData.defaultOrdinalNumber : ordinalNumber;
    }
}

class ApplicationData {
    private static key = "ShoBmiChecker";

    ageOrdinalNumber: number;
    height          : number;
    weight          : number;

    public constructor() {
        this.set(IndexData.defaultOrdinalNumber, null, null);
        this.load();
    }

    public store(ageOrdinalNumber: number, height: number, weight: number): boolean {
        this.set(ageOrdinalNumber, height, weight);
        return this.save();
    }

    private set(ageOrdinalNumber: number, height: number, weight: number): void {
        this.ageOrdinalNumber = ageOrdinalNumber;
        this.height           = height          ;
        this.weight           = weight          ;
    }

    private load(): boolean {
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
    }

    public save(): boolean {
        if (!window.localStorage)
            return false;

        var data = {
            ageOrdinalNumber: this.ageOrdinalNumber,
            height          : this.height          ,
            weight          : this.weight
        };
        var jsonText = JSON.stringify(data);
        window.localStorage.setItem(ApplicationData.key, jsonText);
        return true;
    }
}

class Application {
    private indexData       = new IndexData      ();
    private applicationData = new ApplicationData();

    public constructor() {
        this.indexData.createTables($("#indexTables"), this.applicationData.ageOrdinalNumber);

        var rules = {
            height: { required: true, number: true },
            weight: { required: true, number: true }
        };

        var messages = {
            height: {
                required: '身長は必須入力です',
                number  : '身長は数で入力してください',
                min     : $.validator.format('{0}以上の値を入力してください')
            },
            weight: {
                required: '体重は必須入力です',
                number  : '体重は数で入力してください'
            }
        };

        new BootstrapValidator(rules, messages);
        this.initializeAgeDropdownList();
        this.initializeHeightAndWeight();
        this.initializeIndexKindLabel();
        $('#calculateButton').click(() => this.onCalculate());
        $('#clearButton'    ).click(() => this.onClear    ());
    }

    private initializeHeightAndWeight(): void {
        $('#height').val(Application.toFixedString(this.applicationData.height * 100.0));
        $('#weight').val(Application.toFixedString(this.applicationData.weight));
    }

    private initializeAgeDropdownList(): void {
        var ageDropdownList = $('#ageDropdownList');
        this.indexData.initializeAgeDropdownList(ageDropdownList, this.applicationData.ageOrdinalNumber);
        ageDropdownList.change(() => {
            var ageIndex = Helper.parseToNaturalNumber(ageDropdownList.val());
            this.indexData.selected = ageIndex;
            this.initializeIndexKindLabel();
            this.calculate();
        });
    }

    private initializeIndexKindLabel(): void {
        $("#indexKind").html(this.indexData.captionText + ": ");
    }

    private calculate(): void {
        var height = parseFloat($("#height").val()) / 100.0;
        var weight = parseFloat($("#weight").val());

        this.setCalculated(this.indexData.selected, height, weight);
    }

    private setCalculated(ageOrdinalNumber: number, height: number, weight: number): void {
        if (height <= 0.0)
            return;
        var indexValue = this.indexData.calculate(height, weight);
        $("#indexValue").text(indexValue.toFixed(2).toString());
        $("#indexDescription").text(this.indexData.getDescription(indexValue));
        var standardWeight = this.indexData.calculateStandardWeight(height);
        $("#standardWeight").text(Application.toFixedString(standardWeight));
        $("#deferenceFromStandardWeight").text(Application.toFixedString(weight - standardWeight));

        this.applicationData.store(ageOrdinalNumber, height, weight);
    }

    private onCalculate(): boolean {
        if (!$('#registerForm').valid())
            return false;
        this.calculate();
        return true;
    }

    private onClear(): boolean {
        $("#indexValue").text("");
        $("#indexDescription").text("");
        $("#standardWeight").text("");
        $("#deferenceFromStandardWeight").text("");
        return true;
    }

    private static toFixedString(value: number): string {
        return value == null ? "" : value.toFixed(2).toString();
    }
}

$(document).ready(() => new Application());
