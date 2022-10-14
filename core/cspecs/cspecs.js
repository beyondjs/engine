const crc32 = require('beyond/utils/crc32');

module.exports = platforms => class {
    #tsc;
    get tsc() {
        return this.#tsc;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #ssr;
    get ssr() {
        return this.#ssr;
    }

    #backend;
    get backend() {
        return this.#backend;
    }

    /**
     * Generate a key for the required properties
     *
     * @param properties
     * @return {*}
     */
    key(properties) {
        const options = ['platform', 'tsc', 'ssr', 'backend'];

        properties = properties ? properties : options;
        const compute = properties.forEach(property => {
            if (!options.includes(property)) throw new Error(`Property "${property}" is invalid`);
            return [property, this[property]];
        });
        return crc32(equal.generate(compute));
    }

    constructor(specs) {
        if (typeof specs !== 'object') throw new Error('Invalid compilation specification');
        let {platform, tsc, ssr, backend} = specs;

        if (!platforms.include(platform)) throw new Error(`Platform "${platform}" is invalid`);

        tsc = tsc ? tsc : 'transpiler';
        if (!['transpiler', 'compiler'].includes(tsc)) throw new Error('Property .tsc is invalid');

        this.#ssr = !!ssr;
        this.#backend = !!backend;
    }
}
