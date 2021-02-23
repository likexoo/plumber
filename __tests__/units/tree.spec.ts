import { ConditionModuleTypes } from "../../src/modules/condition.module";
import { TreeModule, TreeModuleTypes } from "../../src/modules/tree.module";
import { ValueModuleTypes } from "../../src/modules/value.module";

describe('TreeModule', function () {

    test('TreeModule.parseTreeValue()', async () => {

        const result1: string = TreeModule.parseTreeValue(
            [
                {
                    type: TreeModuleTypes.PaintType.PAINT_VALUE,
                    way: TreeModuleTypes.PaintWayType.SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE,
                    value: {
                        type: ValueModuleTypes.ValueType.KEY,
                        key: 'type'
                    }
                },
                {
                    type: TreeModuleTypes.PaintType.PAINT_CONDTION,
                    way: TreeModuleTypes.PaintWayType.SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE,
                    consitions: [
                        {
                            type: ConditionModuleTypes.ConditionType.NUMBER_RANGE,
                            valueA: {
                                type: ValueModuleTypes.ValueType.KEY,
                                key: 'price'
                            },
                            valueB: {
                                type: ValueModuleTypes.ValueType.CONSTANT,
                                value: 9
                            },
                            mathSymbol: ConditionModuleTypes.MathSymbol.GTE,
                            decimalPoint: 2
                        }
                    ],
                    true: {
                        type: ValueModuleTypes.ValueType.CONSTANT,
                        value: 'price>=9'
                    },
                    false: {
                        type: ValueModuleTypes.ValueType.CONSTANT,
                        value: 'price<9'
                    }
                }
            ] as TreeModuleTypes.Paint[],
            {
                type: 'PIZZA',
                price: 10
            }
        );

        expect(result1).toBe('PIZZA<#>price>=9');

        const result2: string = TreeModule.parseTreeValue(
            [
                {
                    type: TreeModuleTypes.PaintType.PAINT_VALUE,
                    way: TreeModuleTypes.PaintWayType.SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE,
                    value: {
                        type: ValueModuleTypes.ValueType.KEY,
                        key: 'types'
                    }
                }
            ] as TreeModuleTypes.Paint[],
            {
                types: [5, 2, 3, 4, 4, 1]
            }
        );

        expect(result2).toBe('12345');

        const result3: string = TreeModule.parseTreeValue(
            [
                {
                    type: TreeModuleTypes.PaintType.PAINT_VALUE,
                    way: TreeModuleTypes.PaintWayType.SORTED_METADATA_OBJECTS,
                    value: {
                        type: ValueModuleTypes.ValueType.KEY,
                        key: 'types'
                    }
                }
            ] as TreeModuleTypes.Paint[],
            {
                types: [5, 2, 3, 4, 4, 1]
            }
        );

        expect(result3).toBe('123445');

    });

});
