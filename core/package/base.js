const Attributes = require('./attributes');
const Dependencies = require('./dependencies');
const Modules = require('./modules');
const Static = require('./static');
const equal = require('beyond/utils/equal');

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

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    async _begin() {
        await super._begin();

        this.#dependencies = new Dependencies(this);
        this.#modules = new Modules(this);
        this.#_static = new Static(this);
    }

    _process(config, errors, warnings) {
        errors = errors ? errors : [];
        warnings = warnings ? warnings : [];

        let changed = super._process(config, errors, warnings);
        changed = changed || !equal(errors, this.#errors) || !equal(warnings, this.#warnings);

        this.#errors = errors;
        this.#warnings = warnings;
        this.#dependencies.configure(config.dependencies);
        this.#_static.configure(this.path, config.static);
        this.#modules.configure(config);

        return changed;
    }

    destroy() {
        super.destroy();
        this.#modules?.destroy();
        this.#_static?.destroy();
        this.#dependencies?.destroy();
    }
}
