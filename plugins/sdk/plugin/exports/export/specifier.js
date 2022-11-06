const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'plugin.export.specifier';
    }

    #pexport;

    #value;
    get value() {
        return this.#value;
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    constructor(pexport) {
        super();
        this.#pexport = pexport;
    }

    _prepared(require) {
        require(this.#pexport.plugin.properties);
    }

    _process() {
        const {subpath} = this.#pexport;

        const {name, version} = this.#pexport.pkg;
        const value = name + subpath.slice(1);
        if (this.#value === value) return false;

        this.#value = value;
        this.#vspecifier = `${name}@${version}` + subpath.slice(1);
    }
}
