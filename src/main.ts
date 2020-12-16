import { Modifier } from "./modules/modifier/module";
import {
    PipelineNode, PipelineNodeModule, PipelineNodeModuleName,
    PipelineStep, PipelineStepRunningStatus, PropType
} from "./type";

export class Plumber {

    protected steps: Array<PipelineStep> = [];

    protected _stepIndex: number = -1;
    protected _steps: Array<PipelineStepRunningStatus> = [];

    public init(
        steps: Array<PipelineStep>
    ) {
        // init
        this.steps = steps;
        // init all steps
        this.steps.forEach((step) => {
            // init
            let stepRunningStatus = {
                _origin: step,
                _errors: [],
                _modules: []
            } as PipelineStepRunningStatus;
            // install all modules
            step.nodes.forEach((node) => {
                const m = this.installNodeModule(node)
                if (m) {
                    stepRunningStatus._modules.push(m);
                }
            });
            // push to running status steps
            this._steps.push(stepRunningStatus);
        });
    }

    private preRun() {
        this._stepIndex = -1;
        if (!Array.isArray(this._steps)) {
            this._steps = [];
        }
    }

    public run() {
        this.preRun();
        for (; this._stepIndex < this._steps.length;) {
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

    private runStep(step: PipelineStepRunningStatus) {
        step._modules.forEach(m => this.runModule(m));
    }

    private runModule(module: PipelineNodeModule) {
        module.init();
        module.run();
    }

    private installNodeModule(
        node: PipelineNode
    ) {
        let m = undefined;
        if (node.module === PipelineNodeModuleName.MODIFIER) {
            m = new Modifier();
            m._origin = node;
        }
        return m;
    }

}