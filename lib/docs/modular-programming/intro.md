# Introduction to Modular Programming

Modular programming is a software design technique that emphasizes separating a program's functionality into independent, interchangeable modules. Each module contains everything necessary to execute a specific aspect of the desired functionality. This approach promotes code reusability, maintainability, and scalability by organizing code into discrete, self-contained units.

# BeyondJS and ECMAScript Modules

In our development framework, we use BeyondJS to facilitate modular programming. BeyondJS packages modules as ECMAScript modules, similar to Skypack and JSPM. Each module is defined by a `module.json` file and consists of internal ECMAScript modules that are bundled together. This bundling allows the modules to be exported by the package and imported using bare specifiers. By adhering to this modular structure, developers can ensure that their code is organized, manageable, and easy to extend.

# Internal vs. Package Modules

In BeyondJS, modules are categorized as internal or package modules based on whether they are ECMAScript modules that will be bundled as a package module. This categorization is related to their import method and scope within the package.

## Internal Modules

Internal Modules are ECMAScript modules that belong to the same package module. They are imported using relative paths and are part of a cohesive unit that gets bundled together. Only the names explicitly marked with the `/*bundle*/` magic comment are exported by the bundled package module.

```typescript
// Example of a relative import (internal module)
import { IFileData } from './interfaces/file';
```

## Package Modules

Package Modules are modules that are either from different packages or different modules within the same package. They are imported using non-relative paths, also known as bare specifiers. These modules are already bundled and exported by their respective packages.

```typescript
// Example of a non-relative import (package module)
import { validateBearerToken } from '[PACKAGE]/middleware';
```

The distinction between internal modules and package modules lies in their bundling and import method. Internal modules, imported using relative paths, are part of a single cohesive unit within the same package module. They are bundled together, meaning they can be managed and updated as a single entity. On the other hand, package modules, imported using non-relative paths, are treated as distinct entities, ensuring clear separation between different parts of the codebase and enabling better dependency management.

# Bundling and Importing Modules

## Example of Bundling and Importing

Consider a package module named `data/models` that includes several internal modules, such as `file.ts` and `user.ts`. These internal modules can be imported within their own package module using relative imports. However, you cannot import internal modules from other package modules directly; you can only import the exported names that were marked with the `/*bundle*/` magic comment. Here’s how this works:

**Internal Module: file.ts**

```typescript
// [PACKAGE]/data/models/file.ts
export /*bundle*/ const files = new Collection<IFileDoc>('Files');
```

**Internal Module: user.ts**

```typescript
// [PACKAGE]/data/models/user.ts
export /*bundle*/ const users = new Collection<IUserDoc>('Users');
```

These internal modules are bundled by BeyondJS into a single module defined in `module.json`:

```json
{
  "name": "data/models",
  "bundle": "ts",
  "files": ["*"]
}
```

The bundled module is then added to the `exports` of the `package.json`. The `exports` field in `package.json` is used to specify which modules are exposed by the package for import. This allows consumers of the package to import specific modules using bare specifiers.

Simplified example of how the `package.json` file will look after BeyondJS compilation:

```json
{
  "name": "[PACKAGE]",
  "version": "1.0.0",
  "exports": {
    "./data/models": "./dist/data/models/index.js"
  }
}
```

In this example, the `exports` field specifies the entry points of the package that are exposed for import. BeyondJS compiles the internal modules and adds them to the `exports` field, enabling other modules to import these bundled modules using bare specifiers.

## Importing the Bundled Module Using Bare Specifiers

Once bundled and exported, other modules can import `files` and `users` using non-relative imports (bare specifiers):

```typescript
// Importing the bundled module (package module) using bare specifiers
import { files, users } from '[PACKAGE]/data/models';
```

By following this approach, developers ensure that their code is modular, organized, and easy to manage. Bundling internal modules into a package module allows for clean separation of concerns and simplifies the import process, making the codebase more maintainable and scalable.

# Summary

Modular programming with BeyondJS allows developers to create well-structured, maintainable, and scalable applications. By bundling internal ECMAScript modules into package modules and using the `/*bundle*/` magic comment to manage exports, developers can maintain clear separation of concerns and simplify dependency management. The distinction between internal and package modules ensures that code remains organized and dependencies are well-defined, promoting reusability and ease of maintenance.

By adhering to these principles and practices, developers can leverage the full power of modular programming with BeyondJS, resulting in robust and efficient codebases that are easy to extend and maintain.
