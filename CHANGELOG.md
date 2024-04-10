# Beyond

## v1.2.1 - 2024/4/10

### Features

-   **Module Declarations (feat)**: Generated declarations for `config` modules of packages, improving integration and
    usage of configurations during development.

### Enhancements

-   **Environment Property (feat)**: Added the `environment` property in the `config` module, allowing for more detailed
    and specific environment configuration of the package.

## v1.2.0 - 2023/10/18

### BREAKING CHANGES

-   **Configuration File Update**: Changed the 'applications' entry to 'packages' in the `beyond.json` configuration
    file, requiring updates in existing configurations.
-   **Scaffolding Requirement**: Install package `@beyond-js/scaffolding` to add templates for packages, modules, and
    bundles, affecting project setup and structure.

### FEATURES

-   **Build Command**: Added the command `beyond build` to facilitate the building process with specific parameters:

    ```
    beyond build --pkg=[packageName] --distribution=[yourDistribution] --logs=[boolean]
    ```

### FIXES

-   Improved module declaration generation in the workspace.
-   Enhanced message handling in `devServer` when internal packages are not configured.
-   Fixed `devPackage` dependencies reference in `index.html`.
-   Included host in internal package configuration during the build process.
-   Enhanced error source map accuracy.
-   Improved capturing of template package directories, with specific enhancements for Linux.
-   Optimized reading of `dependencies` and `devDependencies` in `package.json`.
-   Resolved an issue with npm building process handling empty files in style processors.
