module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['external.initialised', 'external.change']
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe = externals => externals.forEach(external => {
        const listeners = this.#listeners;
        external.on('initialised', listeners.get('external.initialised'));
        external.on('change', listeners.get('external.change'));
    });

    unsubscribe = externals => externals.forEach(external => {
        const listeners = this.#listeners;
        external.off('initialised', listeners.get('external.initialised'));
        external.off('change', listeners.get('external.change'));
    });
}