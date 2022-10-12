const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Internals = require('./internals');
const Externals = require('beyond/externals');

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
        const internals = this.#internals = new Internals(config);
        const externals = this.#externals = new Externals();

        // Remove externals initialisation
        externals.ready

        super.setup(new Map([
            ['internals', {child: internals}],
            ['externals', {child: externals}]
        ]))
    }

    _process() {

    }
}
