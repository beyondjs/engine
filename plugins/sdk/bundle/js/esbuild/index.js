const BuilderPlugin = require('./plugin');
const {sep} = require('path');

module.exports = async function (conditional) {
    const plugin = new BuilderPlugin(conditional.processors);

    let build;
    try {
        build = await require('esbuild').build({
            entryPoints: ['bundle.js'],
            incremental: true,
            sourcemap: 'external',
            logLevel: 'silent',
            platform: 'browser',
            format: 'esm',
            bundle: true,
            write: false,
            treeShaking: false,
            outfile: 'out.js',
            plugins: [plugin]
        });
    }
    catch (exc) {
        return {errors: [`Error processing bundle: ${exc.message}`]};
    }

    const result = build;
    const {errors, warnings, outputFiles: outputs} = result;
    if (errors?.length) return {errors, warnings};

    const {code, map} = (() => {
        const code = outputs?.find(({path}) => path.endsWith(`${sep}out.js`))?.text;
        const map = outputs?.find(({path}) => path.endsWith(`${sep}out.js.map`))?.text;
        return {code, map};
    })();

    return {code, map, warnings};
}
