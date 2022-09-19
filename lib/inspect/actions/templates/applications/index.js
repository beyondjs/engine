module.exports = function (actions) {
    this.sources = new (require('./sources'))(actions);

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'templates/applications/get';

        return await actions.data(params, action, monitor);
    };

};
