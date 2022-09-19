module.exports = function (actions) {
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/modules/processors/compilers/get';

        return await actions.data(params, action, monitor);
    };
};