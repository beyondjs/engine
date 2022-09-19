# General description about processors and its implementation

## ProcessorBase

The ProcessorBase object contains the processor source files, and can act as a container for a code packager (by
instantiating and exposing a ProcessorPackager) or as an extender (ProcessorExtender) for other processors.

In cases where the processor is not specified as an extender, then it will always instantiate the ProcessorPackager
object, even if it was not specified in the meta properties, in which case global.ProcessorPackager will be used by
default.

### ProcessorBase children properties

The following properties are crucial for the processor implementation, and must be configured in the meta properties.

* **sources**: IProcessorSources
* **hash**: IProcessorHash
* **packager?**: IProcessorPackager
* **extender?**: IProcessorExtender

## ProcessorPackager

The following properties are crucial for the processor packager implementation, and must be configured in the meta
properties.

* **compiler**: IProcessorCompiler
* **dependencies**: IDependencies
* **declaration**: IProcessorDeclaration
* **code**: IProcessorCode
