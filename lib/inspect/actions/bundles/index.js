module.exports = function (actions) {
    this.dependencies = new (require('./dependencies'));

    this.list = require('./list');
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'bundles/get';
        return await actions.data(params, action, monitor);
    };
};
