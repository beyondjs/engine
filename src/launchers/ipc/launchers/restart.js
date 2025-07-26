module.exports = launchers => async function (id) {
    'use strict';

    const launcher = await require('./get')(launchers, id);
    if (!launcher) throw new Error(`Requested launcher "${id}" not found`);
    return launcher.restart();
}