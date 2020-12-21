import { BasePipelineNodeModule } from "../../cores/base-pipeline-node-module.core";
import { Item, PipelineNodeModule, PipelineNodeModuleAnchorPointDefinition } from "../../type";

export class Start extends BasePipelineNodeModule implements PipelineNodeModule {

    // *********************
    // Pipeline Module
    // *********************

    errors: object[];

    isDynamicIncomingAnchorPoint: boolean = false;
    incomingAnchorPointDefinitions: PipelineNodeModuleAnchorPointDefinition[] = [];

    isDynamicOutcomingAnchorPoint: boolean = false;
    outcomingAnchorPointDefinitions: PipelineNodeModuleAnchorPointDefinition[] = [
        {
            name: 'DEFAULT',
            isAllowUnhooked: false,
            moduleWhitelist: []
        }
    ];

    init(): void { }

    run(): void {
        this._outcomingAnchorPointItems[0]._items = [...this.data];
    }

    // *********************
    // Default
    // *********************

    public data: Array<Item> = [];

}