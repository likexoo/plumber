import { End } from "./modules/end/module";
import { Modifier } from "./modules/modifier/module";
import { Start } from "./modules/start/module";
import { TreeCombiner } from "./modules/tree-combiner/module";
import { ViewRefresh } from "./modules/view-refresh/module";
import { PipelineModuleConfig, PipelineNodeModule, PipelineNodeModuleName } from "./type";

export function createModuleConfig(
    id: string,
    moduleName: PipelineNodeModuleName
): PipelineModuleConfig {
    let config: object = {
        id,
        incomingAnchorPointConfigs: [],
        outcomingAnchorPointConfigs: [],
        moduleConfig: undefined
    }
    let m = {};
    if (moduleName === PipelineNodeModuleName.START) {
        m = new Start();
    }
    else if (moduleName === PipelineNodeModuleName.END) {
        m = new End();
    }
    else if (moduleName === PipelineNodeModuleName.MODIFIER) {
        m = new Modifier();
    }
    else if (moduleName === PipelineNodeModuleName.TREE_COMBINER) {
        m = new TreeCombiner();
    }
    else if (moduleName === PipelineNodeModuleName.VIEW_REFRESH) {
        m = new ViewRefresh();
    }
    // set config
    Object.defineProperty(config, 'name', {
        value: (m as PipelineNodeModule)._originDefinition.name,
        writable: true
    });
    Object.defineProperty(config, 'version', {
        value: (m as PipelineNodeModule)._originDefinition.version,
        writable: true
    });
    Object.defineProperty(config, 'incomingAnchorPointConfigs', {
        value: (m as PipelineNodeModule)._originDefinition.incomingAnchorPointDefinitions.map(t => ({
            name: t.name,
            hookedPointConfigs: []
        })),
        writable: true
    });
    Object.defineProperty(config, 'outcomingAnchorPointConfigs', {
        value: (m as PipelineNodeModule)._originDefinition.outcomingAnchorPointDefinitions.map(t => ({
            name: t.name,
            hookedPointConfigs: []
        })),
        writable: true
    });
    return config as PipelineModuleConfig;
}
