module.exports = function (plm) {
    this.list = require('./list');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'bundles/dependencies/get';
        return await plm.data(params, action, monitor);
    };
};
