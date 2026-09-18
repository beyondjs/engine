# Coding standards

These rules govern all first-party source code in this repository. They are binding for new and modified code, for human contributors and coding agents alike. Every Beyond repository adopts the same standard, and this copy is self-contained: no other checkout is needed to apply it.

Conventions that are specific to this repository, such as module manifests, export markers and formatter configuration, apply together with this standard. When a rule here conflicts with an existing public contract, preserve the contract; see [Compatibility comes first](#compatibility-comes-first).

## File length

| Lines in a source file | Meaning |
| --- | --- |
| 300 or fewer | Target. Design new files to stay within it. |
| 301 to 400 | Tolerated. Extract a responsibility before adding more. |
| More than 400 | Not allowed in new or modified code. Split the file as part of the change. |

Lines are physical lines as counted by `wc -l`, including comments and blank lines. The limit covers first-party source files: TypeScript, JavaScript, JSX and TSX, Svelte, Vue and style sources. It does not cover vendor or third-party code, generated output, lockfiles, data catalogs such as icon or locale tables, or Markdown documentation.

A long file is a symptom: it usually holds more than one responsibility. Shorten it by extracting a collaborating class into its own internal file, never by compressing code, deleting useful comments or joining statements. An extracted file must own a responsibility that can be named; do not cut a file mechanically into numbered parts or move the overflow into a generic `helpers` or `utils` file. A new internal file does not become a public module: keep it behind the existing public module and import it relatively.

## Classes and objects first

Beyond code is object-oriented. Model a responsibility as a class that owns its state and exposes it through members, and build larger behavior by composing collaborating objects.

- Give each class one responsibility. As a rule, a file holds one main class and is named after that responsibility.
- Keep state in ECMAScript `#private` fields and expose it through getters. Do not expose mutable fields directly.
- Compose. An object creates and owns its collaborators and exposes them as simply named properties, as in `package.bundlers`, `package.modules` and `project.dependencies`. Whoever creates a collaborator is responsible for destroying it.
- Prefer a class with methods over a group of free functions that pass the same data to one another. A standalone function remains appropriate for a stateless, pure operation such as an equality comparison or a checksum.
- Where a base class defines a lifecycle, follow its contract. Hook names that a base class or framework requires, such as the `DynamicProcessor` members `dp`, `setup`, `_prepared`, `_process` and `destroy`, are contracts to implement as given.

## Names: let structure carry the context

Compound names are allowed in class definitions, for example `ModuleSpec` or `PackageController`. In usage code, which means methods, properties, variables and parameters, avoid compound names. A compound member name is a sign that a responsibility is missing an object of its own.

Before writing a compound method or property, ask which noun inside it is really an object:

| Instead of | Write | Because |
| --- | --- | --- |
| `registerClient(...)` | `client.register(...)` | `Client` is a class and `register` is its method |
| `installProjectDependencies()` | `project.dependencies.install()` | `dependencies` is a collaborator of `project` |
| `printedDependencyTree` | `dependencies.print.tree` | each level is an object with a simple member |

The left column holds illustrative counterexamples. Turning the compound into a class with a simple member gives the behavior one home, which is what makes it easier to find, extend and test.

This is a design question, not an abbreviation exercise. Do not shorten a compound name into an unclear one, and do not split identifiers mechanically. The rule does not apply to names that are not yours to choose: inherited or external APIs such as `setMaxListeners` or `addEventListener`, framework lifecycle names and hooks, protocol and configuration keys such as `devDependencies`, and identifiers that are already part of a published contract.

Directory paths carry context in the same way. Inside `module/spec` or `graph/node`, short file and class names such as `spec.ts`, `Node` and `Version` are clear because the surrounding structure qualifies them.

## Comments and documentation

- Write comments, doc comments and documentation in English.
- Give every public class, method and type a doc comment that states its responsibility and contract. State the purpose of a class at its definition.
- Inside an implementation, comment the why: constraints, ordering requirements, compatibility reasons and decisions that the code cannot show. Do not restate what the code already says, and do not record session history in comments.
- When a change alters behavior that this repository's guides describe, update the guide in the same change.

## Compatibility comes first

- Public package names, module specifiers, exported identifiers, paths and protocol or configuration keys are contracts. Do not rename them to satisfy a naming rule unless a compatibility change is explicitly scoped.
- The standard governs new and modified code. It does not authorize a broad rewrite: do not restructure untouched files only to meet it. When you substantially modify a file that is over the limit or organized around compound free functions, bring that file into compliance as part of the change, or record why doing so is out of scope.
- Code under paths labeled `trash`, `_older`, `_to-refactor` or similar is not a template for new work and is not brought into compliance. It is either migrated deliberately or removed.
- Vendor, generated and third-party files stay untouched.

## Checking compliance

Before finishing a change, check every source file you created or modified.

1. Count its lines. This command, run from the repository root, lists the source files above the target:

   ```sh
   find . -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.mjs' -o -name '*.cjs' -o -name '*.svelte' -o -name '*.vue' -o -name '*.scss' \) \
     -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/build/*' -not -path '*/builds/*' -not -path '*/.beyond/*' \
     -exec wc -l {} + | awk '$2 != "total" && $1 > 300' | sort -rn
   ```

2. Review each new method, property, variable and parameter name for compounds, and each new free function for the class it belongs to.
3. Confirm that new public API carries a doc comment.

A review rejects a change that adds a file of more than 400 lines, or that adds lines to a file already above 400, unless the file is listed as an accepted exception below.

## Status in this repository

When this standard was adopted, on 2026-09-18, no first-party source file in this repository exceeded the 300-line target. Keep it that way. There are no accepted exceptions.

This standard is shared by all Beyond repositories. Propose a change to the sections above for all of them together instead of diverging locally; only this status section is specific to this repository.
