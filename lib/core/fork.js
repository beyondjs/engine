const {Config} = global.utils;
const fs = require('fs');
const EventEmitter = require('events');

const config = JSON.parse(process.argv[2]);
const {inspect} = config;

process.title = 'BeyondJS core engine subprocess';

const core = new class extends EventEmitter {
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
            '/applications': 'array',
            '/applications/children/template': 'object',
            '/applications/children/template/application': 'object',
            '/applications/children/template/global': 'object',
            '/applications/children/template/processors': 'object',
            '/applications/children/template/overwrites': 'object'
        });
        this.#config = config;
        this.#config.data = 'beyond.json';

        this.#bundlers = new (require('./bundlers'))();
        this.#bundlers.create({bundles: config.get('bundles'), processors: config.get('processors')});

        this.#packages = new (require('./packages'))(config.get('packages'));
        this.#repository = new (require('./repository'))(this.#packages);
        this.#applications = new (require('./applications'))(config.get('applications'));
    }
}

// Expose interprocess communication actions
require('./ipc')(core);
