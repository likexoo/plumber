import { Plumber } from "../../src/main";
import { TreeCombinerTypes } from "../../src/modules/tree-combiner/module";
import { AnchorPointConfig, HookedPointConfig, Item, PipelineModuleConfig, PipelineNodeModuleName, PipelineStepConfig } from "../../src/type";

test('Class TreeCombiner', () => {

    const plumber = new Plumber();

    plumber.startData = [
        {
            id: '1',
            metadata: [
                {
                    name: 'Dish1',
                    type: 'PIZZA',
                    price: 10
                }
            ],
            view: [],
            header: {}
        },
        {
            id: '2',
            metadata: [
                {
                    name: 'Dish2',
                    type: 'OTHERS',
                    price: 6
                }
            ],
            view: [],
            header: {}
        },
        {
            id: '3',
            metadata: [
                {
                    name: 'Dish3',
                    type: 'PIZZA',
                    price: 15
                },
                {
                    name: 'Dish5',
                    type: 'PIZZA',
                    price: 8
                }
            ],
            view: [],
            header: {}
        },
        {
            id: '4',
            metadata: [
                {
                    name: 'Dish4',
                    type: 'PIZZA',
                    price: 19
                }
            ],
            view: [],
            header: {}
        },
    ] as Array<Item>;

    plumber.init(
        [
            {
                index: 0,
                moduleConfigs: [
                    {
                        id: 'PN0001',
                        name: PipelineNodeModuleName.START,
                        version: '1.0.0',
                        incomingAnchorPointConfigs: [],
                        outcomingAnchorPointConfigs: [
                            {
                                name: 'DEFAULT',
                                hookedPointConfigs: [
                                    {
                                        fromModuleId: 'PN0001',
                                        fromModuleType: PipelineNodeModuleName.START,
                                        fromModuleAnchorPointName: 'DEFAULT',
                                        toModuleId: 'PN0002',
                                        toModuleType: PipelineNodeModuleName.MODIFIER,
                                        toModuleAnchorPointName: 'DEFAULT',
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig
                        ],
                        moduleConfig: undefined
                    } as PipelineModuleConfig
                ]
            } as PipelineStepConfig,
            {
                index: 1,
                moduleConfigs: [
                    {
                        id: 'PN0002',
                        name: PipelineNodeModuleName.TREE_COMBINER,
                        version: '1.0.0',
                        incomingAnchorPointConfigs: [
                            {
                                name: 'DEFAULT',
                                hookedPointConfigs: [
                                    {
                                        fromModuleId: 'PN0001',
                                        fromModuleType: PipelineNodeModuleName.START,
                                        fromModuleAnchorPointName: 'DEFAULT',
                                        toModuleId: 'PN0002',
                                        toModuleType: PipelineNodeModuleName.TREE_COMBINER,
                                        toModuleAnchorPointName: 'DEFAULT',
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig
                        ],
                        outcomingAnchorPointConfigs: [
                            {
                                name: 'DEFAULT',
                                hookedPointConfigs: [
                                    {
                                        fromModuleId: 'PN0002',
                                        fromModuleType: PipelineNodeModuleName.TREE_COMBINER,
                                        fromModuleAnchorPointName: 'DEFAULT',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
                                        toModuleAnchorPointName: 'DEFAULT',
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig
                        ],
                        moduleConfig: {
                            paints: [
                                {
                                    type: TreeCombinerTypes.PaintType.PAINT_VALUE,
                                    way: TreeCombinerTypes.PaintWayType.SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE,
                                    value: {
                                        type: TreeCombinerTypes.TheValueType.KEY,
                                        key: 'type'
                                    }
                                },
                                {
                                    type: TreeCombinerTypes.PaintType.PAINT_CONDTION,
                                    way: TreeCombinerTypes.PaintWayType.SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE,
                                    consitions: [
                                        {
                                            type: TreeCombinerTypes.ConditionType.NUMBER_RANGE,
                                            valueA: {
                                                type: TreeCombinerTypes.TheValueType.KEY,
                                                key: 'price'
                                            },
                                            valueB: {
                                                type: TreeCombinerTypes.TheValueType.CONSTANT,
                                                value: 9
                                            },
                                            mathSymbol: TreeCombinerTypes.MathSymbol.GTE,
                                            decimalPoint: 2
                                        }
                                    ],
                                    true: {
                                        type: TreeCombinerTypes.TheValueType.CONSTANT,
                                        value: 'price>=9'
                                    },
                                    false: {
                                        type: TreeCombinerTypes.TheValueType.CONSTANT,
                                        value: 'price<9'
                                    }
                                }
                            ]
                        } as TreeCombinerTypes.TreeCombinerConfig
                    } as PipelineModuleConfig
                ]
            } as PipelineStepConfig,
            {
                index: 2,
                moduleConfigs: [
                    {
                        id: 'PN0003',
                        name: PipelineNodeModuleName.END,
                        version: '1.0.0',
                        incomingAnchorPointConfigs: [
                            {
                                name: 'DEFAULT',
                                hookedPointConfigs: [
                                    {
                                        fromModuleId: 'PN0002',
                                        fromModuleType: PipelineNodeModuleName.TREE_COMBINER,
                                        fromModuleAnchorPointName: 'DEFAULT',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
                                        toModuleAnchorPointName: 'DEFAULT',
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig
                        ],
                        outcomingAnchorPointConfigs: [],
                        moduleConfig: undefined
                    } as PipelineModuleConfig
                ]
            } as PipelineStepConfig,
        ]
    );

    plumber.run();

    // console.log(plumber.endData[0].data[0].items[0].metadata);
    // console.log(plumber.endData[0].data[0].items[1].metadata);
    // console.log(plumber.endData[0].data[0].items[2].metadata);

    expect(plumber.endData[0].data[0].items).toHaveLength(3);

});