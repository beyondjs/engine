module.exports = actions => async (params, session) => {
    const calls = [], output = [];
    const requests = new Map(params);
    const action = 'applications/list';
    const monitor = `${session.monitor}-client`;

    let applications = {};
    const items = await global.utils.ipc.exec(monitor, action, params);
    //All requests receive the same items
    for (const [requestId] of requests) {
        applications = {...applications, ...items};
        calls.push([requestId, Object.keys(items)]);
    }

    applications = await actions.backends(applications, 'application');

    for (const [requestId, entries] of calls) {
        const response = [];
        for (const entry of entries) {
            if (!applications.hasOwnProperty(entry)) continue;
            response.push({tu: Date.now(), data: applications[entry]});
        }
        output.push([requestId, response.length ? response : []]);
    }

    return output;
}