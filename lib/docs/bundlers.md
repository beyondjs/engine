# Creating a Custom Bundler Processor for BeyondJS (TypeScript Guide)

BeyondJS's architecture allows developers to extend its capabilities by creating custom Bundler Processors using
TypeScript. This enables support for new file types, custom compilation steps, or specialized transformations,
integrating them seamlessly into BeyondJS's modular packaging and build system.

This guide outlines the steps and requirements for developing your own Bundler Processor with TypeScript.

## Understanding the Role of a Bundler Processor

In BeyondJS, projects are composed of modules. These modules are defined in `module.json` files, where each "bundler
entry" (e.g., "ts", "scss", "my-custom-type") specifies how a particular set of source files should be processed.

A **Bundler Processor** is the actual engine that takes a "bundler entry" and its associated source file(s) and
transforms them into an independently packaged, usable module (like a JavaScript file, a CSS file, or any other
processed resource).

When you create a custom Bundler Processor, you are creating the TypeScript class and logic that BeyondJS will invoke
whenever it encounters a `module.json` entry that specifies your bundler type.

## Steps to Create a Bundler Processor

Creating a Bundler Processor involves two main parts:

1.  Developing the processor itself as a Node.js package, written in TypeScript.
2.  Configuring a BeyondJS project to recognize and use your new processor.

### 1. Develop the Bundler Processor Package (TypeScript)

Your Bundler Processor must be a Node.js package that BeyondJS can `require`. It should be written in TypeScript and
compiled to JavaScript for consumption.

#### a. Package Entry Point and `meta` Export

The core requirement is that your package's main module (defined by `main` in its `package.json`, pointing to the
compiled JavaScript entry file) must export an object, referred to internally by BeyondJS as `meta`. This `meta` object
is crucial because it provides BeyondJS with the constructor for your `Module` class.

The `meta` object must have a property named `Module` which is the constructor class for your custom module logic.

```typescript
// Example: my-custom-processor/src/index.ts
import { MyCustomModuleProcessor } from './module';

// This is what BeyondJS will load via require()
export const meta = {
	Module: MyCustomModuleProcessor
	// You can add other properties to meta if needed.
};
```

The internal loading mechanism in `workspace/package/bundlers/index.js` checks `typeof meta === 'function'` (treating
`meta` itself as the constructor) or `typeof meta.Module === 'function'`. Providing
`export const meta = { Module: YourClass };` is the most common and robust approach.

#### b. Implementing Your `Module` Class (e.g., `MyCustomModuleProcessor.ts`)

This class is the heart of your Bundler Processor. It will be instantiated by BeyondJS's Module Resolver.

**Defining Interfaces for Constructor Parameters:**

It's highly recommended to define interfaces for the objects passed to your constructor to leverage TypeScript's type
safety. While BeyondJS might not export these interfaces explicitly for external bundler development, you can define
representative interfaces in your project.

