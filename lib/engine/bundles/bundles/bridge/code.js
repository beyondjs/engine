module.exports = class extends global.BundleJsCode {
    _precode() {
        return `const {ActionsBridge} = brequire('@beyond-js/backend/client');\n`;
    }
}
