import Model from '../lib/Model';

describe('Model', () => {
    describe('constructor', () => {
        it('accepts object as parameter and set as properties', () => {
            const model = new Model({ foo: 'foo', bar: 'bar' });

            expect(model).toBeInstanceOf(Model);
            expect((model as any).foo).toBe('foo');
            expect((model as any).bar).toBe('bar');
        });
    })
});