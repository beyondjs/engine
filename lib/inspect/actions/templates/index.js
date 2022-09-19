const {ipc} = global.utils;

module.exports = function (actions) {
    this.global = new (require('./global'))(actions);
    this.overwrites = new (require('./overwrites'))(actions);
    this.processors = new (require('./processors'))(actions);
    this.applications = new (require('./applications'))(actions);

    this.data = async (params, session) => {
        const action = 'templates/get';
        const monitor = `${session.monitor}-client`;

        const output = [];
        const requests = new Map(params);
        for (const [requestId, request] of requests) {
            const response = await ipc.exec(monitor, action, request.fields.id);
            const data = response ? {tu: Date.now(), data: response} : undefined;
            output.push([requestId, data]);
        }

        return output;
    };
};
