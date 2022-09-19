module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['module.initialised', 'module.change'];
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe(modules) {
        modules.forEach(module => module.on('change', this.#listeners.get('module.change')));
    }

    unsubscribe(modules) {
        modules.forEach(module => module.off('change', this.#listeners.get('module.change')));
    }
}