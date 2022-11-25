const SourceMap = require('../../sourcemap');
const {transformAsync: transform} = require('@babel/core');
const createBabelPlugin = require('./babel-plugin');
const t = require('@babel/types');
const generate = require('@babel/generator').default;

module.exports = async function ({ims, dependencies, exports}) {
    const sourcemap = new SourceMap();
    const nsNames = new Map();

    /**
     * To collect information about the name of the variable exported from the namespace as the default export
     * required since the name "default" cannot be used as it is a reserved name
     * @type {{default: string}}
     */
    const info = {};

    /**
     * To collect the dependencies and exports of all namespaces
     */
    for (const {specifier, code, map} of ims) {
        const nsName = `__ns_${nsNames.size}`;
        nsNames.set(specifier, nsName);

        try {
            const cwd = require.resolve('beyond');
            const plugin = createBabelPlugin(info);
            const transformed = await transform(code, {
                cwd,
                sourceType: 'module',
                inputSourceMap: map,
                ast: true,
                code: false,
                sourceMaps: false,
                plugins: [
                    ['@babel/plugin-syntax-typescript', {dts: true}],
                    plugin
                ]
            });

            const identifier = t.identifier(nsName);
            const body = t.TSModuleBlock(transformed.ast.program.body);
            const namespace = t.tsModuleDeclaration(identifier, body);
            namespace.declare = true;

            const sources = {};
            sources[specifier] = code;
            const output = generate(namespace, {sourceMaps: true}, sources);

            sourcemap.concat(`// ${specifier}`);
            sourcemap.concat(output.code, null, output.map);
            sourcemap.concat('\n');
        }
        catch (exc) {
            console.log(exc.stack);
        }
    }

    exports?.forEach(({imSpecifier, name}) => {
        const nsName = nsNames.get(imSpecifier);
        name === 'default' ?
            sourcemap.concat(`export default ${nsName}.${info.default};`) :
            sourcemap.concat(`export import ${name} = ${nsName}.${name};`);
    });

    const {code, map} = sourcemap;
    return {code, map};
}
