import { BasePipelineModule } from "../../cores/base-pipeline-module.core";
import { AnchorPointType, Item, PipelineModuleDefinition, PipelineModuleRunningStatus, PipelineNodeModuleName } from "../../type";
import uuid = require('uuid');

export class TreeCombiner extends BasePipelineModule<TreeCombinerConfig> implements PipelineModuleRunningStatus<TreeCombinerConfig> {

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
                name: 'COMBINED',
                isAllowUnhooked: false,
                moduleWhitelist: []
            },
            {
                name: 'UNCOMBINED',
                isAllowUnhooked: false,
                moduleWhitelist: []
            }
        ]
    };

    run(): void {
        let allItem: Array<Item> = [];
        this.getAllHookedPoints(AnchorPointType.INCOMING).forEach(hookedPoint => {
            allItem.push(...hookedPoint.items);
        });
        let total: any[] = [];
        allItem.map(item => item.metadata.map(val => total.push(val)));

        let combineConfig = this._originConfig.moduleConfig;
        if (combineConfig) {
            let filterCondition = combineConfig.allowCombinerCondition;
            const needCombineData = this.filterByCondition(total, filterCondition);
            const uncombinedData: any[] = total.filter(item => !needCombineData.includes(item));

            this.findAnchorPoint(AnchorPointType.OUTCOMING, 'UNCOMBINED')?.hookedPoints.forEach(item => {
                item.items.push(
                    {
                        id: uuid.v4(),
                        view: [],
                        metadata: uncombinedData,
                        header:  combineConfig?.allowCombinerCondition || {}
                    }
                );
            });

            const addKeyData = this.addMergeKey(needCombineData, combineConfig.combinerCondition);
            const combinedData = this.mergeByCondition(addKeyData.resultArr, [addKeyData.tempKey]);
            this.findAnchorPoint(AnchorPointType.OUTCOMING, 'COMBINED')?.hookedPoints.forEach(hookedPoint => {
                for (let i = 0;i < combinedData.length;i++) {
                    hookedPoint.items.push(
                        {
                            id: uuid.v4(),
                            view: [],
                            metadata: combinedData[i].list,
                            header: combineConfig?.combinerCondition || {}
                        }
                    );
                }
            });
        }

        // 5
        this._errors.push({});

    }

    checkConfig(): boolean {
        throw new Error("Method not implemented.");
    }

    private addMergeKey(
        arr: any[], mergeConArr: Array<MergeConditionType>): { tempKey: string, resultArr: any[] } {
        const orginArr = arr.slice(0, arr.length);
        const tempKey = uuid.v4();
        arr.forEach(item => {
            item[tempKey] = '';
            mergeConArr.forEach(val => {
                switch (val.type) {
                    case 'EQUAL':
                        item[tempKey] += `${val.key}:${item[val.key]}_`;
                        break;
                    case 'REGEX':
                        item[tempKey] += `${val.key}:${val.regex}:${val.regex.test(item[val.key])}_`;
                        break;
                    case 'IN_ARRAY':
                        item[tempKey] += `${val.key}:${val.arr}:${val.arr.includes(item[val.key])}_`;
                        break;
                    case 'NUMBER_RANGE':
                        for (let tempExp of val.range) {
                            if (tempExp.exp === 'gt') {
                                item[tempKey] +=
                                    `${val.key}:${tempExp.exp}${tempExp.val}:${item[val.key] > tempExp.val}_`;
                            } else if (tempExp.exp === 'gte') {
                                item[tempKey] +=
                                    `${val.key}:${tempExp.exp}${tempExp.val}:${item[val.key] >= tempExp.val}_`;
                            } else if (tempExp.exp === 'lt') {
                                item[tempKey] +=
                                    `${val.key}:${tempExp.exp}${tempExp.val}:${item[val.key] < tempExp.val}_`;
                            } else if (tempExp.exp === 'lte') {
                                item[tempKey] +=
                                    `${val.key}:${tempExp.exp}${tempExp.val}:${item[val.key] <= tempExp.val}_`;
                            }
                        }
                        break;
                    default:
                        return { tempKey: '', resultArr: orginArr };
                }
            });
        });
        return { tempKey, resultArr: arr };
    }

    private mergeByCondition(arr: any[], condition: string[]): any[] {
        if (condition.length < 1) return arr;
        let result: any = {};
        arr.forEach((dish: any) => {
            const keys = Object.keys(dish);
            let tempArr = [];
            for (let con of condition) {
                if (!keys.includes(con)) return arr;
                tempArr.push(dish[con]);
            }
            let keyString = tempArr.toString();
            result[keyString] = result[keyString] || [];
            result[keyString].push(dish);
        });
        let mergeResultArr = [];
        for (let k of Object.keys(result)) {
            let temp: any = {};
            for (let m of condition) {
                temp[m] = result[k][0][m];
            }
            temp['list'] = result[k];
            mergeResultArr.push(temp);
        }
        mergeResultArr.forEach(item => {
            item.list.forEach((val: any) => {
                delete val[condition[0]];
            });
        });
        return mergeResultArr;
    }

    private filterByCondition(arr: any[], filterCondition: Array<RegexCondition | InArrayCondition | NumberRangeCondition>): any[] {
        if (filterCondition && filterCondition?.length > 0) {
            arr = arr.filter(item => {
                let flag = true;
                for (let val of filterCondition) {
                    switch (val.type) {
                        case 'REGEX':
                            if (!val.regex.test(item[val.key])) 
                            flag = false;
                            break;
                        case 'IN_ARRAY':
                            if (!val.arr.includes(item[val.key])) 
                            flag = false;
                            break;
                        case 'NUMBER_RANGE':
                            for (let tempExp of val.range) {
                                if (tempExp.exp === 'gt') {
                                    if (item[val.key] <= tempExp.val) 
                                    flag = false;
                                } else if (tempExp.exp === 'gte') {
                                    if (item[val.key] < tempExp.val) 
                                    flag = false;
                                } else if (tempExp.exp === 'lt') {
                                    if (item[val.key] >= tempExp.val) 
                                    flag = false;
                                } else if (tempExp.exp === 'lte') {
                                    if (item[val.key] > tempExp.val) 
                                    flag = false;
                                }
                            }
                            break;
                        default:
                            flag = false;
                            break;
                    }
                }
                return flag;
            });
        }
        return arr;
    }

}

export type TreeCombinerConfig = {
    allowCombinerCondition: Array<RegexCondition | InArrayCondition | NumberRangeCondition>;
    combinerCondition: Array<MergeConditionType>;
};

export declare type MergeConditionType =
    EqualCondition |
    RegexCondition |
    InArrayCondition |
    NumberRangeCondition;

// 是否相同
export declare type EqualCondition = {
    type: 'EQUAL';
    key: string;
};

// 是否符合某正则
export declare type RegexCondition = {
    type: 'REGEX';
    key: string;
    regex: RegExp;
};

// 是否在某个数组
export declare type InArrayCondition = {
    type: 'IN_ARRAY';
    key: string;
    arr: Array<string | number | object>;
};

// 是否在某个范围（数字）
export declare type NumberRangeCondition = {
    type: 'NUMBER_RANGE';
    key: string;
    range: Array<{ exp: 'gte' | 'gt' | 'lte' | 'lt', val: number }>;
};
