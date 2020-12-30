import { BasePipelineModule } from "../../cores/base-pipeline-module.core";
import { AnchorPointType, Item, PipelineModuleDefinition, PipelineModuleRunningStatus, PipelineNodeModuleName } from "../../type";

export class Start extends BasePipelineModule<object> implements PipelineModuleRunningStatus {

    _originDefinition: PipelineModuleDefinition = {
        name: PipelineNodeModuleName.START,
        version: '1.0.0',
        incomingAnchorPointDefinitions: [],
        outcomingAnchorPointDefinitions: [
            {
                name: 'DEFAULT',
                isAllowUnhooked: false,
                moduleWhitelist: []
            }
        ]
    };

    run(): void {
        console.log(this._outcomingAnchorPoints);
        this.getAllHookedPoints(AnchorPointType.OUTCOMING).forEach((hookedPoint) => {
            hookedPoint.items = [...this.data];
        })
    }

    checkConfig(): boolean {
        return true;
    }

    // *********************
    // Default
    // *********************

    public data: Array<Item> = [];

}

export type ModifierConfig = object;