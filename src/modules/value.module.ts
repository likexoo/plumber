
/**
 * @dependencies none
 */
export class ValueModule {

    // *********************
    // Default
    // *********************

    public static parseValue(
        value: ValueModuleTypes.Value,
        context: object
    ): unknown {
        try {
            if (this.isConstantValue(value)) {
                return value.value;
            }
            else if (this.isKeyValue(value)) {
                return (context as any)[value.key];
            }
            else if (this.isUniqueValue(value)) {
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
    // Type Checker
    // *********************

    public static isConstantValue(val: unknown): val is ValueModuleTypes.ConstantValue {
        try {
            return (val as ValueModuleTypes.ConstantValue).type === ValueModuleTypes.ValueType.CONSTANT;
        } catch (error) {
            return false;
        }
    }

    public static isKeyValue(val: unknown): val is ValueModuleTypes.KeyValue {
        try {
            return (val as ValueModuleTypes.KeyValue).type === ValueModuleTypes.ValueType.KEY;
        } catch (error) {
            return false;
        }
    }

    public static isUniqueValue(val: unknown): val is ValueModuleTypes.UniqueValue {
        try {
            return (val as ValueModuleTypes.UniqueValue).type === ValueModuleTypes.ValueType.UNIQUE;
        } catch (error) {
            return false;
        }
    }

    // *********************
    // Helper
    // *********************

    protected static generateRandomId(): string {
        let result: string = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

}

export namespace ValueModuleTypes {

    export type Value = ConstantValue | KeyValue | UniqueValue;

    export enum ValueType {
        CONSTANT = 'CONSTANT',
        KEY = 'KEY',
        UNIQUE = 'UNIQUE',
    }

    export interface ConstantValue {
        type: ValueType.CONSTANT;
        value: unknown;
    }

    export interface KeyValue {
        type: ValueType.KEY;
        key: string;
    }

    export interface UniqueValue {
        type: ValueType.UNIQUE;
    }

}