import { Modifier } from "./modules/modifier/module";

// *********************
// Pipeline
// *********************

export interface Pipeline {
    steps: Array<PipelineStep>;
}

export interface PipelineStep {
    index: number;
    nodes: Array<PipelineNode>;
}

// *********************
// Pipeline Node
// *********************

export interface PipelineNode {

    id: string;
    module: PipelineNodeModuleName;

    config: object;

    incomingAnchorPoints: Array<PipelineNodeAnchorPointHookInformation>;
    outcomingAnchorPoints: Array<PipelineNodeAnchorPointHookInformation>;

}

export interface PipelineNodeAnchorPointHookInformation {

    fromModule: PropType<PipelineNode, 'id'>;
    fromModuleType: PipelineNodeModuleName;
    fromModuleAnchorPointName: PropType<PipelineNodeModuleAnchorPointDefinition, 'name'>;

    toModule: PropType<PipelineNode, 'id'>;
    toModuleType: PipelineNodeModuleName;
    toModuleAnchorPointName: PropType<PipelineNodeModuleAnchorPointDefinition, 'name'>;

}

// *********************
// Pipeline Node Module
// *********************

export type PipelineNodeModules = Modifier;

export enum PipelineNodeModuleName {
    'MODIFIER' = 'MODIFIER',
    'START' = 'START',
    'END' = 'END',
    'TREE_COMBINER' = 'TREE_COMBINER'
}

export interface PipelineNodeModule {

    errors: Array<object>;

    isDynamicIncomingAnchorPoint: boolean;
    incomingAnchorPointDefinitions: Array<PipelineNodeModuleAnchorPointDefinition>;

    isDynamicOutcomingAnchorPoint: boolean;
    outcomingAnchorPointDefinitions: Array<PipelineNodeModuleAnchorPointDefinition>;

    init(): void;

    run(): void;

}

export interface PipelineNodeModuleAnchorPointDefinition {

    name: string;
    isAllowUnhooked: boolean;
    moduleWhitelist: Array<PipelineNodeModuleName>;

}

// *********************
// Item
// *********************

export type Item = SingleItem | CompoundItem;

export interface SingleItem<T = unknown> {

    id: string;
    metadata: T;

}

export interface CompoundItem<T = unknown> {

    id: string;
    metadata: Array<T>;

    items: Array<SingleItem>;

}

// *********************
// Running Status
// *********************

export interface PipelineRunningStatus {
    _origin: Pipeline;
    _errors: Array<object>;
}

export interface PipelineStepRunningStatus {
    _origin: PipelineStep;
    _errors: Array<object>;
    _modules: Array<PipelineNodeModules>;
}

export interface PipelineNodeRunningStatus {
    _origin: PipelineNode;
    _incomingAnchorPointItems: Array<PipelineNodeAnchorPointHookInformationRunningStatus>;
    _outcomingAnchorPointItems: Array<PipelineNodeAnchorPointHookInformationRunningStatus>;
}

export interface PipelineNodeAnchorPointHookInformationRunningStatus
    extends PipelineNodeAnchorPointHookInformation {
    _items: Array<Item>;
}

// *********************
// Others
// *********************

export declare type PropType<T, P extends keyof T> = T[P];
