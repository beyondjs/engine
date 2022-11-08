const {PackageExportCode} = require('beyond/extensible-objects');

module.exports = class extends PackageExportCode {
    get resource() {
        return 'js';
    }

    get hash() {
        return 0;
    }

    async _preprocess() {

    }

    _build() {
        return {code: `console.log('hello world');`};
    }
}
