// The port a distribution's server listens on when the person gives one (`lib/utils/ports/assignment.js`,
// `--port` and `BEYOND_PORT`). Run with `npm test` (Node's test runner). The Engine cases start this checkout's
// Engine on a temporary copy of `test/fixtures/port/`, each on ports it allocates, and stop it by process group.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const Assignment = require('../lib/utils/ports/assignment');

const ENGINE = join(__dirname, '..', 'index.js');
const FIXTURE = join(__dirname, 'fixtures', 'port');
const DECLARED = 1199;
// How long Engine may take to serve `project.json`, on a busy machine
const READY = 60000;

const free = () => new Promise((resolve, reject) => {
    const server = net.createServer().once('error', reject).listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        server.close(() => resolve(port));
    });
});

/** What answers `project.json` on a port: the package's specifier, or undefined when nothing does */
const answer = async port => {
    try {
        const response = await fetch(`http://127.0.0.1:${port}/project.json`, { signal: AbortSignal.timeout(2000) });
        return response.ok ? (await response.json()).specifier : undefined;
    }
    catch {
        return undefined;
    }
};

/** A copy of the fixture whose package file names `declared` */
const copy = (t, declared) => {
    const directory = mkdtempSync(join(tmpdir(), 'engine-port-'));
    t.after(() => rmSync(directory, { recursive: true, force: true }));
    cpSync(FIXTURE, directory, { recursive: true });
    const file = join(directory, 'package.json');
    writeFileSync(file, readFileSync(file, 'utf8').replace(String(DECLARED), String(declared)));
    return directory;
};

/** Engine started in `directory` as the leader of its own process group, stopped by group when the test ends */
const start = (t, directory, args = [], env = {}) => {
    const child = spawn(process.execPath, [ENGINE, ...args], {
        cwd: directory, detached: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...env }
    });
    let output = '';
    child.stdout.on('data', data => output += data);
    child.stderr.on('data', data => output += data);
    const exited = new Promise(resolve => child.once('exit', code => resolve(code)));
    t.after(async () => {
        try {
            process.kill(-child.pid, 'SIGTERM');
        }
        catch {
            return;
        }
        await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 5000))]);
        try {
            process.kill(-child.pid, 'SIGKILL');
        }
        catch {}
    });
    return { exited, get output() { return output; } };
};

/** Waits until `port` answers with the fixture's package, failing past the bound */
const serving = async (port, engine) => {
    const deadline = Date.now() + READY;
    while (Date.now() < deadline) {
        if (await answer(port) === '@beyond-js/engine-port-fixture') return;
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    assert.fail(`Engine did not serve project.json on ${port} within ${READY} ms:\n${engine.output}`);
};

test('without a given port, a distribution keeps its package file\'s', () => {
    const assignment = new Assignment({});
    assert.equal(assignment.given, false);
    const declared = { name: 'node-esm', ports: { bundles: 1160, inspect: 9229 } };
    assert.deepEqual(assignment.apply(declared), { ports: declared.ports, port: undefined });
    assert.equal(new Assignment({ BEYOND_PORT: '  ' }).given, false);
});

test('one port goes to every distribution whose package file names one, and to no other', () => {
    const assignment = new Assignment({ BEYOND_PORT: '24012' });
    assert.deepEqual(assignment.apply({ name: 'node-esm', ports: { bundles: 1160, inspect: 9229 } }),
        { ports: { bundles: 24012, inspect: 9229 }, port: undefined });
    assert.deepEqual(assignment.apply({ name: 'web', port: 8080 }), { ports: { bundles: 24012 }, port: 8080 });
    assert.deepEqual(assignment.apply({ name: 'web' }), { ports: undefined, port: undefined });
});

test('a list gives each named distribution its port and leaves the others as declared', () => {
    const assignment = new Assignment({ BEYOND_PORT: 'node-esm=24012, web = 24013' });
    assert.deepEqual(assignment.apply({ name: 'node-esm', ports: { bundles: 1160 } }).ports, { bundles: 24012 });
    assert.deepEqual(assignment.apply({ name: 'web' }).ports, { bundles: 24013 });
    assert.deepEqual(assignment.apply({ name: 'ssr', ports: { bundles: 1180 } }).ports, { bundles: 1180 });
});

test('a value that is not a port or a list of them is refused with INVALID_PORT', () => {
    for (const value of ['0', '70000', 'abc', 'node-esm', 'node-esm=', 'node-esm=1,node-esm=2', '=24012']) {
        assert.throws(() => new Assignment({ BEYOND_PORT: value }), { code: 'INVALID_PORT' }, value);
    }
});

test('Engine serves a distribution on the port --port gives, not on its package file\'s', async t => {
    const [declared, given] = [await free(), await free()];
    const engine = start(t, copy(t, declared), ['--port', String(given)]);
    await serving(given, engine);
    assert.equal(await answer(declared), undefined);
});

test('Engine serves a named distribution on the port BEYOND_PORT gives it', async t => {
    const [declared, given] = [await free(), await free()];
    const engine = start(t, copy(t, declared), [], { BEYOND_PORT: `node-esm=${given}` });
    await serving(given, engine);
    assert.equal(await answer(declared), undefined);
});

test('Engine stops before it starts anything when --port cannot be used', async t => {
    const declared = await free();
    const engine = start(t, copy(t, declared), ['--port', 'node-esm']);
    assert.equal(await engine.exited, 1);
    assert.match(engine.output, /BEYOND_PORT "node-esm" cannot be used/);
    assert.equal(await answer(declared), undefined);
});
