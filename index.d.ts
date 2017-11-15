declare class Model {
    constructor(obj: any);
}

declare function transform<T = any>(obj: any, schema: ITransformSchema ): T;

interface ITransformSchema {
    field?: string;
    Model?: any; // typeof Model
    include?: IncludeSchema | IncludeSchema[];
}

interface IncludeSchema extends ITransformSchema {
    field: string;
}

export { 
    Model,
    transform,
    ITransformSchema,
}
