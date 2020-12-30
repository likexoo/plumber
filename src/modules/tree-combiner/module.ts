import { BasePipelineModule } from "../../cores/base-pipeline-module.core";
import { AnchorPointType, Item, PipelineModuleDefinition, PipelineModuleRunningStatus, PipelineNodeModuleName } from "../../type";

export class TreeCombiner extends BasePipelineModule<TreeCombinerConfig> implements PipelineModuleRunningStatus<TreeCombinerConfig> {

    _originDefinition: PipelineModuleDefinition = {
        name: PipelineNodeModuleName.TREE_COMBINER,
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
                name: 'DEFAULT',
                isAllowUnhooked: false,
                moduleWhitelist: []
            }
        ]
    };

    run(): void {

        // 1        
        let total: Array<Item> = [];
        this._incomingAnchorPoints.forEach(anchorPoint => {
            anchorPoint.hookedPoints.forEach(hookedPoint => {
                total.push(...hookedPoint.items);
            });
        });

        // 2
        let total2: Array<Item> = [];
        this.getAllHookedPoints(AnchorPointType.INCOMING).forEach(hookedPoint => {
            total2.push(...hookedPoint.items);
        });

        // 3
        this._originConfig.moduleConfig;

        // 4
        let result: Array<Item> = [];
        this.getAllHookedPoints(AnchorPointType.OUTCOMING).forEach(hookedPoint => {
            hookedPoint.items = result;
        });

        // 5
        this._errors.push({});

    }

    checkConfig(): boolean {
        throw new Error("Method not implemented.");
    }

}

export type TreeCombinerConfig = object;
