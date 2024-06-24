# TypeScript Declarations in BeyondJS

BeyondJS generates TypeScript declaration files (`.d.ts`) for the modules in your package using the TypeScript compiler API. These declarations are cached inside the `.beyond` folder and are additionally generated on disk inside the `modules/node_modules` folder for easy access by the code editor. During the compilation process for deploying to NPM, BeyondJS generates these declarations and includes them in the `exports` field of the `package.json`.

## Key Concepts

### Dual Distribution Approach

BeyondJS supports two types of package distributions:

1. **Runtime Distribution**: Modules run without any declarations, relying on TypeScript transpiled code.
2. **NPM Distribution**: TypeScript declarations are included, allowing for package distribution without exposing source code.

## Generating Declarations

BeyondJS creates TypeScript declaration files and places them in a `node_modules` folder within the `modules` directory. This setup ensures that declarations are easily accessible for development purposes and remain intact, as NPM updates can overwrite the main `node_modules` folder.

### Example Directory Structure

```
src/
  modules/
    data/
      models/
        file.ts
        user.ts
        module.json
    node_modules/  // inside modules, not inside modules/data/models
      data/models.d.ts
```

### Purpose of `modules/node_modules` Declarations

The primary purpose of placing declaration files in the `modules/node_modules` folder is to enhance code editor capabilities. This allows code editors to recognize and provide IntelliSense for the declarations, improving the overall development experience. Additionally, this organization prevents conflicts with NPM updates and ensures developers have easy access to their package declarations.

## Declaration Generation Process

BeyondJS uses the TypeScript compiler API to generate declaration files. It organizes these declarations using the namespace feature, ensuring that internal modules are properly scoped and accessible within their respective namespaces. This helps maintain a clear and organized structure in the generated declaration files.

### package.json Exports

BeyondJS also declares the generated declaration files in the `package.json` exports field using conditional exports, specifying the entry points of the package that are exposed for import.

```json
{
  "name": "[PACKAGE]",
  "version": "1.0.0",
  "exports": {
    "default": "./dist/data/models/index.js",
    "types": "./dist/data/models/index.d.ts"
  }
}
```

This setup allows other modules to import the bundled modules using bare specifiers, ensuring clear separation and dependency management.

## Summary

- **Enhanced Editor Support**: Declaration files in the `modules/node_modules` folder ensure that code editors provide accurate IntelliSense, making development smoother and error-free.
- **Efficient Distribution**: By bundling declarations with JavaScript files, TypeScript compilation times are reduced, and packages can be distributed without exposing source code.
- **Dual Distribution**: Developers can choose to run modules in runtime without declarations or deploy packages to NPM with TypeScript declarations included.

This way, BeyondJS makes your development process more efficient and your packages easier to maintain and distribute. Enjoy the seamless integration and enhanced tooling support as you build with BeyondJS!