const {BundleJsCode} = require('beyond/plugins/helpers');

module.exports = class extends BundleJsCode {
    _precode() {
        return `const {ActionsBridge} = brequire('@beyond-js/backend/client');\n`;
    }
}
