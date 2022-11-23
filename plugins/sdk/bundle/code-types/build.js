const SourceMap = require('../../sourcemap');
const {transformAsync: transform} = require('@babel/core');
const babelPlugin = require('./babel-plugin');

module.exports = async function (targetedExport) {
    const sourcemap = new SourceMap();

    const sources = new Map();
    for (const processor of targetedExport.processors.values()) {
        const {types, path} = processor;
        if (!types?.outputs.ims?.size) continue;

        for (const {code, map} of types.outputs.ims.values()) {
            try {
                const cwd = require.resolve('beyond');

                const transformed = await transform(code, {
                    cwd,
                    sourceType: 'module',
                    inputSourceMap: map,
                    sourceMaps: true,
                    plugins: [
                        ['@babel/plugin-syntax-typescript', {dts: true, isTSX: true}],
                        babelPlugin
                    ]
                });
                console.log('Original code:', code);
                console.log('Original map:', map);
                console.log('Transformed code:', transformed.code);
                console.log('Transformed map:', transformed.map);
            }
            catch (exc) {
                console.log('ERROR FOUND!!');
                console.log(exc.stack);
            }
        }
    }

    // const imports = new (require('./transform'))(compiler, tsSources, compiler.files);
    // require('./namespaces')(compiler, tsSources);
    //
    // let output = '';
    // imports.dependencies.forEach((name, module) => {
    //     output += `import * as ${name} from '${module}';\n`;
    // });
    // imports.dependencies.size ? (output += '\n') : null;
    //
    // const printer = ts.createPrinter();
    // tsSources.forEach((source, file) => {
    //     const code = printer.printFile(source);
    //     if (!code) return;
    //
    //     output += `// FILE: ${file}\n`;
    //     output += code;
    //     output += '\n';
    // });


    const {code, map} = sourcemap;
    return {code, map};

    // let code = '';
    // const compiler = this.compiler;
    // code += require('./modules')(compiler);
    // code += require('./exports')(compiler);
    // return code;
}
