import { BasePipelineNodeModule } from "../../cores/base-pipeline-node-module.core";
import { Item, PipelineNodeModule, PipelineNodeModuleAnchorPointDefinition } from "../../type";

export class End extends BasePipelineNodeModule implements PipelineNodeModule {

    // *********************
    // Pipeline Module
    // *********************

    errors: object[];

    isDynamicIncomingAnchorPoint: boolean = true;
    incomingAnchorPointDefinitions: PipelineNodeModuleAnchorPointDefinition[] = [];

    isDynamicOutcomingAnchorPoint: boolean = false;
    outcomingAnchorPointDefinitions: PipelineNodeModuleAnchorPointDefinition[] = [];

    init(): void { }

    run(): void {
        this._incomingAnchorPointItems.forEach((point) => {
            this.data.push({
                pointName: '' + point.toModuleAnchorPointName,
                items: [...point._items]
            });
        });
    }

    // *********************
    // Default
    // *********************

    public data: Array<{
        pointName: string;
        items: Array<Item>;
    }> = [];

}