/**
 * The port a distribution's server listens on when the person gives one instead of its package file's.
 *
 * `BEYOND_PORT` (or `--port` on the command line) holds either one port, given to every distribution whose
 * package file names a port (`ports.bundles`, or `port`), or a comma-separated list of `<distribution>=<port>`,
 * which gives each named distribution its port, whether its package file names one or not. The package file is
 * never changed. Unset or empty, every distribution keeps the port its package file names.
 *
 * A value that is not one of those forms is refused when it is read, with the code `INVALID_PORT`, so Engine never
 * starts on a port the person did not mean.
 */
module.exports = class {
    static VARIABLE = 'BEYOND_PORT';

    // The port every distribution that names one takes, when the value is a single port
    #every;
    // The port of each named distribution, when the value is a list
    #named = new Map();

    get given() {
        return this.#every !== undefined || this.#named.size > 0;
    }

    constructor(env = process.env) {
        const value = env[this.constructor.VARIABLE]?.trim();
        if (!value) return;

        if (/^\d+$/.test(value)) {
            this.#every = this.#port(value, value);
            return;
        }
        for (const entry of value.split(',')) {
            const match = /^\s*([^=\s]+)\s*=\s*(\d+)\s*$/.exec(entry);
            if (!match) throw this.#refusal(value, `"${entry.trim()}" is not <distribution>=<port>`);
            const [, name, port] = match;
            if (this.#named.has(name)) throw this.#refusal(value, `the distribution "${name}" is named twice`);
            this.#named.set(name, this.#port(port, value));
        }
    }

    #port(text, value) {
        const port = Number(text);
        if (port < 1 || port > 65535) throw this.#refusal(value, `${text} is not a port (1 to 65535)`);
        return port;
    }

    #refusal(value, reason) {
        const error = new Error(`${this.constructor.VARIABLE} "${value}" cannot be used: ${reason}. ` +
            'Give one port, or a list of <distribution>=<port> separated by commas');
        error.code = 'INVALID_PORT';
        return error;
    }

    /**
     * The ports a distribution listens on: its package file's, with the bundles port replaced by the given one
     *
     * @param distribution {{name?: string, ports?: object, port?: number}} The distribution as its package file declares it
     * @returns {{ports: object | undefined, port: number | undefined}}
     */
    apply({name, ports, port}) {
        const declared = (typeof ports === 'object' && ports?.bundles) || port;
        const given = this.#named.has(name) ? this.#named.get(name) : (declared ? this.#every : undefined);
        if (given === undefined) return {ports, port};

        return {ports: Object.assign({}, typeof ports === 'object' ? ports : {}, {bundles: given}), port};
    }
}
