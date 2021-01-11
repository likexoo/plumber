import { BasePipelineModule } from "../../cores/base-pipeline-module.core";
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
        const report: TreeCombinerTypes.BuildTreeObjectReport = this.buildTreeObject();
        const result: Item[] = this.parseTreeObject(report.treeObject);
        this.getAllHookedPoints(AnchorPointType.OUTCOMING).forEach(hookedPoint => {
            hookedPoint.items = result;
        });
    }

    checkConfig(): boolean {
        throw new Error("Method not implemented.");
    }

    // *********************
    // Core
    // *********************

    private buildTreeObject(): TreeCombinerTypes.BuildTreeObjectReport {
        // $ 0
        let report: TreeCombinerTypes.BuildTreeObjectReport = {
            treeObject: {},
            treeNum: 0
        };
        let treeObject: TreeCombinerTypes.TreeObject = {};
        let config: TreeCombinerTypes.TreeCombinerConfig | undefined = this._originConfig.moduleConfig;
        if (!config) {
            return report;
        }
        let paints: TreeCombinerTypes.Paint[] = config.paints;
        let items: Item[] = [];
        this._incomingAnchorPoints.forEach(anchorPoint => {
            anchorPoint.hookedPoints.forEach(hookedPoint => {
                items.push(...hookedPoint.items);
            });
        });
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
                treeValue = '' + this.runTheValue(paint.value, metadataObject);
            }
            else if (this.isPaintCondition(paint)) {
                let isAllConditionsPassed: boolean = true;
                paint.consitions.forEach(c => {
                    if (this.runCondition(c, metadataObject) === false) {
                        isAllConditionsPassed = false;
                    }
                });
                if (isAllConditionsPassed) {
                    treeValue = '' + this.runTheValue(paint.true, metadataObject);
                }
                else {
                    treeValue = '' + this.runTheValue(paint.false, metadataObject);
                }
            }
            // $ 2
            return treeValue;
        } catch (error) {
            return TreeCombinerTypes.INVALID_TREE_NAME;
        }
    }

    // *********************
    // The Value
    // *********************

    private runTheValue(
        theValue: TreeCombinerTypes.TheValue,
        context: object
    ): unknown {
        try {
            if (this.isConstantTheValue(theValue)) {
                return theValue.value;
            }
            else if (this.isKeyTheValue(theValue)) {
                return (context as any)[theValue.key];
            }
            else if (this.isUniqueTheValue(theValue)) {
                return this.generateRandomId();
            }
            else {
                return undefined;
            }
        } catch (error) {
            return undefined;
        }
    }

    // *********************
    // Condition
    // *********************

    private runCondition(
        condition: TreeCombinerTypes.Condition,
        context: object
    ): boolean {
        try {
            let isConditionPassed: boolean = false;
            if (this.isEqualCondition(condition)) {
                const valueA: string = '' + this.runTheValue(condition.valueA, context);
                const valueB: string = '' + this.runTheValue(condition.valueB, context);
                isConditionPassed = valueA === valueB;
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isRegexCondition(condition)) {
                const value: string = '' + this.runTheValue(condition.value, context);
                isConditionPassed = condition.regex.test(value);
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isInArrayCondition(condition)) {
                const value: string = '' + this.runTheValue(condition.value, context);
                const arrayValue = '' + this.runTheValue(condition.arrayValue, context);
                if (!Array.isArray(arrayValue)) {
                    return false;
                }
                isConditionPassed = arrayValue.findIndex(t => '' + t === '' + value) !== -1;
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isNumberRangeCondition(condition)) {
                const valueA: number = Number.parseFloat(Number.parseFloat('' + this.runTheValue(condition.valueA, context)).toFixed(condition.decimalPoint));
                const valueB: number = Number.parseFloat(Number.parseFloat('' + this.runTheValue(condition.valueB, context)).toFixed(condition.decimalPoint));
                if (condition.mathSymbol === TreeCombinerTypes.MathSymbol.E) {
                    isConditionPassed = valueA === valueB;
                }
                else if (condition.mathSymbol === TreeCombinerTypes.MathSymbol.GT) {
                    isConditionPassed = valueA > valueB;
                }
                else if (condition.mathSymbol === TreeCombinerTypes.MathSymbol.GTE) {
                    isConditionPassed = valueA >= valueB;
                }
                else if (condition.mathSymbol === TreeCombinerTypes.MathSymbol.LT) {
                    isConditionPassed = valueA < valueB;
                }
                else if (condition.mathSymbol === TreeCombinerTypes.MathSymbol.LTE) {
                    isConditionPassed = valueA <= valueB;
                }
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            return isConditionPassed;
        } catch (error) {
            return false;
        }
    }

    // *********************
    // Tool
    // *********************

    private generateRandomId(): string {
        let result: string = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    private getValueReportByKeyPathInGlobalContext(
        keyPath: string,
        target: unknown
    ): unknown {
        try {
            return (target as any)[keyPath];
            // TODO: 支持类似于lodash的.get()方法
            // const matchedStrings = `${keyPath}`.match(/^[^.]+\./g);
            // if (matchedStrings && matchedStrings.length > 0) {
            //     // init
            //     let currentPath = matchedStrings[0].substring(0, matchedStrings[0].length - 1);
            //     let currentPathInStringType: string = '' + currentPath;
            //     let currentPathInNumberType: number | undefined = Number.parseInt('' + currentPath);
            //     // check if current path is array-like path
            //     const arrayLikePathMatchedStrings = `${keyPath}`.match(/^[^.\[\]]+\[[\d]+\]/g);
            //     // ...
            //     if (target) {
            //         if ((target as object).hasOwnProperty(currentPathInStringType)) {
            //             return (target as any)[currentPathInStringType];
            //         }
            //         else if ((target as object).hasOwnProperty(currentPathInNumberType)) {
            //             return (target as any)[currentPathInNumberType];
            //         }
            //         else {
            //             return undefined;
            //         }
            //     }
            // }
        } catch (error) {
            return undefined;
        }
    }

    // *********************
    // Type Checker
    // *********************

    // TheValue

    private isConstantTheValue(val: unknown): val is TreeCombinerTypes.ConstantTheValue {
        try {
            return (val as TreeCombinerTypes.ConstantTheValue).type === TreeCombinerTypes.TheValueType.CONSTANT;
        } catch (error) {
            return false;
        }
    }

    private isKeyTheValue(val: unknown): val is TreeCombinerTypes.KeyTheValue {
        try {
            return (val as TreeCombinerTypes.KeyTheValue).type === TreeCombinerTypes.TheValueType.KEY;
        } catch (error) {
            return false;
        }
    }

    private isUniqueTheValue(val: unknown): val is TreeCombinerTypes.UniqueTheValue {
        try {
            return (val as TreeCombinerTypes.UniqueTheValue).type === TreeCombinerTypes.TheValueType.UNIQUE;
        } catch (error) {
            return false;
        }
    }

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

    // Condition

    private isEqualCondition(val: unknown): val is TreeCombinerTypes.EqualCondition {
        try {
            return (val as TreeCombinerTypes.EqualCondition).type === TreeCombinerTypes.ConditionType.EQUAL;
        } catch (error) {
            return false;
        }
    }

    private isRegexCondition(val: unknown): val is TreeCombinerTypes.RegexCondition {
        try {
            return (val as TreeCombinerTypes.RegexCondition).type === TreeCombinerTypes.ConditionType.REGEX;
        } catch (error) {
            return false;
        }
    }

    private isInArrayCondition(val: unknown): val is TreeCombinerTypes.InArrayCondition {
        try {
            return (val as TreeCombinerTypes.InArrayCondition).type === TreeCombinerTypes.ConditionType.IN_ARRAY;
        } catch (error) {
            return false;
        }
    }

    private isNumberRangeCondition(val: unknown): val is TreeCombinerTypes.NumberRangeCondition {
        try {
            return (val as TreeCombinerTypes.NumberRangeCondition).type === TreeCombinerTypes.ConditionType.NUMBER_RANGE;
        } catch (error) {
            return false;
        }
    }

}

// Default

export namespace TreeCombinerTypes {

    // default

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

    // TheValue

    export type TheValue = ConstantTheValue | KeyTheValue | UniqueTheValue;

    export enum TheValueType {
        CONSTANT = 'CONSTANT',
        KEY = 'KEY',
        UNIQUE = 'UNIQUE',
    }

    export interface ConstantTheValue {
        type: TheValueType.CONSTANT;
        value: unknown;
    }

    export interface KeyTheValue {
        type: TheValueType.KEY;
        key: string;
    }

    export interface UniqueTheValue {
        type: TheValueType.UNIQUE;
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
        value: TheValue;
    };

    export interface PaintCondition {
        type: PaintType.PAINT_CONDTION;
        way: PaintWayType;
        consitions: Array<Condition>;
        true: TheValue;
        false: TheValue;
    };

    // Condition

    export type Condition = EqualCondition | RegexCondition | InArrayCondition | NumberRangeCondition;

    export enum ConditionType {
        EQUAL = 'EQUAL',
        REGEX = 'REGEX',
        IN_ARRAY = 'IN_ARRAY',
        NUMBER_RANGE = 'NUMBER_RANGE',
    }

    /**
     * 将valueA和valueB转化为string，然后进行比较
     */
    export interface EqualCondition {
        type: ConditionType.EQUAL;
        valueA: TheValue;
        valueB: TheValue;
        reverse?: boolean;
    }

    /**
     * 将value转化为string，然后按照regex进行比较
     */
    export interface RegexCondition {
        type: ConditionType.REGEX;
        value: TheValue;
        regex: RegExp;
        reverse?: boolean;
    }

    /**
     * 将value转化为string，尝试提取arrayValue（类型必须为数组），然后进行比较
     */
    export interface InArrayCondition {
        type: ConditionType.IN_ARRAY;
        value: TheValue;
        arrayValue: TheValue;
        reverse?: boolean;
    }

    /**
     * 将valueA和valueB转化为number（按照decimalPoint进行小数点保留），然后按照数学符号进行比较
     */
    export interface NumberRangeCondition {
        type: ConditionType.NUMBER_RANGE;
        valueA: TheValue;
        valueB: TheValue;
        mathSymbol: MathSymbol;
        decimalPoint: number;
        reverse?: boolean;
    }

    // Constants

    export const INVALID_TREE_NAME = '<INVALID_TREE_NAME>';

    export const TREE_NAME_PREFIX = '<TREE>';

    // Others

    export enum MathSymbol {
        E = 'E',
        GTE = 'GTE',
        GT = 'GT',
        LTE = 'LTE',
        LT = 'LT',
    }

    export interface BuildTreeObjectReport {
        treeObject: TreeObject;
        treeNum: number;
    }

}