declare class Model {
    constructor(obj: any);
}

declare function transform<T = any>(obj: any, schema: ITransformSchema ): T;

interface IOntransform {
    (Model, data, parent, root): any;
}

interface ITransformSchema {
    field?: string;
    Model?: any;
    include?: IIncludeSchema | IIncludeSchema[];
    singleParam?: boolean;
    multiParam?: boolean;
    onTransform?: IOntransform;
}

interface IIncludeSchema extends ITransformSchema {
    field: string;
}

export { 
    Model,
    transform,
    ITransformSchema,
    IIncludeSchema,
    IOntransform,
}
