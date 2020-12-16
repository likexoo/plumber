import { BasePipelineNodeModule } from "../../cores/base-pipeline-node-module.core";
import { PipelineNodeModule, PipelineNodeModuleAnchorPointDefinition } from "../../type";

export class Modifier extends BasePipelineNodeModule implements PipelineNodeModule {

    // *********************
    // Pipeline Module
    // *********************

    errors: object[] = [];

    isDynamicIncomingAnchorPoint: boolean = false;
    incomingAnchorPointDefinitions: PipelineNodeModuleAnchorPointDefinition[] = [
        {
            name: 'DEFAULT',
            isAllowUnhooked: false,
            moduleWhitelist: []
        }
    ];

    isDynamicOutcomingAnchorPoint: boolean = false;
    outcomingAnchorPointDefinitions: PipelineNodeModuleAnchorPointDefinition[] = [
        {
            name: 'UNMODIFIED',
            isAllowUnhooked: false,
            moduleWhitelist: []
        },
        {
            name: 'MODIFIED',
            isAllowUnhooked: false,
            moduleWhitelist: []
        }
    ];

    init(): void { }

    run(): void {
        this._incomingAnchorPointItems.forEach((point) => {
            point._items.forEach((item) => {
                // init
                let isModified: boolean = false;
                // set property by config
                if (item && item.metadata) {
                    isModified = this.setItemProperty(item.metadata as object);
                }
                // end
                if (isModified) {
                    this.findOutcomingAnchorPointItemByName('FROM', 'MODIFIED')!._items.push(item);
                }
                else {
                    this.findOutcomingAnchorPointItemByName('FROM', 'UNMODIFIED')!._items.push(item);
                }
            });
        });
    }

    // *********************
    // Default
    // *********************

    private setItemProperty(item: object): boolean {
        try {
            let isModified: boolean = false;
            (this._origin.config as ModifierConfig).forEach((config) => {
                if (item.hasOwnProperty('' + config.property)) {
                    isModified = true;
                    Object.defineProperty(
                        item,
                        '' + config.property,
                        {
                            value: config.value,
                            writable: true
                        }
                    );
                }
            });
            return isModified;
        } catch (error) {
            this.errors.push(error);
            return false;
        }
    }

}

export type ModifierConfig = Array<{
    property: string;
    value: unknown;
}>;