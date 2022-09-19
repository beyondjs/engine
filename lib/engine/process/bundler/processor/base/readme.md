# ProcessorBase

The ProcessorBase is instantiated by the collection of processors of the object 'bundle', and by the following special
cases:

* The application template for the custom properties (template.application).
* The global styles template that is injected into each widget shadow dom (template.global).
* The template.processors that is in turn used by the css (less and scss) processors.

```typescript
interface IProcessorBase {
    name: string; // The name of the processor
    path: string; // The path join of the bundle path and processor path configuration
    id: string; // `${this.#specs.bundle.id}//${this.#name}//${this.distribution.key}//${this.language}`
    meta: IProcessorMetaProperties; // The configuration made in the processor registration
    application: object; // The application object
    distribution: object; // The distribution specification
    language: string;
    sources: IProcessorSources;
    files: FinderCollection; // Shortcut to sources.files;
    overwrites: FinderCollection; // Shortcut to sources.overwrites;
    multilanguge: boolean;
    hash: IProcessorHash;
    packager: IProcessorPackager;
    extender: IProcessorExtender;
    errors: string[];
    valid: boolean;
    warnings: string[];

    constructor(name: string, specs: IProcessorSpecs);
}

interface IProcessorSpecs {
    bundle: {
        id: string,
        path: string,
        pathname: string,
        resource: string,
        name: string,
        container: {
            is: string // Can be 'module' or 'library'
        }
    },
    distribution: object,
    application: object,
    watcher: object
}
```

# ProcessorSources

```typescript
interface IProcessorSources {
    files: FinderCollection;

    overwrites: FinderCollection;

    constructor(processor: IProcessorBase);
}
```

# ProcessorHash

```typescript
interface IProcessorHash extends IDynamicProcessor {
    value(): number;

    constructor(processor: IProcessorBase);
}
```
