const Attributes = require('./attributes');
const Dependencies = require('./dependencies');
const Modules = require('./modules');
const Static = require('./static');

module.exports = class extends Attributes {
    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    #_static;
    get static() {
        return this.#_static;
    }

    async _begin() {
        await super._begin();

        this.#dependencies = new Dependencies(this);
        this.#modules = new Modules(this);
        this.#_static = new Static(this.watcher);
    }

    _process(config) {
        this.#_static.configure(this.path, config.static);
        this.#modules.configure(config.modules, config.exports);

        return super._process(config);
    }

    destroy() {
        super.destroy();
        this.#modules?.destroy();
        this.#_static?.destroy();
    }
}
