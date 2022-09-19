module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['modules.change']
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe(library) {
        library.modules.on('change', this.#listeners.get('modules.change'));
    }

    unsubscribe(library) {
        library.modules.off('change', this.#listeners.get('modules.change'));
    }
}