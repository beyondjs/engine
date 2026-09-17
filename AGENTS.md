# engine agent instructions

Canonical instructions for this repository and its descendants. Tool-specific files must only reference AGENTS.md. This is an independent Git repository; the current coordinated branch is `feature/next`.

Older Beyond engine and bootstrap reference. Preserve its current authoring/runtime contracts.

- Use English for first-party docs, instructions, comments, docstrings and new explanatory text. Preserve intentional locale catalogs, public names/specifiers/paths, protocol keys and functional test values unless a compatibility change is explicitly authorized. Do not rewrite vendor, generated, lockfile or third-party content for language cleanup.
- Preserve current uncommitted work and repository history. Do not commit, push, reset, publish or deploy without explicit task authorization.
- Keep public Beyond module imports distinct from internal relative source imports. Do not silently replace the configured bootstrap, runtime or framework.
- Read the relevant maintained references before architectural changes; label source findings, runtime evidence and proposals accurately. Use targeted validation for behavior changes; documentation/comment edits do not require unrelated builds or services.
- Keep instructions concise here and link maintained documentation. Before editing nested areas, read any applicable nested AGENTS.md. Do not apply sibling repository instructions globally.

Read [README.md](README.md) and the [inspector and development-service guide](docs/inspector.md) for this repository's service boundaries. Engine compiles and serves Beyond-authored modules. When it bootstraps a newer Packages implementation, Packages remains responsible for compiling and serving its target application. No sibling checkout or suite document is required by these instructions.

Documentation follows [the local documentation standards](docs/AGENTS.md).
