# Testing

This repository has no assertion suite and no test runner. `tests/` holds legacy manual scenario packages that a person serves with this Engine and inspects in the browser, the console or the inspector, and `lib/inspect/tests/files/` holds ad hoc builder scripts and sample projects of the former inspector; both are legacy reference material kept unmodified, not validation. Engine's current role as the bootstrap compiler of Packages is exercised from other repositories: the Packages repository's bootstrap package, the command line's acceptance in the `cli` repository and the Beyond Suite's utilities validation, which serves each utility through the bootstrap's Engine (optional external references). Those runs establish that bootstrap path only, not the scenarios described here.

## Levels and commands

| Level | Location | Command | Prerequisites | What a run shows |
| --- | --- | --- | --- | --- |
| Contract/unit, integration and acceptance | None in this repository | None | None | Nothing is asserted here |
| Manual scenario: template overwrites | `tests/overwrites/` | `npm run test-overwrites`, which runs `node ../../index.js --inspector 4000` inside `tests/overwrites/` | The dependencies of this repository installed | The `welcome` module served with its styles, for a person to inspect how overwrites apply |
| Manual scenarios: the others | `tests/<scenario>/` | Serve the scenario's `beyond.json` with this Engine from its directory, as `test-overwrites` does | The dependencies each scenario's `package.json` declares, and its ports free | What the scenario's purpose names, observed by a person |
| Builder scripts of the former inspector | `lib/inspect/tests/files/*.js`, `lib/inspect/tests/files/*/*.js` | None that works as checked in | Several scripts require modules at paths that no longer exist (`lib/dashboard/...`, `lib/templates`) | Nothing: they are reference material only |

## Fixtures

The scenario packages are the fixtures of the manual runs. Each is served in place.

| Scenario | Purpose | Entry modules |
| --- | --- | --- |
| `tests/bundle-loader/` | Load `@beyond-js/playground/test`, whose `Test.run()` throws on purpose, to read the stack against the source maps; its README gives the steps | `package/modules/test/index.ts`, loaded by `index.js` |
| `tests/config-internal-dependency/` | A package (`main-package`) that imports another package of the same configuration (`dependency-package`) through `libraries.imports` | `dependency-package/modules/test/index.ts` |
| `tests/declarations/property-error/`, `tests/declarations/property-error-consumer/` | Declaration generation for a class whose property type comes from an internal class with an index signature, and a consumer package that imports it | `property-error/modules/to-export/index.ts`, `property-error-consumer/modules/case/importer.ts` |
| `tests/overwrites/` | Template overwrites applied to a module's SCSS | `modules/welcome/styles.scss` |
| `tests/templates-updates/` | Application and global template styles, and their updates, reaching a page module | `modules/home/ts/controller.ts`, `modules/home/scss/styles.scss` |
| `tests/types-errors/` | Deliberate type, style and misplaced-tsconfig errors, listed in `tests/types-errors/errors.md` | `modules/home`, `modules/layouts/main`, `modules/layouts/error-tsconfig`, `modules/styles` |

## Exceptions and limits

- Everything above is legacy manual material kept unmodified as reference. None of it has a runner or assertions, and a manual run is an observation, not evidence of a contract.
- The layout predates the suite convention: `tests/` holds served scenario packages rather than `*.test.*` files, and there is no `fixtures/` or `support/` directory. It is kept because it is legacy reference material.
- `tests/beyond.json` points to `tests/packages.json`, which lists `/property-error-declarations/package.json`; no such directory exists (the declaration scenarios are under `tests/declarations/`, with their own `beyond.json`). The root `packages.json` lists `/types-errors/package.json`, which does not exist at the root either. Both references are stale and were left unchanged.
- `lib/inspect/tests/files/` sits inside `lib/`, which `package.json` lists in `files`, so a published package includes it.
- `tests/bundle-loader/` is byte-identical to `test/bundle-loader/` of the `bee` repository (an optional external reference), verified by a recursive comparison on 2026-09-22. Each independent repository keeps its copy; neither is removed.
- A manual run serves a scenario in place, so whatever the server writes lands next to the checked-in sources. Copy the scenario to a temporary directory first when the checkout must stay unchanged.

## Test organization and source fixtures

These rules are shared by every Beyond repository.

- Contract/unit and integration tests live in `test/` or `tests/`; complete journeys against an installed, composed or exported product live in `acceptance/`, with a README of their own. Harness infrastructure (servers, registries, process lifecycle, copying and substitution) lives in a `support/` directory of the consuming area.
- Applications, packages, modules, documents and assets a test exercises are checked-in files with their real extensions and directory structure under the consuming area's `fixtures/`. Each fixture group has a README naming its purpose, entry modules, the tests that use it, their command, the expected behavior and any intentionally invalid part. A reader inspects the example without running or decoding a generator.
- A harness copies the fixtures it runs or edits to a unique temporary directory, substitutes only explicit values such as versions, ports or origins, and never writes the checked-in files, even when a run fails. Credentials, machine paths and build output are never fixture source.
- Small input values, expected values, protocol payloads and short edits stay inline. Source is generated only when generation is the behavior under test (size or memory stress, combinations, deliberately malformed input); the guide states why, the parameters that reproduce it and how to inspect what was generated.
- Fixtures stay out of the repository's production compilation, discovery and packaging.
- Migrating a test preserves its scenario identities, its positive, negative and recovery cases and its real execution path; an existing failure stays reported as a failure.
