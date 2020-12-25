import { BasePipelineModule } from "../../cores/base-pipeline-module.core";
import { AnchorPointType, PipelineModuleDefinition, PipelineModuleRunningStatus, PipelineNodeModuleName } from "../../type";

export class Modifier extends BasePipelineModule<ModifierConfig> implements PipelineModuleRunningStatus {

    _originDefinition: PipelineModuleDefinition = {
        name: PipelineNodeModuleName.MODIFIER,
        version: '1.0.0',
        incomingAnchorPointDefinitions: [
            {
                name: 'DEFAULT',
                isAllowUnhooked: false,
                moduleWhitelist: []
            }
        ],
        outcomingAnchorPointDefinitions: [
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
        ]
    };

    run(): void {
        this.getAllHookedPoints(AnchorPointType.INCOMING).forEach((incomingHookedPoint) => {
            incomingHookedPoint.items.forEach((incomingHookedPointItem) => {
                // init
                let isModified: boolean = false;
                // set property by config
                if (incomingHookedPointItem && incomingHookedPointItem.metadata) {
                    isModified = this.setItemProperty(incomingHookedPointItem.metadata as object);
                }
                // send to outcoming anchor points
                const outcomingAnchorPointFound = this.findAnchorPoint(
                    AnchorPointType.OUTCOMING,
                    isModified ? 'MODIFIED' : 'UNMODIFIED'
                );
                if (outcomingAnchorPointFound) {
                    outcomingAnchorPointFound.hookedPoints.forEach(target => target.items.push(incomingHookedPointItem));
                }
            });
        });
    }

    checkConfig(): boolean {
        const configs = this._originConfig.moduleConfig;
        if (configs) {
            if (!Array.isArray(configs)) {
                return false;
            }
            for (let time = 0; time < configs.length; time++) {
                if (!configs[time].hasOwnProperty('property')) {
                    return false;
                }
                if (!configs[time].hasOwnProperty('value')) {
                    return false;
                }
            }
        }
        return true;
    }

    // *********************
    // Default
    // *********************

    private setItemProperty(item: object): boolean {
        try {
            let isModified: boolean = false;
            (this._originConfig.moduleConfig || []).forEach((config) => {
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
            this._errors.push(error);
            return false;
        }
    }

}

export type ModifierConfig = Array<{
    property: string;
    value: unknown;
}>;