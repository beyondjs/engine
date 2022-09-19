const {ipc} = global.utils;

module.exports = async function (params, session) {
    const monitor = `${session.monitor}-client`;
    const requests = new Map(params);
    const {requestProcessed, specs} = setRequest(requests);

    const action = 'templates/applications/sources/list';
    const data = await ipc.exec(monitor, action, specs);

    return setResponse(requestProcessed, data);
};

const setRequest = requests => {
    const filters = [];
    const requestProcessed = [];

    for (const [requestId, request] of requests) {
        let id = undefined;
        for (const filter of request.filter) {
            if (filter.field !== 'application') continue;
            id = filter.value;
        }
        requestProcessed.push({requestId: requestId, application: id});
        !filters.includes(id) ? filters.push(id) : null;
    }

    return {requestProcessed: requestProcessed, specs: filters};
};

const setResponse = (requests, ipcData) => {
    const responses = [];

    for (const request of requests) {
        const items = [];
        if (ipcData && ipcData.hasOwnProperty(request.application)) {
            const sources = ipcData[request.application];
            for (const source of sources) items.push({tu: Date.now(), data: source});
        }
        responses.push([request.requestId, items]);
    }

    return responses;
};