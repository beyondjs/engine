module.exports = function (plm) {
    this.list = require('./list.js')();
    this.data = require('./data.js')();
    this.process = params => global.utils.ipc.exec('engine', 'applications/process', params);

    this.static = new (require('./static'))(plm);
    this.modules = new (require('./modules'))(plm);
    this.declarations = new (require('./declarations'));
    this.deployments = new (require('./deployments'))(plm);
};