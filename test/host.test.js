// The address Engine's servers listen on and the port check that guards them (`lib/utils/ports`).
// Run with `npm test` (Node's test runner); each case allocates its own port and closes what it opens.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { networkInterfaces } = require('node:os');
const Host = require('../lib/utils/ports/host');
const Ports = require('../lib/utils/ports');

const listen = (host) => new Promise((resolve, reject) => {
    const server = net.createServer().once('error', reject).listen(0, host, () => resolve(server));
});
const close = server => new Promise(resolve => server.close(resolve));
const external = () => Object.values(networkInterfaces()).flat().find(entry => entry.family === 'IPv4' && !entry.internal)?.address;
const reach = (host, port) => new Promise(resolve => {
    const socket = net.connect({ host, port });
    const finish = result => { socket.destroy(); resolve(result); };
    socket.setTimeout(1000, () => finish(false));
    socket.once('error', () => finish(false)).once('connect', () => finish(true));
});

test('listens on loopback unless BEYOND_HOST names another address', () => {
    assert.equal(new Host({}).address, '127.0.0.1');
    assert.equal(new Host({ BEYOND_HOST: ' ' }).address, '127.0.0.1');
    assert.equal(new Host({ BEYOND_HOST: '::1' }).loopback, true);
});

test('an address open to the network is said once, and only once across forked processes', (t) => {
    const said = [];
    t.mock.method(console, 'warn', message => said.push(message));
    const env = { BEYOND_HOST: '0.0.0.0' };
    assert.equal(new Host(env).address, '0.0.0.0');
    new Host(env);
    assert.equal(said.length, 1);
    assert.match(said[0], /0\.0\.0\.0 \(BEYOND_HOST\)/);
    assert.equal(env.BEYOND_HOST_WARNED, '1');
});

test('a server on the default host cannot be reached from another interface', async (t) => {
    const address = external();
    if (!address) return t.skip('no external IPv4 interface on this machine');
    const ports = new Ports();
    const server = await listen(ports.host);
    t.after(() => close(server));
    const { port } = server.address();
    assert.equal(await reach('127.0.0.1', port), true);
    assert.equal(await reach(address, port), false);
});

test('a port is refused while another process holds it on loopback or on every interface', async (t) => {
    const ports = new Ports();
    const loopback = await listen('127.0.0.1');
    t.after(() => close(loopback));
    assert.equal(await ports.check(loopback.address().port), false);

    const wildcard = await listen();
    t.after(() => close(wildcard));
    assert.equal(await ports.check(wildcard.address().port), false);
});

test('a port is offered again once its holder closes (recovery)', async () => {
    const ports = new Ports();
    const server = await listen('127.0.0.1');
    const { port } = server.address();
    assert.equal(await ports.check(port), false);
    await close(server);
    assert.equal(await ports.check(port), true);
});
