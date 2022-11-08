const DynamicProcessor = require('beyond/utils/dynamic-processor');

/**
 * Wrappers are the objects that resolve a platform as it is required, for example "browser",
 * but it turns out that "browser" may not exist as a conditional and the bundle specified
 * with conditional "default" must be used, then the "browser" condition is added in realtime,
 * so the wrapper remains the same object but now has to use the new bundle whose platform
 * is now "browser" and not "default"
 */
module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'package.standard-export.wrapper';
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    set bundle(value) {
        this.#bundle = value;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    get pexport() {
        return this.#bundle.pexport;
    }

    get js() {
        return this.#bundle.js;
    }

    constructor(platform) {
        super();
        this.#platform = platform;
    }
}
