declare function transform<T = any>(obj: any, schema: transform.ITransformSchema ): T;

declare namespace transform {
    interface IncludeSchema extends ITransformSchema {
        propName: string;
    }
    
    interface ITransformSchema {
        propName?: string;
        readonly Model?: any; // typeof Model
        readonly include?: IncludeSchema | IncludeSchema[];
    }
}

export = transform;