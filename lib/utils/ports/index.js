const Host = require('./host');
const Assignment = require('./assignment');

/**
 * Port availability for the servers Engine opens.
 *
 * Every server Engine opens listens on `ports.host`: the loopback address unless the person asks for
 * another (`BEYOND_HOST`, or `--host` on the command line), so compiled sources are never offered to
 * the local network by default. A distribution's server listens on its package file's port unless the
 * person gives another (`ports.assignment`: `BEYOND_PORT`, or `--port` on the command line).
 */
module.exports = class {
    // Read on first use, so a command that sets `BEYOND_HOST` after the globals exist is honoured
    #host;
    get host() {
        this.#host ??= new Host();
        return this.#host.address;
    }

    // Read on first use, as the host is; a value that cannot be used throws `INVALID_PORT` here
    #assignment;
    get assignment() {
        this.#assignment ??= new Assignment();
        return this.#assignment;
    }

    /**
     * Whether a port is free on the address Engine listens on and on every interface, so a server
     * another process holds on all interfaces is not shadowed by one bound to loopback only.
     *
     * @param port {number}
     * @returns {Promise<boolean>}
     */
    async check(port) {
        return await this.#free(port, this.host) && await this.#free(port);
    }

    #free(port, host) {
        return new Promise(resolve => {
            const tester = require('net').createServer()
                .once('error', () => resolve(false))
                .once('listening', () => tester.once('close', () => resolve(true)).close())
                .listen(port, host);
        });
    }
}
