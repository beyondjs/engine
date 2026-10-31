# Port fixture

A package for `test/port.test.js`: `beyond.json` lists `package.json`, whose one distribution, `node-esm`, names the
bundles port `1199`. It has no modules: the test reads only the distribution's `project.json`, which says which
package answers a port.

The test copies this directory to a unique temporary directory, replaces `1199` with a port it allocates (the port
the package file names), and starts Engine there with another allocated port given by `--port` or `BEYOND_PORT`.
Expected: `project.json` answers on the given port and nothing answers on the package file's; a value that is not a
port or a list of `<distribution>=<port>` stops Engine with exit code 1 and the reason.
