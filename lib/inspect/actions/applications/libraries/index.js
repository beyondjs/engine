module.exports = function (helpers) {
    this.list = require('./list.js');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await helpers.data(params, 'applications/libraries/get', monitor);
    };

    this.count = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await helpers.data(params, 'applications/libraries/count', monitor);
    };
};