
// *********************
// Default
// *********************

import { BasePipelineModule } from "./cores/base-pipeline-module.core";
import { End } from "./modules/end/module";
import { Modifier } from "./modules/modifier/module";
import { Start } from "./modules/start/module";

export enum PipelineNodeModuleName {
    'MODIFIER' = 'MODIFIER',
    'START' = 'START',
    'END' = 'END',
    'TREE_COMBINER' = 'TREE_COMBINER'
}

export type PipelineNodeModule = Start | End | Modifier;

export enum AnchorPointType {
    'INCOMING' = 'INCOMING',
    'OUTCOMING' = 'OUTCOMING'
}

// *********************
// Pipeline Module Definition
// *********************

export interface PipelineModuleDefinition {

    name: PipelineNodeModuleName;
    version: string;

    incomingAnchorPointDefinitions: Array<AnchorPointDefinition>;
    outcomingAnchorPointDefinitions: Array<AnchorPointDefinition>;

}

export interface AnchorPointDefinition {

    name: string;
    isAllowUnhooked: boolean;
    moduleWhitelist: Array<PipelineNodeModuleName>;

}

// *********************
// Pipeline Step Config
// *********************

export interface PipelineStepConfig {
    index: number;
    moduleConfigs: Array<PipelineModuleConfig>;
}


// *********************
// Pipeline Module Config
// *********************

export interface PipelineModuleConfig<MC = object> {

    id: string;

    name: PipelineNodeModuleName;
    version: string;

    incomingAnchorPointConfigs: Array<AnchorPointConfig>;
    outcomingAnchorPointConfigs: Array<AnchorPointConfig>;

    moduleConfig: MC | undefined;

}

export interface AnchorPointConfig {

    name: string;

    hookedPointConfigs: Array<HookedPointConfig>

}

export interface HookedPointConfig {

    fromModuleId: string;
    fromModuleType: PipelineNodeModuleName;
    fromModuleAnchorPointName: string;

    toModuleId: string;
    toModuleType: PipelineNodeModuleName;
    toModuleAnchorPointName: string;

}

// *********************
// Pipeline Module Running Status
// *********************

export interface PipelineModuleRunningStatus<MC = object> extends BasePipelineModule<MC> {

    _originDefinition: PipelineModuleDefinition;

    run(): void;

    checkConfig(): boolean;

}

export interface AnchorPointRunningStatus {

    name: string;
    hookedPoints: Array<HookedPointRunningStatus>;

}

export interface HookedPointRunningStatus {

    fromModuleId: string;
    fromModuleType: PipelineNodeModuleName;
    fromModuleAnchorPointName: string;

    toModuleId: string;
    toModuleType: PipelineNodeModuleName;
    toModuleAnchorPointName: string;

    items: Array<Item>;

}

// *********************
// Running Status
// *********************

export interface PipelineStepRunningStatus {
    index: number;
    modules: Array<PipelineModuleRunningStatus>;
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
// Others
// *********************

export declare type PropType<T, P extends keyof T> = T[P];
