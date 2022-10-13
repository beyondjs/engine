module.exports = class {
    #socket;
    #actions;

    #counter;
    #active;
    #cache;
    #MAX_ACTIVE_REQUESTS = 60;
    #STATE = Object.freeze({
        EXECUTING: 0,
        EXECUTED: 1
    });

    constructor(socket, actions) {
        this.#socket = socket;
        this.#actions = actions;

        this.#cache = new (require('./cache'))(socket.id);
        socket.on('rpc-v2', this.#onmessage);
    }

    onmessage = async (request) => {
        if (typeof request !== 'object') {
            console.warn('Invalid rpc, request must be an object');
            return;
        }
        if (!request.id) {
            console.warn('Action id not set');
            return;
        }

        const socket = this.#socket;

        if (this.#cache.has(request.id)) {
            const cached = this.#cache.get(request.id);
            if (cached.state === this.#STATE.EXECUTED) {
                socket.emit(`response-v2-${request.id}`, {
                    message: cached.response,
                    processingTime: cached.processingTime,
                    source: 'cache'
                });
                return;
            }
            else {
                return; // Continue waiting to the response be ready
            }
        }

        this.#cache.insert(request.id, {
            state: this.#STATE.EXECUTING,
            requestedTime: Date.now()
        });
        this.#counter++;

        if (this.#active > this.#MAX_ACTIVE_REQUESTS) {
            socket.emit(`response-v2-${request.id}`, {
                error: 'Max number of active connections achieved'
            });
            return;
        }

        this.#active++;

        try {
            const response = await require('./execute')(request, this.#actions);
            const cached = this.#cache.get(request.id);
            const processingTime = Date.now() - cached.requestedTime;

            this.#cache.update(request.id, {
                state: this.#STATE.EXECUTED,
                requestedTime: cached.requestedTime,
                processingTime: processingTime,
                response: response
            });

            this.#active--;
            socket.emit(`response-v2-${request.id}`, {
                message: response,
                source: 'server',
                processingTime: processingTime
            });
        }
        catch (exc) {
            this.#active--;
            const message = exc instanceof Error ? exc.message : exc;
            socket.emit(`response-v2-${request.id}`, {error: {message}});

            exc instanceof Error && !(exc instanceof global.errors.StandardError) && console.log(exc.stack);
        }
    }

    #onmessage = message => {
        this.onmessage(message).catch(exc => console.error(exc.stack));
    }

    disconnect() {
        this.#socket.on('rpc-v2', this.#onmessage);
    }
}
