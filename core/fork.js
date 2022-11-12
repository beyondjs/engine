const {Config} = require('beyond/utils/config');
const packages = require('beyond/packages');
const plugins = require('beyond/plugins/registry');
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

    constructor() {
        super();

        const config = new Config(process.cwd(), {
            '/plugins': 'object',
            '/packages': 'array'
        });
        this.#config = config;
        this.#config.data = 'beyond.json';

        plugins.initialise(config.get('plugins'));
        packages.setup(config.get('packages'));
        this.#server = new (require('./server'))(repository, {gzip: false});

        // Expose interprocess communication actions
        require('./ipc')(this);
    }
}
