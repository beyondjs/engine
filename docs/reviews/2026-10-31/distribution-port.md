# A distribution's port without editing its package file (2026-10-31)

## Why

An Engine listened only on the port its package file names (`deployment.distributions[].ports.bundles`). A second
working copy beside the first, or a preview environment that assigns each component a port, had either to change
the package file (a change it must then keep out of its commits) or to replace `net.Server.prototype.listen` inside
the Engine's processes with a port map loaded by `--require`.

## What changed

- `lib/utils/ports/assignment.js` reads `BEYOND_PORT`: one port, given to every distribution whose package file names
  one, or `<distribution>=<port>,…`, which gives each named distribution its own. A value of neither form is refused
  with the code `INVALID_PORT`.
- `--port <value>` on `node index.js` and on `beyond run` sets `BEYOND_PORT`, as `--host` sets `BEYOND_HOST`; both
  check the value before anything starts and stop with exit code 1 and the reason when it cannot be used.
- A distribution's HTTP server (`lib/engine/process/core/applications/deployment/distributions/index.js`) and the
  launchers of `node`, `ssr` and `backend` distributions (`lib/launchers/config/applications.js`) apply the same
  assignment, so a launcher reaches the server on the given port. The inspector port and `ports.http` /
  `ports.inspect` are unchanged; without `BEYOND_PORT` nothing changes.
- Guides: [A distribution's port](../../inspector.md#a-distributions-port), the README, the changelog's Unreleased
  section and [testing](../../testing.md).

## Evidence

Executed locally on 2026-10-31 in macOS, Node 22, from this repository with its dependencies installed:

- `npm test`: 12 tests, 12 passed (`test/host.test.js` and `test/port.test.js`). The port cases start this checkout's
  Engine on a temporary copy of `test/fixtures/port/`: `--port <port>` and `BEYOND_PORT=node-esm=<port>` each serve
  the fixture's `project.json` on the given port and nothing on the package file's, and `--port node-esm` exits 1
  with the reason before any server answers.

Not established here: the suite's Live mode and worktree conventions still use their own mapping until they adopt
this setting, and no release of `beyond` carries it.
