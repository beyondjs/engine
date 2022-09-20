module.exports = function (helpers) {
    this.modules = new (require('./modules'));
    this.static = new (require('./static'))(helpers);

    this.list = require('./list.js')(helpers);
    this.data = require('./data.js')(helpers);
};