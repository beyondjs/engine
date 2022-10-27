module.exports = class {
    #plugin;
    #instances = new Map();

    constructor(plugin) {
        this.#plugin = plugin;
    }

    destroy() {
        this.#instances.forEach(instance => instance.destroy());
        this.#instances.clear();
    }
}
