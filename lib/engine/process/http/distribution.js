const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'http.server.dashboard.distribution';
    }

    get platform() {
        return 'web';
    }

    get environment() {
        return 'development';
    }

    get local() {
        return true;
    }

    get minify() {
        return {};
    }

    get maps() {
        return 'inline';
    }

    get development() {
        return {tools: true};
    }

    get bundles() {
        return {mode: 'amd'};
    }

    #key;
    get key() {
        return this.#key;
    }

    #monitor;
    get monitor() {
        return this.#monitor;
    }

    /**
     * Distribution constructor
     *
     * @param monitor {string} Can be 'main' or 'dashboard'
     */
    constructor(monitor) {
        super();
        this.#monitor = monitor;
        this.#key = `dashboard-${monitor}`;
    }
}
