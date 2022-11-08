const {PackageExportCode} = require('beyond/extensible-objects');

module.exports = class extends PackageExportCode {
    get resource() {
        return 'js';
    }

    get hash() {
        return 0;
    }

    constructor(conditional) {
        super(conditional, {preprocessor: true});
    }

    async _preprocess() {
        const {platform, entry} = this.conditional;
        console.log('Build the standard export', entry, platform);
    }

    _build() {
        return {code: `console.log('hello world');`};
    }
}
