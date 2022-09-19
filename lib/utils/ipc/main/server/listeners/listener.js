module.exports = class {
    #fork;
    #server;
    #dispatchers;

    // The bridge function that allows to execute actions received from a child process
    // and that are executed in another child process
    // The main ipc manager provides the bridge function, as it has the dispatchers
    // to execute actions on the forked processes, and the bridge is the function
    // that knows to which child process is the request being redirected
    #bridge = async message => {
        const {target} = message;
        if (!this.#dispatchers.has(target)) {
            return {error: {message: `Target "${message.target}" not found`}};
        }

        const dispatcher = this.#dispatchers.get(target);
        const response = await dispatcher.exec(undefined, message.action, ...message.params);
        return {response: response};
    }

    constructor(server, fork, dispatchers) {
        this.#server = server;
        this.#fork = fork;
        this.#dispatchers = dispatchers;
        fork.on('message', this.#onmessage);
    }

    #exec = async message => {
        const send = (response) => {
            Object.assign(response, {type: 'ipc.response', id: message.id});
            this.#fork.send(response);
        };

        if (!message.action) {
            send({error: 'Property action is undefined'});
            return;
        }

        if (message.target === 'main') {
            if (!this.#server.has(message.action)) {
                send({error: {message: `Action "${message.action}" not found`}});
                return;
            }

            let response;
            try {
                response = await this.#server.exec(message.action, ...message.params);
            }
            catch (exc) {
                send({error: {message: exc.message, stack: exc.stack}});
                return;
            }
            send({response: response});
        }
        else {
            send(await this.#bridge(message));
        }
    }

    #onmessage = message => {
        if (typeof message !== 'object' || message.type !== 'ipc.request') return;
        if (!message.id) {
            console.error('An undefined message id received on ipc communication', message);
            return;
        }
        this.#exec(message).catch(exc => console.error(exc instanceof Error ? exc.stack : exc));
    }

    destroy() {
        this.#fork.removeListener('message', this.#onmessage);
    }
}
