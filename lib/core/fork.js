const {Config} = require('beyond/utils/config');
const fs = require('fs');
const EventEmitter = require('events');

const config = JSON.parse(process.argv[2]);
const {inspect, repository} = config;

process.title = 'BeyondJS core engine subprocess';

new class extends EventEmitter {
    #path;
    get path() {
        return this.#path;
    }

    #config;
    get config() {
        return this.#config;
    }

    get errors() {
        return this.#config.errors;
    }

    get warnings() {
        return this.#config.warnings;
    }

    #bundlers;
    get bundlers() {
        return this.#bundlers;
    }

    #packages;
    get packages() {
        return this.#packages;
    }

    #repository;
    get repository() {
        return this.#repository;
    }

    #applications;
    get applications() {
        return this.#applications;
    }

    /**
     * BeyondJS core constructor
     *
     * @param path {string} The directory where the instance is running
     */
    constructor(path) {
        super();
        this.#path = path;
        console.log('the path', path);
        return;

        if (!path) throw new Error('Invalid parameters');
        if (!fs.existsSync(path) && !fs.statSync(path).isDirectory()) {
            throw new Error('Root directory is invalid');
        }

        const config = new Config(path, {
            '/bundles': 'object',
            '/processors': 'object',
            '/packages': 'array',
            '/packages/children/dependencies': 'object',
            '/packages/children/modules': 'object',
            '/packages/children/transversals': 'object',
            '/packages/children/static': 'object',
            '/packages/children/excludes': 'object',
            '/packages/children/template': 'object',
            '/packages/children/template/application': 'object',
            '/packages/children/template/global': 'object',
            '/packages/children/template/processors': 'object',
            '/packages/children/template/overwrites': 'object'
        });
        this.#config = config;
        this.#config.data = 'beyond.json';

        this.#bundlers = new (require('./bundlers'))();
        this.#bundlers.create({bundles: config.get('bundles'), processors: config.get('processors')});

        this.#packages = new (require('./packages'))(config.get('packages'));
        this.#repository = void 0; // new (require('./repository'))(this.#packages, {port: repository});

        // Expose interprocess communication actions
        require('./ipc')(this);
    }
}
