module.exports = () => async params => {
    const apps = [], output = [], requests = [];

    for (const [requestId, request] of params) {
        const id = parseInt(request.fields.id);
        apps.push(id);
        requests.push([requestId, id]);
    }

    const action = 'applications/get';
    const applications = await global.utils.ipc.exec('engine', action, apps);

    for (const [requestId, value] of requests) {
        let response;
        applications.hasOwnProperty(value) && (response = {tu: Date.now(), data: applications[value]});
        output.push([requestId, response]);
    }
    return output;
}