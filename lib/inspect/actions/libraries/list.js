module.exports = actions => async (params, session) => {
    const calls = [], output = [];
    const requests = new Map(params);
    const action = 'libraries/list';
    const monitor = `${session.monitor}-client`;

    let libraries = {};
    for (const [requestId] of requests) {
        libraries = {...libraries, ...await global.utils.ipc.exec(monitor, action, params)}
        calls.push([requestId, Object.keys(libraries)]);
    }

    libraries = await actions.backends(libraries, 'library');

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
