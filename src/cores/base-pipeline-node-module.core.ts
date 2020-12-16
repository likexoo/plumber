import { PipelineNode, PipelineNodeRunningStatus, PipelineNodeAnchorPointHookInformationRunningStatus, PipelineNodeAnchorPointHookInformation, PipelineNodeModuleName } from "../type";

export class BasePipelineNodeModule implements PipelineNodeRunningStatus {

    // *********************
    // Pipeline Node (Running Status)
    // *********************

    _origin: PipelineNode;
    _incomingAnchorPointItems: PipelineNodeAnchorPointHookInformationRunningStatus[] = [];
    _outcomingAnchorPointItems: PipelineNodeAnchorPointHookInformationRunningStatus[] = [];

    // *********************
    // Tools
    // *********************

    protected findIncomingAnchorPointItemByName(
        type: 'FROM' | 'TO',
        name: string
    ): PipelineNodeAnchorPointHookInformationRunningStatus | undefined {
        return this._incomingAnchorPointItems.find((point) => {
            if (type === 'FROM') {
                return point && point.fromModuleAnchorPointName === name;
            }
            else if (type === 'TO') {
                return point && point.toModuleAnchorPointName === name;
            }
        })
    }

    protected findOutcomingAnchorPointItemByName(
        type: 'FROM' | 'TO',
        name: string
    ): PipelineNodeAnchorPointHookInformationRunningStatus | undefined {
        return this._outcomingAnchorPointItems.find((point) => {
            if (type === 'FROM') {
                return point && point.fromModuleAnchorPointName === name;
            }
            else if (type === 'TO') {
                return point && point.toModuleAnchorPointName === name;
            }
        })
    }

}