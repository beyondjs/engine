# Hierarchy

## ProcessorBase

It is not a DynamicProcessor.

### Properties

* Sources
* Hash
* Packager
* Extender

## ProcessorSources

The **files** have the *.hash* property.

* Files

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