```typescript
// In your my-custom-processor/src/interfaces.ts (or a similar file)

// Represents the distribution target (platform, environment, etc.)
// This is a simplified example; the actual structure might be more complex.
export interface DistributionSpecs {
	key: string;
	platform: 'web' | 'node' | 'ios' | 'android' | string; // Example platforms
	environment: 'development' | 'production';
	// ... other distribution-specific properties (e.g., minify options, bundle mode)
}

// Conceptual interface for the BeyondJS Package object
export interface BeyondPackage {
	readonly id: string;
	readonly path: string; // Absolute path to the root of the BeyondJS package
	readonly modules: BeyondPackageModules;
	// ... other relevant package properties and methods
}

// Conceptual interface for Package Modules, including Seekers access
export interface BeyondPackageModules {
	readonly seekers: BeyondSeekers;
	// ... other module-related properties
}

// Conceptual interface for Seekers
export interface BeyondSeekers {
	create(specifier: string, distribution: DistributionSpecs): BeyondSeekerWrapper;
	// ... other seeker methods
}

// Conceptual interface for a Seeker Wrapper (often a DynamicProcessor)
export interface BeyondSeekerWrapper {
	readonly ready: Promise<void>;
	readonly valid: boolean;
	readonly errors?: string[];
	readonly bundle?: any; // Represents a resolved internal module/bundle
	readonly external?: any; // Represents a resolved external package
	// ... other properties based on seeker's findings
}

// Path context provided to the module constructor
export interface ModulePathContext {
	dirname: string; // Absolute directory of module.json
	relative: {
		dirname: string; // Relative path of module.json's directory from package root
	};
}

// Global settings for this bundler type, passed from the consuming package's configuration.
// This is an instance of BundleSettings from BeyondJS core, which is a DynamicProcessor.
export interface BundlerSettings {
	readonly value: Record<string, any>; // The actual settings object
	readonly distribution?: DistributionSpecs; // Distribution context might be part of settings
	// ... other properties or methods if it's a DynamicProcessor
}

// Specific configuration from module.json for this instance of the module.
// This is an instance of BundlerSpecs from BeyondJS core.
export interface ModuleSpecs {
	readonly file?: string; // Typically the main source file for the bundler to process
	readonly [key: string]: any; // Allows for other custom options from module.json
}

// Structure of the single object argument passed to your Module class constructor
export interface ModuleConstructorParameters {
	pkg: BeyondPackage;
	path: ModulePathContext;
	settings: BundlerSettings;
	specs: ModuleSpecs;
}
```

**Your `Module` Class Implementation Example:**

```typescript
// In your my-custom-processor/src/module.ts
import * as fs from 'fs/promises';
import * as path from 'path';
import type {
	// Import the interfaces you defined
	ModuleConstructorParameters,
	BeyondPackage,
	ModulePathContext,
	BundlerSettings,
	ModuleSpecs,
	DistributionSpecs
} from './interfaces'; // Adjust path as needed

// Optional: If your bundler needs to be reactive to changes,
// you might extend DynamicProcessor from '@beyond-js/dynamic-processor'.
// For this example, we'll create a standard class.

export class MyCustomModuleProcessor {
	protected readonly _pkg: BeyondPackage;
	protected readonly _path: ModulePathContext;
	protected readonly _settings: BundlerSettings; // Global settings for "my-custom-type" bundler
	protected readonly _specs: ModuleSpecs; // Settings from module.json for this specific instance

	// Example properties for output
	private _processedCode: string | null = null;
	private _sourcemap: object | null = null; // Or string, depending on sourcemap library
	public errors: string[] = [];
	public warnings: string[] = [];

	private _processingPromise?: Promise<void>; // To ensure process() is called only once effectively

	constructor({ pkg, path: modulePath, settings, specs }: ModuleConstructorParameters) {
		this._pkg = pkg;
		this._path = modulePath;
		this._settings = settings;
		this._specs = specs;
	}

	// Main processing logic, often asynchronous.
	// If this class were a DynamicProcessor, this logic would be in `_process()`.
	private async performProcessing(): Promise<void> {
		if (!this._specs.file) {
			this.errors.push('Source file ("file" property) not specified in module.json specs.');
			return;
		}

		try {
			const filePath = path.join(this._path.dirname, this._specs.file);
			const sourceContent: string = await fs.readFile(filePath, 'utf8');

			// === 1. Perform your custom transformation/compilation ===
			// Example:
			// const compilerOptions = { ...this._settings.value, ...this._specs };
			// delete compilerOptions.file; // Avoid passing 'file' as a compiler option if not needed
			// const { code, map, errors: compilerErrors } = myCompiler(sourceContent, compilerOptions);
			// this._processedCode = code;
			// this._sourcemap = map;
			// if (compilerErrors) this.errors.push(...compilerErrors);

			// For this example, a simple transformation:
			this._processedCode = `/* Processed by MyCustomModuleProcessor: ${this._specs.file} */\n/* Package Path: ${
				this._pkg.path
			} */\n${sourceContent.toUpperCase()}`;

			// === 2. Handle Dependencies (if your bundler processes code with imports) ===
			// const foundImports = parseMyCodeForImports(sourceContent); // Your logic to find imports
			// const distribution: DistributionSpecs | undefined = this._settings.distribution;

			// if (!distribution) {
			//     this.warnings.push('Distribution context not available; dependency resolution might be incomplete.');
			// } else {
			//     for (const importSpecifier of foundImports) {
			//         const seeker: BeyondSeekerWrapper = this._pkg.modules.seekers.create(importSpecifier, distribution);
			//         await seeker.ready; // Wait for the seeker to resolve the dependency

			//         if (seeker.errors?.length) {
			//             this.errors.push(`Dependency error for "${importSpecifier}": ${seeker.errors.join(', ')}`);
			//         } else if (!seeker.valid || (!seeker.bundle && !seeker.external)) {
			//             this.errors.push(`Dependency "${importSpecifier}" could not be located.`);
			//         } else {
			//             // Dependency found. 'seeker.bundle' for internal, 'seeker.external' for npm.
			//             // You might need to:
			//             // - Rewrite the importSpecifier in your output code to a resolvable path.
			//             // - Or, if your bundler creates a single file bundle, fetch and include the dependency code.
			//             // console.log(`Dependency "${importSpecifier}" resolved to:`, seeker.bundle || seeker.external);
			//         }
			//     }
			// }
		} catch (e: any) {
			this.errors.push(e.message);
		}
	}

	// Ensures processing is done only once and its promise is awaited
	private async ensureProcessed(): Promise<void> {
		if (!this._processingPromise) {
			this._processingPromise = this.performProcessing();
		}
		await this._processingPromise;
	}

	// Public API for BeyondJS to get the processed content
	public async code(): Promise<string | null> {
		await this.ensureProcessed();
		return this._processedCode;
	}

	public async map(): Promise<object | null> {
		// Or string if your sourcemap is a string
		await this.ensureProcessed();
		return this._sourcemap;
	}

	// .errors and .warnings are public properties, populated by your processing logic
}
```

