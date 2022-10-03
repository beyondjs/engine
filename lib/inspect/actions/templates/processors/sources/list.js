const ipc = require('beyond/utils/ipc');

module.exports = async function (rq) {
    const {requests, params} = prepare(rq);
    return response(requests, await ipc.exec('engine', 'templates/processors/sources/list', params));
};

const prepare = rq => {
    const filters = [];
    const processed = [];
    const requests = new Map(rq);

    for (const [requestId, request] of requests) {
        let id = undefined;
        for (const filter of request.filter) {
            if (filter.field !== 'id') continue;
            id = filter.value;
        }
        processed.push({requestId: requestId, id: id});
        !filters.includes(id) ? filters.push(id) : null;
    }

    return {requests: processed, params: filters};
}

const response = (requests, data) => {
    const responses = [];
    for (const request of requests) {
        const items = [];
        const entries = data.hasOwnProperty(request.id) ? data[request.id] : [];
        for (const entry of entries) items.push({tu: Date.now(), data: entry});
        responses.push([request.requestId, items]);
    }

    return responses;
}
