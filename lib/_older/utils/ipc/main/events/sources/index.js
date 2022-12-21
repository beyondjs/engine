module.exports = class {
    #sources = new Map;

    // The listeners of the main process
    #listeners;

    constructor(listeners) {
        this.#listeners = listeners;
    }

    // Private method used by the children processes to allow child-child notifications
    emit(sourceName, event, message) {
        // Emit the event to the listeners of the main process
        const key = `${sourceName}|${event}`;
        if (this.#listeners.has(key)) {
            const listeners = this.#listeners.get(key);
            listeners.forEach(listener => {
                try {
                    listener(message);
                }
                catch (exc) {
                    console.warn(`Error emitting event ${key}`, exc.stack);
                }
            });
        }

        // Emit the events to the children processes
        this.#sources.forEach(source => source.emit(sourceName, event, message));
    }

    register = (name, fork) =>
        this.#sources.set(name, new (require('./source'))(this, name, fork));

    destroy() {
        this.#sources.forEach(source => source.destroy());
    }
}
