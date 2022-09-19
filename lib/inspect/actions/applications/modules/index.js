module.exports = function (actions) {
    this.list = require('./list.js');
    this.bundles = new (require('./bundles'))(actions);

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await actions.data(params, 'applications/modules/get', monitor);
    };

    this.count = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await actions.data(params, 'applications/modules/count', monitor);
    };
};
