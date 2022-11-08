const {PackageExportCode} = require('beyond/extensible-objects');

module.exports = class extends PackageExportCode {
    get plugin() {
        return this.conditional.plugin;
    }

    #config;
    get config() {
        return this.#config.value;
    }

    constructor(conditional, specs) {
        super(conditional, specs);

        this.#config = conditional.pexport.config;
        super.setup(new Map([['config', {child: this.#config}]]));
    }
}
