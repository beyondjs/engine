module.exports = class {
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
     * @param specs {*} The application specification
     * @param local {{inspect: number}} The engine specification, actually the inspection port
     */
    constructor(specs, local) {
        const {port} = specs;
        const listener = require('./listener')(specs, local);

        const done = (status, errors) => {
            this.#status = status;
            this.#errors = errors ? errors : [];
        };

        try {
            this.#server = require('http').createServer(listener);
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
