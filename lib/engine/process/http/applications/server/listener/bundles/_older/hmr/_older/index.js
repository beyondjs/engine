module.exports = async function (url, application, distribution) {
    'use strict';

    const extname = require('path').extname(url.pathname);
    if(extname !== '.js') return;

    let bundle = url.pathname.substr(1, url.pathname.length - extname.length - 1);
console.log(extname, bundle, url.pathname);
    if (!bundle) return;

    let split = bundle.split('/');
    bundle = split.pop();

    let parsed = /(.*)\[(.*)\]/.exec(bundle);
    if (!parsed || parsed.length !== 3) return;
    bundle = parsed[1];
    let processor = parsed[2];

    bundle = bundle.split('.');
    if (bundle.length > 2) return;
    const language = bundle.length === 2 ? bundle[1] : undefined;
    bundle = bundle[0];

    if (language && language.length !== 3) return;

    let module = split.join('/');
    await application.modules.ready;
    if (!(application.modules.pathnames.has(module))) return;
    module = application.modules.pathnames.get(module);
    await module.ready;
    await module.bundles.ready;

    if (!module.bundles.has(bundle)) {
        return new global.Resource({'404': `Module "${module.pathname}" does not have a "${bundle}" bundle`});
    }
    bundle = module.bundles.get(bundle);

    const packager = bundle.packagers.get(distribution, language);
    await packager.ready;
    await packager.code.ready;

    const {errors, code, map} = packager.code.hmr(processor);

    return !errors?.length ?
        new global.Resource({
            content: require('../sourcemap')(code, map),
            extname: '.js'
        }) :
        new global.Resource({'500': 'Bundle compiled with errors'});
}
