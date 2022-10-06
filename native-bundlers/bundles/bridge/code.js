const {BundleJsCode} = require('beyond/bundler-helpers');

module.exports = class extends BundleJsCode {
    _precode() {
        return `const {ActionsBridge} = require('@beyond-js/backend/client');\n`;
    }
}
