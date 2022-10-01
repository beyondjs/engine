module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['compiler.change'];
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe(compilers) {
        compilers.forEach(compiler => compiler.on('change', this.#listeners.get('compiler.change')));
    }

    unsubscribe(compilers) {
        compilers.forEach(compiler => compiler.off('change', this.#listeners.get('compiler.change')));
    }
}
