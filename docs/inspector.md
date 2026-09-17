# Inspector and development-service architecture

The Engine inspector connects development clients and the Workspace frontend to compiler metadata, update notifications and administration commands. Its HTTP/Socket.IO interface is separate from the distribution server that delivers application artifacts.

Engine compiles Beyond-authored modules. Packages is a newer packaging implementation also authored in Beyond: Engine can compile its implementation while modern BEE Node loads it. In that configuration, Packages must compile and serve the target application itself, including the development events consumed by its runtime. This guide describes the existing inspector and identifies responsibilities reusable in that newer service without making the entire Workspace administration API a prerequisite for a widget application.

Local consumes inspector events and delegates runtime updates to Kernel; Backend supplies its socket and launcher RPC. The inspector owns neither runtime internal-module state nor browser widget instances. Source references to other repositories below are informational and identify each repository's own path; they are not filesystem prerequisites.

## Ownership and startup

The [main Engine object](../lib/index.js) initializes globals, starts the watcher process, constructs the engine, conditionally constructs the inspector when `inspect` is truthy, and constructs launchers. The [CLI run command](../bin/commands/run.js) declares the inspector port option and checks availability before construction. Exact CLI runtime defaults depend on its argument parsing; a declared default is not a demonstrated running listener.

[Inspector](../lib/inspect/index.js) checks the port again, creates an HTTP server, calls `listen(port)`, constructs Service and Actions, attaches Socket.IO, then forwards events through Service.setup. It prints a link to the remote Workspace frontend. It does not serve that frontend itself. Its constructor starts asynchronous work and logs rejection; it exposes no ready Promise, bind-error contract or stop method. The port check and subsequent bind are separate operations, and the code does not await the server's listening event before reporting the link.

Three responsibilities must not be conflated:

| Responsibility | Legacy owner | What it supplies |
| --- | --- | --- |
| Source watching and compilation | Watcher subprocess and Engine compilation objects | File changes, invalidation, code/declaration/style preparation. |
| Inspector control/events | Inspector HTTP/Socket.IO service | Development notifications, metadata queries, workspace mutation/build/launcher commands and uploads. |
| Application artifacts | Distribution [HTTP listener](../lib/engine/process/http/server/listener/index.js) | HTML, project/config/import information, widget resources, styles, bundles, externals, sources and static files. |

The inspector does not compile a JavaScript patch in its socket handler and does not send its bytes over the HMR event. The client receives identity information, then obtains the artifact through the appropriate delivery path.

## Transport and exposed HTTP surface

The inspector's [HTTP handler](../lib/inspect/server/index.js) explicitly serves `/uploader`; other requests return a Resource 404. It normalizes a `.hmr.js` suffix but contains no bundle-serving branch, so that normalization does not make the inspector port an artifact endpoint. Socket.IO attaches its transport handling to the same server separately.

The [uploader](../lib/inspect/server/uploader/index.js) uses Formidable temporary storage, resolves a destination with Engine IPC from submitted type/ID, creates a `static` directory, normalizes filenames and moves uploads there. It is a filesystem mutation capability for Workspace assets, not necessary for runtime HMR. Returned data includes file metadata and paths. Source-level limitations include continuing after a missing destination response and asynchronous parser callback failures outside the surrounding catch; upload callers need an explicit completion/error contract. Its [headers](../lib/inspect/server/uploader/specs.js) permit wildcard origin. Generic response helpers exist for content/files/errors, but no general inspector static-asset route is wired here.

[Socket server](../lib/inspect/ws/index.js) uses Socket.IO with `serveClient: false` and a 100000-byte maximum HTTP buffer. It owns a map of connections and constructs one [Connection](../lib/inspect/ws/connection.js) per socket. There is no authentication middleware or per-action authorization check visible in this connection/dispatcher chain. Dashboard validation is a separate exposed action, not a transport gate. This local legacy arrangement is not a cloud authorization design; remote deployment needs an explicit endpoint/session and mutation boundary.

