# ProcessorCode

## global.ProcessorCode

```typescript
interface ProcessorCode extends IProcessorCode, IDynamicProcessor {
    _build(hmr: boolean);
}
```

## ProcessorCode interface

```typescript
interface IProcessorCode {
    packager: IProcessorPackager;
    multilanguage: boolean;
    diagnostics: ICompilerDiagnostics; // Shortcut to this.packager.compiler.diagnostics
    valid: boolean; // Shortcut to this.diagnostics.valid
    code: { code: string, map: object };
    hmr: { code: string, map: object };

    constructor(packager: IProcessorPackager);

    configure(multilanguage: boolean);
}
```
