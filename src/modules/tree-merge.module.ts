import { TreeModule, TreeModuleTypes } from "./tree.module";

/**
 * @dependencies `TreeModule`
 */
export class TreeMergeModule {

    public static excuteTreeMerge(
        paints: Array<TreeModuleTypes.Paint>,
        items: object[],
    ): { items: object[]; tree: string; }[] {
        try {
            // $ 0
            const reports: { items: object[]; tree: string; }[] = [];
            // $ 1
            items.forEach(item => {
                const tree = TreeModule.parseTreeValue(paints, item);
                const matchedIndex = reports.findIndex(t => t.tree === tree);
                if (matchedIndex === -1) {
                    reports.push({
                        tree,
                        items: [item]
                    });
                }
                else {
                    reports[matchedIndex].items.push(item);
                }
            });
            // $ 2
            return reports;
        } catch (error) {
            return [];
        }
    }

}

export namespace TreeMergeModuleTypes {

}