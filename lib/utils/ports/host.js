/**
 * The address Engine's servers listen on.
 *
 * `127.0.0.1` by default. `BEYOND_HOST` names another one (`0.0.0.0` for every interface, as inside a
 * container whose port is published); an address that is not loopback is said once, because it offers
 * the compiled sources to every machine that can reach it.
 */
module.exports = class {
    static DEFAULT = '127.0.0.1';
    static LOOPBACK = ['127.0.0.1', '::1', 'localhost'];

    #address;
    get address() {
        return this.#address;
    }

    get loopback() {
        return this.constructor.LOOPBACK.includes(this.#address);
    }

    constructor(env = process.env) {
        const value = env.BEYOND_HOST?.trim();
        this.#address = value ? value : this.constructor.DEFAULT;
        if (this.loopback || env.BEYOND_HOST_WARNED) return;

        // Said by the first process only: the forked children inherit the variable
        env.BEYOND_HOST_WARNED = '1';
        console.warn(`Engine listens on ${this.#address} (BEYOND_HOST): every machine that reaches this address can read the compiled sources`);
    }
}
