const registry = (require('../'));

module.exports = class extends Map {
    #entry;

    constructor(entry) {
        super();
        this.#entry = entry;
    }

    register(pending, id) {
        registry.getConsumersOfDP(pending)?.delete(pending);
        this.set(pending, id);
    }

    clear() {
        this.forEach(pending => registry.getConsumersOfDP(pending)?.delete(pending));
        super.clear();
    }
}
