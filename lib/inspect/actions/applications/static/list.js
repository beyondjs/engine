const {ipc} = global.utils;

module.exports = async function (params, session) {
    const requests = new Map(params);
    const monitor = `${session.monitor}-client`;
    const action = 'applications/static/list';
    const {requestProcessed, specs} = setRequest(requests);

    return setResponse(requestProcessed, await ipc.exec(monitor, action, specs));
};

const setRequest = requests => {
    let filters = [];
    const requestProcessed = [];

    for (const [requestId, request] of requests) {
        let id = undefined;
        for (const filter of request.filter) {
            if (filter.field !== 'application') continue;
            id = filter.value;
        }
        requestProcessed.push({requestId: requestId, id: id});
        !filters.includes(id) ? filters.push(id) : null;
    }

    return {requestProcessed: requestProcessed, specs: filters};
};

const setResponse = (requests, ipcData) => {
    const responses = [];

    for (const request of requests) {
        const items = [];
        const entry = ipcData.hasOwnProperty(request.id);
        if (entry && ipcData[request.id]) {
            const sources = ipcData[request.id];
            for (const source of sources) items.push({tu: Date.now(), data: source});
        }
        responses.push([request.requestId, items]);
    }

    return responses;
};