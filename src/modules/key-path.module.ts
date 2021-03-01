
export class KeyPathModule {

    public static isValidPath(path: string): boolean {
        return `${path}`.length > 0 && /(?!\.\[)((?!^)\.|^)(([a-zA-Z]+(\[\d+\])*)|(\[\d+\]+(\[\d+\])*))/g.test(`${path}`);
    }

    public static get(
        target: unknown,
        path: string
    ) {
        let prevTarget: any = target;
        this.splitKeyString(path).forEach(t => {
            prevTarget = this.getOne(
                prevTarget,
                this.buildKeyReport(t),
                undefined
            )
        });
        return prevTarget;
    }

    public static set(
        target: unknown,
        path: string,
        value: unknown
    ) {
        let prevTarget: any = target;
        if (typeof target !== 'object' && !Array.isArray(target)) {
            throw new Error(`KeyPath Module Error: Target must be array or object.`);
        };
        const keys = this.splitKeyString(path);
        for (let i = 0; i < keys.length; i++) {
            const currentKeyReport = this.buildKeyReport(keys[i]);
            const nextKeyReport = i + 1 < keys.length ? this.buildKeyReport(keys[i + 1]) : undefined;
            if (i + 1 < keys.length) {
                prevTarget = this.ensureOne(
                    prevTarget,
                    currentKeyReport,
                    nextKeyReport
                );
            }
            else {
                this.setOne(
                    prevTarget,
                    value,
                    currentKeyReport
                )
            }
        }
    }

    private static splitKeyString(key: string): string[] {
        const r: string[] = [];
        key.split('.').forEach(t => {
            t.split('[').forEach(tt => {
                if (tt.length > 0) {
                    if (tt.endsWith(']')) {
                        r.push(`[${tt}`);
                    }
                    else {
                        r.push(tt)
                    }
                }
            });
        });
        return r;
    }

    private static buildKeyReport(key: string): KeyPathModuleTypes.KeyReport {
        if (/\[\d+\]/g.test(key)) {
            return {
                type: KeyPathModuleTypes.KeyTypes.ARRAY,
                value: key.replace('[', '').replace(']', '')
            };
        }
        return {
            type: KeyPathModuleTypes.KeyTypes.OBJECT,
            value: key
        };
    }

    private static getOne(
        target: unknown,
        keyReport: KeyPathModuleTypes.KeyReport,
        defaultValue: unknown
    ): unknown {
        if (keyReport.type === KeyPathModuleTypes.KeyTypes.ARRAY) {
            let index = Number.parseInt(keyReport.value);
            if (!target || !Array.isArray(target) || target.length < index) {
                return defaultValue ?? undefined;
            }
            return target[index];
        }
        else if (keyReport.type === KeyPathModuleTypes.KeyTypes.OBJECT) {
            if (!target || !(target as object).hasOwnProperty(keyReport.value)) {
                return defaultValue ?? undefined;
            }
            return (target as any)[keyReport.value];
        }
    }

    private static setOne(
        target: unknown,
        value: unknown,
        keyReport: KeyPathModuleTypes.KeyReport,
        options?: {
            isFocus: boolean
        }
    ): void {
        options = options ?? {
            isFocus: true
        };
        if (keyReport.type === KeyPathModuleTypes.KeyTypes.ARRAY) {
            let index = Number.parseInt(keyReport.value);
            if (!target || !Array.isArray(target)) {
                if (!options.isFocus) {
                    throw new Error(`KeyPath Module Error: Target type is not array.`);
                }
                target = [];
            }
            if (Number.isNaN(index)) {
                if (!options.isFocus) {
                    throw new Error(`KeyPath Module Error: Index must be valid integer while target type is array.`);
                }
                index = 0;
            }
            if ((target as Array<any>).length < index) {
                if (!options.isFocus) {
                    throw new Error(`KeyPath Module Error: Index out of range while target type is array.`);
                }
            }
            while ((target as Array<any>).length < index) {
                (target as Array<any>).push(undefined);
            }
            (target as Array<any>)[index] = value;
        }
        else if (keyReport.type === KeyPathModuleTypes.KeyTypes.OBJECT) {
            if (!target) {
                if (!options.isFocus) {
                    throw new Error(`KeyPath Module Error: Target is undefined while target type is object.`);
                }
                target = {};
            }
            if (!(target as object).hasOwnProperty(keyReport.value)) {
                if (!options.isFocus) {
                    throw new Error(`KeyPath Module Error: Key not exist while target type is object.`);
                }
            }
            (target as any)[keyReport.value] = value;
        }
    }

    private static ensureOne(
        target: unknown,
        keyReport: KeyPathModuleTypes.KeyReport,
        nextKeyReport?: KeyPathModuleTypes.KeyReport
    ): unknown {
        const val = this.getOne(
            target,
            keyReport,
            undefined
        );
        if (!val) {
            if (!nextKeyReport) {
                this.setOne(
                    target,
                    undefined,
                    keyReport
                );
            }
            else if (nextKeyReport.type === KeyPathModuleTypes.KeyTypes.ARRAY) {
                this.setOne(
                    target,
                    [],
                    keyReport
                );
            }
            else if (nextKeyReport.type === KeyPathModuleTypes.KeyTypes.OBJECT) {
                this.setOne(
                    target,
                    {},
                    keyReport
                );
            }
        }
        return this.getOne(
            target,
            keyReport,
            undefined
        );
    }

}

export namespace KeyPathModuleTypes {

    export enum KeyTypes {
        ARRAY = 'ARRAY',
        OBJECT = 'OBJECT'
    }

    export type KeyReport = {
        type: KeyTypes;
        value: string;
    }

}