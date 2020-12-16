import { Plumber } from "../../src/main";
import { PipelineNode, PipelineNodeAnchorPointHookInformation, PipelineNodeModuleName, PipelineStep } from "../../src/type";

test('Class Plumber', () => {

    const plumber = new Plumber();

    plumber.init(
        [
            {
                index: 0,
                nodes: [
                    {
                        id: 'PN0001',
                        module: PipelineNodeModuleName.START,
                        config: {},
                        incomingAnchorPoints: [

                        ] as Array<PipelineNodeAnchorPointHookInformation>,
                        outcomingAnchorPoints: [

                        ] as Array<PipelineNodeAnchorPointHookInformation>
                    } as PipelineNode
                ] as Array<PipelineNode>
            } as PipelineStep
        ] as Array<PipelineStep>
    );

});