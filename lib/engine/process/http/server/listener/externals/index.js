const {join} = require('path');
const {platforms} = global;

module.exports = async function (url, application, distribution) {
    'use strict';

    let {pathname} = url;
    if (!pathname.startsWith('/packages/')) return;

    if (platforms.node.includes(distribution.platform)) {
        return new global.Resource({'500': 'External package is not supported if execution environment is "node"'});
    }

    // Remove the extension
    let extname = pathname.endsWith('.js.map') ? '.js.map' : void 0;
    extname = extname ? extname : (pathname.endsWith('.d.ts') ? '.d.ts' : '');
    extname = extname ? extname : (pathname.endsWith('.js') ? '.js' : '');
    pathname = pathname.slice(0, pathname.length - extname.length);
    if (pathname.endsWith('/')) return; // Ex: packages/engine.io-parser@5.0.4/.js

    if (extname === '.d.ts') {
        return new global.Resource({'500': 'External package extension .d.ts actually not supported'});
    }

    const {bundle, pkg} = require('./parser')(pathname);

    // Check if package is an application library
    await application.libraries.ready;
    if (application.libraries.has(pkg)) return;

    if (!['.js', '.js.map'].includes(extname)) {
        return new global.Resource({'500': 'Package extension is invalid'});
    }

    const specs = {
        cwd: application.path,
        temp: join(application.path, '.beyond/uimport'),
        cache: join(process.cwd(), '.beyond/uimport'),
        versions: true
    };
    const {mode} = distribution.bundles;
    const {code, map, dependencies, errors} = await require('uimport')(bundle, mode, specs);

    const info = url.searchParams.has('info');
    if (info) {
        return await require('./info')(errors, dependencies);
    }

    if (errors) {
        return new global.Resource({'500': `External resource has been processed with errors`});
    }

    let content = extname === '.js.map' ? map : code;
    content = content ? content : '';
    return new global.Resource({content, extname});
}