## Event contract and HMR trace

[Service.setup](../lib/inspect/service/index.js) installs IPC listeners and emits globally through `io.emit`; it does not filter by socket, project room, selected distribution or subscribed module.

| IPC source and event | Socket event | Payload / purpose |
| --- | --- | --- |
| engine `bundles`, only `type: 'change'` | `bundle/change` | `specifier`, `vspecifier`, `extname`, `distribution`, `language`; identifies changed output. |
| engine `application-styles` | `application-styles` | Forwarded message; producer emits `{type: 'update'}`. |
| engine `global-styles` | `global-styles` | Forwarded message; producer emits `{type: 'update'}`. |
| engine `data-notification` | `client:plm/record/update`, `client:plm/list/update`, `client:plm/record/field/update` | Forwarded metadata notification; other types logged and discarded. |
| main `data-notification` | Corresponding `server:plm/...` events | Same allowed types for main-process data. |
| engine `declarations-save` | `declaration-save:<applicationId>` | Declaration generation progress/result notification. |
| engine `project-process`, only `type: 'process'` | `project-process:<application>` | Application processing notification. |
| main `bee.log` | `bees.log` | Legacy service execution logs. |

The JavaScript update path is:

1. The [watcher service](../lib/watchers/main/index.js) forks its [IPC worker](../lib/watchers/main/fork.js). It provides watcher/listener creation and deletion; watcher clients forward filesystem events into consumers. The inspector is not the filesystem watcher.
2. Engine's dynamic compilation dependencies invalidate prepared outputs. The [packaged-code base](../lib/engine/process/bundler/bundle/packager/code/base/index.js) implements `_notify`, forwarding bundle identity, `.js`/`.css`, distribution key and language through `ipc.notify('bundles', ...)`. Preparation/cache and code generation are separate methods; the event alone is not a successful artifact-consumption acknowledgement.
3. Inspector Service forwards `bundle/change` to connected clients. It adds no monotonic revision, journal, acknowledgement, dependency graph or delivery replay.
4. Local HMR (local repository, `main/hmr/index.ts`) checks the existing Kernel bundle registry, chooses a language package and requests a cache-busted patch through legacy `bimport`. It currently ignores distribution and uses its own attempt counter. Backend supplies the socket; general RPC is not used for these events.
5. The distribution [bundle route](../lib/engine/process/http/server/listener/bundles/index.js) parses identity and the HMR query, waits for bundle/packager/code readiness and returns generated output or a diagnostic response. Source maps and declarations have separate branches. Inspector port and artifact port need not be the same.
6. The [patch emitter](../lib/engine/process/bundler/bundle/packager/code/js/package/process.js) selects the existing runtime package for an HMR output; [initialization emission](../lib/engine/process/bundler/bundle/packager/code/js/package/initialisation.js) emits `__pkg.update(ims)` instead of initial creation. Kernel performs internal creator/export mutation; widget consumers perform their own refresh.

There is a cache-specific exception: packaged-code `__update(hmr)` returns a comment-only sourcemap when HMR is requested from an up-to-date cache-hydrated output without processor children. The normal artifact code route can serve that result successfully. An HTTP success or completed patch import therefore does not prove `Package.update` ran; cache/reconnect acceptance must assert the actual runtime change and consumer notification.

For modular CSS, the same bundle event routes Local to Kernel's style registry and consumer-specific loading/adoption. For application/global CSS, [application](../lib/engine/process/core/applications/styles/application/styles.js) and [global](../lib/engine/process/core/applications/styles/global/styles.js) processors emit separate invalidations and Local updates document links/Widgets integration. Those two producer payloads contain no project or distribution identity, even though the inspector broadcasts to all clients. This makes explicit filtering/context part of the new protocol design.

## RPC envelope, dispatch and lifecycle

