# Running Tests in BeyondJS Packages

This guide explains how to prepare and run tests for packages developed with **BeyondJS**, using the DevServer and
**Jest**.

---

## 1) Minimum workspace structure

```
/ (workspace root)
├─ src/                    # the package you are developing (if the repo has only one package)
│  └─ package.json         # package.json of the package
├─ beyond.json             # workspace definition
├─ package.json            # test dependencies (root)
└─ tests/                  # folder with test cases
```

### beyond.json (workspace)

If the workspace has **only one package**, the `packages` array must point to the package’s `package.json`:

```json
{
	"packages": ["src/package.json"]
}
```

In monorepos, list all `package.json` files for each package.

---

## 2) Test dependencies (root `package.json`)

In the **root of the workspace**, add the dependencies needed to run tests:

```json
{
	"devDependencies": {
		"@beyond-js/bee": "~0.0.6",
		"@types/jest": "^30.0.0",
		"jest": "^30.0.5",
		"ts-jest": "^29.4.0"
	},
	"scripts": {
		"test": "jest",
		"test:watch": "jest --watch"
	}
}
```

`@beyond-js/bee` loads your package’s modules directly from the **BeyondJS DevServer** during development.

---

## 3) Development dependency in the package

In the `package.json` of the **package** itself (inside `src/` or any folder listed in `beyond.json`), add:

```json
{
	"devDependencies": {
		"@beyond-js/local": "~0.1.3"
	}
}
```

This allows working in any environment with **HMR** support.

---

## 4) Test folder

Create a folder for your test cases (for example `tests/`) in the root of the workspace.

---

## 5) Initializing BEE

For tests to import workspace modules, you must initialize **BEE** pointing to the DevServer port.

Example (`tests/bootstrap.js`):

```js
const BEE = require('@beyond-js/bee');

const DEVSERVER_URL = process.env.DEVSERVER_URL ?? 'http://localhost:1110';

// Initialize BEE and enable optional inspector
BEE(DEVSERVER_URL, { inspect: 4000 });

// Optional helper to import modules from the current package
const local = (subpath = '') => `@company/hello${subpath ? `/${subpath}` : ''}`;

module.exports = { local };
```

---

## 6) Jest test example

```js
// tests/package-resolution.spec.js
let PackageResolution, PackageResolutionType;

beforeAll(async () => {
	const resolutionModule = await bimport('@beyond-js/packages/dependencies/resolution');
	const typesModule = await bimport('@beyond-js/packages/repositories/types');

	PackageResolution = resolutionModule.PackageResolution;
	PackageResolutionType = typesModule.PackageResolutionType;
});

describe('PackageResolution', () => {
	const cases = [
		{
			name: 'lodash',
			version: '^4.17.0',
			expected: {
				resolution: 'Semver',
				semver: '^4.17.0',
				repository: 'default'
			}
		},
		{
			name: 'my-lib',
			version: 'https://cdn.example.com/my-lib-1.0.0.tgz',
			expected: { resolution: 'Tarball' }
		},
		{
			name: 'core',
			version: 'git+https://github.com/user/core.git#dev',
			expected: {
				resolution: 'Git',
				repository: 'github',
				git: {
					host: 'github.com',
					owner: 'user',
					repo: 'core',
					ref: 'dev'
				}
			}
		}
	];

	for (const { name, version, expected } of cases) {
		test(`${name}@${version}`, () => {
			const result = new PackageResolution(name, version);

			expect(result.resolution).toBe(PackageResolutionType[expected.resolution]);
			if (expected.semver) expect(result.semver).toBe(expected.semver);
			if (expected.repository) expect(result.repository).toBe(expected.repository);
			if (expected.git) expect(result.git).toEqual(expected.git);
		});
	}
});
```

---

## 7) Running the tests

**Step 1 — Start the DevServer**

Before running any tests, you must start BeyondJS in the **root of the workspace** (where `beyond.json` is located):

```bash
cd /path/to/workspace
beyond
```

This will start the DevServer, usually at `http://localhost:1110`.

---

**Step 2 — Run the tests**

With the DevServer running:

```bash
# Using Jest
npm test

# Manual script (without Jest)
node tests/manual.js
```

If the DevServer is not running, `bimport` will not be able to resolve workspace modules and the tests will fail.

---

## 8) Tips

-   You can change the DevServer port/URL with the `DEVSERVER_URL` environment variable.
-   BEE initialization must run **before** any `bimport` call.
-   In monorepos, ensure all package `package.json` files are listed in `beyond.json`.
