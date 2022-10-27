module.exports = class extends global.BundleJsCode {
    _precode() {
        const {application, distribution} = this.packager;
        const bee = `${application.package}/${distribution.name}`;
        const host = distribution.local ? 'localhost' : distribution.host;

        const destructure = distribution.local ? 'ActionsBridge' : 'backends, ActionsBridge';
        let code = '';
        code += `const {${destructure}} = require('@beyond-js/backend/client');\n`;
        code += distribution.local ? '' : `backends.register('${bee}', '${host}')`;

        return code;
    }
}
