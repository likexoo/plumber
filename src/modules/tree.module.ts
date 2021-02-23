import { ConditionModule, ConditionModuleTypes } from "./condition.module";
import { ValueModule, ValueModuleTypes } from "./value.module";

/**
 * @dependencies `ValueModule` `ConditionModule`
 */
export class TreeModule {

    // *********************
    // Default
    // *********************

    public static parseTreeValue(
        paints: Array<TreeModuleTypes.Paint>,
        item: object
    ): string {
        try {
            // $ 0
            let treeValues: string[] = [];
            // $ 1
            paints.forEach(paint => {
                // Init
                let rawTreeValue: unknown;
                let treeValue: string = '';
                // Get raw tree value
                if (this.isPaintValue(paint)) {
                    rawTreeValue = ValueModule.parseValue(paint.value, item);
                }
                else if (this.isPaintCondition(paint)) {
                    let isAllConditionsPassed: boolean = true;
                    paint.consitions.forEach(c => {
                        if (ConditionModule.parseCondition(c, item) === false) {
                            isAllConditionsPassed = false;
                        }
                    });
                    if (isAllConditionsPassed) {
                        rawTreeValue = ValueModule.parseValue(paint.true, item);
                    }
                    else {
                        rawTreeValue = ValueModule.parseValue(paint.false, item);
                    }
                }
                // Get tree value raw tree value by paint way
                if (Array.isArray(rawTreeValue)) {
                    if (paint.way === TreeModuleTypes.PaintWayType.SORTED_METADATA_OBJECTS) {
                        treeValue = rawTreeValue.sort((a, b) => ('' + a).localeCompare('' + b)).join('');
                    }
                    else if (paint.way === TreeModuleTypes.PaintWayType.SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE) {
                        treeValue = Array.from(new Set(rawTreeValue)).sort((a, b) => ('' + a).localeCompare('' + b)).join('');
                    }
                }
                else {
                    treeValue = '' + rawTreeValue;
                }
                // Add to total tree value
                treeValues.push(treeValue);
            });
            // $ 2
            return treeValues.join(TreeModuleTypes.TREE_DELIMITER);
        } catch (error) {
            return TreeModuleTypes.INVALID_TREE_NAME;
        }
    }

    // *********************
    // Type Checker
    // *********************

    public static isPaintValue(val: unknown): val is TreeModuleTypes.PaintValue {
        try {
            return (val as TreeModuleTypes.PaintValue).type === TreeModuleTypes.PaintType.PAINT_VALUE;
        } catch (error) {
            return false;
        }
    }

    public static isPaintCondition(val: unknown): val is TreeModuleTypes.PaintCondition {
        try {
            return (val as TreeModuleTypes.PaintCondition).type === TreeModuleTypes.PaintType.PAINT_CONDTION;
        } catch (error) {
            return false;
        }
    }

}

export namespace TreeModuleTypes {

    // Paint

    export type Paint = PaintValue | PaintCondition;

    export enum PaintType {
        PAINT_VALUE = 'PAINT_VALUE',
        PAINT_CONDTION = 'PAINT_CONDTION'
    }

    export interface PaintValue {
        type: PaintType.PAINT_VALUE;
        way: PaintWayType;
        value: ValueModuleTypes.Value;
    };

    export interface PaintCondition {
        type: PaintType.PAINT_CONDTION;
        way: PaintWayType;
        consitions: Array<ConditionModuleTypes.Condition>;
        true: ValueModuleTypes.Value;
        false: ValueModuleTypes.Value;
    };

    // Paint Way

    export enum PaintWayType {
        SORTED_METADATA_OBJECTS = 'SORTED_METADATA_OBJECTS',
        SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE = 'SORTED_METADATA_OBJECTS_WITHOUT_DUPLICATE'
    }

    // Constants

    export const INVALID_TREE_NAME = '<INVALID_TREE_NAME>';

    export const TREE_DELIMITER = '<#>';

}