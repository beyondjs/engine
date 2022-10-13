const ipc = require('beyond/utils/ipc');

module.exports = () => async params => {
    const apps = [], output = [], requests = [];

    for (const [requestId, request] of params) {
        const id = parseInt(request.fields.id);
        apps.push(id);
        requests.push([requestId, id]);
    }

    const action = 'applications/get';
    const applications = await ipc.exec('engine', action, apps);

    for (const [requestId, value] of requests) {
        const response = applications.hasOwnProperty(value) ?
            {tu: Date.now(), data: applications[value]} : undefined;
        output.push([requestId, response]);
    }
    return output;
}