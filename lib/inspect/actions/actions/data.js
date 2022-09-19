const {ipc} = global.utils;

/**
 *
 * @param params parametros de PLM
 * @param action ruta de la llamada
 * @param monitor nombre del proceso donde se solicita la informacion
 * @param multiple campo para validar si la estructura de respuesta es para una llamada list o data
 * @returns [<PLMResponse>] Request Array | Object PLMResponse {tu: number, data: object}
 */
module.exports = async (params, action, monitor, multiple) => {
    const ids = [];
    const output = [];
    const requests = new Map(params);

    for (const [, request] of requests) {
        ids.push(request.fields.id);
    }

    const ipcResponse = await ipc.exec(monitor, action, ids);
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
};