module.exports = function (actions) {
    this.distributions = new (require('./distributions'))(actions);

    this.list = require('./list');
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/deployments/get';
        return await actions.data(params, action, monitor);
    };
};
