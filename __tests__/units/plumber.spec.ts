import { Plumber } from "../../src/main";
import { AnchorPointConfig, HookedPointConfig, Item, PipelineModuleConfig, PipelineNodeModuleName, PipelineStepConfig } from "../../src/type";

test('Class Plumber', () => {

    const plumber = new Plumber();

    plumber.startData = [
        {
            id: '1',
            metadata: {}
        },
        {
            id: '2',
            metadata: {}
        },
        {
            id: '3',
            metadata: {},
            items: [
                {
                    id: '4',
                    metadata: {}
                }
            ]
        },
        {
            id: '5',
            metadata: {}
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

});