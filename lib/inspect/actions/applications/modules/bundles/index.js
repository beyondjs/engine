module.exports = function (actions) {
    this.consumers = new (require('./consumers'))(actions);
    this.processors = new (require('./processors'))(actions);
    this.packagers = new (require('./packagers'))(actions);

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return await actions.data(params, 'applications/modules/bundles/get', monitor);
    };
};
