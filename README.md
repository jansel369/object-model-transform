## API Reference
### transform(data: any, schema: ITransformSchema)
Recursively transforms data into a model by the given schema and returns the value.
- `data` - [required] Any object or array data to transform.
- `schema` - [required] The schema for transforming objects to Model
  - `field` - [required for nested schema] The property field you want to transform. Supports dotnotation as field value.
  - `Model` - [optional] The Model class of the object to transform.
  - `include` - [optional] A Schema to transform nested objects. Value can be array for multiple fields to transform.
  -  `singleParam` - [optional] A boolean value to provide a single parameter with any data type for the constructor of any custom model.
  -  `multiParam` - [optional] A boolean value to provide multiple parameters for  the constructor of any custom model. Provided data type must be array that contains all the parameters.
  - `onTransform` - [optional] Provide a function with a highest precedence that returns a transformed data.
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

## Guide

### Basic Transform

```js
  var obj = {
    name: 'li',
    age: 32,
  };

  var schema = {
    Model: Person,
  };

  transformer.transform(obj, schema);
    // => Person { name: 'li', age: 32, };
```

### Transforming an array
```
  var arr = [
    { name: 'Gab' },
    { name: 'Pauline' },
  ];
  
  transformer.transform(arr, schema);
    // => [Person { name: 'Gab', }, Person { name: 'Pauline' }]
```

### Transforming a nested objects
```
  var nestedObjs = [
    {
      name: 'Pat',
      items: [
        { name: '0', color: 'red' },
        { name: '1', color: 'black' },
      ],
      pet: {
        name: 'Brench',
        type: 'dog',
        collar: { color: 'yello' },
      },
    },
  ],

  var nestedSchema = {
    Model: Person,
    include: [
      { field: 'items', Model: Item },
      {
        field: 'pet',
        Model: Animal,
        include: { field: 'collar', Model: Item }
      },
    ],
  };

  transformer.transform(nestedObjs, nestedSchema); /* => 
    [
      Person {
        ....
        items: [
          Item { .... },
          Item { .... },
        ],
        pet: Animal {
          ....
          collar: Item { .... },
          makeSount(),
        },
      },
    ]
  */
```

### Dotnotaion as a field
```
  var dnObj = {
    name: 'jans',
    item: {
      tool: {
        type: 'programming',
        laptop: { color: 'black' },
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
        laptop: Item { .... },
      },
    },
  }
  */
```
### With multiple fields to transform
```
  var dnObj2 = {
    name: 'Brent',
    computer: {
      favorite: {
        laptops: [
          { brand: 'dell' },
          { brand: 'asus' }
        ],
        computer: {
          brand: 'mansanas',
          casing: { material: 'titanium' }
        },
      },
    },
  };
  var dnSchema2 = {
    Model: Person,
    include: {
      field: 'computer.favorite',
      include: [
        { field: 'laptops', Model: Laptop },
        {
          field: 'computer',
          Model: Computer,
          include: { field: 'casing', Model: Item },
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
            Laptop { .... },
            Laptop { .... }
          ],
          computer: Computer {
            ....
            casing: Item { .... }
          },
        },
      },
    };
  */
```
### onTrnasform(Model, data, parent, root)
Customize a model for the provided field.
- `Model` - The model provided in schema.
- `data` - The data to transform from the specified field of schema. For nested transformation child object of data are the first to transform.
- `parent` - The parent object or array of the data.
- `root` - The root object from nested transformation

```
 class Person {
   constructor(person, petName) {
     Object.assign(this, person);
     this.petName = petName;
   }
 }

const data = {
    person: { name: 'Karl', age: 33 },
    pet: { name: 'Light' },
  };
const schema = {
  include: {
    field: 'person',
    Model: Person,
    onTransform: (Model, data, parent, root) => {
      return new Model(data, root.pet.name);
    },
  },
};

transformer.transform(data, schema) /*=>
  {
    person: Person {
      name: 'Karl',
      age: 33,
      petName: 'Light'
    },
    pet: { name: 'Light' },
  }
*/
```


## Models with diffirent parameters

### Single parameter
```

var timestamp = Date.now;
// 'singleParam' property to pass any type of single parameter
var schema = { Model: Date, singleParam: true }

transformer.transform(name, schema); /* =>
  Date { ... }
*/
```

### Multiple Parameter
```
class Laptop {
  constructor(name, brand, weight) {
    this.name = name;
    this.brand = brand;
    this.weight = weight;
  }
}

var data = ['pc32', 'brand-y', 2];
// 'multiParam' property to pass any type of multiple parameters
var schema = { Model: Laptop, multiParam: true };

transformer.transform(data, schema); /* =>
  Laptop { name: 'pc32', brand: 'brand-y', weight: 2 }
*/
```