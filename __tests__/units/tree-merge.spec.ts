import { ConditionModuleTypes } from "../../src/modules/condition.module";
import { TreeMergeModule } from "../../src/modules/tree-merge.module";
import { TreeModuleTypes } from "../../src/modules/tree.module";
import { ValueModuleTypes } from "../../src/modules/value.module";

describe('TreeMergeModule', function () {

    test('TreeMergeModule.excuteTreeMerge()', async () => {

        const result1 = TreeMergeModule.excuteTreeMerge(
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
            [
                {
                    type: 'PIZZA',
                    price: 10
                },
                {
                    type: 'PIZZA',
                    price: 6
                },
                {
                    type: 'PIZZA',
                    price: 12
                }
            ]
        );

        expect(result1).toBeInstanceOf(Array);
        expect(result1).toHaveProperty('0.tree', 'PIZZA<#>price>=9');
        expect(result1[0].items).toHaveLength(2);
        expect(result1).toHaveProperty('1.tree', 'PIZZA<#>price<9');
        expect(result1[1].items).toHaveLength(1);

    });

});
