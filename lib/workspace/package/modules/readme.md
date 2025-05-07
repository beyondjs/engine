# Package Modules System (`workspace/package/modules/`)

This system is responsible for the discovery and instantiation of modules within a package.

It also provides the mechanism for these modules to locate their dependencies referenced by "bare specifiers" (e.g.,
`import 'my-package/featureX';`), during their processing phase. This dependency location is handled by **Seekers**.

Modules are flexibly defined via `module.json`, and ultimately packaged to be interoperable and addressable in a
standard way, akin to modules in systems like Skypack, and will correspond to entries in the package's `exports` in
`package.json` upon build.

## Module Definition and Structure

Modules are primarily defined within `module.json` files. A single `module.json` file can describe multiple **conceptual
modules** through distinct "bundler entries". Each bundler entry (e.g., "ts", "scss", "txt") specifies a type of
resource and implies a specific processing pipeline. The Bundler Processor associated with an entry (e.g., a "ts bundler
processor" for a "ts" entry) is responsible for transforming the source into an independently packaged module (e.g., a
JavaScript file, a CSS stylesheet). This is a core aspect of BeyondJS's modular packaging approach: each bundler entry
yields a distinct, addressable module.

The capability to define multiple bundler entries within one `module.json` allows related aspects of a single logical
component to be managed cohesively. For example, a UI widget can have its TypeScript logic, SASS styles, and text
resources defined in the same `module.json` file as separate bundler entries. While grouped for definition, each entry
is processed into a distinct, specialized module, ready for individual import or use.

The `modules` system, through its **Resolvers**, identifies `module.json` files and processes each bundler entry,
preparing it for instantiation as an individual `Module` object.

## Module Instantiation

Each conceptual module (a bundler entry from `module.json`) is transformed into an actual `Module` object instance. This
instantiation process relies on **Registered Bundlers**.

1.  **Registered Bundlers (Package-Level)**: These are the processing engines (e.g., TypeScript compiler, SASS
    processor) configured for the package (managed by `workspace/package/bundlers/`). Their availability and base
    configurations are set in the `package.json` file. Each Registered Bundler provides:

    -   `meta`: Contains the core logic, including the constructor class (e.g., for a "ts bundler", this would be the
        class that handles TypeScript processing) required to create a `Module` instance of its specific type. This
        `Module` class itself embodies the specific bundling/processing logic for that type of resource.
    -   `settings`: Default or global configuration settings applicable to all modules processed by this Registered
        Bundler within the package.

2.  **The Resolver's Role (`./resolvers/resolver.js`)**: The `Resolver` handles the instantiation of each conceptual
    module. For every bundler entry parsed from a `module.json` (which is processed into `BundlerSpecs` by
    `./resolvers/entries/entry.js`):

    -   It identifies the type of Registered Bundler required (e.g., "ts", "scss") from the `BundlerSpecs`.
    -   It retrieves this Registered Bundler from the package's collection of available bundlers (`pkg.bundlers`).
    -   From this Registered Bundler, it extracts the `meta` (constructor class) and its global `settings`.
    -   The `Resolver` then instantiates the `Module` by invoking the constructor (from `meta`) and passing it:
        -   The specific configuration for the conceptual module (`specs`, derived from the `module.json` bundler
            entry).
        -   The global `settings` associated with the Registered Bundler.
        -   A reference to the parent `Package` object (`pkg`) and the module's file path.

    This instantiated `Module` object (e.g., an instance created by a "ts bundler processor") is the component that will
    perform the actual processing (compilation, transformation) of the source file(s) associated with its bundler entry,
    resulting in a final, packaged module (e.g., a JavaScript bundle).

## Dependency Location (Seekers)

As a `Module` instance (i.e., a Bundler Processor like a "ts bundler processor" or "scss bundler processor") processes
its source content, it encounters references to other modules or libraries, typically through `import` statements using
"bare specifiers" (e.g., `import 'some-package/module'` or `import 'external-library'`). To locate these dependencies,
it utilizes the **Dependency Seekers** system.

The `Seekers` functionality is exposed through the `Package` object, accessible as `pkg.modules.seekers` (where `pkg` is
the package instance injected into the `Module` during its instantiation).

-   **Function**: When a Bundler Processor encounters a dependency specifier, it uses the `Seeker` system to locate and
    identify that resource. The Seeker is designed to handle various specifier types, particularly "bare specifiers"
    which are crucial for modular packaging. These specifiers can point to:
    -   Other modules within the same package, intended to be addressable parts of the package's public API (which will
        align with `package.json` `exports` upon build).
    -   Modules from other packages linked as libraries.
    -   External NPM packages.
    -   Node.js built-in modules.
-   **Process & Dynamic Nature**: The Bundler Processor calls methods on the `Seekers` interface (e.g.,
    `pkg.modules.seekers.create(specifier, distribution)`). The `Seeker` class (`./seekers/seeker.js`), being a
    `DynamicProcessor`, observes relevant parts of the package (like `pkg.libraries` and `pkg.modules`). It then
    attempts to find the resource. Its key advantage is its ability to dynamically update its findings if the
    availability or definition of these addressable modules changes (e.g., if a module that would satisfy a bare
    specifier is newly built and registered within the development environment, or an external dependency is updated).
    This ensures dependency location remains current. The `Factory` (`./seekers/factory.js`) manages Seeker instances
    for efficiency.

In this architecture, module definition and instantiation (via Resolvers and Registered Bundlers) are integrated with
the capability for these modules to dynamically locate their dependencies (via Seekers) during their own processing
lifecycle. This ensures that while development benefits from the flexibility of `module.json`, the system is geared
towards producing standard, interoperable packages where modules are addressable via standard specifiers.
