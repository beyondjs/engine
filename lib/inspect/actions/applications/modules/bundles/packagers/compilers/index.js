module.exports = function (plm) {
    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        const action = 'applications/modules/bundles/packagers/compilers/get';

        return await plm.data(params, action, monitor);
    };
};