#### c. Compiling Your TypeScript Package

You'll need a `tsconfig.json` for your Bundler Processor package to compile it to JavaScript (typically CommonJS for
Node.js consumption by BeyondJS).

Example `tsconfig.json`:

```json
{
	"compilerOptions": {
		"target": "es2020",
		"module": "commonjs",
		"outDir": "./dist",
		"rootDir": "./src",
		"strict": true,
		"esModuleInterop": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true,
		"declaration": true, // Generate .d.ts files
		"declarationMap": true // Optional: For better .d.ts navigation
	},
	"include": ["src/**/*"]
}
```

And in your `package.json`:

```json
{
	"name": "my-custom-bundler-processor",
	"version": "1.0.0",
	"description": "A custom BeyondJS bundler processor.",
	"main": "dist/index.js", // Points to compiled JS entry (where 'meta' is exported)
	"types": "dist/index.d.ts", // Points to main declaration file
	"scripts": {
		"build": "tsc",
		"prepublishOnly": "npm run build" // Ensure it's built before publishing
	},
	"keywords": ["beyondjs", "beyondjs-bundler"],
	"author": "Your Name",
	"license": "MIT",
	"devDependencies": {
		"typescript": "^5.0.0", // Or your preferred TypeScript version
		"@types/node": "^18.0.0" // Or your preferred Node.js types version
	},
	"dependencies": {
		// If you use @beyond-js/dynamic-processor or other BeyondJS types/libs as actual dependencies:
		// "@beyond-js/dynamic-processor": "x.y.z"
		// Note: For types like BeyondPackage, you might rely on peerDependencies or just define them structurally if not provided.
	}
}
```

### 2. Register the New Bundler in a BeyondJS Project

For a BeyondJS project to use your `my-custom-bundler-processor`:

-   **Install your processor package** (after publishing it to NPM or linking it locally using `npm link` or
    `yarn link`):
    ```bash
    npm install my-custom-bundler-processor
    # or
    yarn add my-custom-bundler-processor
    ```
