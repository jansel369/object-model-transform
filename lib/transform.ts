import OMTError from './OMTError';

export interface ITransformSchema {
    field?: string;
    Model?: any; // typeof Model
    include?: IncludeSchema | IncludeSchema[];
    singleParam?: boolean;
    multiParam?: boolean;
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
        return schema.reduce<object>((prev, schemaElement) => transformObject(prev, dataSource, undefined, schemaElement), {}); // returns a multiple transformed props object
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
                [field]: transformObject(data, data, undefined, schema),
            };
        }

        const data = dataSource[schema.field];

        return {
            [fields[0]]: data instanceof Array && !schema.multiParam
                ? data.map((dataElement) => transformObject(dataElement, dataElement, schema, schema.include, schema.Model))
                : transformObject(data, data, schema, schema.include, schema.Model),
        };
    }
}

export function transformObject(data, target, schema: ITransformSchema, nextSchema: ITransformSchema | ITransformSchema[], Model?) {
    if (schema) {
        if (schema.singleParam && schema.multiParam) {
            throw new OMTError('Invalid schema: multiple field "singleParam" and "multipleParam" must only be one');
        }
    
        if (schema.singleParam) {
            return singleParamTransform(target, Model);
        } else if (schema.multiParam) {
            return multiParamTransform(target, Model)
        }
    }
    
    if (target instanceof Object) {
        const object = { ...data, ...modelTransform(target, nextSchema) };

        return Model ? new Model(object) : object;
    }

    return target;
}

export function singleParamTransform(target, Model) {
    return target && Model ? new Model(target) : target;
}

export function multiParamTransform(target, Model) {
    return target && Model && target instanceof Array
        ? new Model(...target)
        : target;
}