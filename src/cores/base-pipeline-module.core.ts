import { AnchorPointRunningStatus, AnchorPointType, HookedPointRunningStatus, PipelineModuleConfig } from "../type";

export class BasePipelineModule<MC = object> {

    // *********************
    // Running Status
    // *********************

    _originConfig: PipelineModuleConfig<MC>;

    _errors: object[] = [];
    _incomingAnchorPoints: AnchorPointRunningStatus[] = [];
    _outcomingAnchorPoints: AnchorPointRunningStatus[] = [];

    public init(config: PipelineModuleConfig) {
        this._originConfig = config as unknown as PipelineModuleConfig<MC>;
        this.initAnchorPoints();
    }

    protected initAnchorPoints() {
        this._originConfig.incomingAnchorPointConfigs.forEach((anchorPointConfigTarget, anchorPointConfigIndex) => {
            this._incomingAnchorPoints.push({
                name: anchorPointConfigTarget.name,
                hookedPoints: []
            })
            anchorPointConfigTarget.hookedPointConfigs.forEach((hookedPointConfigTarget) => {
                this._incomingAnchorPoints[anchorPointConfigIndex].hookedPoints.push({
                    ...hookedPointConfigTarget,
                    items: []
                })
            });
        });
        this._originConfig.outcomingAnchorPointConfigs.forEach((anchorPointConfigTarget, anchorPointConfigIndex) => {
            this._outcomingAnchorPoints.push({
                name: anchorPointConfigTarget.name,
                hookedPoints: []
            })
            anchorPointConfigTarget.hookedPointConfigs.forEach((hookedPointConfigTarget) => {
                this._outcomingAnchorPoints[anchorPointConfigIndex].hookedPoints.push({
                    ...hookedPointConfigTarget,
                    items: []
                })
            });
        });
    }

    // *********************
    // Tools
    // *********************

    protected getAllHookedPoints(
        anchorPointType: AnchorPointType
    ): Array<HookedPointRunningStatus> {
        return (anchorPointType === AnchorPointType.INCOMING ? this._incomingAnchorPoints : this._outcomingAnchorPoints)
            .map((anchorPoint) => anchorPoint.hookedPoints)
            .flat();
    }

    protected findAnchorPoint(
        anchorPointType: AnchorPointType,
        name: string
    ): AnchorPointRunningStatus | undefined {
        return (anchorPointType === AnchorPointType.INCOMING ? this._incomingAnchorPoints : this._outcomingAnchorPoints)
            .find((anchorPoint) => anchorPoint.name === name);
    }

}