const {ipc} = global.utils;

module.exports = async function (params) {
    const requests = new Map(params);
    const {requestProcessed, specs} = setRequest(requests);

    return setResponse(requestProcessed, await ipc.exec('engine', 'templates/overwrites/list', specs));
};

const setRequest = requests => {
    let applications = [];
    const requestProcessed = [];

    for (const [requestId, request] of requests) {
        let application = undefined;
        for (const filter of request.filter) {
            if (filter.field !== 'application') continue;
            application = filter.value;
        }

        requestProcessed.push({requestId: requestId, application: application});
        !applications.includes(application) ? applications.push(application) : null;
    }

    return {requestProcessed: requestProcessed, specs: applications};
};

const setResponse = (requests, ipcData) => {
    const responses = [];

    for (const request of requests) {
        const items = [];
        const entry = ipcData.hasOwnProperty(request.application);
        if (entry && ipcData[request.application]) {
            const overwrites = ipcData[request.application];
            for (const overwrite of overwrites) items.push({tu: Date.now(), data: overwrite});
        }
        responses.push([request.requestId, items]);
    }

    return responses;
};