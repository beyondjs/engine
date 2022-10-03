const ipc = require('beyond/utils/ipc');

module.exports = plm => async params => {
    const libs = [], output = [], requests = [];

    for (const [requestId, request] of params) {
        const id = request.fields.id;
        libs.push(id);
        requests.push([requestId, id]);
    }

    const action = 'libraries/get';
    let libraries = await ipc.exec('engine', action, libs);
    libraries = await plm.backends(libraries, 'library');

    for (const [requestId, value] of requests) {
        const response = libraries.hasOwnProperty(value) ? libraries[value] : undefined;
        const data = response ? {tu: Date.now(), data: response} : undefined;
        output.push([requestId, data]);
    }

    return output;
}