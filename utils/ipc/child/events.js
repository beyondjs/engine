module.exports = class {
    #listeners = new Map;

    constructor() {
        process.on('message', this.#onmessage);
    };

    emit = (event, message) => process.send({
        type: 'ipc.event.emit',
        event: event,
        message: message
    });

    on(source, event, listener) {
        if (typeof source !== 'string' || typeof event !== 'string' || typeof listener !== 'function') {
            throw new Error('Invalid parameters');
        }

        const key = `${source}|${event}`;
        !this.#listeners.has(key) &&
        process.send({
            type: 'ipc.add.event.listener',
            source: source,
            event: event
        });

        let listeners;
        if (this.#listeners.has(key)) {
            listeners = this.#listeners.get(key);
        }
        else {
            listeners = new Set;
            this.#listeners.set(key, listeners);
        }
        listeners.add(listener);
    }

    off(source, event, listener) {
        if (typeof source !== 'string' || typeof event !== 'string' || typeof listener !== 'function') {
            throw new Error('Invalid parameters');
        }

        const key = `${source}|${event}`;

        let listeners;
        if (!this.#listeners.has(key)) {
            console.warn(`No listeners registered with key "${key}"`);
            return;
        }

        listeners = this.#listeners.get(key);
        if (!listeners.has(listener)) {
            console.warn(`The specified listener is not registered with key "${key}"`);
            return;
        }

        listeners.delete(listener);

        !listeners.size &&
        this.#listeners.delete(key) &&
        process.send({
            type: 'ipc.remove.event.listener',
            source: source,
            event: event
        });
    }

    #exec = message => {
        const key = `${message.source}|${message.event}`;
        if (!this.#listeners.has(key)) {
            console.warn(`Received an event with no listeners registered "${key}"`);
            return;
        }

        const listeners = this.#listeners.get(key);
        listeners.forEach(listener => {
            // Execute the listener
            try {
                listener(message.message);
            }
            catch (exc) {
                console.error(`Error executing listener of event "${key}"`, exc.stack);
            }
        });
    }

    #onmessage = message => {
        if (typeof message !== 'object' || message.type !== 'ipc.event.dispatch') return;
        if (!message.source || !message.event) {
            console.error('Invalid event message received', message);
            return;
        }

        this.#exec(message);
    }

    destroy() {
        process.removeListener('message', this.#onmessage);
    }
}
