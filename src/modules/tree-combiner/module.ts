import { BasePipelineModule, ConditionTypes, TheValueTypes } from "../../cores/base-pipeline-module.core";
import { AnchorPointType, Item, PipelineModuleDefinition, PipelineModuleRunningStatus, PipelineNodeModuleName } from "../../type";

export class TreeCombiner extends BasePipelineModule<TreeCombinerTypes.TreeCombinerConfig> implements PipelineModuleRunningStatus<TreeCombinerTypes.TreeCombinerConfig> {

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
        let config: TreeCombinerTypes.TreeCombinerConfig | undefined = this._originConfig.moduleConfig;
        if (config) {
            const items: Item[] = [];
            this._incomingAnchorPoints.forEach(anchorPoint => {
                anchorPoint.hookedPoints.forEach(hookedPoint => {
                    items.push(...hookedPoint.items);
                });
            });
            const report: TreeCombinerTypes.BuildTreeObjectReport = this.buildTreeObject(config, items);
            const result: Item[] = this.parseTreeObject(report.treeObject);
            this.getAllHookedPoints(AnchorPointType.OUTCOMING).forEach(hookedPoint => {
                hookedPoint.items = result;
            });
        }
    }

    checkConfig(): boolean {
        throw new Error("Method not implemented.");
    }

    // *********************
    // Core
    // *********************

    private buildTreeObject(
        config: TreeCombinerTypes.TreeCombinerConfig,
        items: Item[]
    ): TreeCombinerTypes.BuildTreeObjectReport {
        // $ 0
        let report: TreeCombinerTypes.BuildTreeObjectReport = {
            treeObject: {},
            treeNum: 0
        };
        let treeObject: TreeCombinerTypes.TreeObject = {};
        let paints: TreeCombinerTypes.Paint[] = config.paints;
        // $ 1
        items.forEach(item => {
            // 1.1
            let treeValue: string = '';
            paints.forEach(paint => {
                const paintString = this.getPaintValueByItem(paint, item);
                treeValue += this.buildTreeValueByValue(TreeCombinerTypes.TREE_NAME_PREFIX, paintString);
            });
            // 1.2
            if (treeObject.hasOwnProperty(treeValue)) {
                treeObject[treeValue].items.push(item);
            }
            else {
                treeObject[treeValue] = {
                    treeValue: treeValue,
                    items: [item]
                };
                report.treeNum++;
            }
        });
        // $ 2
        report.treeObject = treeObject;
        return report;
    }

    private parseTreeObject(
        treeObject: TreeCombinerTypes.TreeObject
    ): Item[] {
        // $ 0
        let items: Item[] = [];
        // $ 1
        Object.keys(treeObject).forEach(treeValue => {
            if (treeValue.startsWith(TreeCombinerTypes.TREE_NAME_PREFIX)) {
                if (treeObject[treeValue].items.length >= 1) {
                    let clonedTreeValueItems: Item[] = [...treeObject[treeValue].items];
                    let firstItem: Item = clonedTreeValueItems[0];
                    if (clonedTreeValueItems.length >= 2) {
                        clonedTreeValueItems = clonedTreeValueItems.slice(1, clonedTreeValueItems.length);
                        clonedTreeValueItems.forEach(item => {
                            firstItem.metadata.push(...item.metadata);
                        });
                    }
                    items.push(firstItem);
                }
            }
        })
        // $ 2
        return items;
    }

    // *********************
    // Tree
    // *********************

    private buildTreeValueByValue(
        treeValue: string,
        val: unknown
    ): string {
        try {
            if (Array.isArray(val)) {
                return treeValue + val.sort((a, b) => ('' + a).localeCompare('' + b)).join('');
            }
            else {
                return treeValue + val;
            }
        } catch (error) {
            return treeValue + val;
        }
    }

    // *********************
    // Paint
    // *********************

    private getPaintValueByItem(
        paint: TreeCombinerTypes.Paint,
        item: Item
    ): string {
        try {
            // $ 0
            let treeValue: string = TreeCombinerTypes.INVALID_TREE_NAME;
            // $ 1
            if (paint.way === TreeCombinerTypes.PaintWayType.SORTED_METADATA_OBJECTS) {
                let paintValues: string[] = [];
                item.metadata.forEach(m => {
                    paintValues.push(this.getPaintValueByMetadaObject(paint, m));
                });
                treeValue = paintValues.sort((a, b) => ('' + a).localeCompare('' + b)).join('');
            }
            else if (paint.way === TreeCombinerTypes.PaintWayType.SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE) {
                let paintValues: string[] = [];
                item.metadata.forEach(m => {
                    paintValues.push(this.getPaintValueByMetadaObject(paint, m));
                });
                treeValue = Array.from(new Set(paintValues)).sort((a, b) => ('' + a).localeCompare('' + b)).join('');
            }
            // $ 2
            return treeValue;
        } catch (error) {
            return TreeCombinerTypes.INVALID_TREE_NAME;
        }
    }

    private getPaintValueByMetadaObject(
        paint: TreeCombinerTypes.Paint,
        metadataObject: object
    ) {
        try {
            // $ 0
            let treeValue: string = TreeCombinerTypes.INVALID_TREE_NAME;
            // $ 1
            if (this.isPaintValue(paint)) {
                treeValue = '' + this.parseTheValue(paint.value, metadataObject);
            }
            else if (this.isPaintCondition(paint)) {
                let isAllConditionsPassed: boolean = true;
                paint.consitions.forEach(c => {
                    if (this.parseCondition(c, metadataObject) === false) {
                        isAllConditionsPassed = false;
                    }
                });
                if (isAllConditionsPassed) {
                    treeValue = '' + this.parseTheValue(paint.true, metadataObject);
                }
                else {
                    treeValue = '' + this.parseTheValue(paint.false, metadataObject);
                }
            }
            // $ 2
            return treeValue;
        } catch (error) {
            return TreeCombinerTypes.INVALID_TREE_NAME;
        }
    }

    // *********************
    // Type Checker
    // *********************

    // Paint

    private isPaintValue(val: unknown): val is TreeCombinerTypes.PaintValue {
        try {
            return (val as TreeCombinerTypes.PaintValue).type === TreeCombinerTypes.PaintType.PAINT_VALUE;
        } catch (error) {
            return false;
        }
    }

    private isPaintCondition(val: unknown): val is TreeCombinerTypes.PaintCondition {
        try {
            return (val as TreeCombinerTypes.PaintCondition).type === TreeCombinerTypes.PaintType.PAINT_CONDTION;
        } catch (error) {
            return false;
        }
    }

}

