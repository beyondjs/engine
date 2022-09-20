module.exports = function (helpers) {
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/modules/processors/compilers/get';

        return await helpers.data(params, action, monitor);
    };
};