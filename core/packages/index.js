const DynamicProcessor = require('beyond/utils/dynamic-processor');
const Internals = require('./internals');
const externals = require('beyond/externals/installs');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'packages';
    }

    #internals;
    get internals() {
        return this.#internals;
    }

    constructor(config) {
        super();
        const internals = this.#internals = new Internals(config);

        // Remove externals initialisation
        externals.ready

        super.setup(new Map([
            ['internals', {child: internals}],
            ['externals', {child: externals}]
        ]));

        this.ready; // Auto-initialise packages collection
    }

    _process() {
        console.log('Processing packages:', [...externals.keys()]);
    }
}
