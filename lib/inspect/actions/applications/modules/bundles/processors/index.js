module.exports = function (actions) {
    this.sources = new (require('./sources'))(actions);
    this.compilers = new (require('./compilers'))(actions);
    this.overwrites = new (require('./overwrites'))(actions);
    this.dependencies = new (require('./dependencies'))(actions);

    this.data = async (params, session) => {
        const monitor = `${session.monitor}-client`;
        return actions.data(params, 'applications/modules/processors/get', monitor);
    };
};