export namespace TreeCombinerTypes {

   // Default

    export type TreeCombinerConfig = {
        paints: Array<Paint>;
    };

    export interface TheGlobalContext {
        totalItems: Array<Item>;
        currentItem: Item;
        currentMetadataObject: object;
    }

    export interface TreeObject {
        [key: string]: {
            treeValue: string;
            items: Item[];
        }
    }

    // Paint

    export type Paint = PaintValue | PaintCondition;

    export enum PaintType {
        PAINT_VALUE = 'PAINT_VALUE',
        PAINT_CONDTION = 'PAINT_CONDTION'
    }

    export enum PaintWayType {
        SORTED_METADATA_OBJECTS = 'SORTED_METADATA_OBJECTS',
        SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE = 'SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE'
    }

    export interface PaintValue {
        type: PaintType.PAINT_VALUE;
        way: PaintWayType;
        value: TheValueTypes.TheValue;
    };

    export interface PaintCondition {
        type: PaintType.PAINT_CONDTION;
        way: PaintWayType;
        consitions: Array<ConditionTypes.Condition>;
        true: TheValueTypes.TheValue;
        false: TheValueTypes.TheValue;
    };

    // Constants

    export const INVALID_TREE_NAME = '<INVALID_TREE_NAME>';

    export const TREE_NAME_PREFIX = '<TREE>';

    // Others
    export interface BuildTreeObjectReport {
        treeObject: TreeObject;
        treeNum: number;
    }

}