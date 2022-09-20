module.exports = function (plm) {
    this.dependencies = new (require('./dependencies'));

    this.list = require('./list');
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'bundles/get';
        return await plm.data(params, action, monitor);
    };
};
