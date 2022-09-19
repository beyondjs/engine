module.exports = function (actions) {
    this.list = require('./list');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/modules/processors/sources/get';

        return await actions.data(params, action, monitor);
    };
};