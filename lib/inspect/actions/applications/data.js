const {ipc} = global.utils;

module.exports = () => async (params, session) => {
    const apps = [], output = [], requests = [];

    for (const [requestId, request] of params) {
        const id = parseInt(request.fields.id);
        apps.push(id);
        requests.push([requestId, id]);
    }

    const action = 'applications/get';
    const monitor = `${session.monitor}-client`;
    const applications = await ipc.exec(monitor, action, apps);

    for (const [requestId, value] of requests) {
        const response = applications.hasOwnProperty(value) ?
            {tu: Date.now(), data: applications[value]} : undefined;
        output.push([requestId, response]);
    }
    return output;
}