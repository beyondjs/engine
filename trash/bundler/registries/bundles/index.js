module.exports = class extends require('../registry') {
    get dp() {
        return 'bundles-registry';
    }

    get transversals() {
        return new Map([...this].filter(([name, bundle]) => bundle.transversal && [name, bundle]));
    }

    constructor(config) {
        super('bundles', config);
    }
}
