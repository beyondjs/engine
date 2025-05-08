# Creating a Custom Bundler for BeyondJS

BeyondJS is a development framework rooted in modular programming and packaging. A core aspect of this is its reliance
on **Bundlers**: specialized engines that process various source definitions (which may or may not be file-based) and
transform them into independently packaged modules. These output modules (e.g., JavaScript files, CSS stylesheets, or
other data structures) are the standard, addressable units that constitute a BeyondJS package.

While packages adhere to standard module practices (like `package.json` `exports` for their public API), BeyondJS uses
`module.json` files internally to offer greater versatility in defining how these output modules are generated from
various sources. This guide outlines how to develop your own custom Bundler to extend BeyondJS's processing
capabilities.

## Understanding the Role of a Bundler

In BeyondJS, the structure and processing of a package's content are heavily influenced by `module.json` files. Within
these files, "bundler entries" (e.g., "ts", "scss", "my-custom-type") dictate how specific source definitions should be
handled by a corresponding Bundler.

A **Bundler**, in the context of this guide, is the Node.js package you create. It contains the logic that the BeyondJS
engine will invoke to:

1. Access or receive source information based on a "bundler entry" in a `module.json`.
2. Transform or compile this information.
3. Produce an independently packaged, usable module as output.

When you create a custom Bundler, you are defining a new type of processing pipeline that can be utilized within any
BeyondJS package that configures it.

## Steps to Create a Bundler

Creating a Bundler involves developing a Node.js package that exports its processing logic according to BeyondJS
conventions.

### 1. Develop the Bundler Package (JavaScript)

Your Bundler must be structured as a standard Node.js package. The BeyondJS engine will load this package (based on its
name, once configured in a project) and instantiate your bundler's core logic on demand when processing modules that
specify your bundler type.

#### a. Package Entry Point and `meta` Export

The primary requirement is that your package's main module (as defined by the `main` field in its `package.json`) must
export a value that BeyondJS refers to as `meta`. This `meta` export provides BeyondJS with the constructor for your
`Bundler` class, which encapsulates your bundler's specific processing logic.

There are two valid ways your package can export this `meta`:

1.  **Exporting an Object with a `Bundler` Property:** Your package exports an object that has a property named
    `Bundler`. The value of this `Bundler` property must be the constructor class for your bundler.

    ```javascript
    // Example: my-custom-bundler/index.js
    class MyCustomBundler {
    	// ... constructor and methods defining the bundler's logic will be here ...
    }

    module.exports = {
    	Bundler: MyCustomBundler
    	// Other properties can be part of this exported object if needed.
    };
    ```

2.  **Exporting the `Bundler` Class Directly:** Your package can export the `Bundler` constructor class itself as the
    main export. ```javascript // Example: my-custom-bundler/index.js class MyCustomBundler { // ... constructor and
    methods defining the bundler's logic will be here ... }

        module.exports = MyCustomBundler;
        ```

    BeyondJS will use this exported class (obtained either directly from `meta` or from `meta.Bundler`) to create
    instances of your bundler for each relevant `module.json` entry.

#### b. Implementing Your `Bundler` Class (e.g., `MyCustomBundler.js`)

This class is the core of your Bundler. An instance of this class will be created by BeyondJS's Module Resolver for each
`module.json` entry that specifies your bundler's type.

**Constructor Signature:**

Your `Bundler` class constructor (e.g., `MyCustomBundler`) will receive a single object argument with the following
properties:

-   `pkg`: The BeyondJS `Package` object of the package currently being processed. This provides access to:
    -   `pkg.path`: The absolute path to the root of the BeyondJS package.
    -   `pkg.modules.seekers`: An interface to BeyondJS's dependency location system (Seekers). Your bundler can use
        this if it needs to resolve `import` statements or other dependencies based on the content it processes.
    -   Other package-level information and services.
