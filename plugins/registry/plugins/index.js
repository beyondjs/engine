module.exports = class extends require('../registry') {
    get dp() {
        return 'plugins-registry';
    }

    get transversals() {
        return new Map([...this].filter(([name, bundle]) => bundle.transversal && [name, bundle]));
    }

    constructor(config) {
        super('plugins', config);
    }
}
