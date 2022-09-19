module.exports = async function (packager, bundle, resource, distribution, map) {
    'use strict';

    const ext = resource.extname === '.js' ? 'js' : 'css';
    if (!packager[ext]) {
        const is = ext === 'js' ? 'code' : 'stylesheet';
        return global.Resource({'404': `Bundle does not implement a ${is} packager`});
    }

    const code = packager[ext];
    await code.ready;

    if (code.valid && !code.processorsCount) {
        return new global.Resource({'404': `Bundle does not implement "${resource.extname}" extension`});
    }

    const {info} = resource;
    if (info) {
        const {extname} = resource;
        return await require('./info')({packager, code, extname});
    }
    else if (map) {
        const map = code.map();
        let content = typeof map === 'object' ? JSON.stringify(map) : map;
        content = content ? content : '';
        return new global.Resource({content, extname: '.map'});
    }
    else {
        const {hmr, extname} = resource;
        const mode = distribution.maps;
        const content = require('../sourcemap')(bundle, code.code(hmr), code.map(hmr), extname, mode);

        return code.valid ?
            new global.Resource({content, extname: resource.extname}) :
            new global.Resource({'500': 'Bundle compiled with errors'});
    }
}
