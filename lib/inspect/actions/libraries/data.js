const {ipc} = global.utils;

module.exports = actions => async (params, session) => {
    const libs = [], output = [], requests = [];

    for (const [requestId, request] of params) {
        const id = request.fields.id;
        libs.push(id);
        requests.push([requestId, id]);
    }

    const action = 'libraries/get';
    const monitor = `${session.monitor}-client`;
    let libraries = await ipc.exec(monitor, action, libs);
    libraries = await actions.backends(libraries, 'library');

    for (const [requestId, value] of requests) {
        const response = libraries.hasOwnProperty(value) ? libraries[value] : undefined;
        const data = response ? {tu: Date.now(), data: response} : undefined;
        output.push([requestId, data]);
    }

    return output;
}
