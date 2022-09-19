module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['code.initialised', 'code.change'];
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe = extensions => {
        extensions.forEach(extension => {
            const listeners = this.#listeners;

            extension.on('initialised', listeners.get('code.initialised'));
            extension.on('change', listeners.get('code.change'));
        });
    }

    unsubscribe = processors => processors.forEach(extension => {
        const listeners = this.#listeners;

        extension.off('initialised', listeners.get('code.initialised'));
        extension.off('change', listeners.get('code.change'));
    });
}
