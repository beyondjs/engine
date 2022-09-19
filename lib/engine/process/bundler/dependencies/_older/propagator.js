module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['dependency.change'];
        events.forEach(event => this.#listeners.set(event, (...params) => emitter.emit(event, ...params)));
    }

    subscribe(dependencies) {
        dependencies.forEach(dependency => dependency.on('change', this.#listeners.get('dependency.change')));
    }

    unsubscribe(dependencies) {
        dependencies.forEach(dependency => dependency.off('change', this.#listeners.get('dependency.change')));
    }
}
