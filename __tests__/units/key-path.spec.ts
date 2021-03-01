import { KeyPathModule } from "../../src/modules/key-path.module";

describe('KeyPathModule', function () {

    test('KeyPathModule.get()', async () => {

        const result1 = KeyPathModule.get(
            {
                a: {
                    b: {
                        c: [
                            {
                                d: 1
                            }
                        ]
                    }
                }
            },
            'a.b.c[0].d'
        );

        expect(result1).toBe(1);

        const result2 = KeyPathModule.get(
            [
                [],
                [
                    [],
                    [],
                    [
                        {
                            a: [
                                1
                            ]
                        }
                    ]
                ]
            ],
            '[1][2][0].a[0]'
        );

        expect(result2).toBe(1);

        const result3 = KeyPathModule.get(
            [
                [
                    []
                ]
            ],
            '[1].a.b.c'
        );

        expect(result3).toBeUndefined();

    });

    test('KeyPathModule.set()', async () => {

        const v1 = {
            a: {
                b: {
                    c: [
                        { }
                    ]
                }
            }
        };

        KeyPathModule.set(
            v1,
            'a.b.c[0].d',
            10
        );

        expect(v1).toHaveProperty(['a', 'b', 'c', '0', 'd'], 10);

        const v2 = {};

        KeyPathModule.set(
            v2,
            'a.b.c[0].d[2][3]',
            10
        );

        expect(v2).toHaveProperty(['a', 'b', 'c', '0', 'd', '2', '3'], 10);

        const v3: any[] = [];

        KeyPathModule.set(
            v3,
            '[0][2][3]',
            10
        );

        expect(v3).toHaveProperty(['0', '2', '3'], 10);

        const v4 = {
            a: {
                b: {
                    c: [
                        { 
                            e: 99
                        },
                        99
                    ]
                }
            }
        };

        KeyPathModule.set(
            v4,
            'a.b.c[0].d',
            10
        );

        expect(v4).toHaveProperty(['a', 'b', 'c', '0', 'd'], 10);
        expect(v4).toHaveProperty(['a', 'b', 'c', '0', 'e'], 99);
        expect(v4).toHaveProperty(['a', 'b', 'c', '1'], 99);

    });

});
