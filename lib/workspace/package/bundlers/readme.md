# Package Bundlers (`workspace/package/bundlers/`)

This directory is responsible for managing the collection of **Registered Bundlers** (also referred to as Bundler)
available to a package.

In BeyondJS's modular packaging approach, modules are initially defined as "conceptual modules" via "bundler entries"
(e.g., "ts", "scss") within `module.json` files (as detailed in the `workspace/package/modules/` system). The Registered
Bundlers managed here are the _actual processing engines_ that take these conceptual definitions and transform their
associated source code into **independently packaged modules**. These output modules—such as individual JavaScript
files, CSS stylesheets, or other processed resources—are the discrete, addressable units that ultimately form the
package's output, ready for use, distribution, or inclusion in final application builds.

## Overview

The primary functions of the system within this directory are:

1.  **Discovery and Loading**: To identify and load the Bundler Processor implementations based on the package's
    configuration. These configurations, set in the `package.json` file, dictate which bundlers (e.g., a TypeScript
    compiler wrapper, a SASS/CSS processor) are available for use.
2.  **Configuration Management**: To manage the specific settings (`settings`) and core operational logic (`meta`) for
    each Registered Bundler. The `meta` typically includes the constructor class needed by the Module Resolvers to
    instantiate `Module` objects.
3.  **Provision to Module System**: To make this collection of Registered Bundlers readily accessible to other parts of
    the package system, particularly the Module Resolvers (`workspace/package/modules/resolvers/`). The Module Resolvers
    depend on this collection to find the appropriate engine for instantiating each conceptual module defined in
    `module.json`.

## Core Components

-   **`index.js` (Bundlers Collection):**

    -   Defines the `Bundlers` class, which extends `DynamicProcessor`. This class is central to managing all Registered
        Bundlers for the package.
    -   It processes the package's specific bundler configuration, which lists the bundlers to be made available.
    -   For each bundler specified in the configuration (e.g., "ts", "scss", "page", "txt"):
        -   It attempts to `require.resolve` and load the corresponding Node.js package that implements the bundler's
            processing logic.
        -   If successful, it stores the loaded bundler, keyed by its designated name.
    -   Each entry in this collection holds:
        -   `meta`: The core export from the bundler's package. This is critically important as it usually contains or
            is the constructor class (e.g., a class to handle TypeScript compilation, or another for SASS processing).
            The Module Resolver (`workspace/package/modules/resolvers/resolver.js`) uses this class to create `Module`
            instances.
        -   `settings`: An instance of `BundleSettings` (from `./settings.js`), encapsulating the specific, potentially
            dynamic, configuration for this Registered Bundler as it applies to the current package.

-   **`settings.js` (BundleSettings):**
    -   Defines the `BundleSettings` class, also a `DynamicProcessor`.
    -   This class is a wrapper for the configuration settings of an individual Registered Bundler.
    -   Its dynamic nature ensures that if a bundler's settings are updated, these changes can be propagated, allowing
        dependent components (like `Module` instances that were initialized with these settings) to be aware of or react
        to these modifications.

## Role in Module Instantiation

The collection of Registered Bundlers curated by this system is indispensable for the **Module Instantiation** phase
carried out by the Module Resolvers (detailed in `workspace/package/modules/readme.md`).

To reiterate the interaction:

1.  A Module Resolver encounters a "bundler entry" (e.g., "ts") in a `module.json` file. This entry represents a
    conceptual module that needs to be processed by a "ts bundler processor".
2.  The Resolver queries the `Bundlers` collection (i.e., `pkg.bundlers`, managed by `this` directory) using the name
    "ts".
3.  From the `Bundlers` collection, it retrieves the corresponding Registered Bundler, which provides:
    -   The `meta` object/function (containing the constructor for a `Module` capable of processing TypeScript).
    -   The `settings` object (the package-level default settings for the "ts bundler processor").
4.  These `meta` and `settings` are then used by the Resolver, along with the specific `specs` from the `module.json`
    entry, to create and configure a new `Module` instance. This instance is, effectively, the "ts bundler processor"
    for that specific source file.

## Dynamic Capabilities

Leveraging `DynamicProcessor` for both the overall `Bundlers` collection and individual `BundleSettings` allows the
system to be responsive. Changes in the package's bundler configurations or updates to specific bundler settings can be
dynamically processed and propagated, ensuring that the build system can adapt to an evolving configuration landscape.

In essence, the `workspace/package/bundlers/` directory serves as the central registry and configuration hub for the
various processing engines (Registered Bundlers). It ensures that the `modules` system has access to the correct tools
and configurations needed to transform diverse source files into well-defined, packaged modules according to their
`module.json` specifications.
