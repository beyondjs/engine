# Hierarchy

## ProcessorBase

It is not a DynamicProcessor.

### Properties

* Sources
* Hash
* Packager
* Extender

## ProcessorSources

The **files** and **overwrites** objects each have the *.hash* property.

* Files
* Overwrites

The *.configure* method is responsible to configuring the files finder property. \

```javascript
class ProcessorSources {
    configure = (path, config) => files.configure(path, config);
}
```

## ProcessorPackager

It is not a DynamicProcessor.

### Properties

* Hash
* Dependencies
* Compiler
* Declaration
* Code
* HMR

## ProcessorCompiler

It is a DynamicProcessor.

### Children:

* files
* overwrites

## ProcessorCode

It is a DynamicProcessor

### Children:

* compiler

## ProcessorDeclaration

### Children

* Can be code (required by txt) or compiler (required by ts)

## Dependencies

### Properties

* code
* declarations

### Children

* packager.hash
