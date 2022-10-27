module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['compiler.initialised', 'compiler.change'];
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe = compilers => {
        compilers.forEach(compiler => {
            const listeners = this.#listeners;
            compiler.on('initialised', listeners.get('compiler.initialised'));
            compiler.on('change', listeners.get('compiler.change'));
        });
    }

    unsubscribe = compilers => compilers.forEach(compiler => {
        const listeners = this.#listeners;

        compiler.off('initialised', listeners.get('compiler.initialised'));
        compiler.off('change', listeners.get('compiler.change'));
    });
}
