/**
 * The compiled dashboard manager
 */
module.exports = class {
    #containers;
    get containers() {
        return this.#containers;
    }

    #ready = Promise.pending();
    get ready() {
        return this.#ready.value;
    }

    #initialised = false;
    get initialised() {
        return this.#initialised;
    }

    async initialise() {
        if (this.#initialised) return;
        this.#initialised = true;

        // Add the compiled dashboard backend in the main instance
        const path = require('path').resolve(__dirname, '../../../../dashboard/ws');
        const config = new global.utils.Config(path, {
            '/libraries': 'array',
            '/libraries/children/node': 'object',
            '/libraries/children/ssr': 'object',
            '/libraries/children/backend': 'object',
            '/libraries/children/legacyBackend': 'object',
        });
        config.data = 'backend.json';
        await config.ready;

        const libraries = config.properties.get('libraries');

        const ContainersCollection = require('../../containers/collection');
        this.#containers = new ContainersCollection('dashboard', libraries, true);
        await this.#containers.ready;

        this.#ready.resolve();
    }
}
