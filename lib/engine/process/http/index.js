const PackagesServer = require('./packages');
const ApplicationsServers = require('./applications');

module.exports = class {
    #packages;
    #applications;

    /**
     * Development servers constructor
     *
     * @param core
     * @param local {{inspect: number}} The engine specification, actually the inspection port
     */
    constructor(core, local) {
        this.#packages = new PackagesServer(core, local);
        this.#applications = new ApplicationsServers(core, local);
    }
}
