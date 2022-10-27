const equal = require('beyond/utils/equal');
const crc32 = require('beyond/utils/crc32');

module.exports = platforms => class {
    #typecheck;
    get typecheck() {
        return this.#typecheck;
    }

    #platform;
    get platform() {
        return this.#platform;
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
        const options = ['platform', 'typecheck', 'backend'];

        properties = properties ? properties : options;
        const compute = [...properties.values()].map(property => {
            if (!options.includes(property)) throw new Error(`Property "${property}" is invalid`);
            return [property, this[property]];
        });
        return crc32(equal.generate(compute));
    }

    constructor(specs) {
        if (typeof specs !== 'object') throw new Error('Invalid compilation specification');
        let {platform, typecheck, backend} = specs;

        if (!platforms.includes(platform)) throw new Error(`Platform "${platform}" is invalid`);

        this.#platform = platform;
        this.#typecheck = !!typecheck;
        this.#backend = !!backend;
    }
}