The socket receives `rpc-v2`; a request supplies `id`, `module`, `action` and optional `params` array. The [dispatcher](../lib/inspect/ws/execute.js) validates the basic fields, strips an optional leading slash from action and walks the Actions object by action segments. `module` is checked as a string but does not select the action namespace; `action` does. It invokes the resulting function with spread params. Responses use `response-v2-<id>` with `message`, or an `error` object; successful responses also report processing time/source. This differs from HMR broadcast events.

PLM [data/list adapters](../lib/inspect/actions/plm/index.js) batch request IDs and entity IDs/filters, dispatch to Engine/main IPC and return timestamped records. Those timestamps are read-response metadata, not authoritative HMR revisions. The [action cache](../lib/inspect/ws/cache/cache.js) is keyed by socket ID plus request ID, expires entries after 1000000000 milliseconds and removes at most one expired entry per timer tick. It cannot deduplicate across new socket identities or replay HMR events.

Concrete limitations visible in this chain:

- Connection counters start uninitialized; incrementing them does not establish a working concurrency limit. Error execution does not mark the cached request complete, so later duplicate handling can return without a response.
- A missing action attempts `join` on an action already required to be a string, masking the intended error message.
- Connection.disconnect adds the `rpc-v2` listener again rather than removing it.
- Socket wrapper destroy removes only its connection listener; it does not close Socket.IO/HTTP, disconnect clients, release per-socket state or stop the cache timer.
- Service.setup uses anonymous IPC listeners with no teardown. Inspector and Engine top-level objects show no comprehensive shutdown contract here.

These lifecycle and response limitations must be addressed if the corresponding capabilities are retained.

## Public action families and application services

The [Actions owner](../lib/inspect/actions/index.js) composes the following fifteen families. Names in this table are slash-addressable action paths through that object, not public Beyond module specifiers. Presence in the dispatcher object does not imply a successful implementation.

| Family / source | Exposed responsibilities and important details |
| --- | --- |
| [applications](../lib/inspect/actions/applications/index.js) | `list`, `data`, `process`; `static/data,list`; `modules/data,count,list`; `declarations/update,updateAll`; `deployments/data,list`. Queries and processing/declarations forward to Engine IPC. |
| [modules](../lib/inspect/actions/modules/index.js) | `data`; `static/data,list`; `declarations/update`. Module metadata is separate from bundle/compiler data. |
| [bundles](../lib/inspect/actions/bundles/index.js) | `data`; `consumers/data,list`; `dependencies/data`; `packagers/data`; `packagers/compilers/data`. References the packaging/dependency view rather than source CRUD. |
| [processors](../lib/inspect/actions/processors/index.js) | `data`; `sources/data,list`; `compilers/data`; `overwrites/data,list`; `dependencies/data,list`. |
| [templates](../lib/inspect/actions/templates/index.js) | `data`; `global/data` and `global/sources/data,list`; `applications/data` and `applications/sources/data,list`; `processors/data` and `processors/sources/data,list`; `overwrites/data,list`. |
| [distributions](../lib/inspect/actions/distributions/index.js) | `data,list` through applications/distributions IPC. |
| [launchers](../lib/inspect/actions/launchers/index.js) | `status,start,stop,restart,data,list` through main-process launcher IPC. Runtime Local only wraps status/start/stop. |
| [build](../lib/inspect/actions/build/index.js) | Callable top-level action forwarding applications/build. Build execution is outside inspector transport. |
| [server](../lib/inspect/actions/server/index.js) | `config`; reads Engine server/config for both client and server response fields. |
| [builder](../lib/inspect/actions/builder/index.js) | Project `edit,setDistribution,create,backend,checkPort,checkStatic`; module `edit,clone,create,delete,install,addBundle`; template `update,delete`. Some wrappers expose unavailable methods, detailed below. |
| [sources](../lib/inspect/actions/sources/index.js) | `save,clone,rename,delete,format,create`; resolves some source paths via Engine metadata and delegates filesystem operations. `clone` is exposed but missing in the service implementation. |
| [globalsBundles](../lib/inspect/actions/globals-bundles/index.js) | `data,list` for global bundles. Exact public property is camel-cased `globalsBundles`; directory spelling differs. |
| [dashboard](../lib/inspect/actions/dashboard/index.js) | `validate,cleanCache,getWD`; validates a fixed application code, removes working-directory cache, obtains working directory. It does not authenticate all RPC. |
| [transversal](../lib/inspect/actions/transversal/index.js) | `data`, backed by transversal/dependencies/get. |
| [declarations](../lib/inspect/actions/declarations/index.js) | `list,data`, with declaration-specific batch response shaping. |

