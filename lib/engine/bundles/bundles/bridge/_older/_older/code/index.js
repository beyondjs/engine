module.exports = class extends global.BundleJsCode {
    constructor(...params) {
        super(...params);

        const {application, distribution} = this.packager;
        const host = new (require('./host'))(application, distribution);
        super.setup(new Map([['host', {child: host}]]));
    }

    _precode() {
        const host = this.children.get('host').child;

        let code = '';
        code += `const backends = require('@beyond-js/backend/client/ts');\n`;
        code += `backends.register('${host.bee}', '${host.value}')`;

        return code;
    }

    destroy() {
        super.destroy();

        const host = this.children.get('host').child;
        host.destroy();
    }
}
