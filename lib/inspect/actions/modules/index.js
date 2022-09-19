const {ipc} = global.utils;

module.exports = function (actions) {
    this.static = new (require('./static'))(actions);
    this.declarations = new (require('./declarations'));

    this.data = async (params, session) => {
        const action = 'modules/get';
        const requests = new Map(params);
        const monitor = `${session.monitor}-client`;

        const ids = [];
        requests.forEach(request => ids.push(request.fields.id));

        const data = await ipc.exec(monitor, action, ids);
        return setResponse(requests, data);
    };

    const setResponse = (requests, ipcResponse) => {
        const output = [];

        for (const [requestId, request] of requests) {
            if (!ipcResponse) {
                output.push([requestId, undefined]);
                continue;
            }

            if (!ipcResponse.hasOwnProperty(request.fields.id)) {
                output.push([requestId, undefined]);
                continue;
            }
            const data = {tu: Date.now(), data: ipcResponse[request.fields.id]};
            output.push([requestId, data]);
        }

        return output;
    };
};
