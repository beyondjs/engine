# Beyond

## v1.3.2 - 2025/3/01

### Features

-   **Template Overwrites Support**: Introduced support for defining `scss` and `txt` bundle overwrites at the template
    level.

    This feature allows templates to customize specific bundles and processors of modules from dependent packages. To
    enable it, use the `overwrites` entry point in the `template.json` file. The value can be either an inline object or
    a string referencing a separate configuration file (e.g., `"overwrites": "overwrites.json"` will resolve to a file
    located alongside `template.json`).

    The `overwrites` object must follow this structure:

    ```json
    {
    	"@scope/package-name/module-name": {
    		"txt": {
    			"txt": {
    				"files": "./overwrites/example.json"
    			}
    		},
    		"widget": {
    			"scss": {
    				"files": "./overwrites/example.scss"
    			}
    		}
    	}
    }
    ```

    -   Each key is the bare module specifier (as used in imports or dependencies).
    -   Bundles (`txt`, `widget`, etc.) group related processors, which may include `scss`, `txt`, or others.
    -   For each processor, the `files` property specifies the source of the overwrite.
    -   The processor configuration mirrors the format used in `module.json`, ensuring consistency across customization
        points.

## v1.2.5 - 2025/2/17

### Fix

-   **Path error in static file generation for internal library modules**: solved, static files are generated with the
    library's vspecifier

## v1.2.4 - 2024/8/15

### Fix

-   **Internal libraries that do not have the build distribution are not being processed**: solved, error message during
    compilation process

## v1.2.3 - 2024/6/19

### Fix

-   **Generate package declarations with config imports**: solved, generate bundle declarations that have imports from
    the bundle config

### Feat

-   **Styles on the information page (feat)**: Improvement in interface and page visual with bundle information

## v1.2.2 - 2024/5/24

### Fix

-   **Import internal dependencies config (fix)**: solved, import of the bundle config of internal dependencies from
    main package

### Features

-   **Config Declarations (feat)**: Declarations generated for `config` package modules, use case when handling packages
    as internal dependencies (old libraries)

### Enhancements

-   **Minify Build (feat)**: minified css and js in the compilation process according to the distribution configuration

Example:

```json
"minify": {
  "css": true,
  "js": true
}
```

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
