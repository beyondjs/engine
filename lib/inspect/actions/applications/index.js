module.exports = function (plm) {
    this.list = require('./list.js')(plm);
    this.data = require('./data.js')(plm);

    this.static = new (require('./static'))(plm);
    this.modules = new (require('./modules'))(plm);
    this.libraries = new (require('./libraries'))(plm);
    this.deployments = new (require('./deployments'))(plm);
    this.declarations = new (require('./declarations'));
};