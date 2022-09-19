module.exports = async function (packager, resource, info) {
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

    if (info) {
        return await require('./info')(packager, code);
    }
    else {
        return code.valid ?
            new global.Resource({
                content: require('../sourcemap')(code.code(true), code.map(true), resource.extname),
                extname: resource.extname
            }) :
            new global.Resource({'500': 'Bundle compiled with errors'});
    }
}
