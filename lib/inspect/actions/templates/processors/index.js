const {ipc} = global.utils;

module.exports = function (actions) {
    this.sources = new (require('./sources'))(actions);

    const setResponse = (requests, ipcResponse) => {
        const responses = [];

        for (const [requestId, request] of requests) {
            for (const response of Object.values(ipcResponse)) {
                if (response.hasOwnProperty(request.fields.id)) {
                    const data = {tu: Date.now(), data: response[request.fields.id]};
                    responses.push([requestId, data]);
                }
            }
        }

        return responses;
    };

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const requests = new Map(params);

        const processors = [];
        requests.forEach(request => processors.push(request.fields.id));

        const action = 'templates/processors/get';
        const data = await ipc.exec(monitor, action, processors);

        return setResponse(requests, data);
    };
};