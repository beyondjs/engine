const fs = require('fs');

/**
 * Determines the js file of the external
 *
 * @param path {string} The path of the package
 * @param module {string} The module resolved from 'module' entry in the package.json
 * @param config {object} The configuration set in the application.json
 */
module.exports = function (path, module, config) {
    const warnings = [];

    let development, production, format;
    if (config.development || config.production) {
        const message = 'Use the property "source" if both development and production files are the same';
        !config.hasOwnProperty('development') && warnings.push(`Development entry not set. ${message}`);
        !config.hasOwnProperty('production') && warnings.push(`Production entry not set. ${message}`);

        config.development = config.development ? config.development : config.production;
        config.production = config.production ? config.production : config.development;

        development = config.development;
        production = config.production;
        format = 'amd';
    }
    else if (config.source) {
        development = config.source;
        production = config.source;
        format = 'amd';
    }
    else if (module) {
        development = module;
        production = module;
        format = 'esm';
    }
    else {
        return {errors: ['Module cannot be determined']};
    }

    const p = require('path');
    development = p.resolve(path, development);
    production = p.resolve(path, production);

    const errors = [];
    const check = file => fs.existsSync(file) && fs.statSync(file).isFile();
    !check(development) && errors.push(`File "${development}" not found`);
    !check(production) && errors.push(`File "${production}" not found`);
    if (errors.length) return {errors};

    const js = new Map();
    const filename = file => {
        const basename = require('path').basename(file);
        return basename.endsWith('.js') ? basename : `${basename}.js`;
    };
    const map = file => check(`${file}.map`);
    js.set('development', {source: development, filename: filename(development), map: map(development), format});
    js.set('production', {source: production, filename: filename(production), map: map(production), format});

    return {warnings, js};
}
