module.exports = class extends global.BundleJsCode {
    _precode() {
        return `const {ActionsBridge} = require('@beyond-js/backend/client');\n`;
    }
}
