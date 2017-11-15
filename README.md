## API Reference
### transform(obj: any, schema: ITransformSchema)
Recursively transform object into a model by the given schema.
- `obj` - [required] Any object or array data to transform.
- `schema` - [required] The schema for transforming objects to Model
  - `field` - [required for nested schema] The property field you want to transform. Supports dotnotation.
  - `Model` - [optional] The Model class of the object to transform.
  - `include` - [optional] A Schema to transform nested objects. Value can be array for multiple fields to transform.

## Defining a Model
```js
  var transformer = require('object-model-transform');

  // using a built-in Model
  class Person extends transformer.Model { }
  // create your custom Model
  class Item { 
    constructor(obj) {
      Object.assign(this, obj);
    }
  }
  class Animal {
    constructor(obj) {
      Object.assign(this, obj);
    }

    makeSound() {
      // code ...
    }
  }
```

## Example

```js
  var obj = {
    name: 'li',
    age: 32,
  };

  var schema = {
    model: Person,
  };

  transformer.transform(obj, schema); // => Person { name: 'li', age: 32, };

  // schema also works on array of objects

  var arr = [
    {
      name: 'Gab',
    },
    {
      name: 'Pauline',
    },
  ];
  
  transformer.transform(arr, schema) // => [ Person { name: 'Gab', }, Person { name: 'Pauline' }]

  // transforming a nested objects

  var nestedObjs = [
    {
      name: 'Pat',
      items: [
        {
          name: '0',
          color: 'red',
        },
        {
          name: '1',
          color: 'black',
        },
      ],
      pet: {
        name: 'Brench',
        type: 'dog',
        collar: {
          color: 'yello',
        },
      },
    },
  ],

  var nestedSchema = {
    Model: Person,
    include: [
      {
        field: 'items',
        Model: Item,
      },
      {
        field: 'pet',
        Model: Animal,
        include: {
          field: 'collar',
          Model: Item,
        }
      },
    ],
  };

  transformer.transform(nestedObjs, nestedSchema); /* => 
    [
      Person {
        ....
        items: [
          Item {
            ....
          },
          Item {
            ....
          },
        ],
        pet: Animal {
          ....
          collar: Item {
            ....
          },
          makeSount(),
        },
      },
    ]
  */

  // Using dotnotaion as a field

  var dnObj = {
    name: 'jans',
    item: {
      tool: {
        type: 'programming',
        laptop: {
          color: 'black',
        },
      },
    },
  };
  var dnSchema = {
    include: {
      field: 'item.tool.laptop',
      Model: Item,
    },
  }

  transformer.transform(dnObj, dnSchema); /* => 
  {
    ....
    item: {
      tool: {
        ....
        laptop: Item {
          ....
        },
      },
    },
  }
  */

  // with multiple fields to transform
  const dnObj2 = {
    name: 'Brent',
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
  const dnSchema2 = {
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

  transformer.transform(dnObj2, dnSchema2); /* => 
    Person {
      ....
      computer: {
        favorite: {
          laptops: [
            Laptop {
              ....
            },
            Laptop {
              ....
            }
          ],
          computer: Computer {
            ....
            casing: Item {
              ....
            }
          },
        },
      },
    };
  */
```