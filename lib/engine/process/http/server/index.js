const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc} = global.utils;

/**
 * The HTTP Server
 */
module.exports = class extends DynamicProcessor {
    get dp() {
        return 'http.server';
    }

    #application;
    get application() {
        return this.#application;
    }

    #distribution;
    get distribution() {
        return this.#distribution;
    }

    #id;
    #listener;

    #connections;
    #server;
    get server() {
        return this.#server;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #status = 'closed';
    get status() {
        return this.#status;
    }

    #specs;
    get specs() {
        return this.#specs;
    }

    #port;
    get port() {
        return this.#port;
    }

    /**
     * The HTTP Server constructor
     *
     * @param application {object} The application object
     * @param distribution {object} The distribution specification
     * @param specs {{port: number}=} If port is specified, use this port, if not, then use the application port
     */
    constructor(application, distribution, specs) {
        super();
        this.#application = application;
        this.#distribution = distribution;
        this.#specs = specs ? specs : {};
        this.#id = `${application.id}/${distribution.key}`;
        this.#listener = require('./listener')(application, distribution);

        distribution.dp && super.setup(new Map([['distribution', {child: distribution}]]));
    }

    async _process(request) {
        const distribution = this.#distribution;
        const dport = distribution.ports?.bundles ? distribution.ports.bundles : distribution.port;
        if (!this.#specs.port && !dport) {
            this.#server && this.#close();
            this.#errors = [];
            return;
        }

        if (this.#server && this.#specs.port && this.#specs.port === this.#port) return;
        if (this.#server && dport && dport === this.#port) return;

        this.#server && this.#close();
        this.#status = 'initialising';

        const done = (status, errors) => {
            this.#status = status;
            this.#errors = errors ? errors : [];
        };

        let port = this.#specs.port;
        if (!port && dport) {
            port = dport;
            const available = await ipc.exec('main', 'ports.check', dport);
            if (this._request !== request) return;
            if (!available) return done('closed', [`Port "${dport}" is unavailable`]);
        }
        else if (!port) {
            const use = `application@${distribution.id}:${distribution.key}`;
            port = await ipc.exec('main', 'ports.reserve', use, false);
            if (this._request !== request) return;
            if (!port) return done('closed', ['It was not possible to get an available port']);
        }

        try {
            this.#server = require('http').createServer(this.#listener);
            this.#connections = new (require('./connections'))(this.#server);
            this.#port = port;
            this.#server
                .on('close', () => done('closed'))
                .on('error', exc => done('closed', [`Error creating http server instance: ${exc.message}`]))
                .listen(port);

            done('running');
        }
        catch (exc) {
            return done('closed', [`Error creating http server instance: ${exc.message}`]);
        }
    }

    #close() {
        if (!this.#server || ['closed', 'closing'].includes(this.#status)) return;
        this.#status = `closing`;

        this.#connections.destroy();
        this.#server.close(() => {
            this.#status = 'closed';
            this.#server = undefined;
        });
    }

    destroy() {
        super.destroy();
        this.#close();
    }
}
