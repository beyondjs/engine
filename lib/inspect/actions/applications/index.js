module.exports = function (helpers) {
    this.list = require('./list.js')(helpers);
    this.data = require('./data.js')(helpers);

    this.static = new (require('./static'))(helpers);
    this.modules = new (require('./modules'))(helpers);
    this.libraries = new (require('./libraries'))(helpers);
    this.deployments = new (require('./deployments'))(helpers);
    this.declarations = new (require('./declarations'));
};