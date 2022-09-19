module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['declaration.initialised', 'declaration.change'];
        events.forEach(event => this.#listeners.set(event, (...params) => emitter.emit(event, ...params)));
    }

    subscribe(dependency) {
        const listeners = this.#listeners;

        const {seeker} = dependency;
        seeker.on('declaration.initialised', listeners.get('declaration.initialised'));
        seeker.on('declaration.change', listeners.get('declaration.change'));
    }

    unsubscribe(dependency) {
        const listeners = this.#listeners;

        const {seeker} = dependency;
        seeker.off('declaration.initialised', listeners.get('declaration.initialised'));
        seeker.off('declaration.change', listeners.get('declaration.change'));
    }
}
