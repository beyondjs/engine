const {TargetCode} = require('beyond/extensible-objects');

/**
 * The configuration is immutable in the TargetCode that is used by the standard export.
 * This is the TargetCode object that must be used by the plugins, whose configuration is done in the module.json file
 */
module.exports = class extends TargetCode {
    get plugin() {
        return this.target.plugin;
    }

    #config;
    get config() {
        return this.#config.value;
    }

    constructor(target, specs) {
        super(target, specs);

        this.#config = target.pexport.config;
        super.setup(new Map([['config', {child: this.#config}]]));
    }
}
