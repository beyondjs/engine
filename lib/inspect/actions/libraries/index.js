module.exports = function (actions) {
    this.modules = new (require('./modules'));
    this.static = new (require('./static'))(actions);

    this.list = require('./list.js')(actions);
    this.data = require('./data.js')(actions);
};