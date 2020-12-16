import { BasePipelineNodeModule } from "./base-pipeline-node-module.core";

export class Checker {

    public static checkIncomingAnchorPoint<T extends BasePipelineNodeModule = any>(
        module: T
    ) {
        if (!Array.isArray(module._incomingAnchorPointItems)) {
            throw new Error(`module ${module._origin.id} anchor point items is not array.`);
        }
        module._incomingAnchorPointItems.forEach((point)=>{
        });
    }

}