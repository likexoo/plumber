import { BasePipelineModule } from "../../cores/base-pipeline-module.core";
import { HookedPointRunningStatus, PipelineModuleDefinition, PipelineModuleRunningStatus, PipelineNodeModuleName } from "../../type";

export class End extends BasePipelineModule implements PipelineModuleRunningStatus {

    _originDefinition: PipelineModuleDefinition = {
        name: PipelineNodeModuleName.END,
        version: '1.0.0',
        incomingAnchorPointDefinitions: [
            {
                name: 'DEFAULT',
                isAllowUnhooked: false,
                moduleWhitelist: []
            }
        ],
        outcomingAnchorPointDefinitions: []
    };

    run(): void {
        this.data = [...this._incomingAnchorPoints[0].hookedPoints || []];
    }

    checkConfig(): boolean {
        return true;
    }

    // *********************
    // Default
    // *********************

    public data: Array<HookedPointRunningStatus> = [];

}