module.exports = class {
    #listeners = new Map();

    constructor(emitter) {
        const events = ['item.change'];
        events.forEach(event => this.#listeners.set(event, () => emitter.emit(event)));
    }

    subscribe(items) {
        items.forEach(item => item.on('change', this.#listeners.get('item.change')));
    }

    unsubscribe(items) {
        items.forEach(item => item.off('change', this.#listeners.get('item.change')));
    }
}
