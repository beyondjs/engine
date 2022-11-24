const SourceMap = require('../../sourcemap');
const {transformAsync: transform} = require('@babel/core');
const createBabelPlugin = require('./babel-plugin');
const t = require('@babel/types');
const generate = require('@babel/generator').default;

module.exports = async function (targetedExport) {
    const sourcemap = new SourceMap();
    const nsNames = new Map();

    /**
     * To collect the dependencies and exports of all namespaces
     */
    const metadata = {dependencies: new Map(), exports: new Map()};

    for (const {types} of targetedExport.processors.values()) {
        if (!types?.outputs.ims?.size) continue;

        for (const {specifier, code, map} of types.outputs.ims.values()) {
            const nsName = `__ns_${nsNames.size}`;
            nsNames.set(specifier, nsName);

            try {
                const cwd = require.resolve('beyond');
                const dependencies = new Map();
                const exports = new Set();
                const plugin = createBabelPlugin({dependencies, exports});

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

                exports.forEach(name => {
                    const names = metadata.exports.has(specifier) ? metadata.exports.get(specifier) : new Set();
                    names.add(name);
                    metadata.exports.set(specifier, names);
                });

                const identifier = t.identifier(nsName);
                const body = t.TSModuleBlock(transformed.ast.program.body);
                const namespace = t.tsModuleDeclaration(identifier, body);
                const output = generate(namespace, {sourceMaps: true}, {
                    'henry.ts': code
                });

                sourcemap.concat(`// ${specifier}`);
                sourcemap.concat(output.code, null, output.map);
                sourcemap.concat('\n');
            }
            catch (exc) {
                console.log(exc.stack);
            }
        }
    }

    /**
     * Process the exports
     */
    targetedExport.processors.forEach(({types}) => types?.outputs.ims?.forEach(({specifier}) => {
        const nsName = nsNames.get(specifier);
        const exportedNames = metadata.exports.get(specifier);
        exportedNames.forEach(name => {
            sourcemap.concat(`export import ${name} = ${nsName}.${name};`);
        });
    }));

    const {code, map} = sourcemap;
    return {code, map};
}
