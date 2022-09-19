module.exports = function (actions) {
    this.launcher = new (require('./launcher'))(actions);

    this.list = require('./list');
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/distributions/get';
        return await actions.data(params, action, monitor);
    };
};
