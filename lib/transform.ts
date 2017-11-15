
export interface ITransformSchema {
    field?: string;
    readonly Model?: any; // typeof Model
    readonly include?: IncludeSchema | IncludeSchema[];
}

interface IncludeSchema extends ITransformSchema {
    field: string;
}

export default function transform<T = any>(obj: any, transformSchema: ITransformSchema): T {
    const key = 'key';

    return modelTransform({ [key]: obj }, { ...transformSchema, field: key })[key];
}

export function modelTransform(dataSource: any | any[], schema: ITransformSchema | ITransformSchema[]): any {
    if (!schema || !dataSource) {
        return {};
    }

    if (schema instanceof Array) {
        return schema.reduce<object>((prev, schemaElement) => transformObject(prev, dataSource, schemaElement), {}); // returns a multiple transformed props object
    } else {
        const fields = schema.field.split('.');
        if (!(fields[0] in dataSource)) {
            return;
        }

        if (fields.length > 1) { // for dot notation transform
            const field = fields.shift();
            const data = dataSource[field];
            schema.field = fields.join('.');

            return {
                [field]: transformObject(data, data, schema),
            };
        }

        const data = dataSource[schema.field];

        return {
            [fields[0]]: data instanceof Array
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
