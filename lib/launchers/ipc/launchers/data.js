module.exports = instances => async function (rq, instance) {
    'use strict';

    const ids = typeof rq === 'string' ? [rq] : rq;
    if (!ids) return;

    const output = {};
    for (const id of ids) {
        const bee = await require('./get')(instances, instance, id);
        if (!bee) continue;

        output[id] = {
            id: id,
            status: bee.status,
            pid: bee.pid,
            path: bee.specs.path,
            error: bee.error,
            ports: bee.specs.ports
        };
    }

    return typeof rq === 'string' ? output[rq] : output;
}
