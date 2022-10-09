const {Config} = require('beyond/utils/config');
const bundlers = require('beyond/bundlers-registry');
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

    constructor() {
        super();

        const config = new Config(process.cwd(), {
            '/bundles': 'object',
            '/processors': 'object',
            '/packages': 'array',
            '/packages/children/dependencies': 'object',
            '/packages/children/modules': 'object',
            '/packages/children/transversals': 'object',
            '/packages/children/static': 'object',
            '/packages/children/excludes': 'object',
            '/packages/children/deployment': 'object',
            '/packages/children/template': 'object',
            '/packages/children/template/application': 'object',
            '/packages/children/template/global': 'object',
            '/packages/children/template/processors': 'object',
            '/packages/children/template/overwrites': 'object'
        });
        this.#config = config;
        this.#config.data = 'beyond.json';

        bundlers.initialise({bundles: config.get('bundles'), processors: config.get('processors')});

        this.#packages = new (require('./packages'))(config.get('packages'));
        this.#repository = new (require('./repository'))(this.#packages, {port: repository}, {gzip: false});

        // Expose interprocess communication actions
        require('./ipc')(this);
    }
}
