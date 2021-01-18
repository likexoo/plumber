import { End } from "./modules/end/module";
import { Modifier } from "./modules/modifier/module";
import { Start } from "./modules/start/module";
import { TreeCombiner } from "./modules/tree-combiner/module";
import { ViewRefresh } from "./modules/view-refresh/module";
import {
    AnchorPointRunningStatus,
    AnchorPointType,
    HookedPointConfig,
    HookedPointRunningStatus,
    Item,
    PipelineModuleConfig,
    PipelineModuleRunningStatus,
    PipelineNodeModuleName, 
    PipelineStepConfig, 
    PipelineStepRunningStatus
} from "./type";

export class Plumber {

    protected stepIndex: number = -1;
    protected steps: Array<PipelineStepRunningStatus> = [];

    public startData: Array<Item> = [];
    public endData: Array<{
        endModuleId: string;
        data: Array<HookedPointRunningStatus>;
    }> = [];

    public init(
        stepDefinitions: Array<PipelineStepConfig>
    ) {
        stepDefinitions.forEach((stepDefTarget) => {
            // init
            let stepRunningStatus: PipelineStepRunningStatus = {
                index: stepDefTarget.index,
                modules: []
            }
            // install all module
            stepDefTarget.moduleConfigs.forEach((moduleConfig) => {
                const m = this.installModule(moduleConfig);
                if (m) stepRunningStatus.modules.push(m);
            });
            // push to steps
            this.steps.push(stepRunningStatus);
        });
    }

    // *********************
    // Run
    // *********************

    public run() {
        for (; this.stepIndex < this.steps.length - 1;) {
            this.stepIndex++;
            this.runStep(this.steps[this.stepIndex]);
        }
    }

    public * runByGenerator() {
        while (this.stepIndex < this.steps.length) {
            this.stepIndex++;
            this.runStep(this.steps[this.stepIndex]);
            yield;
        }
    }

    private runStep(step: PipelineStepRunningStatus) {
        step.modules.forEach(m => this.runModule(m));
    }

    private runModule(module: PipelineModuleRunningStatus) {
        module.run();
        this.transfer(module);
    }

    // *********************
    // Module
    // *********************

    private installModule(
        config: PipelineModuleConfig
    ): PipelineModuleRunningStatus | undefined {
        let m: PipelineModuleRunningStatus | undefined;
        if (config.name === PipelineNodeModuleName.START) {
            m = new Start();
            m.init(config);
            (m as Start).data = this.startData;
        }
        else if (config.name === PipelineNodeModuleName.END) {
            m = new End();
            m.init(config);
        }
        else if (config.name === PipelineNodeModuleName.MODIFIER) {
            m = new Modifier();
            m.init(config);
        }
        else if (config.name === PipelineNodeModuleName.TREE_COMBINER) {
            m = new TreeCombiner();
            m.init(config);
        }
        else if (config.name === PipelineNodeModuleName.VIEW_REFRESH) {
            m = new ViewRefresh();
            m.init(config);
        }
        return m;
    }

    // *********************
    // Service
    // *********************

    private transfer(module: PipelineModuleRunningStatus) {
        // init
        const nextStepIndex = this.stepIndex + 1;
        // if module is END
        if (module._originDefinition.name === PipelineNodeModuleName.END) {
            this.endData.push({
                endModuleId: module._originConfig.id,
                data: (module as End).data
            });
        }
        // if module is not END
        else {
            module._outcomingAnchorPoints.forEach((anchorPoint) => {
                anchorPoint.hookedPoints.forEach((hookedPoint) => {
                    const nextModuleAnxhorPoint = this.findAnchorPoint(
                        nextStepIndex,
                        hookedPoint.toModuleId,
                        AnchorPointType.INCOMING,
                        hookedPoint.toModuleAnchorPointName
                    );
                    if (nextModuleAnxhorPoint) {
                        const nextModuleHookedPoint = this.findHookedPointInAnchorPoint(
                            nextModuleAnxhorPoint,
                            {
                                fromModuleId: hookedPoint.fromModuleId,
                                fromModuleAnchorPointName: hookedPoint.fromModuleAnchorPointName,
                                toModuleId: hookedPoint.toModuleId,
                                toModuleAnchorPointName: hookedPoint.toModuleAnchorPointName,
                            }
                        );
                        if (nextModuleHookedPoint) {
                            if (!Array.isArray(nextModuleHookedPoint.items)) nextModuleHookedPoint.items = [];
                            nextModuleHookedPoint.items.push(...hookedPoint.items);
                        }
                    }
                });
            });
        }
    }

    // *********************
    // Tool Functions
    // *********************

    protected findStep(
        stepIndex: number
    ): PipelineStepRunningStatus | undefined {
        return this.steps.find((step) => step.index === stepIndex);
    }

    protected findModule(
        stepIndex: number,
        moduleId: string
    ): PipelineModuleRunningStatus | undefined {
        const step = this.findStep(stepIndex);
        if (!step) return undefined;
        return step.modules.find((module) => module._originConfig.id === moduleId);
    }

    protected findAnchorPoint(
        stepIndex: number,
        moduleId: string,
        anchorPointType: AnchorPointType,
        anchorPointName: string
    ): AnchorPointRunningStatus | undefined {
        const moduleFound = this.findModule(stepIndex, moduleId);
        if (!moduleFound) return undefined;
        return (anchorPointType === 'INCOMING' ?
            moduleFound._incomingAnchorPoints : moduleFound._outcomingAnchorPoints
        ).find((point) => point.name === anchorPointName);
    }

    protected findHookedPointInAnchorPoint(
        anchorPoint: AnchorPointRunningStatus,
        hookedPointInfo: Partial<Pick<HookedPointConfig, 'fromModuleId' | 'fromModuleAnchorPointName' | 'toModuleId' | 'toModuleAnchorPointName'>>
    ): HookedPointRunningStatus | undefined {
        return anchorPoint.hookedPoints.find((hookedPoint) => {
            let isSameHookedPoint: boolean = true;
            if (hookedPointInfo.hasOwnProperty('fromModuleId') && hookedPoint.fromModuleId !== hookedPointInfo.fromModuleId) {
                isSameHookedPoint = false;
            }
            if (hookedPointInfo.hasOwnProperty('fromModuleAnchorPointName') && hookedPoint.fromModuleAnchorPointName !== hookedPointInfo.fromModuleAnchorPointName) {
                isSameHookedPoint = false;
            }
            if (hookedPointInfo.hasOwnProperty('toModuleId') && hookedPoint.toModuleId !== hookedPointInfo.toModuleId) {
                isSameHookedPoint = false;
            }
            if (hookedPointInfo.hasOwnProperty('toModuleAnchorPointName') && hookedPoint.toModuleAnchorPointName !== hookedPointInfo.toModuleAnchorPointName) {
                isSameHookedPoint = false;
            }
            return isSameHookedPoint;
        });
    }

}