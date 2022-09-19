module.exports = async function (packager, resource) {
    'use strict';

    const {declaration} = packager;
    await declaration.ready;

    const {info} = resource;
    if (info) {
        return await require('./info')({packager, declaration, extname: '.d.ts'});
    }
    else {
        return declaration.valid ?
            new global.Resource({content: declaration.code, extname: '.d.ts'}) :
            new global.Resource({'500': 'Declaration compiled with errors'});
    }
}
