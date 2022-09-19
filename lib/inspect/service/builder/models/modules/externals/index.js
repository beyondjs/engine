module.exports = class Externals extends require('../../file-manager') {

    #packages = [];
    #custom = new Map();

    get packages() {
        return this.#packages;
    }

    set packages(value) {
        this.#packages = value;
    }

    get structure() {
        const structure = {};
        if (this.packages.length) structure.packages = this.#packages;
        this.#custom.forEach((item, key) => structure[key] = item);
        return structure;
    }

    constructor(data) {
        super();
        if (data) this.set(data);
    }

    set(data) {
        if (Array.isArray(data?.packages)) {
            this.#packages = data.packages;
            delete data.packages;
        }

        if (typeof data === 'object') {
            Object.keys(data).forEach((property, key) => this.#custom.set(property, data[property]));
        }
    }
}
