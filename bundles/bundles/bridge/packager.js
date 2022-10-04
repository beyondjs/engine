const {BundlePackager} = require('beyond/bundler-helpers');

module.exports = class extends BundlePackager {
    constructor(...params) {
        super(...params);
        this.dependencies.add('@beyond-js/backend/client');
    }
}
