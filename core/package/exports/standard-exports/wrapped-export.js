const DynamicProcessor = require('beyond/utils/dynamic-processor');

/**
 * Wrapped exports are the objects that resolve a platform as it is required, for example "browser",
 * but it turns out that "browser" may not exist as a conditional and the targeted export specified
 * with conditional "default" must be used, then the "browser" condition is added in realtime,
 * so the wrapper remains the same object but then it would use the new bundle whose platform
 * is now "browser" and not "default"
 */
module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'package.standard-export.conditioned-export';
    }

    #targetedExport;
    get targetedExport() {
        return this.#targetedExport;
    }

    set targetedExport(value) {
        this.#targetedExport = value;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    get packageExport() {
        return this.#targetedExport.packageExport;
    }

    get js() {
        return this.#targetedExport.js;
    }

    constructor(platform) {
        super();
        this.#platform = platform;
    }
}
