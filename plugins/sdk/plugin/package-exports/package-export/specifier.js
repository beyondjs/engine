const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'plugin.export.specifier';
    }

    #packageExport;

    #value;
    get value() {
        return this.#value;
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    constructor(packageExport) {
        super();
        this.#packageExport = packageExport;
    }

    _prepared(require) {
        require(this.#packageExport.plugin.properties);
    }

    _process() {
        const {subpath} = this.#packageExport;

        const {name, version} = this.#packageExport.pkg;
        const value = name + subpath.slice(1);
        if (this.#value === value) return false;

        this.#value = value;
        this.#vspecifier = `${name}@${version}` + subpath.slice(1);
    }
}
