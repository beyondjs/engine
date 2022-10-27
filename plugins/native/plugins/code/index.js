const {Plugin} = require('beyond/plugins/helpers');
const {BundleTypes, JS} = require('');

module.exports = class extends Plugin {
    get name() {
        return 'code';
    }

    outputs() {
        const {name} = this.config;

        return new Map([
            [`${name}.d.ts`, BundleTypes],
            [`${name}.js`, JS]
        ]);
    }
}
