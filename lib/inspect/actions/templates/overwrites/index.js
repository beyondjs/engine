module.exports = function (actions) {
    this.list = require('./list');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const route = 'templates/overwrites/';

        return await actions.data(params, `${route}get`, monitor);
    };
};