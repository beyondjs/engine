module.exports = function (plm) {
    this.compilers = new (require('./compilers'))(plm);

    this.list = require('./list');
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/modules/bundles/packagers/get';
        return await plm.data(params, action, monitor);
    };
};