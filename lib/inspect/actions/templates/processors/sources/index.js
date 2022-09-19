module.exports = function (actions) {

    this.list = require('./list');

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await actions.data(params, 'templates/processors/sources/get', monitor);
    };

};
