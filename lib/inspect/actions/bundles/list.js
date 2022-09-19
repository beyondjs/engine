module.exports = async function (params, session) {
    const requests = new Map(params);
    const monitor = `${session.monitor}-client`;
    const action = 'bundles/list';

    let bundles = {};
    const calls = [], output = [];
    for (const [requestId] of requests) {
        bundles = {...await global.utils.ipc.exec(monitor, action, params)};
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