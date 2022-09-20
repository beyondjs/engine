module.exports = function (plm) {
    this.modules = new (require('./modules'));
    this.static = new (require('./static'))(plm);

    this.list = require('./list.js')(plm);
    this.data = require('./data.js')(plm);
};