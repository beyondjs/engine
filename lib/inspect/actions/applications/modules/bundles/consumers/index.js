module.exports = function (plm) {
    this.list = require('./list');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await plm.data(params, 'applications/modules/bundles/consumers/get', monitor);
    };
};
