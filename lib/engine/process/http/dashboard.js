const {ipc} = global.utils;
require('colors');

module.exports = class extends Map {
    #core;

    constructor(core) {
        super();
        this.#core = core;
        this.#process().catch(exc => console.error(exc.stack));
    }

    #setup = async (application, distribution) => {
        const use = `dashboard/${distribution.monitor}`;
        const dashboard = distribution.monitor === 'dashboard'
        const port = await ipc.exec('main', 'ports.reserve', use, dashboard);
        if (!port) {
            console.log('It was not possible to get an available port '.red +
                `for the dashboard application [${distribution.monitor}]`.red);
            return;
        }

        const server = new (require('./server'))(application, distribution, {port: port});
        await server.initialise();

        return server;
    }

    // It is expected the dashboard to have only one application
    #process = async () => {
        const Distribution = require('./distribution');
        const distributions = [new Distribution('main'), new Distribution('dashboard')];

        // Create application http servers
        await this.#core.applications.ready;
        const application = [...this.#core.applications.values()][0];
        await application.ready;

        // Create the server of each distribution
        for (const distribution of distributions) {
            const id = `${application.id}/${distribution.key}`;

            const server = await this.#setup(application, distribution);
            if (!server) return;

            this.set(id, server);
        }
    }

    destroy() {
        this.forEach(server => server.destroy());
    }
}
