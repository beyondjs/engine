module.exports = class extends global.DependenciesPropagator {
    #listeners = new Map();

    constructor(emitter) {
        super(emitter);

        const events = ['declaration.change'];
        events.forEach(event => this.#listeners.set(event, (...params) => emitter.emit(event, ...params)));
    }

    subscribe(dependencies) {
        super.subscribe(dependencies);
        dependencies.forEach(({declaration}) => declaration.on('change', this.#listeners.get('declaration.change')));
    };

    unsubscribe(dependencies) {
        super.unsubscribe(dependencies);
        dependencies.forEach(({declaration}) => declaration.off('change', this.#listeners.get('declaration.change')));
    }
}
