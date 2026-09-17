/**
 *
 * @param params PLM parameters
 * @param action request route
 * @param monitor name of the process from which information is requested
 * @param multiple flag indicating whether the response structure is for a list or data request
 * @returns [<PLMResponse>] Request Array | Object PLMResponse {tu: number, data: object}
 */
module.exports = async (params, action, monitor = 'engine', multiple) => {
    const ids = [];
    const output = [];
    const requests = new Map(params);

    for (const [, request] of requests) ids.push(request.fields.id);

    const ipcResponse = await global.utils.ipc.exec(monitor, action, ids);
    for (const [requestId, request] of requests) {
        if (!ipcResponse || !ipcResponse.hasOwnProperty(request.fields.id)) {
            output.push([requestId, undefined]);
            continue;
        }

        const response = multiple ? [] : {};
        const value = ipcResponse[request.fields.id];
        if (multiple) response.push({tu: Date.now(), data: value});
        else {
            response.tu = Date.now();
            response.data = value;
        }

        output.push([requestId, response]);
    }

    return output;
}