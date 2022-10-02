module.exports = instances => async function () {
    'use strict';

    const bee = await require('./bee')(instances);
    return bee.specs;
}
