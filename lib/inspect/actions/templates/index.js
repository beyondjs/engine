const ipc = require('beyond/utils/ipc');

module.exports = function (plm) {
    this.global = new (require('./global'))(plm);
    this.overwrites = new (require('./overwrites'))(plm);
    this.processors = new (require('./processors'))(plm);
    this.applications = new (require('./applications'))(plm);

    this.data = async rq => {
        const output = [];
        const requests = new Map(rq);
        for (const [requestId, request] of requests) {
            const response = await ipc.exec('engine', 'templates/get', request.fields.id);
            const data = response ? {tu: Date.now(), data: response} : undefined;
            output.push([requestId, data]);
        }

        return output;
    };
};
