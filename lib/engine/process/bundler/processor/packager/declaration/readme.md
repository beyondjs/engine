# ProcessorDeclaration

## global.ProcessorDeclaration

```typescript
interface ProcessorDeclaration extends IProcessorDeclaration, IDynamicProcessor {
    _build();
}
```

## ProcessorDeclaration interface

```typescript
interface IProcessorDeclaration {
    packager: IProcessorPackager;
    diagnostics: ICompilerDiagnostics; // Shortcut to this.packager.compiler.diagnostics
    valid: boolean; // Shortcut to this.diagnostics.valid
    code: { code: string, map: string };

    constructor(packager: IProcessorPackager);
}
```
