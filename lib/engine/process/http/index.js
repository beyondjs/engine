const PackagesServer = require('./packages');
const ApplicationsServers = require('./applications');

module.exports = class {
    #packages;
    #applications;

    /**
     * Development servers constructor
     *
     * @param core
     * @param local {{inspect: number, repository: number}} The engine specification
     */
    constructor(core, local) {
        this.#packages = new PackagesServer(core, local);
        this.#applications = new ApplicationsServers(core, local);
    }

    initialise() {
        this.#packages.initialise();
        this.#applications.initialise();
    }
}
