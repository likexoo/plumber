import { ConditionModule, ConditionModuleTypes } from "../../src/modules/condition.module";
import { ValueModuleTypes } from "../../src/modules/value.module";

describe('ConditionModule', function () {

    test('ConditionModule.parseCondition()', async () => {

        const result1: boolean = ConditionModule.parseCondition(
            {
                type: ConditionModuleTypes.ConditionType.EQUAL,
                valueA: {
                    type: ValueModuleTypes.ValueType.CONSTANT,
                    value: 'ABC'
                } as ValueModuleTypes.Value,
                valueB: {
                    type: ValueModuleTypes.ValueType.KEY,
                    key: 'abc'
                } as ValueModuleTypes.Value,
                reverse: false
            } as ConditionModuleTypes.Condition,
            {
                abc: 'ABC'
            }
        );

        expect(result1).toBe(true);

    });

});
