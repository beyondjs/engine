module.exports = function (helpers) {
    this.list = require('./list');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'modules/static/get';
        return await helpers.data(params, action, monitor);
    };
};
