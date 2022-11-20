const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'plugin.export.config';
    }

    #value;
    get value() {
        return this.#value;
    }

    _prepared() {
        return !!this.#value;
    }

    set(value) {
        this.#value = value;
        this._invalidate();
    }
}
