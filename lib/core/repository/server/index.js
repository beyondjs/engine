const DynamicProcessor = global.utils.DynamicProcessor();
const {ports} = global.utils;

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

    #port;
    get port() {
        return this.#port;
    }

    /**
     * The HTTP Server constructor
     *
     * @param application {object} The application object
     * @param distribution {object} The distribution specification
     * @param local {{inspect: number}} The engine specification, actually the inspection port
     */
    constructor(application, distribution, local) {
        super();
        this.#application = application;
        this.#distribution = distribution;
        this.#id = `${application.id}/${distribution.key}`;
        this.#listener = require('./listener')(application, distribution, local);

        distribution.dp && super.setup(new Map([['distribution', {child: distribution}]]));
    }

    async _process(request) {
        const distribution = this.#distribution;
        const port = distribution.ports?.bundles ? distribution.ports.bundles : distribution.port;
        if (this.#server && port === this.#port) return;

        if (!port) {
            this.#server && this.#close();
            this.#errors = [];
            return;
        }

        this.#server && this.#close();
        this.#status = 'initialising';

        const done = (status, errors) => {
            this.#status = status;
            this.#errors = errors ? errors : [];
        };

        const available = await ports.check(port);
        if (this._request !== request) return;
        if (!available) return done('closed', [`Port "${port}" is unavailable`]);

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
