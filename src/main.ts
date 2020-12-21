import { BasePipelineNodeModule } from "./cores/base-pipeline-node-module.core";
import { End } from "./modules/end/module";
import { Modifier } from "./modules/modifier/module";
import { Start } from "./modules/start/module";
import {
    Item,
    PipelineNode, PipelineNodeAnchorPointHookInformationRunningStatus, PipelineNodeModule, PipelineNodeModuleAnchorPointDefinition, PipelineNodeModuleName,
    PipelineNodeModules,
    PipelineStep, PipelineStepRunningStatus, PropType
} from "./type";

export class Plumber {

    protected _stepIndex: number = -1;
    protected _steps: Array<PipelineStepRunningStatus> = [];

    public startModuleData: Array<Item> = [];
    public endModuleData: object | undefined = undefined;

    public init(
        steps: Array<PipelineStep>
    ) {
        // init all steps
        steps.forEach((step) => {
            // init
            let stepRunningStatus = {
                _origin: step,
                _errors: [],
                _modules: []
            } as PipelineStepRunningStatus;
            // install all modules
            step.nodes.forEach((node) => {
                const m = this.getModule(node);
                if (m) {
                    stepRunningStatus._modules.push(m);
                }
            });
            // push to running status steps
            this._steps.push(stepRunningStatus);
        });
    }

    public run() {
        this.preRun();
        for (; this._stepIndex < this._steps.length - 1;) {
            this._stepIndex++;
            this.runStep(this._steps[this._stepIndex]);
        }
    }

    public * runByGenerator() {
        this.preRun();
        while (this._stepIndex < this._steps.length) {
            this._stepIndex++;
            this.runStep(this._steps[this._stepIndex]);
            yield;
        }
    }

    // *********************
    // Run Functions
    // *********************

    private preRun() {
        this._stepIndex = -1;
        if (!Array.isArray(this._steps)) {
            this._steps = [];
        }
    }

    private runStep(step: PipelineStepRunningStatus) {
        step._modules.forEach(m => this.runModule(m));
    }

    private runModule(module: PipelineNodeModule & BasePipelineNodeModule) {
        module.init();
        module.run();
        this.transfer(module);
    }

    // *********************
    // Service
    // *********************

    private transfer(module: PipelineNodeModule & BasePipelineNodeModule) {
        if (module._origin.module === PipelineNodeModuleName.END) {
            this.endModuleData = (module as End).data;
        }
        else {
            module._outcomingAnchorPointItems.forEach((point) => {
                const moduleFound = this.findModule(this._stepIndex + 1, point.toModuleId);
                if (moduleFound) {
                    if (moduleFound.isDynamicIncomingAnchorPoint) {
                        moduleFound._incomingAnchorPointItems.push(
                            {
                                fromModuleId: module._origin.id,
                                fromModuleType: module._origin.module,
                                fromModuleAnchorPointName: point.fromModuleAnchorPointName,
                                toModuleId: moduleFound._origin.id,
                                toModuleType: moduleFound._origin.module,
                                toModuleAnchorPointName: point.fromModuleAnchorPointName,
                                _items: [...point._items]

                            } as PipelineNodeAnchorPointHookInformationRunningStatus
                        );
                    }
                    else {
                        const pointFound = this.findAnchorPointItem(this._stepIndex + 1, point.toModuleId, 'INCOMING', 'TO', point.toModuleAnchorPointName);
                        if (pointFound) {
                            pointFound._items.push(...point._items);
                        }
                    }
                }
            });
        }
    }

    // *********************
    // Tool Functions
    // *********************

    private getModule(
        node: PipelineNode
    ): PipelineNodeModules | undefined {
        let m = undefined;
        if (node.module === PipelineNodeModuleName.START) {
            m = new Start();
            m._origin = node;
            m.data = this.startModuleData;
            this.initModule(m, node);
        }
        else if (node.module === PipelineNodeModuleName.END) {
            m = new End();
            m._origin = node;
            this.initModule(m, node);
        }
        else if (node.module === PipelineNodeModuleName.MODIFIER) {
            m = new Modifier();
            m._origin = node;
            this.initModule(m, node);
        }
        return m;
    }
    private initModule(
        module: PipelineNodeModule & BasePipelineNodeModule,
        node: PipelineNode
    ) {
        module._incomingAnchorPointItems = node.incomingAnchorPoints.map(point => ({ ...point, _items: [] }));
        module._outcomingAnchorPointItems = node.outcomingAnchorPoints.map(point => ({ ...point, _items: [] }));
    }

    protected findStep(
        stepIndex: number
    ): PipelineStepRunningStatus | undefined {
        return this._steps.find((step) => step._origin.index === stepIndex);
    }

    protected findModule(
        stepIndex: number,
        moduleId: string
    ): (PipelineNodeModule & BasePipelineNodeModule) | undefined {
        const step = this.findStep(stepIndex);
        if (!step) return undefined;
        return step._modules.find((module) => module._origin.id === moduleId);
    }

    protected findAnchorPointItem(
        stepIndex: number,
        moduleId: string,
        anchorPointType: 'INCOMING' | 'OUTCOMING',
        anchorPointDirection: 'FROM' | 'TO',
        anchorPointName: string
    ): PipelineNodeAnchorPointHookInformationRunningStatus | undefined {
        const moduleFound = this.findModule(stepIndex, moduleId);
        if (!moduleFound) return undefined;
        return (anchorPointType === 'INCOMING' ?
            moduleFound._incomingAnchorPointItems : moduleFound._outcomingAnchorPointItems
        ).find((point) =>
            (anchorPointDirection === 'FROM' ?
                point.fromModuleAnchorPointName : point.toModuleAnchorPointName
            ) === anchorPointName
        );
    }

}