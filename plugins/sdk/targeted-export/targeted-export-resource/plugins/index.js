const TargetedExportedResource = require('../standard');

/**
 * The configuration is immutable in the TargetedExportedResource that is used by the standard export.
 * This is the TargetedExportedResource object that must be used by the plugins,
 * whose configuration is done in the module.json file.
 */
module.exports = class extends TargetedExportedResource {
    get plugin() {
        return this.target.plugin;
    }

    #config;
    get config() {
        return this.#config.value;
    }

    constructor(target, specs) {
        super(target, specs);

        this.#config = target.packageExport.config;
        super.setup(new Map([['config', {child: this.#config}]]));
    }
}