### Builder/model semantics worth retaining

[Service](../lib/inspect/service/index.js) owns focused Builder, Dashboard and Sources collaborators. [Builder](../lib/inspect/service/builder/index.js) similarly composes project/modules/template objects. Their [models](../lib/inspect/service/builder/models/index.js) include FileManager, Project, Module, Server, Template, Overwrite, Validator and File. This object composition is the familiar semantic model to preserve in Beyond-authored successors; a generic command dispatcher is only an adapter over those responsibilities.

The [Project service](../lib/inspect/service/builder/project.js) creates/loads filesystem-backed project models, edits configuration and distributions, checks ports/static paths, and adds projects to a Server model representing beyond.json. [Project model](../lib/inspect/service/builder/models/project/index.js) copies scaffolding templates and can optionally install dependencies. The active [template resolver](../lib/inspect/service/builder/models/templates/index.js) locates `@beyond-js/scaffolding/templates`; the large bundled templates tree is not proof every active create path uses those files.

The [Module service](../lib/inspect/service/builder/modules.js) creates, clones, edits and adds bundles through module models. Creation can schedule declaration generation after a fixed delay. It exposes no implemented `delete` method although its action wrapper refers to one. The install helper interprets the supplied array as a joined working-directory string for npm install, rather than a conventional list of dependencies; that contract requires repair before reuse. Project's backend field construction is commented in the model, while its service still calls `project.backend.create()`. These paths must not be documented as working merely because actions exist.

[Sources](../lib/inspect/service/sources/index.js) writes existing files, creates files, renames through copy/remove, deletes and formats text. Paths in rename and nested create use Windows separators; source.clone has no service implementation. Format fixes Prettier's parser to Babel. FileManager save calls the underlying write without awaiting/returning it, so an awaited higher-level action need not guarantee completed persistence. Model-level caches, delayed declarations and optional installation also have lifecycle/error implications.

The preserved value is discoverable model structure, domain identities and responsibility-specific methods. It is not necessary to copy unused wrappers, filesystem assumptions, global process dependencies or weak completion semantics into Packages. Full field schemas and every template transformation remain a later compatibility/migration task if Workspace CRUD is implemented.

## Packages: active capabilities versus missing inspector wiring

| Capability | Current Packages source | Required interpretation |
| --- | --- | --- |
| HTTP startup | http/server (packages repository, `modules/http/start/index.ts`) wraps api-server and calls start; no public ready/stop handle. | Existing HTTP shell to repair; not a running full inspector. |
| HTTP routes | Routes (packages repository, `modules/http/routes/index.ts`) wires root and module routes; info/dependencies setup is commented. Module handler (packages repository, `modules/http/routes/modules/index.ts`) returns fixed JS from buildBundle. | Options/headers/ETags are implemented scaffolding; no actual request-to-package-output integration yet. |
| Workspace/package models | Workspace (packages repository, `modules/workspace/index.ts`), Package (packages repository, `modules/package/main/index.ts`), module/conditional objects. | Reusable native object model. Preserve it; inspector actions should call these services instead of recreating a separate packaging engine. |
| Watchers | Package optionally starts WatcherClient against named watchers service; processor input finder (packages repository, `modules/sdk/conditional/processor/sources/inputs/index.ts`) consumes package watcher. | Real partial integration; service bootstrap and complete lifecycle remain required. |
| Watch coordination | PackageController (packages repository, `modules/package/main/controller/index.ts`) only stores package and reads watcher. ModuleManifests (packages repository, `modules/package/main/modules/manifests/index.ts`) constructs finder without watcher. Workspace constructs Package without watch option. | No complete source edit → target rebuild → artifact publication → update notification path. |
| Teardown | Package.destroy unconditionally calls optional watcher's destroy; Workspace clears the package map before iterating for destruction. | Source lifecycle defects, not validated cleanup. Fix ownership when exposing server stop. |
| HMR production/event server | The active Packages module wiring contains no socket server or `bundle/change` publisher. Historical HMR code exists under SDK `_to-refactor`, `_older` and `to-be-refactored` folders. | Retained implementation references, not installed/active inspector behavior. Connect selected active conditionals and runtime ABI explicitly. |
| Route-module HMR | The API-server wrapper may support HMR of its own route module; this is a separate dependency capability. | Restarting an implementation route on change is distinct from target app patch publication and consumption. |
| Workspace CRUD, upload, launchers, full PLM | No wired equivalents in the current HTTP route setup. | Preserve as requirements/reference for the appropriate subsequent Workspace/backend scope, not an implicit requirement to port all legacy administration before the widget testbed. |

