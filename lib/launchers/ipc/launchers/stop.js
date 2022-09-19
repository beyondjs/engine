module.exports = instances => async function (id, instance) {
    'use strict';

    const bee = await require('./get')(instances, instance, id);
    if (!bee) throw new Error(`Requested bee "${id}" not found`);
    return bee.stop();
}