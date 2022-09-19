module.exports = async function (bundle, code, resource, distribution) {
    'use strict';

    if (resource.is === 'bundle' && !code.processorsCount) {
        return new global.Resource({'404': `Bundle does not implement any processor`});
    }

    const {hmr, extname} = resource;
    const mode = distribution.maps;
    const content = require('./sourcemap')(bundle, resource.is, code.code(hmr), code.map(hmr), extname, mode);

    return new global.Resource({content, extname: resource.extname});
}