-   **Configure the project's bundlers**: This configuration is read by BeyondJS (often influenced by `package.json` or
    a central `beyond.json` project file). You need to inform BeyondJS about your new bundler type and which Node.js
    package implements it.

    The configuration that `workspace/package/bundlers/index.js` consumes would look something like this for the project
    using your bundler:

    ```json
    // Part of a BeyondJS project's configuration (e.g., in beyond.json or derived from package.json's "beyond.bundlers" field)
    {
    	"packages": {
    		"name-of-project-using-custom-bundler": {
    			// Or at the root level of beyond.json if global to workspace
    			"bundlers": {
    				// ... other standard bundlers like "ts", "scss"
    				"my-custom-type": {
    					// This is the key you'll use in module.json files
    					"specifier": "my-custom-bundler-processor", // Your NPM package name
    					// Optional: Default settings for "my-custom-type" that will be passed to your Module's constructor as 'settings.value'
    					"defaultCompilerOptionForPackage": "somePackageSpecificValue"
    				}
    			}
    		}
    	}
    }
    ```

    If your bundler requires no default package-level settings and its NPM package name is the same as the key, the
    configuration might be simpler: `"my-custom-type": "my-custom-bundler-processor"` (The internal loader checks for
    `settings.specifier` first, then the key if `specifier` isn't in a settings object.)

### 3. Use Your Bundler in `module.json` Files

Once your Bundler Processor is developed, compiled, and registered in a BeyondJS project, you can use its designated key
(e.g., `"my-custom-type"`) in `module.json` files within that project:

```json
// In a module.json file within the configured BeyondJS project
{
	"my-custom-type": {
		"file": "./src/data.customext", // Path to the source file for your bundler
		"specificOptionForThisModuleInstance": true, // This will be in 'specs'
		"anotherOption": "value"
	},
	// Other bundler entries, like "ts" or "page"
	"ts": {
		"file": "./component.ts"
	}
}
```

When BeyondJS processes this `module.json`, its Module Resolver will:

1.  See the `"my-custom-type"` entry.
2.  Look up `"my-custom-type"` in the project's Registered Bundlers.
3.  Find your `my-custom-bundler-processor`'s exported `meta` object.
4.  Instantiate your `MyCustomModuleProcessor` class (from `meta.Module`), passing it:
    -   `pkg`: The current BeyondJS project object.
    -   `path`: Path context for this `module.json` entry.
    -   `settings`: An object whose `.value` property would be
        `{ "defaultCompilerOptionForPackage": "somePackageSpecificValue", ... }` (from project's bundler config).
    -   `specs`: An object like
        `{ "file": "./src/data.customext", "specificOptionForThisModuleInstance": true, "anotherOption": "value", ... }`
        (from this `module.json` entry).

Your `MyCustomModuleProcessor` instance will then execute its processing logic, and its output (via `.code()`, `.map()`,
etc.) will be integrated into BeyondJS's build system.

## Best Practices

-   **Clear Interface**: Ensure your `Module` class reliably exposes methods like `code()` and `map()`, and properties
    like `errors` and `warnings`.
-   **Robust Error Handling**: Provide descriptive error messages in the `.errors` array to aid developers using your
    bundler.
-   **Sourcemaps**: If your processor transforms code in a way that changes line numbers or structure, generating
    sourcemaps is crucial for debugging.
-   **Dependency Management**: If your bundler processes code with import statements, use
    `this._pkg.modules.seekers.create(specifier, distribution)` to correctly resolve these. Ensure your processor has
    access to the `distribution` context if it's needed for resolving dependencies.
-   **Asynchronous Operations**: All I/O and potentially long-running tasks should be asynchronous (return Promises).
-   **Dynamic Processing (Advanced)**: For scenarios where your bundler needs to react to changes in source files, its
    own configuration, or its resolved dependencies without a full rebuild, consider making your `Module` class extend
    `@beyond-js/dynamic-processor`. This requires implementing methods like `_process` and managing children for
    reactive updates.
-   **Type Definitions**: Publish comprehensive type definitions (`.d.ts` files) with your Bundler Processor package.
    This significantly improves the developer experience for those using or maintaining the bundler.
-   **Testing**: Thoroughly test your Bundler Processor, including its dependency resolution logic and its output across
    various configurations and edge cases.
