module.exports = function (helpers) {
    this.global = new (require('./global'))(helpers);
    this.overwrites = new (require('./overwrites'))(helpers);
    this.processors = new (require('./processors'))(helpers);
    this.applications = new (require('./applications'))(helpers);

    this.data = async rq => {
        const output = [];
        const {ipc} = global.utils;
        const requests = new Map(rq);
        for (const [requestId, request] of requests) {
            const response = await ipc.exec('engine', 'templates/get', request.fields.id);
            const data = response ? {tu: Date.now(), data: response} : undefined;
            output.push([requestId, data]);
        }

        return output;
    };
};
