const {BundlePackager} = require('beyond/plugins/helpers');

module.exports = class extends BundlePackager {
    constructor(...params) {
        super(...params);
        this.dependencies.add('@beyond-js/backend/client');
    }
}
