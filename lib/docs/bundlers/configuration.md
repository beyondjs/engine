# Configuring Bundlers in Your Package

BeyondJS is a modular development framework that relies on **bundlers** for its modular packaging strategy. Each bundler
is a specialized engine responsible for processing specific types of source files (like TypeScript, SASS, etc.) and
transforming them into independently packaged modules—such as JavaScript files or CSS stylesheets—that form the output
of your package.

To utilize these bundlers for different "bundler entries" defined in your `module.json` files, you must first configure
them within your package. This tells BeyondJS which bundlers are available and how they should behave by default. This
configuration is managed through your package's `package.json` file.

## Declaring Bundlers in `package.json`

The way to make bundlers available to your BeyondJS package is by declaring them in its `package.json` file, within a
dedicated `beyond.bundlers` property. This object serves as a registry where each key represents a bundler that can be
referenced in `module.json` files.

For each bundler you want to use, you define:

1.  A **short, descriptive key** (e.g., `"ts"`, `"scss"`, `"txt"`). This key is the alias you will use in your
    `module.json` files.
2.  The **NPM package name** that provides the bundler's implementation (referred to as the `specifier`).
3.  Optionally, **default settings** that will apply to this bundler across your package.

### Standard Configuration Structure

Here's how you typically structure the `beyond.bundlers` object in your `package.json`:

```json
// Example: package.json
{
	"name": "my-beyondjs-package",
	"version": "1.0.0",
	// ... other standard package.json fields
	"beyond": {
		"bundlers": {
			// TypeScript bundler
			"ts": {
				"specifier": "@beyond-js/ts-bundler" // NPM package name
			},

			// SASS/SCSS bundler
			"scss": {
				"specifier": "@beyond-js/sass-bundler"
			},

			// A simple text bundler
			"txt": {
				"specifier": "@beyond-js/txt-bundler"
			},

			// Configuration for a custom bundler
			"my-custom": {
				"specifier": "npm-package-for-custom-bundler",
				"options": {
					// Using structured options
					"default": "defaultValueForMyProcessor",
					"another": "value"
				}
			}
		}
	}
}
```
