module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['extension.hash.change'];
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe = extensions => {
        extensions.forEach(exthash => exthash.on('change', this.#listeners.get('extension.hash.change')));
    }

    unsubscribe = extensions => {
        extensions.forEach(exthash => exthash.off('change', this.#listeners.get('extension.hash.change')));
    }
}
