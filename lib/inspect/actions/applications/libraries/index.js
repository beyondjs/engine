module.exports = function (actions) {
    this.list = require('./list.js');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await actions.data(params, 'applications/libraries/get', monitor);
    };

    this.count = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await actions.data(params, 'applications/libraries/count', monitor);
    };
};