The table concerns the wired entrypoints listed. Historical SDK files remain implementation references; their presence does not activate an inspector or prove compatibility with a selected compiler/runtime.

## Proposed new responsibility split and acceptance

The new Packages inspector must provide the service-side counterpart of the new runtime: explicit workspace/package context; artifact identity and generation status; file-watch invalidation; notifications that identify the selected public module, version/source, conditional/target, language and artifact type; available patch/artifact retrieval; diagnostics; and connection/start/stop ownership. A loaded-graph/revision synchronization strategy must cover reconnect gaps. The final API shape and transport remain bounded implementation contracts to choose against actual consumers, not settled by this proposal.

Keep domain objects and simple methods: workspace owns packages, packages own module/conditional state, a change coordinator observes outputs, artifact delivery resolves those outputs, and a transport adapter publishes events/handles requests. Name and publish Beyond modules only where a public boundary is justified. The client runtime retains runtime composition/export mutation and consumer events; the inspector does not own browser widget instances. Modern BEE Node supplies Node loading, not an inspector or an HMR protocol.

The minimal development service does not require the full remote Workspace frontend, PLM record protocol, scaffold editing, npm installation, upload or launcher administration. Record those separately and retain adapters when actual existing consumers require them. Generic Backend RPC is optional for notification delivery itself; removing it from HMR must not silently remove service RPC/launcher behavior elsewhere. Cloud-capable endpoint configuration is required for the runtime direction, while cloud deployment and CDN hosting have separate service responsibilities.

Acceptance criteria for a Packages-owned development service:

1. Start Packages through modern BEE Node with explicit readiness/failure/stop; prove Engine supplies implementation artifacts only.
2. Compile and serve the widget and independent shared module through Packages; changing source must alter its real artifact and diagnostics.
3. Watch a source edit and publish only after the corresponding selected artifact is available, or emit explicit failure. Preserve stable public identity and distinguish revision/attempt/cache-busting values.
4. Connect the new runtime and prove internal JS changes, unchanged internal preservation, widget refresh and modular/application/global CSS without a full page reload. Browser and Node HMR are separate claims.
5. Test overlapping changes, wrong-project/conditional messages, failed compilation, reconnect gaps and repeated start/stop; verify listener/watch/socket cleanup and chosen recovery behavior.
6. Verify retained administrative/RPC adapters independently with temporary fixtures if in scope. Upload/edit/install operations belong to their own administrative acceptance cases.

## Service boundary

The required runtime loop is compilation, artifact publication, identified update delivery, runtime application and consumer refresh. Workspace metadata browsing, source editing, scaffolding, uploads and launcher administration are adjacent services with their own persistence and lifecycle requirements. Preserve those domains as recognizable objects and modules; expose only the capabilities implemented by the selected service, with observable errors and completion.
