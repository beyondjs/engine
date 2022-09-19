module.exports = function (actions) {
    this.list = require('./list.js')(actions);
    this.data = require('./data.js')(actions);

    this.static = new (require('./static'))(actions);
    this.modules = new (require('./modules'))(actions);
    this.libraries = new (require('./libraries'))(actions);
    this.deployments = new (require('./deployments'))(actions);
    this.declarations = new (require('./declarations'));
};