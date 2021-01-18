import { BasePipelineModule, ConditionTypes, TheValueTypes } from "../../cores/base-pipeline-module.core";
import { Item, PipelineModuleDefinition, PipelineModuleRunningStatus } from "../../type";

export class ViewRefresh extends BasePipelineModule<object> implements PipelineModuleRunningStatus {

    _originDefinition: PipelineModuleDefinition;

    run(): void {
        throw new Error("Method not implemented.");
    }

    checkConfig(): boolean {
        throw new Error("Method not implemented.");
    }

    // *********************
    // Core
    // *********************

    private executeItemAction(
        action: ViewRefreshTypes.ItemAction,
        items: Item[],
        context: ViewRefreshTypes.Context
    ): Item[] {
        try {
            // $ 0
            let clonedItems = [...items];
            // $ 1
            if (this.isClearItemAction(action)) {
                clonedItems = [];
            }
            else if (this.isInjectMetadataAction(action)) {
                clonedItems = [...context.metadata];
            }
            // $ 2
            return clonedItems;
        } catch (error) {
            return items;
        }
    }

    private executeElementAction(
        action: ViewRefreshTypes.ElementAction,
        items: Item[],
        context: ViewRefreshTypes.Context
    ): Item[] {
        try {
            // $ 0
            let clonedItems = [...items];
            // $ 1
            if (this.isGatherElementAction(action)) {

            }
            else if (this.isDispersionElementAction(action)) {

            }
            else if (this.isCreateFieldAction(action)) {

            }
            else if (this.isDeleteFieldAction(action)) {

            }
            else if (this.isUpdateFieldAction(action)) {

            }
            // $ 2
            return clonedItems;
        } catch (error) {
            return items;
        }
    }

    // *********************
    // Action
    // *********************

    private executeGatherElementAction(
        action: ViewRefreshTypes.GatherElementAction,
        newElements: object[],
        remainingElements: object[]
    ) {
        const clonedNewElements: object[] = [...newElements];
        const otherElements: object[] = [...remainingElements];
        if (remainingElements.length > 1) {
            let mainElement = { ...remainingElements[0] };
            const otherElements = remainingElements.slice(1, remainingElements.length);
            for (const oe of otherElements) {
                // 0
                let isAllConditionsPassed: boolean = true;
                for (const c of action.conditions) {
                    if (this.parseCondition(c, oe) === false) {
                        isAllConditionsPassed = false;
                        break;
                    }
                }
                // 1
                if (isAllConditionsPassed) {
                    let num: number = (mainElement as any)[action.quantityFieldKey];
                    if (Number.parseInt('' + num) <= action.quantityMaxValue) {
                       
                    }
                    // oe.
                }
            }
        }
        else {
            const r = [...newElements];
            if (remainingElements.length === 1) {
                r.push(remainingElements[0]);
            }
            return {
                newElements: r,
                remainingElements: []
            }
        }
    }

    // *********************
    // Type Checker
    // *********************

    // Action

    private isItemAction(val: unknown): val is ViewRefreshTypes.Action {
        try {
            return (val as ViewRefreshTypes.Action).type === ViewRefreshTypes.ItemActionType.CLEAR ||
                (val as ViewRefreshTypes.Action).type === ViewRefreshTypes.ItemActionType.INJECT_METADATA;
        } catch (error) {
            return false;
        }
    }

    private isElementAction(val: unknown): val is ViewRefreshTypes.ElementAction {
        try {
            return (val as ViewRefreshTypes.Action).type === ViewRefreshTypes.ElementActionType.GATHER ||
                (val as ViewRefreshTypes.Action).type === ViewRefreshTypes.ElementActionType.DISPERSION ||
                (val as ViewRefreshTypes.Action).type === ViewRefreshTypes.ElementActionType.CREATE_FIELD ||
                (val as ViewRefreshTypes.Action).type === ViewRefreshTypes.ElementActionType.DELETE_FIELD ||
                (val as ViewRefreshTypes.Action).type === ViewRefreshTypes.ElementActionType.UPDATE_FIELD;
        } catch (error) {
            return false;
        }
    }

    // Item Action

    private isClearItemAction(val: unknown): val is ViewRefreshTypes.ClearItemAction {
        try {
            return (val as ViewRefreshTypes.ClearItemAction).type === ViewRefreshTypes.ItemActionType.CLEAR;
        } catch (error) {
            return false;
        }
    }

