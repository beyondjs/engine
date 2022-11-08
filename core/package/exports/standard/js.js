const {PackageExportCode} = require('beyond/extensible-objects');

module.exports = class extends PackageExportCode {
    get resource() {
        return 'js';
    }

    get hash() {
        return 0;
    }
}
