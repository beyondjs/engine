# ProcessorBase objects properties

The following objects are implemented as properties of the ProcessorBase object, and can be overriden by specifying them
in the **meta** properties.

# ProcessorPackager

```typescript
interface IProcessorPackager {
    processor: IProcessorBase;
    id: string; // Is the same as the IProcessorBase id
    application: object;
    distribution: object;
    language: string;
    compiler: IProcessorCompiler;
    hash: IProcessorPackagerHash;
    dependencies: IDependencies;
    declaration: IProcessorDeclaration;
    code: IProcessorCode;
    hmr: object;

    constructor(processor);

    setup();

    destroy();

    configure(config, multilanguage);
}
```

## ProcessorPackagerHash

```typescript
interface IProcessorPackagerHash extends IDynamicProcessor {
    value(): number;

    packager: IProcessorPackager;

    constructor(packager: IProcessorPackager);
}
```