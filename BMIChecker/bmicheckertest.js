/// <reference path="scripts/typings/qunit/qunit.d.ts" />
var HelperTest = (function () {
    function HelperTest() {
    }
    HelperTest.HelperTest = function () {
        this.parseToNaturalNumberにnullを渡すとnull();
    };
    HelperTest.parseToNaturalNumberにnullを渡すとnull = function () {
        QUnit.test("parseToNaturalNumberにnullを渡すとnull", function (assert) {
            return assert.ok(Helper.parseToNaturalNumber(null) === null, "Passed!");
        });
    };
    return HelperTest;
}());
HelperTest.HelperTest();
//# sourceMappingURL=bmicheckertest.js.map