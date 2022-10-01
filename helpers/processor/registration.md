# Processors Registration

The registration of the processors is done through the configuration of the property "processors" in the beyond.json
file.

Example of the "processors" property of the beyond.json file:

```json5
{
  "processors": {
    "register": [
      './processors'
    ]
  }
}
```

The register property is an array where each entry is a string that points to the location of the code files that must
in turn return an array of objects, where each object implements the IProcessorMetaProperties interface.

### Meta properties

```typescript
interface IProcessorMetaProperties {
    name: string;
    Processor?: IProcessor;
    sources: {
        overwrites: boolean;
        Sources?: IProcessorSources;
        extname: string [] | string;
    }
    Hash?: IProcessorHash;
    Analyzer?: IProcessorSourcesAnalyzer;
    extender?: IProcessorExtender;
    packager?: {
        Packager?: IProcessorPackager;
        Code: IPrrocessorCode;
        Hash?: IProcessorPackagerHash;
        Dependencies?: IDependencies;
        compiler: (packager: IProcessorPackager) => IProcessorCompiler;
        declaration?: (packager: IProcessorPackager) => IProcessorDeclaration;
    }
}
```

#### Where:

Required properties:

* **name**: The name of the processor
* **sources.extname**: Must be specified as a string or an array of strings with the dot at the beginning. Ex: '.ext'.
* **packager.compiler** It is a function as it would be required to return a different compiler according to the
  distribution, or any other feature of the packager.
* **packager.declaration** It is a function to be able to determine if the processor has a declaration according to the
  distribution, or any other feature of the packager.
* **packager.Js**: Should extend **global.ProcessorCode**.
* **packager.Css**: Should extend **global.ProcessorCode**.

Optional properties;

* **Processor**: If not specified, then **global.ProcessorBase** is going to be used.
* **analyzer** and **analyzer.Analyzer**: If the **analyzer** property is specified, and **analyzer.Analyzer** is
  undefined, then global.ProcessorAnalyzer will be instantiated. If **analyzer** is not defined, then the processor will
  not have an analyzer.
* **packager.Packager**: If not specified, then **global.ProcessorPackager** is going to be used.
* **Hash**: If not specified, then **global.ProcessorHash** is going to be used.
* **sources.overwrites**: Default is false.
* **sources.Sources**: If not specified, then **global.ProcessorSources** is going to be used.
