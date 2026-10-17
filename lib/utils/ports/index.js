const Host = require('./host');

/**
 * Port availability for the servers Engine opens.
 *
 * Every server Engine opens listens on `ports.host`: the loopback address unless the person asks for
 * another (`BEYOND_HOST`, or `--host` on the command line), so compiled sources are never offered to
 * the local network by default.
 */
module.exports = class {
    // Read on first use, so a command that sets `BEYOND_HOST` after the globals exist is honoured
    #host;
    get host() {
        this.#host ??= new Host();
        return this.#host.address;
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
