module.exports = function (ipc) {

    /**
     * Templates object has a static method that creates the Templates instance and queries the template path.
     * Is got it here to have available the template path later
     */
    require('./models/templates').get();

    this.modules = new (require('./modules'))(ipc);
    this.template = new (require('./template'))(ipc);
    this.project = new (require('./project'))(ipc);
}
