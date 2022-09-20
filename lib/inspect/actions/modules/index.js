module.exports = function (plm) {
    this.static = new (require('./static'))(plm);
    this.declarations = new (require('./declarations'));

    this.data = async params => {
        const requests = new Map(params);

        const ids = [];
        requests.forEach(request => ids.push(request.fields.id));

        const data = await global.utils.ipc.exec('engine', 'modules/get', ids);
        return response(requests, data);
    };

    const response = (requests, ipcResponse) => {
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
