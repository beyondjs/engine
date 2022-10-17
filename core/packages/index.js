const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Internals = require('./internals');
const Externals = require('./externals');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'packages';
    }

    #internals;
    get internals() {
        return this.#internals;
    }

    #externals;
    get externals() {
        return this.#externals;
    }

    constructor(config) {
        super();
        const internals = this.#internals = new Internals(this, config);
        const externals = this.#externals = new Externals(this);
        super.setup(new Map([['internals', {child: internals}], ['externals', {child: externals}]]));

        this.ready; // Auto-initialise packages collection
    }

    _process() {
        this.clear();
    }
}
