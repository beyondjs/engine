const ipc = require('beyond/utils/ipc');

module.exports = async function (params) {
    const requests = new Map(params);

    let bundles = {};
    const calls = [], output = [];
    for (const [requestId] of requests) {
        bundles = {...await ipc.exec('engine', 'bundles/list', params)};
        calls.push([requestId, Object.keys(bundles)]);
    }

    for (const [requestId, entries] of calls) {
        const response = [];
        for (const entry of entries) {
            if (!bundles.hasOwnProperty(entry)) continue;
            response.push({tu: Date.now(), data: bundles[entry]});
        }
        output.push([requestId, response.length ? response : []]);
    }

    return output;
};