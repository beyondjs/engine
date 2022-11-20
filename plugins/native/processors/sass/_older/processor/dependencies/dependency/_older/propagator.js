module.exports = class {
    #listeners = new Map();
    #previous;

    constructor(emitter) {
        const events = ['processors.change'];
        events.forEach(event => this.#listeners.set(event, (...params) => emitter.emit(event, ...params)));
    }

    subscribe(dependency) {
        const {bundle, distribution, language} = dependency;
        const {processors} = bundle ? bundle.packagers.get(distribution, language) : {};
        if (processors === this.#previous) return;

        this.unsubscribe();
        this.#previous = processors;
        processors?.on('change', this.#listeners.get('processors.change'));
    }

    unsubscribe() {
        this.#previous?.off('change', this.#listeners.get('processors.change'));
    }
}
