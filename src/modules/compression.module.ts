
export class CompressionModule {

    // *********************
    // Default
    // *********************

    public static executeCompression(
        fields: CompressionModuleTypes.Field[],
        items: object[]
    ): object {
        try {
            let result: any = {};
            fields.forEach(f => {
                const field = f.value;
                if (this.isConstantFieldValue(field)) {
                    result[f.key] = field.value;
                }
                else if (this.isFirstFieldValue(field)) {
                    result[f.key] = (items[0] as any)[field.originKey];
                }
                else if (this.isNumberSumFieldValue(field)) {
                    result[f.key] = 0;
                    items.forEach(item => {
                        if (Number.isInteger((item as any)[field.originKey])) {
                            result[f.key] += (item as any)[field.originKey];
                        }
                    });
                }
                else if (this.isArraySumFieldValue(field)) {
                    result[f.key] = [];
                    items.forEach(item => {
                        if (Array.isArray((item as any)[field.originKey])) {
                            result[f.key].push(...(item as any)[field.originKey]);
                        }
                    });
                    if (field.isRemoveDuplicated === true) {
                        result[f.key] = Array.from(new Set(result[f.key])).sort((a, b) => ('' + a).localeCompare('' + b));
                    }
                }
                else if (this.isMetadataFieldValue(field)) {
                    result[f.key] = items;
                }
            });
            return result;
        } catch (error) {
            return {};
        }
    }

    // *********************
    // Type Checker
    // *********************

    public static isConstantFieldValue(val: unknown): val is CompressionModuleTypes.ConstantFieldValue {
        try {
            return (val as CompressionModuleTypes.ConstantFieldValue).type === CompressionModuleTypes.FieldValueTypes.CONSTANT;
        } catch (error) {
            return false;
        }
    }

    public static isFirstFieldValue(val: unknown): val is CompressionModuleTypes.FirstFieldValue {
        try {
            return (val as CompressionModuleTypes.FirstFieldValue).type === CompressionModuleTypes.FieldValueTypes.FIRST;
        } catch (error) {
            return false;
        }
    }

    public static isNumberSumFieldValue(val: unknown): val is CompressionModuleTypes.NumberSumFieldValue {
        try {
            return (val as CompressionModuleTypes.NumberSumFieldValue).type === CompressionModuleTypes.FieldValueTypes.NUMBER_SUM;
        } catch (error) {
            return false;
        }
    }

    public static isArraySumFieldValue(val: unknown): val is CompressionModuleTypes.ArraySumFieldValue {
        try {
            return (val as CompressionModuleTypes.ArraySumFieldValue).type === CompressionModuleTypes.FieldValueTypes.ARRAY_SUM;
        } catch (error) {
            return false;
        }
    }

    public static isMetadataFieldValue(val: unknown): val is CompressionModuleTypes.MetadataFieldValue {
        try {
            return (val as CompressionModuleTypes.MetadataFieldValue).type === CompressionModuleTypes.FieldValueTypes.METADATA;
        } catch (error) {
            return false;
        }
    }

}

export namespace CompressionModuleTypes {

    // Field

    export type Field = {
        key: string;
        value: FieldValue;
    };

    // Field Value

    export type FieldValue = ConstantFieldValue | FirstFieldValue | NumberSumFieldValue |
        ArraySumFieldValue | MetadataFieldValue;

    export enum FieldValueTypes {
        CONSTANT = 'CONSTANT',
        FIRST = 'FIRST',
        ALL = 'ALL',
        NUMBER_SUM = 'NUMBER_SUM',
        ARRAY_SUM = 'ARRAY_SUM',
        METADATA = 'METADATA',
    }

    export interface ConstantFieldValue {
        type: FieldValueTypes.CONSTANT;
        value: unknown;
    }

    export interface FirstFieldValue {
        type: FieldValueTypes.FIRST;
        originKey: string;
    }

    export interface NumberSumFieldValue {
        type: FieldValueTypes.NUMBER_SUM;
        originKey: string;
    }

    export interface ArraySumFieldValue {
        type: FieldValueTypes.ARRAY_SUM;
        originKey: string;
        isRemoveDuplicated: boolean;
    }

    export interface MetadataFieldValue {
        type: FieldValueTypes.METADATA;
    }

}
