module.exports = async function (declaration) {
    'use strict';

    await declaration.ready;
    return new global.Resource({content: declaration.code, extname: '.d.ts'});
}
