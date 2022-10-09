module.exports = class {
    #tsc;
    get tsc() {
        return this.#tsc;
    }

    #ssr;
    get ssr() {
        return this.#ssr;
    }

    #format;
    get format() {
        return this.#format;
    }

    #minify;
    get minify() {
        return this.#minify;
    }

    /**
     * Generate a key for the required properties
     *
     * @param properties
     * @return {*}
     */
    key(properties) {
        const options = ['tsc', 'ssr', 'minify', 'format'];

        properties = properties ? properties : options;
        const compute = properties.forEach(property => {
            if (!options.includes(property)) throw new Error(`Property "${property}" is invalid`);
            return [property, this[property]];
        });
        return crc32(equal.generate(compute));
    }

    constructor(specs) {
        if (typeof specs !== 'object') throw new Error('Invalid compilation specification');
        let {tsc, ssr, format, minify} = specs;

        tsc = tsc ? tsc : 'transpiler';
        if (!['transpiler', 'compiler'].includes(tsc)) throw new Error('Property .tsc is invalid');

        this.#ssr = !!ssr;
        this.#format = !!format;
        this.#minify = !!minify;
    }
}
