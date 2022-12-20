const {minify} = require('uglify-js');

module.exports = async function (baseDir, application, distribution, local) {
    'use strict';

    await application.dependencies.packages.ready;
    const dependencies = [...application.dependencies.packages];
    dependencies.push([application.package, application.version]);

    const __app_package = JSON.stringify({
        specifier: application.package,
        vspecifier: `${application.package}@${application.version}`,
        version: application.version,
        dependencies: dependencies
    });

    let code = '\n';
    code += '<script>\n';
    code += `window.__app_package = ${__app_package};\n\n`;
    code += '// Set global baseDir and baseUrl variables\n';
    code += `const baseDir = window.baseDir = '${baseDir}';\n`;
    code += 'const baseUrl = window.baseUrl = (() => {\n';
    code += '    const {protocol, host, pathname} = location;\n';
    code += '    if (protocol === \'file:\') {\n';
    code += '        const path = pathname.split(\'/\');\n';
    code += '        path.pop(); // Remove \'index.html\'\n';
    code += '        path.join(\'/\');\n';
    code += '        return `file://${path.join(\'/\')}`;\n';
    code += '    }\n';
    code += '    else {\n';
    code += '        return `${protocol}//${host}${baseDir}`;\n';
    code += '    }\n';
    code += '})();\n';
    code += '</script>\n\n';

    /**
     * The required bundles to run at the beginning of the page navigation
     */
    const required = await (async () => {
        const {seekers} = application.modules;

        const required = [];
        const push = async specifier => {
            const seeker = seekers.create(specifier, distribution);
            await seeker.ready;

            const {valid, bundle, external} = seeker;
            seeker.destroy();
            if (!valid) return;

            await bundle?.ready;
            await external?.ready;
            const resource = bundle ? bundle.resource(distribution) : external.resource(distribution);
            required.push(resource);
        }

        if (application.engine !== 'legacy') {
            await push('@beyond-js/widgets/render');
            await push('@beyond-js/widgets/application');
            await push('@beyond-js/widgets/layout');
        }
        else {
            await push('@beyond-js/kernel/styles');
        }

        // console.log('head', local, distribution.development.tools,local && distribution.development.tools && await push('@beyond-js/local/main'))
        local && distribution.development.tools && await push('@beyond-js/local/main');

        return required;
    })();

    code += await (async () => {
        const {mode} = distribution.bundles;
        if (mode === 'sjs') return await require('./sjs')(baseDir, application, distribution, required, local);
        if (mode === 'amd') return await require('./amd')(baseDir, application, distribution, required, local);
        if (mode === 'esm') return await require('./esm')(baseDir, application, distribution, required, local);
        throw new Error(`Invalid distribution bundles mode "${mode}"`);
    })();

    // Add the code to fetch the page when ssr routing is on
    code += await require('./ssr')(application, distribution, local);

    if (distribution.minify.js) {
        let c = minify(code);
        c.error && console.log('error min', JSON.stringify(c.error))
        c.code && console.log('code min', c.code)
    }

    return distribution.minify.js ? minify(code).code : code;
}
