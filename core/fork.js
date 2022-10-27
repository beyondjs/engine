const {Config} = require('beyond/utils/config');
const packages = require('beyond/packages');
const bundlers = require('beyond/plugins/registry');
const EventEmitter = require('events');

const config = JSON.parse(process.argv[2]);
const {inspect, repository} = config;

process.title = 'BeyondJS core engine subprocess';

new class extends EventEmitter {
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

    #server;
    get server() {
        return this.#server;
    }

    #applications;
    get applications() {
        return this.#applications;
    }

    constructor() {
        super();

        const config = new Config(process.cwd(), {
            '/plugins': 'object',
            '/packages': 'array',
            '/packages/children/template': 'object',
            '/packages/children/template/application': 'object',
            '/packages/children/template/global': 'object',
            '/packages/children/template/processors': 'object',
            '/packages/children/template/overwrites': 'object'
        });
        this.#config = config;
        this.#config.data = 'beyond.json';

        bundlers.initialise({bundles: config.get('bundles'), processors: config.get('processors')});
        packages.create(config.get('packages'));
        this.#server = new (require('./server'))(repository, {gzip: false});

        // Expose interprocess communication actions
        require('./ipc')(this);
    }
}