    private isInjectMetadataAction(val: unknown): val is ViewRefreshTypes.InjectMetadataAction {
        try {
            return (val as ViewRefreshTypes.InjectMetadataAction).type === ViewRefreshTypes.ItemActionType.INJECT_METADATA;
        } catch (error) {
            return false;
        }
    }

    // Element Action

    private isGatherElementAction(val: unknown): val is ViewRefreshTypes.GatherElementAction {
        try {
            return (val as ViewRefreshTypes.GatherElementAction).type === ViewRefreshTypes.ElementActionType.GATHER;
        } catch (error) {
            return false;
        }
    }

    private isDispersionElementAction(val: unknown): val is ViewRefreshTypes.DispersionElementAction {
        try {
            return (val as ViewRefreshTypes.DispersionElementAction).type === ViewRefreshTypes.ElementActionType.DISPERSION;
        } catch (error) {
            return false;
        }
    }

    private isCreateFieldAction(val: unknown): val is ViewRefreshTypes.CreateFieldAction {
        try {
            return (val as ViewRefreshTypes.CreateFieldAction).type === ViewRefreshTypes.ElementActionType.CREATE_FIELD;
        } catch (error) {
            return false;
        }
    }

    private isDeleteFieldAction(val: unknown): val is ViewRefreshTypes.DeleteFieldAction {
        try {
            return (val as ViewRefreshTypes.DeleteFieldAction).type === ViewRefreshTypes.ElementActionType.DELETE_FIELD;
        } catch (error) {
            return false;
        }
    }

    private isUpdateFieldAction(val: unknown): val is ViewRefreshTypes.UpdateFieldAction {
        try {
            return (val as ViewRefreshTypes.UpdateFieldAction).type === ViewRefreshTypes.ElementActionType.UPDATE_FIELD;
        } catch (error) {
            return false;
        }
    }

}

export namespace ViewRefreshTypes {

    // Default

    export type ViewRefreshConfig = {
        actions: Array<Action>;
    };

    // Action

    export type Action = ItemAction | ElementAction;

    export type ActionType = ItemActionType | ElementActionType;

    // Item Action

    export type ItemAction = ClearItemAction | InjectMetadataAction;

    export enum ItemActionType {
        CLEAR = 'CLEAR',
        INJECT_METADATA = 'INJECT_METADATA',
    }

    export interface ClearItemAction {
        type: ItemActionType.CLEAR;
    }

    export interface InjectMetadataAction {
        type: ItemActionType.INJECT_METADATA;
    }

    // Element Action

    export type ElementAction = GatherElementAction | DispersionElementAction | CreateFieldAction | DeleteFieldAction | UpdateFieldAction;

    export enum ElementActionType {
        GATHER = 'GATHER',
        DISPERSION = 'DISPERSION',
        CREATE_FIELD = 'CREATE_FIELD',
        DELETE_FIELD = 'DELETE_FIELD',
        UPDATE_FIELD = 'UPDATE_FIELD',
    }

    /**
     * @property `quantityFieldKey` 聚集的元素用来表示数量的字段
     * @property `quantityMaxValue` 聚集后的新元素的最大数量（若聚集操作未结束，超过最大数量后，会创建新元素并继续执行操作）
     * @property `metadataFieldKey` 聚集后的新元素用来储存源信息的字段
     * @property `metadataKeysPerElement` 在执行聚集操作时，用于储存至源信息数组的对象的字段
     */
    export interface GatherElementAction {
        // default
        type: ElementActionType.GATHER;
        conditions: ConditionTypes.Condition[];
        // quantity
        quantityFieldKey: string;
        quantityMaxValue: number;
        // metadata
        metadataFieldKey: string;
        metadataKeysPerElement: string[];
    }

    export interface DispersionElementAction {
        type: ElementActionType.DISPERSION;
        conditions: ConditionTypes.Condition[];
        quantityFieldKey: string;
        quantityPerElement: number;
    }

    export interface CreateFieldAction {
        type: ElementActionType.CREATE_FIELD;
        key: string;
        value: TheValueTypes.TheValue;
    }

    export interface DeleteFieldAction {
        type: ElementActionType.DELETE_FIELD;
        key: string;
    }

    export interface UpdateFieldAction {
        type: ElementActionType.UPDATE_FIELD;
        key: string;
        value: TheValueTypes.TheValue;
    }

    // Others

    export interface Context {
        metadata: Item[];
    }

}
