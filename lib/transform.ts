import OMTError from './OMTError';

export interface IOntransform {
    (Model, data, parent, root): any;
}

export interface ITransformSchema {
    field?: string;
    Model?: any; // typeof Model
    include?: IncludeSchema | IncludeSchema[];
    singleParam?: boolean;
    multiParam?: boolean;
    onTransform?: IOntransform;
}

interface IncludeSchema extends ITransformSchema {
    field: string;
}

export default function transform<T = any>(obj: any, transformSchema: ITransformSchema): T {
    const key = 'key';

    return modelTransform({ [key]: obj }, { ...transformSchema, field: key }, obj, 0)[key];
}

export function modelTransform(dataSource: any | any[], schema: ITransformSchema | ITransformSchema[], root, depth: number): any {
    if (!schema || !dataSource) {
        return {};
    }

    if (schema instanceof Array) {
        return schema.reduce<object>((prev, schemaElement) => transformObject(prev, dataSource, undefined, schemaElement, root, dataSource, depth), {}); // returns a multiple transformed props object
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
                [field]: transformObject(data, data, undefined, schema, root, dataSource, depth),
            };
        }

        const data = dataSource[schema.field];

        return {
            [fields[0]]: data instanceof Array && !schema.multiParam
                ? data.map((dataElement) => transformObject(dataElement, dataElement, schema, schema.include, root, dataSource, depth))
                : transformObject(data, data, schema, schema.include, root, dataSource, depth),
        };
    }
}

export function transformObject(data, target, schema: ITransformSchema, nextSchema: ITransformSchema | ITransformSchema[], root, parent, depth: number) {
    if (schema) {
        const Model = schema.Model;

        if (typeof schema.onTransform === 'function') {
            const object = subTransform(data, target, nextSchema, root, depth);

            return schema.onTransform(Model, object, depth === 0 ? undefined : parent, root);
        }

        if (schema.singleParam) {
            return singleParamTransform(target, Model);
        } else if (schema.multiParam) {
            return multiParamTransform(target, Model)
        }

        if (target instanceof Object) {
            const object = subTransform(data, target, nextSchema, root, depth);

            return Model ? new Model(object) : object;
        }
    }

    if (nextSchema && !schema) { // for array schema and dot notation
        return subTransform(data, target, nextSchema, root, depth);
    }

    return target;
}

export function subTransform(data, target, nextSchema, root, depth) {
    return {
        ...data,
        ...modelTransform(target, nextSchema, root, depth + 1),
    };
}

export function singleParamTransform(target, Model) {
    return target && Model ? new Model(target) : target;
}

export function multiParamTransform(target, Model) {
    return target && Model && target instanceof Array
        ? new Model(...target)
        : target;
}