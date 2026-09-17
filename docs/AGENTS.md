# Documentation instructions

These instructions apply to this directory and its descendants, together with the repository's root AGENTS.md.

- Write autonomous product and developer documentation. Explain purpose, responsibilities, public interfaces, setup where supported, execution flow, limitations and extension points directly. Keep source-review reports, session history, reviewer actions and temporary Git state out of maintained guides.
- Use English and the repository's established terminology. Distinguish implemented behavior, known limitations and proposed changes without narrating the investigation. Do not present a plan or source inspection as working runtime behavior.
- Start with the reader's task and the component's role. Use consistent descriptive headings and filenames; link guides from the repository README or a local documentation index. Scale detail to the component rather than creating empty template sections.
- Keep every relative link inside this repository. A standalone clone must contain the explanations needed to understand and work on this component. Other repositories may be optional named references or verified external source links; never require a sibling checkout to read a guide, and never invent published links for local-only documents.
- Preserve public package/module identities and distinguish public modules from internal source files. Explain dependencies as contracts, not assumed directory layouts. Parameterize cross-repository execution examples with explicitly configured locations.
- Describe APIs and behavior with examples tied to source. Keep command prerequisites and expected results clear. Do not prescribe commands that are known not to work without stating the missing integration.
- Preserve useful legacy material and mark obsolete APIs or examples precisely. Leave generated/vendor material unchanged. Do not rewrite runtime code, install dependencies or run unrelated services for documentation cleanup.
- Validate local links, anchors and formatting for the actual edits. Keep external references accurate and treat tests as evidence only when actually executed. Required source-review provenance belongs in a separate review record, not repeated throughout architecture guides.
