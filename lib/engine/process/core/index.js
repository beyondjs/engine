const {Config} = global.utils;
const fs = require('fs');
const EventEmitter = require('events');

/**
 * BeyondJS core
 */
module.exports = class extends EventEmitter {
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

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #applications;
    get applications() {
        return this.#applications;
    }

    #libraries;
    get libraries() {
        return this.#libraries;
    }

    #bundler;
    get bundler() {
        return this.#bundler;
    }

    /**
     * BeyondJS core constructor
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
            '/applications': 'array',
            '/applications/children/deployment': 'object',
            '/applications/children/modules': 'object',
            '/applications/children/modules/externals': 'object',
            '/applications/children/transversals': 'object',
            '/applications/children/static': 'object',
            '/applications/children/libraries': 'object',
            '/applications/children/excludes': 'object',
            '/applications/children/template': 'object',
            '/applications/children/template/application': 'object',
            '/applications/children/template/global': 'object',
            '/applications/children/template/processors': 'object',
            '/applications/children/template/overwrites': 'object'
        });
        this.#config = config;
        this.#config.data = 'beyond.json';

        this.#bundler = require('../bundler').createRegistries({
            bundles: config.get('bundles'),
            processors: config.get('processors')
        });

        this.#applications = new (require('./applications'))(config.get('applications'));
    }

    destroy() {
        if (this.#destroyed) throw new Error('Core is already destroyed');
        this.#destroyed = true;
        this.removeAllListeners();
        this.#config.destroy();
    }
}
