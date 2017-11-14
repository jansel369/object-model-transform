interface IncludeSchema extends ITransformSchema {
    propName: string;
}

interface ITransformSchema {
    propName?: string;
    readonly Model?: any; // typeof Model
    readonly include?: IncludeSchema | IncludeSchema[];
}

export default function transform<T = any>(obj: any, transformSchema: ITransformSchema): T {
    const key = 'key';

    return modelTransform({ [key]: obj }, { ...transformSchema, propName: key })[key];
}

export function modelTransform(dataSource: any | any[], schema: ITransformSchema | ITransformSchema[]): any {
    if (!schema || !dataSource) {
        return {};
    }

    if (schema instanceof Array) {
        return schema.reduce<object>((prev, schemaElement) => transformObject(prev, dataSource, schemaElement), {}); // returns a multiple transformed props object
    } else {
        const propNames = schema.propName.split('.');
        if (!(propNames[0] in dataSource)) {
            return;
        }

        if (propNames.length > 1) { // for dot notation transform
            const propName = propNames.shift();
            const data = dataSource[propName];
            schema.propName = propNames.join('.');

            return {
                [propName]: transformObject(data, data, schema),
            };
        }

        const data = dataSource[schema.propName];

        return {
            [propNames[0]]: data instanceof Array
                ? data.map((dataElement) => transformObject(dataElement, dataElement, schema.include, schema.Model))
                : transformObject(data, data, schema.include, schema.Model),
        };
    }
}

export function transformObject(data, target, schema: ITransformSchema | ITransformSchema[], Model?) {
    if (target instanceof Object) {
        const object = { ...data, ...modelTransform(target, schema) };

        return Model ? new Model(object) : object;
    } else {
        return target;
    }
}
