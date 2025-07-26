module.exports = launchers => async function (rq) {
    'use strict';

    const ids = typeof rq === 'string' ? [rq] : rq;
    if (!ids) return;

    const output = {};
    for (const id of ids) {
        const launcher = await require('./get')(launchers, id);
        if (!launcher) continue;

        output[id] = {
            id: id,
            status: launcher.status,
            pid: launcher.pid,
            path: launcher.specs.path,
            error: launcher.error,
            ports: launcher.specs.ports
        };
    }

    return typeof rq === 'string' ? output[rq] : output;
}
