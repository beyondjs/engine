# ProcessorCompiler

The basic implementation of a processor compiler requires extending global.ProcessorCompiler and implementing the
.compile method.

```typescript
class MyProcessor extends global.ProcessorCompiler {
    _processSource(source: IFinderFile, is: string): { compiled: string, errors: string[] } {
    }
}
```

In cases where a special behavior of the compiler is required, and it is not possible to extend from
global.ProcessorCompiler, the IProcessorCompiler interface must be implemented to be compatible with the BeyondJS
bundles.

## ProcessorCompiler interfaces

```typescript
interface IProcessorCompiler extends IDynamicProcessor {
    packager: IProcessorPackager;
    files: Map<string, ICompiledSource>;
    diagnostics: ICompilerDiagnostics;
    valid: boolean; // Shortcut of diagnostics.valid
    path: string;

    _processSource(source: IFinderFile, is: string): { compiled: string, errors: string[] };

    constructor(packager: IProcessorPackager);
}

interface ICompiledSource extends IFinderFile {
    is: string; // Can be 'source' or 'overwrite'
    id: string; // `${specs.bundle.id}//${name}//${is}${this.#source.relative.file}`
    compiled: string;

    constructor(packager: IProcessorPackager, is: string, source: IFinderFile, compiled: string);
}

interface IFinderFile {
    version: number;
    root: string;
    file: string;
    dirname: string;
    filename: string;
    basename: string;
    extname: string;
    relative: {
        file: string;
        dirname: string;
    }
    content: string;
    hash: string;
}

interface ICompilerDiagnostics {
    valid: boolean;
    general: string[];
    files: Map<string, ICompilerDiagnostic>;
    overwrites: Map<string, ICompilerDiagnostic>;
}

interface ICompilerDiagnostic {
    message: string;
    line?: number;
    character?: number;
}
```
