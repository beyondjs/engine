module.exports = class extends require('../base') {
    get dp() {
        return 'bundler.bundle.packager.code.js';
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
        if (!this.children.has('dependencies')) {
            const {distribution, dependencies, bundle: {module}} = this.packager;
            const children = new Map();
            children.set('dependencies', {child: dependencies.code});

            /**
             * The dependencies.packages hash value is required in local environment to support dynamic imports
             */
            distribution.local && children.set('dependencies.packages', {child: module.container.dependencies.packages});
            this.children.register(children);
        }
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

        // Check if the dependencies of the package container are valid
        const pdependencies = this.packager.distribution.local && this.children.get('dependencies.packages').child;
        if (pdependencies && !pdependencies.valid) {
            const errors = [];
            pdependencies.errors.forEach(error => errors.push(`Error on container package dependency: ${error}`));
            return {errors};
        }

        const {packager} = this;
        const transversal = !!global.bundles.get(packager.bundle.type).transversal;

        return require('./package')(this, hmr, transversal);
    }
}
