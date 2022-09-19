module.exports = function (actions) {
    this.compilers = new (require('./compilers'))(actions);

    this.list = require('./list');
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/modules/bundles/packagers/get';
        return await actions.data(params, action, monitor);
    };
};