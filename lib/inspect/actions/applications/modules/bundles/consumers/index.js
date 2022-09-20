module.exports = function (helpers) {
    this.list = require('./list');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await helpers.data(params, 'applications/modules/bundles/consumers/get', monitor);
    };
};
