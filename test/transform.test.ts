import Model from '../lib/Model';
import transform, { ITransformSchema } from '../lib/transform';

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
                    propName: 'pet',
                    Model: Animal,
                    include: {
                        propName: 'collars',
                        Model: Item,
                    }
                },
                {
                    propName: 'pocket',
                    Model: Item,
                    include: {
                        propName: 'money',
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

    it.only('transform object in a given dot notation property name', () => {
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
        //             propName: 'computer.favorite.laptops',
        //             Model: Laptop,
        //         },
        //         {
        //             propName: 'computer.favorite.computer',
        //             Model: Computer,
        //             include: {
        //                 propName: 'casing',
        //                 Model: Item,
        //             },
        //         },
        //     ],
        // };
        const schema1 = {
            Model: Person,
            include: {
                propName: 'computer.favorite',
                include: [
                    {
                        propName: 'laptops',
                        Model: Laptop,
                    },
                    {
                        propName: 'computer',
                        Model: Computer,
                        include: {
                            propName: 'casing',
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
});
