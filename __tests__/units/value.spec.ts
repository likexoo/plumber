import { ValueModule, ValueModuleTypes } from "../../src/modules/value.module";

describe('ValueModule', function () {

    test('ValueModule.parseCondition()', async () => {

        const result1 = ValueModule.parseValue(
            {
                type: ValueModuleTypes.ValueType.KEY,
                key: 'abc'
            } as ValueModuleTypes.Value,
            {
                abc: 'ABC'
            }
        );

        expect(result1).toBe('ABC');

    });

});
