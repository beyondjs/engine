module.exports = class extends global.TransversalCodePackager {
    /**
     * Start transversal code packager constructor
     *
     * @param tp {object} The transversal packager
     * @param params
     */
    constructor(tp, ...params) {
        super(tp, ...params);
        const {distribution} = tp;
        const {application} = tp.transversal;

        super.setup(new Map([
            ['bundles', {child: new (require('./bundles'))(application, distribution)}]
        ]));
    }

    _generate() {
        const {sourcemap: input} = super._generate();
        if (input.errors) return input;

        const bundles = this.children.get('bundles').child;
        const {transversal, distribution} = this.tp;
        const {application} = transversal;

        const sourcemap = new (require('./sourcemap'))();

        // The bundles start code
        bundles.code && sourcemap.concat(bundles.code);

        // The code of the bundles of the libraries and modules
        sourcemap.concat(input.code, input.map);
        return {sourcemap};
    }

    _post(input) {
        const {application, distribution} = this.tp;
        const {platforms} = global;
        const {platform} = distribution;

        if (platforms.node.includes(platform)) return input;
        if (distribution.bundles.mode !== 'amd') return input;

        const baseDir = platforms.web.includes(platform) ? `/${distribution.baseDir}` : distribution.baseDir;
        const baseUrl = `${baseDir}packages`;
        const pkg = application.package;

        let code = '';
        code += `const baseDir = '${baseDir}';\n`;
        code += 'const baseUrl = (() => {\n';
        code += '    const {protocol, host, pathname} = location;\n';
        code += '    if (protocol === \'file:\') {\n';
        code += '        const path = pathname.split(\'/\');\n';
        code += '        path.pop(); // Remove \'index.html\'\n';
        code += '        path.join(\'/\');\n';
        code += '        return `${protocol}//${path.join(\'/\')}`;\n';
        code += '    }\n';
        code += '    else {\n';
        code += '        const baseUrl = baseDir === \'/\' ? \'\' : baseDir;\n';
        code += '        return `${protocol}//${host}${baseUrl}`;\n';
        code += '    }\n';
        code += '})();\n';
        code += `const paths = {'${pkg}': baseUrl};\n`;
        code += `requirejs.config({baseUrl: '${baseUrl}', paths});\n\n`;

        const sourcemap = new (require('./sourcemap'))();
        sourcemap.concat(code);
        sourcemap.concat(input.code, input.map);
        return sourcemap;
    }
}
