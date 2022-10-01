module.exports = async function (params) {
    const requests = new Map(params);
    const {requestProcessed, specs} = setRequest(requests);

    return setResponse(requestProcessed, await global.utils.ipc.exec('main', 'launchers/list', specs));
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
            for (const item of ipcData[request.id]) items.push({tu: Date.now(), data: item});
        }
        responses.push([request.requestId, items]);
    }

    return responses;
};