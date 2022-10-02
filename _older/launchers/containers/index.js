const {EventEmitter} = require('events');

module.exports = class extends EventEmitter {
    #applications;
    get applications() {
        return this.#applications;
    }

    #libraries;
    get libraries() {
        return this.#libraries;
    }

    // The collection of services of the compiled dashboard
    #dashboard;
    get dashboard() {
        return this.#dashboard;
    }

    /**
     * Services collection constructor
     *
     * @param config {object} The applications and libraries configuration
     * @param dashboard {boolean} Is it the instance of the Beyond JS dashboard
     */
    constructor(config, dashboard) {
        super();

        this.#applications = new (require('./collection'))(
            'application',
            config.properties.get('applications'),
            dashboard);

        this.#libraries = new (require('./collection'))(
            'library',
            config.properties.get('libraries'),
            dashboard);

        // Add the compiled dashboard service in the main instance
        this.#dashboard = !dashboard ? new (require('./dashboard'))() : undefined;
        this.#dashboard?.initialise().catch(exc => console.log(exc.stack));
    }
}
