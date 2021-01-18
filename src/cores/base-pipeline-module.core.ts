import { AnchorPointRunningStatus, AnchorPointType, HookedPointRunningStatus, PipelineModuleConfig } from "../type";

export class BasePipelineModule<MC = object> {

    // *********************
    // Running Status
    // *********************

    _originConfig: PipelineModuleConfig<MC>;

    _errors: object[] = [];
    _incomingAnchorPoints: AnchorPointRunningStatus[] = [];
    _outcomingAnchorPoints: AnchorPointRunningStatus[] = [];

    // *********************
    // Default
    // *********************

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
    // Tool - TheValue
    // *********************

    // Default

    protected parseTheValue(
        theValue: TheValueTypes.TheValue,
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

    // Type Checker

    protected isConstantTheValue(val: unknown): val is TheValueTypes.ConstantTheValue {
        try {
            return (val as TheValueTypes.ConstantTheValue).type === TheValueTypes.TheValueType.CONSTANT;
        } catch (error) {
            return false;
        }
    }

    protected isKeyTheValue(val: unknown): val is TheValueTypes.KeyTheValue {
        try {
            return (val as TheValueTypes.KeyTheValue).type === TheValueTypes.TheValueType.KEY;
        } catch (error) {
            return false;
        }
    }

    protected isUniqueTheValue(val: unknown): val is TheValueTypes.UniqueTheValue {
        try {
            return (val as TheValueTypes.UniqueTheValue).type === TheValueTypes.TheValueType.UNIQUE;
        } catch (error) {
            return false;
        }
    }

    // *********************
    // Tool - Condition
    // *********************

    // Default

    protected parseCondition(
        condition: ConditionTypes.Condition,
        context: object
    ): boolean {
        try {
            let isConditionPassed: boolean = false;
            if (this.isEqualCondition(condition)) {
                const valueA: string = '' + this.parseTheValue(condition.valueA, context);
                const valueB: string = '' + this.parseTheValue(condition.valueB, context);
                isConditionPassed = valueA === valueB;
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isRegexCondition(condition)) {
                const value: string = '' + this.parseTheValue(condition.value, context);
                isConditionPassed = condition.regex.test(value);
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isInArrayCondition(condition)) {
                const value: string = '' + this.parseTheValue(condition.value, context);
                const arrayValue = '' + this.parseTheValue(condition.arrayValue, context);
                if (!Array.isArray(arrayValue)) {
                    return false;
                }
                isConditionPassed = arrayValue.findIndex(t => '' + t === '' + value) !== -1;
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            else if (this.isNumberRangeCondition(condition)) {
                const valueA: number = Number.parseFloat(Number.parseFloat('' + this.parseTheValue(condition.valueA, context)).toFixed(condition.decimalPoint));
                const valueB: number = Number.parseFloat(Number.parseFloat('' + this.parseTheValue(condition.valueB, context)).toFixed(condition.decimalPoint));
                if (condition.mathSymbol === ConditionTypes.MathSymbol.E) {
                    isConditionPassed = valueA === valueB;
                }
                else if (condition.mathSymbol === ConditionTypes.MathSymbol.GT) {
                    isConditionPassed = valueA > valueB;
                }
                else if (condition.mathSymbol === ConditionTypes.MathSymbol.GTE) {
                    isConditionPassed = valueA >= valueB;
                }
                else if (condition.mathSymbol === ConditionTypes.MathSymbol.LT) {
                    isConditionPassed = valueA < valueB;
                }
                else if (condition.mathSymbol === ConditionTypes.MathSymbol.LTE) {
                    isConditionPassed = valueA <= valueB;
                }
                isConditionPassed = condition.reverse === true ? !isConditionPassed : isConditionPassed;
            }
            return isConditionPassed;
        } catch (error) {
            return false;
        }
    }

    // Type Checker

    protected isEqualCondition(val: unknown): val is ConditionTypes.EqualCondition {
        try {
            return (val as ConditionTypes.EqualCondition).type === ConditionTypes.ConditionType.EQUAL;
        } catch (error) {
            return false;
        }
    }

    protected isRegexCondition(val: unknown): val is ConditionTypes.RegexCondition {
        try {
            return (val as ConditionTypes.RegexCondition).type === ConditionTypes.ConditionType.REGEX;
        } catch (error) {
            return false;
        }
    }

    protected isInArrayCondition(val: unknown): val is ConditionTypes.InArrayCondition {
        try {
            return (val as ConditionTypes.InArrayCondition).type === ConditionTypes.ConditionType.IN_ARRAY;
        } catch (error) {
            return false;
        }
    }

    protected isNumberRangeCondition(val: unknown): val is ConditionTypes.NumberRangeCondition {
        try {
            return (val as ConditionTypes.NumberRangeCondition).type === ConditionTypes.ConditionType.NUMBER_RANGE;
        } catch (error) {
            return false;
        }
    }

    // *********************
    // Helper
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

    protected generateRandomId(): string {
        let result: string = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

}

export namespace TheValueTypes {

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

}

export namespace ConditionTypes {

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
        valueA: TheValueTypes.TheValue;
        valueB: TheValueTypes.TheValue;
        reverse?: boolean;
    }

    /**
     * 将value转化为string，然后按照regex进行比较
     */
    export interface RegexCondition {
        type: ConditionType.REGEX;
        value: TheValueTypes.TheValue;
        regex: RegExp;
        reverse?: boolean;
    }

    /**
     * 将value转化为string，尝试提取arrayValue（类型必须为数组），然后进行比较
     */
    export interface InArrayCondition {
        type: ConditionType.IN_ARRAY;
        value: TheValueTypes.TheValue;
        arrayValue: TheValueTypes.TheValue;
        reverse?: boolean;
    }

    /**
     * 将valueA和valueB转化为number（按照decimalPoint进行小数点保留），然后按照数学符号进行比较
     */
    export interface NumberRangeCondition {
        type: ConditionType.NUMBER_RANGE;
        valueA: TheValueTypes.TheValue;
        valueB: TheValueTypes.TheValue;
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