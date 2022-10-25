const {bundles} = require('beyond/bundlers-registry');

module.exports = class extends require('../base') {
    get dp() {
        return 'bundle.js';
    }

    constructor(packager) {
        super('.js', packager);
    }

    _prepared(require) {
        if (this.updated) return;

        const prepared = super._prepared(require);
        if (typeof prepared === 'string' || (typeof prepared === 'boolean' && !prepared)) return prepared;
        if (!this.children.prepared) return;

        // When the code was returned from cache, and the processors and imports were not registered as a child
        !this.children.has('dependencies') &&
        this.children.register(new Map([['dependencies', {child: this.packager.dependencies.code}]]));
    }

    /**
     * Used by the packager to inject code at the beginning of the bundle.
     * To be overridden. Actually used by the 'bridge' bundle to register the backend host.
     * @private
     */
    _precode() {
    }

    _update(hmr) {
        // Check if the dependencies are all valid
        const dependencies = this.children.get('dependencies').child;
        if (!dependencies.valid) return {errors: dependencies.errors};

        const {packager} = this;
        const transversal = !!bundles.get(packager.bundle.type).transversal;

        return require('./package')(this, hmr, transversal);
    }
}
