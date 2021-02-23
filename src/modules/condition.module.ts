import { ValueModule, ValueModuleTypes } from "./value.module";

/**
 * @dependencies `ValueModule`
 */
export class ConditionModule {

    // *********************
    // Default
    // *********************

    public static parseCondition(
        condition: ConditionModuleTypes.Condition,
        context: object
    ): boolean {
        try {
            let isConditionPassed: boolean = false;
            if (this.isEqualCondition(condition)) {
                const valueA: string = '' + ValueModule.parseValue(condition.valueA, context);
                const valueB: string = '' + ValueModule.parseValue(condition.valueB, context);
                isConditionPassed = valueA === valueB;
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isRegexCondition(condition)) {
                const value: string = '' + ValueModule.parseValue(condition.value, context);
                isConditionPassed = condition.regex.test(value);
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isInArrayCondition(condition)) {
                const value: string = '' + ValueModule.parseValue(condition.value, context);
                const arrayValue = '' + ValueModule.parseValue(condition.arrayValue, context);
                if (!Array.isArray(arrayValue)) {
                    return false;
                }
                isConditionPassed = arrayValue.findIndex(t => '' + t === '' + value) !== -1;
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isNumberRangeCondition(condition)) {
                const valueA: number = Number.parseFloat(Number.parseFloat('' + ValueModule.parseValue(condition.valueA, context)).toFixed(condition.decimalPoint));
                const valueB: number = Number.parseFloat(Number.parseFloat('' + ValueModule.parseValue(condition.valueB, context)).toFixed(condition.decimalPoint));
                if (condition.mathSymbol === ConditionModuleTypes.MathSymbol.E) {
                    isConditionPassed = valueA === valueB;
                }
                else if (condition.mathSymbol === ConditionModuleTypes.MathSymbol.GT) {
                    isConditionPassed = valueA > valueB;
                }
                else if (condition.mathSymbol === ConditionModuleTypes.MathSymbol.GTE) {
                    isConditionPassed = valueA >= valueB;
                }
                else if (condition.mathSymbol === ConditionModuleTypes.MathSymbol.LT) {
                    isConditionPassed = valueA < valueB;
                }
                else if (condition.mathSymbol === ConditionModuleTypes.MathSymbol.LTE) {
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
    // Type Checker
    // *********************

    public static isEqualCondition(val: unknown): val is ConditionModuleTypes.EqualCondition {
        try {
            return (val as ConditionModuleTypes.EqualCondition).type === ConditionModuleTypes.ConditionType.EQUAL;
        } catch (error) {
            return false;
        }
    }

    public static isRegexCondition(val: unknown): val is ConditionModuleTypes.RegexCondition {
        try {
            return (val as ConditionModuleTypes.RegexCondition).type === ConditionModuleTypes.ConditionType.REGEX;
        } catch (error) {
            return false;
        }
    }

    public static isInArrayCondition(val: unknown): val is ConditionModuleTypes.InArrayCondition {
        try {
            return (val as ConditionModuleTypes.InArrayCondition).type === ConditionModuleTypes.ConditionType.IN_ARRAY;
        } catch (error) {
            return false;
        }
    }

    public static isNumberRangeCondition(val: unknown): val is ConditionModuleTypes.NumberRangeCondition {
        try {
            return (val as ConditionModuleTypes.NumberRangeCondition).type === ConditionModuleTypes.ConditionType.NUMBER_RANGE;
        } catch (error) {
            return false;
        }
    }

}

export namespace ConditionModuleTypes {

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
        valueA: ValueModuleTypes.Value;
        valueB: ValueModuleTypes.Value;
        reverse?: boolean;
    }

    /**
     * 将value转化为string，然后按照regex进行比较
     */
    export interface RegexCondition {
        type: ConditionType.REGEX;
        value: ValueModuleTypes.Value;
        regex: RegExp;
        reverse?: boolean;
    }

    /**
     * 将value转化为string，尝试提取arrayValue（类型必须为数组），然后进行比较
     */
    export interface InArrayCondition {
        type: ConditionType.IN_ARRAY;
        value: ValueModuleTypes.Value;
        arrayValue: ValueModuleTypes.Value;
        reverse?: boolean;
    }

    /**
     * 将valueA和valueB转化为number（按照decimalPoint进行小数点保留），然后按照数学符号进行比较
     */
    export interface NumberRangeCondition {
        type: ConditionType.NUMBER_RANGE;
        valueA: ValueModuleTypes.Value;
        valueB: ValueModuleTypes.Value;
        mathSymbol: MathSymbol;
        decimalPoint: number;
        reverse?: boolean;
    }

    export enum MathSymbol {
        E = 'E',
        GTE = 'GTE',
        GT = 'GT',
        LTE = 'LTE',
        LT = 'LT',
    }

}