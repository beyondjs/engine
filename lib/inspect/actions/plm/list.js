module.exports = async function (rq, action, filter, process = 'engine') {
    const {requests, params} = prepare(rq, filter);
    return response(requests, await global.utils.ipc.exec(process, action, params));
};

const prepare = (rq, tableFilter) => {
    const filters = [];
    const processed = [];
    const requests = new Map(rq);

    for (const [requestId, request] of requests) {
        let id = undefined;
        for (const filter of request.filter) {
            if (filter.field !== tableFilter) continue;
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