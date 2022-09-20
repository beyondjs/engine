module.exports = function (plm) {
    this.list = require('./list');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/modules/processors/dependencies/get';

        return await plm.data(params, action, monitor);
    };
};