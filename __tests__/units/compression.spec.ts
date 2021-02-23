import { CompressionModule, CompressionModuleTypes } from '../../src/modules/compression.module'

describe('CompressionModule', function () {

    test('CompressionModule.executeCompression()', async () => {

        const result1 = CompressionModule.executeCompression(
            [
                {
                    key: 'abc',
                    value: {
                        type: CompressionModuleTypes.FieldValueTypes.CONSTANT,
                        value: 'ABC'
                    }
                },
                {
                    key: 'type',
                    value: {
                        type: CompressionModuleTypes.FieldValueTypes.ARRAY_SUM,
                        originKey: 'type',
                        isRemoveDuplicated: true
                    }
                },
                {
                    key: 'num',
                    value: {
                        type: CompressionModuleTypes.FieldValueTypes.NUMBER_SUM,
                        originKey: 'num'
                    }
                },
                {
                    key: 'metadata',
                    value: {
                        type: CompressionModuleTypes.FieldValueTypes.METADATA
                    }
                }
            ] as CompressionModuleTypes.Field[],
            [
                {
                    type: [1 , 2],
                    name: 'dish1',
                    num: 2
                },
                {
                    type: [2],
                    name: 'dish2',
                    num: 1
                },
                {
                    type: [4, 1],
                    name: 'dish3',
                    num: 4
                }
            ]
        );

        expect(result1).toBeInstanceOf(Object);
        expect(result1).toHaveProperty('abc', 'ABC');
        expect(result1).toHaveProperty('type');
        expect((result1 as any).type).toHaveLength(3);
        expect(result1).toHaveProperty('num', 7);
        expect(result1).toHaveProperty('metadata');
        expect((result1 as any).metadata).toHaveLength(3);

    });

});
