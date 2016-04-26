/// <reference path="scripts/typings/qunit/qunit.d.ts" />

class HelperTest {
    static HelperTest() {
        this.parseToNaturalNumberにnullを渡すとnull();
    }

    public static parseToNaturalNumberにnullを渡すとnull() {
        QUnit.test("parseToNaturalNumberにnullを渡すとnull",
            assert =>
                assert.ok(Helper.parseToNaturalNumber(null) === null, "Passed!")
        );
    }
}

HelperTest.HelperTest();



