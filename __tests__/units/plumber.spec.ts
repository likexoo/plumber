import { Plumber } from "../../src/main";
import { Item, PipelineNode, PipelineNodeAnchorPointHookInformation, PipelineNodeModuleName, PipelineStep } from "../../src/type";

test('Class Plumber', () => {

    const plumber = new Plumber();

    plumber.startModuleData = [
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
    ] as Array<Item>

    plumber.init(
        [
            {
                index: 0,
                nodes: [
                    {
                        id: 'PN0001',
                        module: PipelineNodeModuleName.START,
                        config: {},
                        incomingAnchorPoints: [],
                        outcomingAnchorPoints: [
                            {
                                fromModuleId: 'PN0001',
                                fromModuleType: PipelineNodeModuleName.START,
                                fromModuleAnchorPointName: 'DEFAULT',
                                toModuleId: 'PN0002',
                                toModuleType: PipelineNodeModuleName.MODIFIER,
                                toModuleAnchorPointName: 'DEFAULT',
                            } as PipelineNodeAnchorPointHookInformation
                        ]
                    } as PipelineNode
                ]
            } as PipelineStep,
            {
                index: 1,
                nodes: [
                    {
                        id: 'PN0002',
                        module: PipelineNodeModuleName.MODIFIER,
                        config: {},
                        incomingAnchorPoints: [
                            {
                                fromModuleId: 'PN0001',
                                fromModuleType: PipelineNodeModuleName.START,
                                fromModuleAnchorPointName: 'DEFAULT',
                                toModuleId: 'PN0002',
                                toModuleType: PipelineNodeModuleName.MODIFIER,
                                toModuleAnchorPointName: 'DEFAULT',
                            } as PipelineNodeAnchorPointHookInformation
                        ],
                        outcomingAnchorPoints: [
                            {
                                fromModuleId: 'PN0002',
                                fromModuleType: PipelineNodeModuleName.MODIFIER,
                                fromModuleAnchorPointName: 'UNMODIFIED',
                                toModuleId: 'PN0003',
                                toModuleType: PipelineNodeModuleName.END,
                                toModuleAnchorPointName: 'CUSTOM_UNMODIFIED',
                            } as PipelineNodeAnchorPointHookInformation,
                            {
                                fromModuleId: 'PN0002',
                                fromModuleType: PipelineNodeModuleName.MODIFIER,
                                fromModuleAnchorPointName: 'MODIFIED',
                                toModuleId: 'PN0003',
                                toModuleType: PipelineNodeModuleName.END,
                                toModuleAnchorPointName: 'CUSTOM_MODIFIED',
                            } as PipelineNodeAnchorPointHookInformation
                        ]
                    } as PipelineNode
                ]
            } as PipelineStep,
            {
                index: 2,
                nodes: [
                    {
                        id: 'PN0003',
                        module: PipelineNodeModuleName.END,
                        config: {},
                        incomingAnchorPoints: [],
                        outcomingAnchorPoints: []
                    } as PipelineNode
                ]
            } as PipelineStep,
        ]
    );

    plumber.run();
    
    console.log(plumber.endModuleData);

});