const {Resource} = global;
const processSourceMap = require('./process-sourcemap');

module.exports = async function (url, application, distribution) {
    'use strict';

    let {pathname} = url;
    if (pathname.includes('/static/')) return;

    /**
     * Parse the uri
     */
    const parsed = new (require('./uri-parser'))(application, pathname, url.search.slice(1));
    await parsed.process(distribution);
    if (!parsed.valid) return new Resource({'500': parsed.error});

    // Check if it is one of the allowed extensions
    if (!['.js', '.css', '.d.ts', '.json'].includes(parsed.extname) || !parsed.found) return;

    const {is, extname, bundle} = parsed;

    // Transversal bundles does not have a typescript declaration
    // Declarations are always related to module bundles
    if (is === 'transversal' && extname === '.d.ts') {
        return new Resource({'404': 'Transversal bundles does not have a typescript declaration'});
    }
    if (is === 'transversal' && extname === '.css') {
        return new Resource({'404': 'Transversal bundles does not support stylesheets'});
    }

    const {packager, code} = await (async () => {
        await bundle.ready;
        if (!bundle.valid) return {};

        const {language} = parsed;
        const packager = bundle.packagers.get(distribution, language);
        await packager.ready;

        if (extname === '.d.ts') return {packager, code: packager.declaration};
        if (['.js', '.json'].includes(extname)) return {packager, code: packager.js};
        if (extname === '.css') return {packager, code: packager.css};
    })();

    // Check if bundle information is being requested
    if (parsed.info) {
        return is === 'transversal' ?
            await require('./info/transversal')({bundle, code}) :
            await require('./info/bundle')({bundle, code, extname});
    }
    if (!bundle.valid) return new Resource({'500': 'Bundle is invalid'});

    if (!code) return new Resource({'404': `Bundle does not implement a "${extname}" extension`});
    await code.ready;
    if (!code.valid) return new Resource({'500': `Errors found processing bundle code`});

    if (parsed.map) {
        const map = code.map();
        if (!map) return new Resource({'404': `Sourcemap not found`});

        const content = JSON.stringify(processSourceMap(bundle, map));
        return new Resource({content, extname: '.map'});
    }

    if (parsed.bridges) return await require('./bridges')(packager);
    if (extname === '.json') return await require('./json')(bundle, packager, code, parsed);
    if (extname === '.d.ts') return await require('./declaration')(code);
    return await require('./code')(bundle, code, parsed, distribution);
}
