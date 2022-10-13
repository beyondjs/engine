const ipc = require('beyond/utils/ipc');

module.exports = plm => async params => {
    const calls = [], output = [];
    const requests = new Map(params);
    const action = 'libraries/list';

    let libraries = {};
    for (const [requestId] of requests) {
        libraries = {...libraries, ...await ipc.exec('engine', action, params)}
        calls.push([requestId, Object.keys(libraries)]);
    }

    libraries = await plm.backends(libraries, 'library');

    for (const [requestId, entries] of calls) {
        const response = [];
        for (const entry of entries) {
            if (!libraries.hasOwnProperty(entry)) continue;
            response.push({tu: Date.now(), data: libraries[entry]});
        }
        output.push([requestId, response.length ? response : []]);
    }

    return output;
}
