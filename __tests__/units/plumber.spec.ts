import { Plumber } from "../../src/main";
import { TreeCombinerConfig } from "../../src/modules/tree-combiner/module";
import { AnchorPointConfig, HookedPointConfig, HookedPointRunningStatus, Item, PipelineModuleConfig, PipelineNodeModuleName, PipelineStepConfig } from "../../src/type";

test('Class Plumber', () => {

    const plumber = new Plumber();

    plumber.startData = [
        {
            id: '1',
            metadata: [],
            view: [],
            header: {}
        },
        {
            id: '2',
            metadata: [],
            view: [],
            header: {}
        },
        {
            id: '3',
            metadata: [],
            view: [],
            header: {}
        },
        {
            id: '5',
            metadata: [],
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
                        name: PipelineNodeModuleName.MODIFIER,
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
                                        toModuleType: PipelineNodeModuleName.MODIFIER,
                                        toModuleAnchorPointName: 'DEFAULT',
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig
                        ],
                        outcomingAnchorPointConfigs: [
                            {
                                name: 'UNMODIFIED',
                                hookedPointConfigs: [
                                    {
                                        fromModuleId: 'PN0002',
                                        fromModuleType: PipelineNodeModuleName.MODIFIER,
                                        fromModuleAnchorPointName: 'UNMODIFIED',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
                                        toModuleAnchorPointName: 'DEFAULT',
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig,
                            {
                                name: 'MODIFIED',
                                hookedPointConfigs: [
                                    {
                                        fromModuleId: 'PN0002',
                                        fromModuleType: PipelineNodeModuleName.MODIFIER,
                                        fromModuleAnchorPointName: 'MODIFIED',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
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
                                        fromModuleType: PipelineNodeModuleName.MODIFIER,
                                        fromModuleAnchorPointName: 'UNMODIFIED',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
                                        toModuleAnchorPointName: 'DEFAULT',
                                    } as HookedPointConfig,
                                    {
                                        fromModuleId: 'PN0002',
                                        fromModuleType: PipelineNodeModuleName.MODIFIER,
                                        fromModuleAnchorPointName: 'MODIFIED',
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

    console.log(plumber.endData);
    console.log(plumber.endData[0].data);
    console.log(plumber.endData[0].data[1].items);

});


test('combine Plumber', () => {

    const plumber = new Plumber();

    plumber.startData = [
        {
            id: '1',
            metadata: [
                { name: '小红', age: '23', sex: 'f', class: 3, grade: '三', address: '湖南' },
                { name: '小刚', age: '23', sex: 'm', class: 5, grade: '三', address: '湖南' },
                { name: '小明', age: '25', sex: 'm', class: 2, grade: '四', address: '北京' },
                { name: '小白', age: '26', sex: 'm', class: 5, grade: '三', address: '湖北' },
                { name: '小琴', age: '25', sex: 'f', class: 3, grade: '三', address: '湖南' },
                { name: '小江', age: '24', sex: 'f', class: 4, grade: '四', address: '广东' },
                { name: '小吴', age: '24', sex: 'm', class: 2, grade: '四', address: '北京' },
                { name: '小陈', age: '27', sex: 'f', class: 1, grade: '四', address: '四川' },
                { name: '小婷', age: '25', sex: 'f', class: 6, grade: '三', address: '广东' },
                { name: '小蓝', age: '26', sex: 'm', class: 5, grade: '四', address: '江西' }
            ],
            view: [],
            header: {}
        }
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
                                        toModuleAnchorPointName: 'DEFAULT'
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
                                        toModuleAnchorPointName: 'DEFAULT'
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig
                        ],
                        outcomingAnchorPointConfigs: [
                            {
                                name: 'UNCOMBINED',
                                hookedPointConfigs: [
                                    {
                                        fromModuleId: 'PN0002',
                                        fromModuleType: PipelineNodeModuleName.TREE_COMBINER,
                                        fromModuleAnchorPointName: 'UNCOMBINED',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
                                        toModuleAnchorPointName: 'DEFAULT'
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig,
                            {
                                name: 'COMBINED',
                                hookedPointConfigs: [
                                    {
                                        fromModuleId: 'PN0002',
                                        fromModuleType: PipelineNodeModuleName.TREE_COMBINER,
                                        fromModuleAnchorPointName: 'COMBINED',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
                                        toModuleAnchorPointName: 'DEFAULT'
                                    } as HookedPointConfig
                                ]
                            } as AnchorPointConfig
                        ],
                        moduleConfig: {
                            allowCombinerCondition: [
                                {
                                    type: 'NUMBER_RANGE',
                                    key: 'class',
                                    range: [
                                        {
                                            exp: 'lt',
                                            val: 6
                                        }
                                    ]
                                }
                            ],
                            combinerCondition: [
                                {
                                    type: 'EQUAL',
                                    key: 'sex'
                                },
                                {
                                    type: 'EQUAL',
                                    key: 'grade'
                                }
                            ]
                        } as TreeCombinerConfig
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
                                        fromModuleAnchorPointName: 'UNCOMBINED',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
                                        toModuleAnchorPointName: 'DEFAULT'
                                    } as HookedPointConfig,
                                    {
                                        fromModuleId: 'PN0002',
                                        fromModuleType: PipelineNodeModuleName.TREE_COMBINER,
                                        fromModuleAnchorPointName: 'COMBINED',
                                        toModuleId: 'PN0003',
                                        toModuleType: PipelineNodeModuleName.END,
                                        toModuleAnchorPointName: 'DEFAULT'
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

    console.log(plumber.endData);
    console.log(plumber.endData[0].data);
    console.log(plumber.endData[0].data[1].items[0].metadata);

});