-   `path`: An object describing the path context of the `module.json` file that defined this specific module instance.
    While often used for file-based bundlers, for other types of bundlers, it still provides a contextual anchor:
    -   `path.dirname`: The absolute directory path where the `module.json` file is located.
    -   `path.relative.dirname`: The relative path of `path.dirname` from the package root.
-   `settings`: An object representing the global/default settings for your bundler type, as configured in the BeyondJS
    package that is _using_ your bundler. The actual settings values are typically available under `settings.value`.
-   `specs`: An object representing the specific configuration provided for this particular module instance within the
    `module.json` file (e.g., `specs.source` could be a database query, `specs.file` for file-based bundlers, or any
    other custom options your bundler needs).

**Core Responsibilities and Expected Interface:**

Your `Bundler` class (e.g., `MyCustomBundler`) must implement the logic for processing the source information as defined
in `specs`. This conceptually involves:

-   **Initialization (`constructor`):**

    -   Store references to `pkg`, `path`, `settings`, and `specs`.
    -   Initialize internal state for errors (`_errors`) and warnings (`_warnings`).
    -   Perform essential validation of `specs` (e.g., check for required properties in `specs` according to your
        bundler's needs).

    ```javascript
    // Conceptual structure within your MyCustomBundler class
    class MyCustomBundler {
    	#pkg;
    	#path;
    	#settings;
    	#specs;
    	#errors = [];
    	#warnings = [];

    	constructor({ pkg, path, settings, specs }) {
    		this.#pkg = pkg;
    		this.#path = path;
    		this.#settings = settings;
    		this.#specs = specs;

    		// Example: Basic validation for a required spec property
    		if (this.#specs.someRequiredInput === void 0) {
    			this.#errors.push('Required "someRequiredInput" property not specified in module.json specs.');
    		}
    	}

    	// ... other methods for processing and exposing output ...
    }
    ```

-   **Exposing Processed Output:** Your bundler must provide standardized methods for BeyondJS to retrieve the results
    of its processing. These typically include: _ `async code()`: A method that returns a `Promise`. This promise should
    resolve to the main processed content as a string (e.g., JavaScript code, CSS, JSON data). The core logic for
    accessing source information (from files, databases, APIs, based on `specs`), transforming it, and handling
    dependencies (if any) would be triggered or performed within this method or a method it calls. _ `async map()`: A
    method that returns a `Promise`. This promise should resolve to a sourcemap object or string if your bundler
    generates sourcemaps (relevant for code transformations); otherwise, it can resolve to `null`. _ `get errors()`: A
    getter that returns an array. This array should contain any error messages (strings or error objects) encountered
    during the processing of this module instance. _ `get warnings()`: A getter that returns an array. This array should
    contain any warning messages generated during processing.

        ```javascript
        // Conceptual interface methods within your MyCustomBundler class (continued)
        class MyCustomBundler {
            // ... constructor from previous example ...

            async code() {
                // Actual processing logic to generate and return code string is implemented here.
                // This is a placeholder indicating the method must exist.
                // It should handle errors by populating 'this._errors'.
                // If 'this._errors' has content, it might return null or an empty string.
                // Based on this.#specs, it would fetch/generate content.
                // E.g., if this.#specs.query, it might query a DB.
                // E.g., if this.#specs.file, it might read a file.
                throw new Error('Method "code()" not implemented.');
            }

            async map() {
                // Actual logic to generate and return sourcemap is implemented here.
                // This is a placeholder.
                return null;
            }

            get errors() {
                return this._errors; // Should be populated by your processing logic
            }

            get warnings() {
                return this._warnings; // Should be populated by your processing logic
            }
        }
        ```

    The detailed implementation within these methods, particularly `code()` and `map()`, is specific to your bundler's
    purpose. For more complex scenarios, especially those requiring reactivity to changes in source data or other
    dynamic conditions, your `Module` class might also be implemented as a `@beyond-js/dynamic-processor`.
