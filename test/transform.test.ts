import Model from '../lib/Model';
import transform, { ITransformSchema, modelTransform } from '../lib/transform';

describe('transform', () => {
    class Person extends Model {};
    class Animal extends Model {};
    class Item extends Model {};

    it('transforms basic object to a model', () => {
        const obj = {
            name: 'Doms',
        };
        const schema: ITransformSchema = {
            Model: Person,
        };

        expect(transform(obj, schema)).toBeInstanceOf(Person);
    });

    it('ignores transformation if no Model supplied to a schema', () => {
        const obj = {
            name: 'Doms',
        };
        const schema: ITransformSchema = {
        };

        const res = transform(obj, schema);
        expect(res).not.toBeInstanceOf(Person);
        expect(res).toBeInstanceOf(Object);
    });

    it('transforms array of objects into Model', () => {
        const arr = [
            {
                name: 'Doms',
            },
            {
                name: 'Pat',
            },
            {
                name: 'Brench'
            },
        ];
        const schema = {
            Model: Person,
        };

        const res = transform<Person[]>(arr, schema);

        expect(res[0]).toBeInstanceOf(Person);
        expect(res[1]).toBeInstanceOf(Person);
        expect(res[2]).toBeInstanceOf(Person);
    });
    
    it('ignores non-object element in array', () => {
        const arr = [
            {
                name: 'Doms',
            },
            'black element',
            {
                name: 'Brench'
            },
            null,
            0,
            undefined,
            false,
        ];
        const schema = {
            Model: Person,
        };

        const res = transform<Person[]>(arr, schema);

        expect(res[0]).toBeInstanceOf(Person);
        expect(res[1]).not.toBeInstanceOf(Person);
        expect(typeof res[1]).toBe('string');
        expect(res[2]).toBeInstanceOf(Person);
        expect(res[3]).not.toBeInstanceOf(Person);
        expect(res[3]).toBeNull();
        expect(res[4]).not.toBeInstanceOf(Person);
        expect(res[4]).toBe(0);
    });

    it('transforms multiple nested property with array or object value', () => {
        const arr = [
            {   
                name: 'Doms',
                pet: {
                    name: 'Brench',
                },
            },
            {
                name: 'Pat',
                pet: {
                    name: 'Li',
                    collars: [
                        {
                            color: 'red',
                        },
                        {
                            color: 'pink',
                            name: 'I love TS',
                        }
                    ]
                },
                pocket: {
                    money: {
                        amount: 500000000,
                    },
                    card: 'ATM',
                },
                sayings: 'I am Rick now!',
            }
        ];
        const schema: ITransformSchema = {
            Model: Person,
            include: [
                {
                    field: 'pet',
                    Model: Animal,
                    include: {
                        field: 'collars',
                        Model: Item,
                    }
                },
                {
                    field: 'pocket',
                    Model: Item,
                    include: {
                        field: 'money',
                        Model: Item,
                    },
                },
            ],
        };

        const res = transform(arr, schema);

        expect(res[0]).toBeInstanceOf(Person);
        expect(res[0].pet).toBeInstanceOf(Animal);
        expect(res[1]).toBeInstanceOf(Person);
        expect(res[1].pet).toBeInstanceOf(Animal);
        expect(res[1].pet.collars[0]).toBeInstanceOf(Item);
        expect(res[1].pet.collars[1]).toBeInstanceOf(Item);
        expect(res[1].pocket).toBeInstanceOf(Item);
        expect(res[1].pocket.money).toBeInstanceOf(Item);
    });

    it('transform object in a given dot notation property name', () => {
        class Computer extends Model {}
        class Laptop extends Model {};

        const obj = {
            name: 'Brent',
            talent: 'chickboi',
            computer: {
                favorite: {
                    laptops: [
                        {
                            brand: 'dell',
                        },
                        {
                            brand: 'asus',
                        }
                    ],
                    computer: {
                        brand: 'mansanas',
                        casing: {
                            material: 'titanium',
                        }
                    },
                },
            },
        };
        // const schema = {
        //     Model: Person,
        //     include: [
        //         {
        //             field: 'computer.favorite.laptops',
        //             Model: Laptop,
        //         },
        //         {
        //             field: 'computer.favorite.computer',
        //             Model: Computer,
        //             include: {
        //                 field: 'casing',
        //                 Model: Item,
        //             },
        //         },
        //     ],
        // };
        const schema1 = {
            Model: Person,
            include: {
                field: 'computer.favorite',
                include: [
                    {
                        field: 'laptops',
                        Model: Laptop,
                    },
                    {
                        field: 'computer',
                        Model: Computer,
                        include: {
                            field: 'casing',
                            Model: Item,
                        },
                    },
                ],
            },
        };
        const res = transform(obj, schema1);
        expect(res).toBeInstanceOf(Person);
        expect(res.computer.favorite.laptops[0]).toBeInstanceOf(Laptop);
        expect(res.computer.favorite.laptops[1]).toBeInstanceOf(Laptop);
        expect(res.computer.favorite.computer).toBeInstanceOf(Computer);
        expect(res.computer.favorite.computer.casing).toBeInstanceOf(Item);
    });

    it('transforms any non object data', () => {
        class Computer {
            name: string;

            constructor(name: string) {
                this.name = name;
            }
        }

        class Laptop {
            name: string;
            brand: string;
            weight: number;

            constructor(name: string, brand: string, weight: number) {
                this.name = name;
                this.brand = brand;
                this.weight = weight;
            }
        }

        const pc1 = 'pc173';
        const pc2 = ['pc222', 'brand234', 1];
        const computerSchema: ITransformSchema = {
            Model: Computer,
            singleParam: true,
        }
        const laptopSchema: ITransformSchema = {
            Model: Laptop,
            multiParam: true,
        }

        const pcRes1 = transform(pc1, computerSchema);
        expect(pcRes1).toBeInstanceOf(Computer);
        expect(pcRes1.name).toBe(pc1);

        const pcRes2 = transform(pc2, laptopSchema);
        expect(pcRes2).toBeInstanceOf(Laptop);
        expect(pcRes2.name).toBe(pc2[0]);
        expect(pcRes2.brand).toBe(pc2[1]);
        expect(pcRes2.weight).toBe(pc2[2]);
    });

    it('throws error for having two "singleTransform" and "multiTransform" at the same time', () => {
        class Computer {
            name: string;

            constructor(name: string) {
                this.name = name;
            }
        }

        const invalidSchema: ITransformSchema = {
            multiParam: true,
            singleParam: true,
            Model: Computer,
        }

        expect(() => transform('pc1', invalidSchema)).toThrow();
    });
});

